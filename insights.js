// SF-FS · Flower menu, Insights, History, Shelves
// Uses helpers that app.js shares on window.SFFS.
const S = window.SFFS;
const { $, $$, esc, DB } = S;
const DAY = 864e5;

/* ═════════════════ Flower menu ═════════════════
   Tapping "menu" blooms petals out of the button: Insights, History, Shelves, Settings. */
const ICON = {
  insights: '<svg viewBox="0 0 24 24"><path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="7" rx="1"/><rect x="10.5" y="6" width="3" height="12" rx="1"/><rect x="15.5" y="9" width="3" height="9" rx="1"/></svg>',
  history: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></svg>',
  shelves: '<svg viewBox="0 0 24 24"><path d="M5 4v16M19 4v16M5 9h14M5 14.5h14M5 20h14"/><rect x="7.5" y="5.5" width="3" height="3.5" rx=".6"/><rect x="12" y="11" width="4" height="3.5" rx=".6"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.4"/><path d="M12 9.6c-1.5-2.3-1.5-4.9 0-6.2 1.5 1.3 1.5 3.9 0 6.2ZM12 14.4c1.5 2.3 1.5 4.9 0 6.2-1.5-1.3-1.5-3.9 0-6.2ZM9.6 12c-2.3 1.5-4.9 1.5-6.2 0 1.3-1.5 3.9-1.5 6.2 0ZM14.4 12c2.3-1.5 4.9-1.5 6.2 0-1.3 1.5-3.9 1.5-6.2 0Z"/></svg>'
};
const PETALS = [
  { id: 'insights', label: 'Insights', go: () => openInsights() },
  { id: 'history', label: 'History', go: () => openHistory() },
  { id: 'shelves', label: 'Shelves', go: () => openShelves() },
  { id: 'settings', label: 'Settings', go: () => S.openSettings() }
];
const bloom = document.createElement('div');
bloom.className = 'bloom'; bloom.hidden = true;
bloom.innerHTML = `<div class="bloom-veil"></div>` + PETALS.map((p, i) =>
  `<button class="petal" data-p="${p.id}" style="--i:${i}"><span class="pc">${ICON[p.id]}<b>${p.label}</b></span></button>`).join('');
document.body.append(bloom);
const menuBtn = $('#goMenu');
function openBloom() {
  const r = menuBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + 16;
  const R = Math.min(170, Math.max(150, innerWidth * .41))   // far enough out that petals don't overlap
    + (parseFloat(getComputedStyle(bloom).getPropertyValue('--bloom-extra')) || 0);   // long petals (Armory) sit farther out
  // fan from straight left (180°) to straight up (90°); if the button isn't at the right edge, fan wider
  const right = innerWidth - cx < 120;
  const from = right ? 180 : 165, to = right ? 90 : 15;
  $$('.petal', bloom).forEach((el, i) => {
    const a = (from + (to - from) * i / (PETALS.length - 1)) * Math.PI / 180;
    const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
    const rot = 90 - a * 180 / Math.PI;
    el.style.setProperty('--x', `${x}px`); el.style.setProperty('--y', `${y}px`);
    el.style.setProperty('--cx', `${cx}px`); el.style.setProperty('--cy', `${cy}px`);
    el.style.setProperty('--rot', `${rot}deg`);
  });
  bloom.hidden = false; menuBtn.classList.add('open');
  requestAnimationFrame(() => requestAnimationFrame(() => bloom.classList.add('on')));
}
function closeBloom() {
  bloom.classList.remove('on'); menuBtn.classList.remove('open');
  setTimeout(() => { if (!bloom.classList.contains('on')) bloom.hidden = true; }, 220);
}
menuBtn.onclick = () => bloom.classList.contains('on') ? closeBloom() : openBloom();
bloom.addEventListener('click', e => {
  const p = e.target.closest('.petal');
  closeBloom();
  if (p) setTimeout(() => PETALS.find(x => x.id === p.dataset.p).go(), 90);
});
addEventListener('keydown', e => { if (e.key === 'Escape' && bloom.classList.contains('on')) closeBloom(); });

