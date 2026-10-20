// Runs every hour on GitHub Actions (free). It:
//  • sends the weekly shopping list on the chosen day/hour (Settings in the app)
//  • sends it right away when someone taps "Email it to us now"
//  • once a day, alerts (phone + email) for anything within a month of expiring
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import webpush from 'web-push';

const H = process.env.HOUSEHOLD || 'spencer';
const APP_URL = process.env.APP_URL || 'https://shawnjspencer.github.io/SF-FS/';
const TZ = 'America/Denver';
const FORCE = process.env.FORCE_REPORT === 'true';

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();
const hRef = db.doc(`households/${H}`);

const STORES = {
  maceys: ["Macey's", n => `https://www.google.com/search?q=${encodeURIComponent(n + ' site:maceys.com')}`],
  costco: ['Costco', n => `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(n)}`],
  sams: ["Sam's Club", n => `https://www.samsclub.com/s/${encodeURIComponent(n)}`],
  walmart: ['Walmart', n => `https://www.walmart.com/search?q=${encodeURIComponent(n)}`]
};

// "now" in Utah
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, weekday: 'short' })
  .formatToParts(new Date()).map(p => [p.type, p.value]));
const todayStr = `${parts.year}-${parts.month}-${parts.day}`;
const hour = +parts.hour % 24;
const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
const today = new Date(`${todayStr}T00:00:00`);

const expDate = e => !e ? null : /^\d{4}$/.test(e) ? new Date(+e, 11, 31) : new Date(+e.slice(0, 4), +e.slice(5, 7), 0);
const daysLeft = e => { const d = expDate(e); return d ? Math.round((d - today) / 864e5) : Infinity; };
const fmtExp = e => /^\d{4}$/.test(e) ? e : `${+e.slice(5, 7)}/${e.slice(2, 4)}`;
const qtyOf = i => (i.lots || []).reduce((a, l) => a + (+l.qty || 0), 0);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const meta = (await hRef.get()).data() || {};
const items = (await db.collection(`households/${H}/items`).get()).docs.map(d => d.data());
const emails = (meta.emails || []).filter(Boolean);

const mailer = process.env.SMTP_PASS ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}) : null;
if (process.env.VAPID_PRIVATE) webpush.setVapidDetails('mailto:' + (emails[0] || process.env.SMTP_USER), process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

async function push(payload) {
  if (!process.env.VAPID_PRIVATE) return;
  const subs = await db.collection(`households/${H}/push`).get();
  for (const d of subs.docs) {
    try { await webpush.sendNotification(d.data().sub, JSON.stringify(payload)); }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await d.ref.delete(); else console.warn('push failed', e.statusCode); }
  }
}
async function mail(subject, html) {
  if (!mailer || !emails.length) return console.log('(email skipped: no SMTP or no addresses)');
  await mailer.sendMail({ from: `"Food Storage ✿" <${process.env.SMTP_USER}>`, to: emails.join(','), subject, html });
}

const shell = (title, inner) => `<div style="background:#fdf6f3;padding:24px 12px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#5c4048">
  <div style="max-width:560px;margin:0 auto;background:#fffdfb;border-radius:22px;padding:26px 24px">
  <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#a08a90;font-weight:700">Spencer Family</div>
  <div style="font:italic 600 28px Georgia,serif;margin:2px 0 14px">${title}</div>${inner}
  <p style="margin-top:26px"><a href="${APP_URL}" style="color:#d4859b;font-weight:700;text-decoration:none">✿ Open Food Storage</a></p></div></div>`;
const rowHTML = (img, name, sub, link) => `<tr><td style="padding:8px 0;border-bottom:1px dashed #f0dde2;width:46px">${img ? `<img src="${esc(img.startsWith('data:') ? '' : img)}" width="38" height="38" style="border-radius:10px;object-fit:cover;display:${img.startsWith('data:') ? 'none' : 'block'}">` : ''}</td>
  <td style="padding:8px 6px;border-bottom:1px dashed #f0dde2"><b>${esc(name)}</b><br><span style="color:#a08a90;font-size:13px">${sub}</span></td>
  <td style="padding:8px 0;border-bottom:1px dashed #f0dde2;text-align:right">${link ? `<a href="${link}" style="color:#d4859b;font-size:13px;font-weight:700;text-decoration:none">find ↗</a>` : ''}</td></tr>`;