/* ═════════════════ Data ═════════════════ */
const LASTS = ['household', 'medicine', 'longterm'];
const isEveryday = cat => !LASTS.includes(cat);
// What we call each other in the app
const NAMES = { 'shawn@spencerfam.com': 'Shawn', 'kinzspencer@gmail.com': 'Kenzie' };
const nameOf = who => {
  if (NAMES[(who || '').toLowerCase()]) return NAMES[who.toLowerCase()];
  if (!who || who === 'this device') return 'This device';
  const local = who.split('@')[0].replace(/[._-]+/g, ' ');
  return local.charAt(0).toUpperCase() + local.slice(1);
};
const monthKey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
const monthLabel = (k, long) => new Date(+k.slice(0, 4), +k.slice(5) - 1, 1).toLocaleString('en-US', { month: long ? 'long' : 'short' });
const lastMonths = n => { const out = [], d = new Date(); d.setDate(1); for (let i = n - 1; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(monthKey(x)); } return out; };
const fmtDate = t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtTime = t => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// Realistic made-up history, built from your real items, for showing the reports before there's data.
function sampleLog() {
  let seed = 20261025; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const RATE = { snacks: 3, cereal: 2.5, 'milk-juice': 2, pasta: 1.6, meals: 1.6, baking: 1, condiments: .9, 'chest-freezer': 1.8, 'upright-freezer': 1.6,
    vegetables: 1, fruits: 1, beans: .7, soup: .7, meat: .5, mixes: .6, grains: .6, household: 1.6, medicine: .3, longterm: .05 };
  const people = (DB.meta.emails || []).filter(Boolean);
  const A = people[0] || 'shawn@spencerfam.com', B = people[1] || 'kinzspencer@gmail.com';
  const now = Date.now(), DAYS = 180, ev = [];
  for (const it of DB.items.values()) {
    if (rnd() < .3) continue;                                   // plenty of items barely move
    const rate = (RATE[it.cat] ?? .8) * .45 * (.35 + rnd() * 1.3) / 30; // per day — a realistic family pace
    let stock = 0;
    for (let d = 0; d < DAYS; d++) {
      const t = now - (DAYS - d) * DAY + Math.floor(rnd() * 14 + 7) * 36e5;
      if (stock <= 0 && rnd() < .12) {
        const q = 1 + Math.floor(rnd() * 3); stock += q;
        const stores = ['costco', 'maceys', 'sams', 'walmart'];
        const store = rnd() < .7 ? (it.store || 'costco') : stores[Math.floor(rnd() * stores.length)];
        ev.push({ t: t - 2 * 36e5, type: 'in', id: it.id, name: it.name, cat: it.cat, qty: q, store, who: rnd() < .6 ? A : B });
      }
      if (rnd() < rate) {
        const toss = rnd() < .045, rotP = .78 + .17 * d / DAYS;   // rotation gets better over time
        ev.push({ t, type: toss ? 'toss' : 'out', id: it.id, name: it.name, cat: it.cat, qty: 1, oldest: rnd() < rotP, who: rnd() < .55 ? B : A });
        stock--;
      }
    }
  }
  return ev.sort((a, b) => a.t - b.t);
}

let realLog = null, mode = null;   // mode: 'real' | 'sample'
async function getLog() {
  if (!realLog) { try { realLog = await S.readLog(400); } catch (e) { console.warn(e); realLog = []; } }
  if (!mode) mode = realLog.filter(e => e.type !== 'adjust').length >= 25 ? 'real' : 'sample';
  return mode === 'real' ? realLog : (sampleCache ||= sampleLog());
}
let sampleCache = null;

function crunch(E) {
  const now = Date.now(), items = [...DB.items.values()];
  const outs = E.filter(e => e.type === 'out'), tosses = E.filter(e => e.type === 'toss');
  const first = E.length ? E[0].t : now;
  const W = Math.min(90, Math.max(14, (now - first) / DAY));          // days used to measure pace
  const recent = outs.filter(e => e.t >= now - W * DAY);
  const perDay = new Map();
  recent.forEach(e => perDay.set(e.id, (perDay.get(e.id) || 0) + (e.qty || 1) / W));
  const months = lastMonths(6);
  const byMonth = k => ({ used: outs.filter(e => monthKey(e.t) === k).length, tossed: tosses.filter(e => monthKey(e.t) === k).length,
    oldest: outs.filter(e => monthKey(e.t) === k && e.oldest).length });
  const monthly = months.map(k => ({ k, ...byMonth(k) }));
  const last90 = E.filter(e => e.t >= now - 90 * DAY);
  const o90 = last90.filter(e => e.type === 'out');
  const rotation = o90.length ? Math.round(100 * o90.filter(e => e.oldest).length / o90.length) : null;
  // top used
  const cnt = new Map(); o90.forEach(e => cnt.set(e.id, (cnt.get(e.id) || 0) + 1));
  const top = [...cnt].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, n]) => ({ it: DB.items.get(id) || { name: E.find(e => e.id === id)?.name || '?' }, id, n, perMonth: n / 3 }));
  // waste
  const t90 = last90.filter(e => e.type === 'toss');
  const tc = new Map(); t90.forEach(e => tc.set(e.name, (tc.get(e.name) || 0) + 1));
  const tossedTop = [...tc].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const wastePct = (o90.length + t90.length) ? Math.round(100 * t90.length / (o90.length + t90.length)) : 0;
  // people
  const ppl = new Map();
  last90.filter(e => e.type !== 'adjust').forEach(e => { const p = ppl.get(e.who) || { in: 0, out: 0 }; e.type === 'in' ? p.in += e.qty || 1 : p.out += 1; ppl.set(e.who, p); });
  // keep-on-hand suggestions: about 6 weeks of what you use
  const sugg = items.filter(it => (perDay.get(it.id) || 0) * 30 >= .5).map(it => {
    const m = perDay.get(it.id) * 30, s = Math.max(1, Math.ceil(m * 1.5));
    return { it, m, s, par: it.par ?? 1 };
  }).filter(x => x.s !== x.par).sort((a, b) => Math.abs(b.s - b.par) - Math.abs(a.s - a.par)).slice(0, 8);
  // runs-out forecast
  const forecast = items.filter(it => S.qtyOf(it) > 0 && perDay.get(it.id) > 0)
    .map(it => ({ it, days: S.qtyOf(it) / perDay.get(it.id) })).sort((a, b) => a.days - b.days).slice(0, 10);
  // supply
  const every = items.filter(it => isEveryday(it.cat) && perDay.get(it.id) > 0);
  const units = every.reduce((a, it) => a + S.qtyOf(it), 0), pace = every.reduce((a, it) => a + perDay.get(it.id), 0);
  const weeks = pace ? units / pace / 7 : null;
  // where we buy (put-aways in the last 90 days, by store)
  const ins = last90.filter(e => e.type === 'in' && e.store);
  const byStore = new Map(); ins.forEach(e => byStore.set(e.store, (byStore.get(e.store) || 0) + (e.qty || 1)));
  const multi = new Map(); ins.forEach(e => { const st = multi.get(e.name) || new Set(); st.add(e.store); multi.set(e.name, st); });
  const shared = [...multi].filter(([, st]) => st.size > 1).sort((a, b) => b[1].size - a[1].size).slice(0, 6);
  return { byStore, shared, monthly, rotation, top, tossedTop, wastePct, t90: t90.length, o90: o90.length, ppl, sugg, forecast, weeks, perDay };
}
// these never need history
function stockHealth() {
  return S.orderedCats().map(c => {
    const its = [...DB.items.values()].filter(i => i.cat === c.id);
    const ok = its.filter(i => S.qtyOf(i) >= (i.par ?? 1)).length;
    return { c, n: its.length, ok, pct: its.length ? Math.round(100 * ok / its.length) : 100 };
  }).filter(x => x.n);
}
function longterm() {
  const its = [...DB.items.values()].filter(i => i.cat === 'longterm');
  const serv = its.reduce((a, i) => a + S.qtyOf(i) * (i.servings ?? S.servingsGuess(i) ?? 0), 0);
  const fam = DB.meta.familySize || 4;
  return { serv, fam, days: serv / (fam * 3), withServ: its.filter(i => (i.servings ?? S.servingsGuess(i))).length, n: its.length };
}
function expCalendar() {
  const now = new Date(); now.setDate(1);
  const keys = Array.from({ length: 18 }, (_, i) => monthKey(new Date(now.getFullYear(), now.getMonth() + i, 1)));
  const bucket = new Map([['past', []], ...keys.map(k => [k, []])]);
  for (const it of DB.items.values()) for (const l of S.sortLots(it.lots)) {
    if (!l.exp) continue;
    const d = S.expDate(l.exp); if (!d) continue;
    const k = d < now ? 'past' : /^\d{4}$/.test(l.exp) ? null : monthKey(d);
    if (k && bucket.has(k)) bucket.get(k).push({ it, l });
  }
  return { keys: ['past', ...keys], bucket };
}