function soonList(maxDays = 31) {
  const out = [];
  for (const i of items) for (const l of i.lots || []) if (l.qty > 0) { const n = daysLeft(l.exp); if (n <= maxDays) out.push({ i, l, n }); }
  return out.sort((a, b) => a.n - b.n);
}

/* ── Weekly shopping report ── */
const due = FORCE || meta.reportRequested || (dow === +(meta.reportDay ?? 6) && hour >= +(meta.reportHour ?? 8) && meta.lastReport !== todayStr);
if (due) {
  const need = items.filter(i => qtyOf(i) < (i.par ?? 1));
  let inner = need.length ? '' : '<p>Everything is stocked ✿</p>';
  for (const [k, [name, q]] of Object.entries(STORES)) {
    const rows = need.filter(i => (i.store || 'maceys') === k).sort((a, b) => a.name.localeCompare(b.name));
    if (!rows.length) continue;
    inner += `<div style="font:italic 600 20px Georgia,serif;margin:18px 0 4px">${name}</div><table width="100%" cellspacing="0">` +
      rows.map(i => rowHTML(i.img, i.name, `have ${qtyOf(i)} · need ${(i.par ?? 1) - qtyOf(i)}${i.loc ? ' · shelf ' + esc(i.loc) : ''}`, q(i.name))).join('') + '</table>';
  }
  const soon = soonList();
  if (soon.length) inner += `<div style="font:italic 600 20px Georgia,serif;margin:22px 0 4px;color:#c9566f">Use soon</div><table width="100%" cellspacing="0">` +
    soon.map(({ i, l, n }) => rowHTML(i.img, i.name, `${n < 0 ? 'expired' : 'expires'} ${fmtExp(l.exp)} · ${l.qty} there${i.loc ? ' · shelf ' + esc(i.loc) : ''}`)).join('') + '</table>';
  await mail(`Shopping list · ${need.length} item${need.length === 1 ? '' : 's'}`, shell('Shopping list', inner));
  await push({ title: 'Shopping list is ready ✿', body: `${need.length} thing${need.length === 1 ? '' : 's'} to pick up`, url: './?view=shop', tag: 'report' });
  await hRef.set({ reportRequested: false, ...(meta.reportRequested || FORCE ? {} : { lastReport: todayStr }) }, { merge: true });
  console.log('report sent:', need.length, 'items');
}

/* ── Expiration alerts (once a day) ── */
if (meta.lastExpiryCheck !== todayStr && hour >= Math.min(+(meta.reportHour ?? 8), 9)) {
  const alerted = meta.alerted || {};
  const fresh = soonList().filter(({ i, l }) => !alerted[`${i.id}|${l.exp}`]);
  if (fresh.length) {
    const inner = `<p>These are within a month of their date — time to use them up.</p><table width="100%" cellspacing="0">` +
      fresh.map(({ i, l, n }) => rowHTML(i.img, i.name, `${n < 0 ? 'expired' : n + ' days left ·'} ${fmtExp(l.exp)} · ${l.qty} there${i.loc ? ' · shelf ' + esc(i.loc) : ''}`)).join('') + '</table>';
    await mail(`Use soon: ${fresh.slice(0, 3).map(x => x.i.name).join(', ')}${fresh.length > 3 ? '…' : ''}`, shell('Use these soon', inner));
    await push({ title: fresh.length === 1 ? `${fresh[0].i.name} expires soon` : `${fresh.length} things expire soon`,
      body: fresh.slice(0, 4).map(x => `${x.i.name} (${fmtExp(x.l.exp)})`).join(', '), badge: soonList().length, tag: 'expiry' });
    fresh.forEach(({ i, l }) => alerted[`${i.id}|${l.exp}`] = todayStr);
  }
  // forget alerts for lots that are gone
  const live = new Set(items.flatMap(i => (i.lots || []).filter(l => l.qty > 0).map(l => `${i.id}|${l.exp}`)));
  for (const k of Object.keys(alerted)) if (!live.has(k)) delete alerted[k];
  await hRef.update({ alerted, lastExpiryCheck: todayStr });
  console.log('expiry check:', fresh.length, 'new');
}
process.exit(0);