/* ═════════════════ Charts (SVG, theme colors) ═════════════════ */
const niceMax = v => { if (v <= 4) return 4; const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return v; };
// Columns. One series, value labels only where useful, recessive grid.
function columns({ cols, max, h = 150, pct = false, tap = false }) {
  const W = 360, padL = 26, padB = 22, padT = 16, n = cols.length, top = max ?? niceMax(Math.max(1, ...cols.map(c => c.v)));
  const gw = (W - padL) / n, bw = Math.max(6, Math.min(30, gw - 6)), ih = h - padB - padT;
  const y = v => padT + ih - (v / top) * ih;
  const grid = [0, .5, 1].map(f => `<line x1="${padL}" x2="${W}" y1="${y(top * f)}" y2="${y(top * f)}" class="gl"/><text x="${padL - 6}" y="${y(top * f) + 3.5}" class="ax" text-anchor="end">${Math.round(top * f)}${pct ? '%' : ''}</text>`).join('');
  const bars = cols.map((c, i) => {
    const x = padL + gw * i + (gw - bw) / 2, yy = y(c.v), hh = padT + ih - yy, r = Math.min(4, bw / 2, hh);
    const path = hh > 0 ? `M${x},${padT + ih} V${yy + r} Q${x},${yy} ${x + r},${yy} H${x + bw - r} Q${x + bw},${yy} ${x + bw},${yy + r} V${padT + ih} Z` : '';
    const lbl = c.v && (c.showV ?? true) ? `<text x="${x + bw / 2}" y="${yy - 4}" class="vl" text-anchor="middle">${c.v}${pct ? '%' : ''}</text>` : '';
    return `<g class="bar${tap ? ' tap' : ''}" data-k="${esc(c.k ?? '')}"><rect x="${padL + gw * i}" y="${padT}" width="${gw}" height="${ih + padB}" fill="transparent"/>
      ${path ? `<path d="${path}" class="${c.warn ? 'bw' : 'ba'}"/>` : ''}${lbl}<text x="${x + bw / 2}" y="${h - 6}" class="ax" text-anchor="middle">${esc(c.label)}</text>
      <title>${esc(c.title ?? `${c.label}: ${c.v}`)}</title></g>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img">${grid}${bars}</svg>`;
}
// Horizontal bars as HTML rows (label · bar · value)
const hbars = rows => `<div class="hb">${rows.map(r => `<div class="hr" title="${esc(r.title || '')}"><span class="hl">${esc(r.label)}</span>
  <span class="ht"><i style="width:${Math.max(0, Math.min(100, r.pct))}%" class="${r.warn ? 'w' : ''}"></i></span><span class="hv">${esc(r.value)}</span></div>`).join('')}</div>`;

/* ═════════════════ Insights ═════════════════ */
const sampleChip = () => mode === 'sample' ? '<span class="chip-s">sample</span>' : '';
async function openInsights() {
  const body = S.openSheet(`<h2>Insights</h2><p class="sub">Loading…</p>`, null, 'big');
  const E = await getLog(); drawInsights(body, E);
}
function modeBar() {
  const realN = (realLog || []).filter(e => e.type !== 'adjust').length;
  return `<div class="seg" role="tablist"><button data-mode="real" class="${mode === 'real' ? 'on' : ''}">Our data</button><button data-mode="sample" class="${mode === 'sample' ? 'on' : ''}">Sample data</button></div>
    ${mode === 'sample' ? `<p class="banner">These reports are showing <b>made-up sample history</b> built from our real items, so you can see how they'll look. The app has logged ${realN} real ${realN === 1 ? 'change' : 'changes'} so far. Charts marked <span class="chip-s">sample</span> fill in with our real numbers as we put things away and use them. The others already use real data.</p>` : ''}`;
}
function drawInsights(body, E) {
  const C = crunch(E), H = stockHealth(), L = longterm(), cal = expCalendar();
  const healthPct = Math.round(100 * H.reduce((a, x) => a + x.ok, 0) / Math.max(1, H.reduce((a, x) => a + x.n, 0)));
  const months = C.monthly;
  const fam = L.fam;
  body.innerHTML = `<h2>Insights</h2>${modeBar()}
  <div class="tiles">
    <div class="tile"><b>${healthPct}%</b><span>of items at or above keep on hand</span></div>
    <div class="tile"><b>${C.weeks != null ? C.weeks.toFixed(1) : '—'}</b><span>weeks of everyday food ${sampleChip()}</span></div>
    <div class="tile"><b>${C.rotation != null ? C.rotation + '%' : '—'}</b><span>grabbed the oldest one ${sampleChip()}</span></div>
    <div class="tile"><b class="${C.t90 ? 'warn' : ''}">${C.t90}</b><span>tossed in 90 days ${sampleChip()}</span></div>
  </div>
  <div class="ins-grid">

  <section class="card wide2"><h3>When things expire</h3><p class="note">Items expiring each month for the next year and a half. Tap a month to see what's in it.</p>
    ${columns({ cols: cal.keys.map(k => ({ k, v: cal.bucket.get(k).reduce((a, x) => a + x.l.qty, 0), warn: k === 'past',
      label: k === 'past' ? 'Past' : (k.endsWith('-01') ? "'" + k.slice(2, 4) : monthLabel(k)[0]),
      title: k === 'past' ? 'Already expired' : `${monthLabel(k, true)} ${k.slice(0, 4)}`, showV: true })), tap: true, h: 160 })}
    <div id="calList" class="mini"><p class="note">Tap a bar.</p></div></section>

  <section class="card"><h3>Supply</h3>
    <div class="gauge"><div class="gl2"><span>Everyday food ${sampleChip()}</span><b>${C.weeks != null ? C.weeks.toFixed(1) + ' weeks' : 'not enough data yet'}</b></div>
      <div class="track"><i style="width:${Math.min(100, (C.weeks || 0) / 13 * 100)}%"></i><em style="left:100%"></em></div>
      <p class="note">Goal: a 3-month supply (13 weeks), at the pace we usually eat it.</p></div>
    <div class="gauge"><div class="gl2"><span>Longterm</span><b>${L.serv ? Math.round(L.serv).toLocaleString() + ' servings' : 'add servings'}</b></div>
      <div class="track"><i style="width:${Math.min(100, L.days / 90 * 100)}%"></i></div>
      <p class="note">${L.serv ? `About <b>${Math.round(L.days)} days</b> for ${fam} people eating 3 servings a day. ` : ''}${L.withServ < L.n ? `${L.n - L.withServ} longterm items still need “servings per package” on their item page.` : ''}</p></div>
  </section>

  <section class="card"><h3>Stock health by category</h3><p class="note">Share of items at or above what we like to keep.</p>
    ${hbars(H.sort((a, b) => a.pct - b.pct).map(x => ({ label: x.c.name, pct: x.pct, value: x.pct + '%', warn: x.pct < 50, title: `${x.ok} of ${x.n} items stocked` })))}</section>

  <section class="card"><h3>Keep-on-hand suggestions ${sampleChip()}</h3><p class="note">About 6 weeks' worth of what we actually use.</p>
    ${C.sugg.length ? `<table class="tb"><tr><th>Item</th><th>Use / mo</th><th>Keep</th><th></th></tr>${C.sugg.map(x => `<tr><td>${esc(x.it.name)}</td><td>${x.m.toFixed(1)}</td>
      <td>${x.par} → <b>${x.s}</b></td><td><button class="link" data-apply="${x.it.id}" data-s="${x.s}" ${mode === 'sample' ? 'disabled title="Sample data"' : ''}>use</button></td></tr>`).join('')}</table>`
      : '<p class="note">Nothing to change. Our keep-on-hand numbers match how we use things.</p>'}</section>

  <section class="card"><h3>Runs out next ${sampleChip()}</h3><p class="note">At the pace we've been using them.</p>
    ${C.forecast.length ? `<table class="tb">${C.forecast.map(x => `<tr><td>${esc(x.it.name)}</td><td class="r">${S.qtyOf(x.it)} left</td>
      <td class="r ${x.days < 14 ? 'warn' : ''}">${x.days < 1 ? 'any day' : 'about ' + fmtDate(Date.now() + x.days * DAY)}</td></tr>`).join('')}</table>` : '<p class="note">Not enough history yet.</p>'}</section>

  <section class="card"><h3>Used each month ${sampleChip()}</h3>
    ${columns({ cols: months.map(m => ({ v: m.used, label: monthLabel(m.k), title: `${monthLabel(m.k, true)}: ${m.used} used` })) })}
    <h4>Most used, last 90 days</h4>
    ${C.top.length ? hbars(C.top.map(x => ({ label: x.it.name, pct: 100 * x.n / C.top[0].n, value: `${x.perMonth.toFixed(1)}/mo` }))) : '<p class="note">Nothing yet.</p>'}</section>

  <section class="card"><h3>Rotation ${sampleChip()}</h3><p class="note">How often we grabbed the oldest one when taking something out.</p>
    ${columns({ cols: months.map(m => ({ v: m.used ? Math.round(100 * m.oldest / m.used) : 0, label: monthLabel(m.k), title: `${monthLabel(m.k, true)}: ${m.oldest} of ${m.used} were the oldest` })), max: 100, pct: true })}</section>

  <section class="card"><h3>Waste ${sampleChip()}</h3><p class="note">Things we tossed because they expired or spoiled.</p>
    ${columns({ cols: months.map(m => ({ v: m.tossed, warn: true, label: monthLabel(m.k), title: `${monthLabel(m.k, true)}: ${m.tossed} tossed` })), h: 120 })}
    <p class="note">Last 90 days: <b>${C.t90}</b> tossed, ${C.wastePct}% of everything we took out.</p>
    ${C.tossedTop.length ? `<h4>Tossed most</h4><table class="tb">${C.tossedTop.map(([n, c]) => `<tr><td>${esc(n)}</td><td class="r warn">${c}×</td></tr>`).join('')}</table><p class="note">Consider buying fewer of these, or moving them up front.</p>` : ''}</section>

  <section class="card"><h3>Where we buy ${sampleChip()}</h3><p class="note">What we put away in the last 90 days, by store.</p>
    ${C.byStore.size ? (() => { const rows = [...C.byStore].sort((a, b) => b[1] - a[1]), tot = rows.reduce((a, r) => a + r[1], 0);
      return hbars(rows.map(([k, n]) => ({ label: S.STORES[k]?.name || k, pct: 100 * n / rows[0][1], value: `${n} · ${Math.round(100 * n / tot)}%` }))); })()
      : '<p class="note">Nothing yet. Pick the store each time you put something away.</p>'}
    ${C.shared.length ? `<h4>Bought at more than one store</h4><table class="tb">${C.shared.map(([n, st]) => `<tr><td>${esc(n)}</td><td class="r">${[...st].map(k => esc(S.STORES[k]?.name || k)).join(', ')}</td></tr>`).join('')}</table>` : ''}</section>

  <section class="card"><h3>Who's been busy ${sampleChip()}</h3><p class="note">Last 90 days.</p>
    ${C.ppl.size ? (() => { const rows = [...C.ppl]; const mx = Math.max(...rows.map(([, p]) => p.in + p.out)); return hbars(rows.map(([w, p]) => ({ label: nameOf(w), pct: 100 * (p.in + p.out) / mx, value: `${p.in} in · ${p.out} out` }))); })() : '<p class="note">Nothing yet.</p>'}</section>

  </div>`;
  // interactions
  body.querySelector('.seg').onclick = e => { const b = e.target.closest('[data-mode]'); if (!b || b.dataset.mode === mode) return; mode = b.dataset.mode; getLog().then(E => drawInsights(body, E)); };
  body.querySelectorAll('.chart .bar.tap').forEach(g => g.addEventListener('click', () => {
    const k = g.dataset.k, list = cal.bucket.get(k) || [];
    body.querySelectorAll('.chart .bar.tap').forEach(x => x.classList.toggle('sel', x === g));
    $('#calList', body).innerHTML = `<h4>${k === 'past' ? 'Already expired' : monthLabel(k, true) + ' ' + k.slice(0, 4)}</h4>` + (list.length
      ? `<div class="sugg">${list.sort((a, b) => a.it.name.localeCompare(b.it.name)).map(x => `<button data-open2="${x.it.id}">${esc(x.it.name)} <small>· ${x.l.qty} · exp ${S.fmtExp(x.l.exp)}${x.it.loc ? ' · ' + esc(x.it.loc) : ''}</small></button>`).join('')}</div>`
      : '<p class="note">Nothing expires this month.</p>');
  }));
  body.onclick = async e => {
    const o = e.target.closest('[data-open2]'); if (o) return S.openItem(o.dataset.open2);
    const a = e.target.closest('[data-apply]');
    if (a && !a.disabled) { await DB.mutate(a.dataset.apply, x => { x.par = +a.dataset.s; }); a.textContent = '✓'; a.disabled = true; S.toast('Keep-on-hand updated ✿'); }
  };
}

/* ═════════════════ History ═════════════════ */
const VERB = { in: 'put away', out: 'took out', toss: 'tossed', adjust: 'changed the count of' };
async function openHistory() {
  const body = S.openSheet(`<h2>History</h2><p class="sub">Loading…</p>`, null, 'big');
  await getLog(); drawHistory(body);
}
function drawHistory(body) {
  const E = (mode === 'real' ? realLog : (sampleCache ||= sampleLog())).slice().reverse().slice(0, 300);
  const groups = new Map();
  E.forEach(e => { const k = new Date(e.t).toDateString(); (groups.get(k) || groups.set(k, []).get(k)).push(e); });
  body.innerHTML = `<h2>History</h2>${modeBar()}
    ${E.length ? [...groups].map(([k, list]) => `<div class="hday"><h4>${new Date(k).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
      ${list.map(e => `<div class="hev ${e.type}"><span class="dot2"></span><span class="tx"><b>${esc(nameOf(e.who))}</b> ${VERB[e.type] || e.type}
        ${e.type === 'adjust' ? `<b>${esc(e.name)}</b> (${e.qty > 0 ? '+' : ''}${e.qty})` : `${e.qty > 1 ? e.qty + ' × ' : ''}<b>${esc(e.name)}</b>`}
        ${e.type === 'out' ? (e.oldest ? '<small class="ok">· oldest ✓</small>' : '<small>· not the oldest</small>') : ''}
        ${e.exp ? `<small>· exp ${esc(S.fmtExp(e.exp))}</small>` : ''}${e.store && e.type === 'in' ? `<small>· from ${esc(S.STORES[e.store]?.name || e.store)}</small>` : ''}</span><time>${fmtTime(e.t)}</time></div>`).join('')}</div>`).join('')
      : `<p class="empty-note">Nothing yet. Every time someone puts something away, takes something out or tosses something, it'll show up here.</p>`}`;
  body.querySelector('.seg').onclick = e => { const b = e.target.closest('[data-mode]'); if (!b || b.dataset.mode === mode) return; mode = b.dataset.mode; drawHistory(body); };
}

/* ═════════════════ Shelves ═════════════════ */
function openShelves() {
  const items = [...DB.items.values()];
  const at = loc => items.filter(i => i.loc === loc);
  const body = S.openSheet(`<h2>Shelves</h2><p class="sub">What lives where. Tap a spot to see its items.</p>
    <div class="shelfmap" style="--tall:${Math.max(...DB.meta.shelves.map(s => s.rows))}">${DB.meta.shelves.map(s => `<div class="sm-col"><div class="sm-rows">${Array.from({ length: s.rows }, (_, i) => s.rows - i).map(r => {
      const its = at(s.id + r), u = its.reduce((a, i) => a + S.qtyOf(i), 0);
      return `<button class="sm-cell ${its.length ? '' : 'empty'}" data-loc="${esc(s.id + r)}" style="--fill:${Math.min(1, its.length / 12)}"><b>${esc(s.id + r)}</b><small>${its.length ? its.length + (its.length === 1 ? ' item · ' : ' items · ') + u : 'empty'}</small></button>`; }).join('')}</div>
      <div class="sm-lbl">${esc(s.id)}</div></div>`).join('')}
      <div class="sm-col floor"><div class="sm-rows"><button class="sm-cell ${at('Floor').length ? '' : 'empty'}" data-loc="Floor" style="--fill:${Math.min(1, at('Floor').length / 12)}"><b>Floor</b><small>${at('Floor').length === 1 ? '1 item' : at('Floor').length + ' items'}</small></button></div><div class="sm-lbl">Floor</div></div>
    </div>
    <p class="note">${items.filter(i => !i.loc && S.qtyOf(i) > 0).length} items on hand don't have a spot yet. <button class="link" data-loc="">See them</button></p>
    <div id="smList" class="mini"></div>
    <p class="note" style="margin-top:18px">Coming later: a drawing of the room with a glowing dot where each item lives.</p>`, null, 'big');
  body.onclick = e => {
    const o = e.target.closest('[data-open2]'); if (o) return S.openItem(o.dataset.open2);
    const b = e.target.closest('[data-loc]'); if (!b) return;
    const loc = b.dataset.loc, list = loc ? at(loc) : items.filter(i => !i.loc && S.qtyOf(i) > 0);
    $$('.sm-cell', body).forEach(x => x.classList.toggle('sel', x === b));
    $('#smList', body).innerHTML = `<h4>${loc ? esc(loc) : 'No spot yet'}</h4>` + (list.length ? `<div class="sugg">${list.sort((a, b) => a.name.localeCompare(b.name)).map(i =>
      `<button data-open2="${i.id}">${esc(i.name)} <small>· ${S.qtyOf(i)} / ${i.par ?? 1}</small></button>`).join('')}</div>` : '<p class="note">Nothing here.</p>');
    $('#smList', body).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
}

// new activity → re-read the log next time a report opens
addEventListener('sffs:logged', () => { realLog = null; });
export { openInsights, openHistory, openShelves };
