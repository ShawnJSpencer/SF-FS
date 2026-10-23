// SF-FS · Spencer Family Food Storage
const CFG = window.SFFS_CONFIG || {};
const SEED = window.SFFS_SEED;
const VERSION = '1.3.2';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p = 'i') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = o => JSON.parse(JSON.stringify(o));

/* ───────────── Device-only preferences (never synced) ───────────── */
const THEMES = [
  ['blush', 'Blush Peony'], ['lavender', 'Lavender'], ['sage', 'Sage & Daisy'], ['buttercup', 'Buttercup'],
  ['hydrangea', 'Hydrangea'], ['peach', 'Peach Blossom'], ['wildflower', 'Wildflower'], ['moonlit', 'Moonlit']
];
const dev = {
  get(k, d) { try { const v = localStorage.getItem('sffs-dev-' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sffs-dev-' + k, JSON.stringify(v)); } catch {} }
};
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  $('meta[name=theme-color]').content = v('--bg');
  const fl = (x, y, c, r = 4) => [0, 72, 144, 216, 288].map(a => {
    const rad = a * Math.PI / 180;
    return `<ellipse cx='${x + Math.cos(rad) * r * .9}' cy='${y + Math.sin(rad) * r * .9}' rx='${r * .62}' ry='${r * .42}' transform='rotate(${a} ${x + Math.cos(rad) * r * .9} ${y + Math.sin(rad) * r * .9})' fill='${c}'/>`;
  }).join('') + `<circle cx='${x}' cy='${y}' r='${r * .38}' fill='%23f6d36b'/>`;
  const enc = c => c.replace('#', '%23');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34'><rect width='34' height='34' fill='%23fffaf8'/>` +
    fl(8, 9, enc(v('--tulip1')), 5) + fl(25, 25, enc(v('--tulip2')), 4.6) + fl(26, 6, enc(v('--accent')), 3) + fl(7, 27, enc(v('--accent')), 3) +
    `<path d='M15 15q5 -1 6 4q-5 1-6-4z M17 28q4 -2 6 1q-4 2-6-1z' fill='${enc(v('--leaf'))}'/>` +
    `</svg>`;
  document.documentElement.style.setProperty('--floral', `url("data:image/svg+xml,${svg.replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E')}")`);
}
applyTheme(dev.get('theme', 'blush'));

/* ───────────── Splash: white flowers spiral out, two tulips bloom ───────────── */
function runSplash() {
  const sp = $('#splash');
  if (!dev.get('splash', true)) { sp.remove(); return; }
  const cv = $('#petals'), ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
  // flower sprite
  const spr = document.createElement('canvas'); spr.width = spr.height = 64;
  const s = spr.getContext('2d'); s.translate(32, 32);
  s.fillStyle = 'rgba(255,255,255,.96)';
  for (let k = 0; k < 5; k++) { s.save(); s.rotate(k * Math.PI * 2 / 5); s.beginPath(); s.ellipse(0, -14, 9, 14, 0, 0, Math.PI * 2); s.fill(); s.restore(); }
  s.fillStyle = '#f6dc8a'; s.beginPath(); s.arc(0, 0, 7, 0, Math.PI * 2); s.fill();
  const cx = W / 2, cy = H / 2, R = Math.hypot(W, H) / 2 + 24;
  const N = Math.round(Math.min(950, Math.max(380, W * H / 430)));
  const c = R / Math.sqrt(N), G = Math.PI * (3 - Math.sqrt(5));
  const fl = Array.from({ length: N }, (_, i) => {
    const r = c * Math.sqrt(i + .5), th = i * G + r * 0.0035;
    return { x: cx + r * Math.cos(th), y: cy + r * Math.sin(th), t0: 0.04 + (i / N) * 0.92, sz: 7 + Math.random() * 7, rot: Math.random() * 6 };
  });
  const easeBack = t => { const k = 1.6; return 1 + (k + 1) * Math.pow(t - 1, 3) + k * Math.pow(t - 1, 2); };
  const start = performance.now();
  function frame(now) {
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, W, H);
    for (const f of fl) {
      const p = Math.min(1, Math.max(0, (t - f.t0) / 0.38));
      if (!p) continue;
      const e = easeBack(p), x = cx + (f.x - cx) * Math.min(1, e), y = cy + (f.y - cy) * Math.min(1, e), z = f.sz * e;
      ctx.save(); ctx.translate(x, y); ctx.rotate(f.rot + (1 - p) * 2.2); ctx.globalAlpha = Math.min(1, p * 1.6);
      ctx.drawImage(spr, -z / 2, -z / 2, z, z); ctx.restore();
    }
    if (t < 1.5) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  let done = false;
  const close = () => { if (done) return; done = true; sp.classList.add('bye'); setTimeout(() => sp.remove(), 500); };
  setTimeout(close, 3300);
  sp.addEventListener('click', close);
}
runSplash();

/* ───────────── Dates ───────────── */
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
function expDate(e) {
  if (!e) return null;
  if (/^\d{4}$/.test(e)) return new Date(+e, 11, 31);
  const [y, m] = e.split('-').map(Number); return new Date(y, m, 0);
}
const daysLeft = e => { const d = expDate(e); return d ? Math.round((d - today0()) / 864e5) : Infinity; };
function fmtExp(e) {
  if (!e) return '';
  if (/^\d{4}$/.test(e)) return e;
  const [y, m] = e.split('-'); return `${+m}/${y.slice(2)}`;
}
function fmtLeft(e) {
  const n = daysLeft(e);
  if (n === Infinity) return '';
  if (n < 0) return 'expired';
  if (n === 0) return 'today';
  if (n <= 31) return `${n} day${n === 1 ? '' : 's'} left`;
  return '';
}
const SOON = 31;

/* ───────────── Item helpers ───────────── */
const qtyOf = it => (it.lots || []).reduce((a, l) => a + (+l.qty || 0), 0);
const sortLots = lots => [...(lots || [])].filter(l => l.qty > 0).sort((a, b) => (expDate(a.exp) || 9e15) - (expDate(b.exp) || 9e15));
const soonest = it => sortLots(it.lots).find(l => l.exp);
const STORES = {
  maceys: { name: "Macey's", sub: 'Spanish Fork', home: 'https://www.maceys.com/', q: n => `https://www.google.com/search?q=${encodeURIComponent(n + ' site:maceys.com')}` },
  costco: { name: 'Costco', sub: 'Spanish Fork', home: 'https://www.costco.com/', q: n => `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(n)}` },
  sams: { name: "Sam's Club", sub: 'Provo', home: 'https://www.samsclub.com/', q: n => `https://www.samsclub.com/s/${encodeURIComponent(n)}` },
  walmart: { name: 'Walmart', sub: 'Spanish Fork', home: 'https://www.walmart.com/store/4068-spanish-fork-ut', q: n => `https://www.walmart.com/search?q=${encodeURIComponent(n)}` }
};
// An item can have many barcodes ("kinds"): regular + blueberry Belvita both count as Belvita.
const kindsOf = it => (it.codes || []).map(c => ({ code: c, ...((it.kinds || {})[c] || {}) }));
function addKind(x, code, p) {
  x.codes = [...new Set([...(x.codes || []), code])];
  x.kinds = { ...(x.kinds || {}) };
  if (p && !x.kinds[code]) x.kinds[code] = { name: p.name || '', img: p.img || '' };
}
function dropKind(x, code) { x.codes = (x.codes || []).filter(c => c !== code); if (x.kinds) { x.kinds = { ...x.kinds }; delete x.kinds[code]; } }
const ownerOf = code => [...DB.items.values()].find(i => (i.codes || []).some(c => normCode(c) === code));
const normCode = c => { c = String(c).trim(); return /^\d{12}$/.test(c) ? '0' + c : c; };
const flowerPH = `<svg viewBox="0 0 24 24" fill="currentColor"><g opacity=".9">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="12" cy="6.5" rx="3.2" ry="4.6" transform="rotate(${a} 12 12)"/>`).join('')}</g><circle cx="12" cy="12" r="2.6" fill="#f6d36b"/></svg>`;
// Which picture to show: the package of the batch that expires first (its kind's photo),
// otherwise the item's main photo.
const kindName = (it, code) => code ? ((it.kinds || {})[code]?.name || '') : '';
function showImg(it) {
  const first = sortLots(it.lots)[0];
  const k = first?.code && (it.kinds || {})[first.code];
  return (k && k.img) || it.img || '';
}
const pic = (it, cls = 'thumb') => showImg(it) ? `<img class="${cls}" src="${esc(showImg(it))}" alt="" loading="lazy">` : `<div class="${cls} ph">${flowerPH}</div>`;

/* ───────────── Data store (local or Firebase) ───────────── */
const DEFAULT_META = () => ({
  cats: SEED.cats,
  shelves: 'ABCDEF'.split('').map(id => ({ id, rows: 5 })),
  emails: ['shawn@spencerfam.com', ''],
  reportDay: 6, reportHour: 8, reportRequested: false
});
const DB = {
  mode: 'local', user: null, items: new Map(), meta: DEFAULT_META(), fb: null, ready: false,
  loadLocal() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem('sffs-local')); } catch {}
    if (saved?.items) { saved.items.forEach(i => this.items.set(i.id, i)); this.meta = { ...DEFAULT_META(), ...saved.meta }; }
    else SEED.items.forEach(i => this.items.set(i.id, clone(i)));
    this.persistLocal();
  },
  // Quick-start copy for this device. Once synced, photos live in the shared
  // database (and its offline cache), so this copy skips them to stay small.
  persistLocal() {
    const items = [...this.items.values()];
    const slim = this.mode !== 'cloud' ? items : items.map(i => {
      let o = i;
      if (i.img?.startsWith('data:')) o = { ...o, img: '', imgCloud: true };
      if (Object.values(i.kinds || {}).some(k => k.img?.startsWith('data:'))) {
        const kinds = {}; for (const [c, k] of Object.entries(i.kinds)) { const { img, ...rest } = k; kinds[c] = img?.startsWith('data:') ? rest : k; }
        o = { ...o, kinds, imgCloud: true };
      }
      return o;
    });
    try { localStorage.setItem('sffs-local', JSON.stringify({ meta: this.meta, items: slim, mode: this.mode })); }
    catch { if (this.mode !== 'cloud') toast("This phone's storage is full — turn on Sync so photos can live in the cloud"); }
  },
  async saveItem(it) {
    it.updatedAt = Date.now(); it.updatedBy = this.user?.email || 'this device';
    this.items.set(it.id, it); this.persistLocal(); render();
    if (this.mode === 'cloud') {
      const { doc, setDoc } = this.fb, ref = doc(this.fb.db, this.path('items'), it.id);
      // never blank out a synced photo just because this device's quick-start copy didn't hold it
      if (it.imgCloud) { const { imgCloud, ...rest } = it; if (!rest.img) delete rest.img; await setDoc(ref, rest, { merge: true }).catch(syncErr); }
      else { delete it.imgCloud; await setDoc(ref, it).catch(syncErr); }
    }
  },
  async deleteItem(id) {
    this.items.delete(id); this.persistLocal(); render();
    if (this.mode === 'cloud') { const { doc, deleteDoc } = this.fb; await deleteDoc(doc(this.fb.db, this.path('items'), id)).catch(syncErr); }
  },
  async saveMeta(patch) {
    Object.assign(this.meta, patch); this.persistLocal(); render();
    if (this.mode === 'cloud') { const { doc, setDoc } = this.fb; await setDoc(doc(this.fb.db, this.path()), patch, { merge: true }).catch(syncErr); }
  },
  // Safe read-modify-write for quantity changes so two phones don't clobber each other
  async mutate(id, fn) {
    if (this.mode === 'cloud' && navigator.onLine) {
      const { doc, runTransaction } = this.fb; const ref = doc(this.fb.db, this.path('items'), id);
      try {
        let out;
        await runTransaction(this.fb.db, async tx => {
          const snap = await tx.get(ref); const it = snap.exists() ? snap.data() : clone(this.items.get(id));
          fn(it); it.updatedAt = Date.now(); it.updatedBy = this.user?.email || ''; tx.set(ref, it); out = it;
        });
        this.items.set(id, out); this.persistLocal(); render(); return out;
      } catch (e) { console.warn(e); }
    }
    const it = clone(this.items.get(id)); fn(it); await this.saveItem(it); return it;
  },
  path(sub) { return `households/${CFG.household || 'spencer'}` + (sub ? '/' + sub : ''); }
};
function syncErr(e) { console.error(e); toast('Saved here — will sync when back online'); }

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
async function initCloud() {
  if (!CFG.firebase) return setSync('this device');
  try {
    const [{ initializeApp }, auth, fs] = await Promise.all([
      import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')]);
    const app = initializeApp(CFG.firebase);
    const db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) });
    // Remember the sign-in on this device in two places (IndexedDB, then plain storage as a backup),
    // so app updates never sign you out.
    let fbAuth;
    try { fbAuth = auth.initializeAuth(app, { persistence: [auth.indexedDBLocalPersistence, auth.browserLocalPersistence] }); }
    catch { fbAuth = auth.getAuth(app); }
    DB.fb = { ...auth, ...fs, app, db, auth: fbAuth };
    auth.onAuthStateChanged(fbAuth, user => {
      DB.user = user;
      if (user) { dev.set('lastEmail', user.email); return goCloud(); }
      DB.mode = 'local'; unsubs.forEach(u => u()); unsubs = [];
      setSync(dev.get('lastEmail', '') ? 'tap to sign in' : 'signed out'); render();
    });
  } catch (e) { console.error(e); setSync('offline'); }
}
let unsubs = [];
async function goCloud() {
  const { collection, doc, onSnapshot, getDocs, getDoc, writeBatch } = DB.fb, db = DB.fb.db;
  setSync('connecting…');
  try {
    const existing = await getDocs(collection(db, DB.path('items')));
    if (existing.empty) {   // first sign-in ever: upload what's on this device (her tracker)
      const items = [...DB.items.values()];
      for (let i = 0; i < items.length; i += 400) {
        const b = writeBatch(db);
        items.slice(i, i + 400).forEach(it => b.set(doc(db, DB.path('items'), it.id), it));
        if (i === 0) b.set(doc(db, DB.path()), DB.meta, { merge: true });
        await b.commit();
      }
      toast('Our storage is now synced ✿');
    } else {
      // Anything changed on this device before signing in (photos, barcodes, counts) gets sent up,
      // unless the shared copy was changed more recently.
      const cloud = new Map(existing.docs.map(d => [d.id, d.data()]));
      const newer = [...DB.items.values()].filter(it => it.updatedAt && !it.imgCloud && (!cloud.has(it.id) || (cloud.get(it.id).updatedAt || 0) < it.updatedAt));
      for (let i = 0; i < newer.length; i += 400) {
        const b = writeBatch(db); newer.slice(i, i + 400).forEach(it => b.set(doc(db, DB.path('items'), it.id), it)); await b.commit();
      }
      if (newer.length) toast(`Sent ${newer.length} change${newer.length === 1 ? '' : 's'} from this device ✿`);
      if (!(await getDoc(doc(db, DB.path()))).exists()) await DB.fb.setDoc(doc(db, DB.path()), DB.meta, { merge: true });
    }
  } catch (e) { console.error(e); setSync('no access'); toast("This account isn't allowed in — check SETUP.md step 3"); return; }
  DB.mode = 'cloud';
  unsubs.forEach(u => u()); unsubs = [];
  unsubs.push(onSnapshot(collection(db, DB.path('items')), snap => {
    DB.items = new Map(snap.docs.map(d => [d.id, d.data()])); DB.persistLocal(); render();
    setSync(snap.metadata.fromCache ? 'saved, syncing' : 'synced', !snap.metadata.fromCache);
  }));
  unsubs.push(onSnapshot(doc(db, DB.path()), snap => { if (snap.exists()) { DB.meta = { ...DEFAULT_META(), ...snap.data() }; DB.persistLocal(); render(); } }));
}
function setSync(txt, on = false) {
  const el = $('#syncState'); el.innerHTML = `<span class="dot ${on ? 'on' : ''}"></span><span>${esc(txt)}</span>`;
  el.classList.toggle('needs', /sign in/.test(txt));
}
// Tapping "tap to sign in" goes straight to the sign-in fields, email already filled in
$('#syncState').addEventListener('click', () => {
  if (DB.mode === 'cloud' || !CFG.firebase) return;
  openSettings();
  setTimeout(() => { const p = $('#stPass'); if (p) { p.scrollIntoView({ block: 'center' }); p.focus(); } }, 350);
});

/* ───────────── Home ───────────── */
// Food & freezers A–Z, then Household, then Medicine, then Longterm (new categories slot in alphabetically).
const LAST = ['household', 'medicine', 'longterm'];
function catGroups() {
  const all = DB.meta.cats;
  const food = all.filter(c => !LAST.includes(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  return [food, ...LAST.map(id => all.filter(c => c.id === id))].filter(g => g.length);
}
const orderedCats = () => catGroups().flat();
let query = '', activeCat = null;
function render() {
  const items = [...DB.items.values()];
  const q = query.trim().toLowerCase();
  const cats = orderedCats();
  // use-soon ribbon
  const soon = [];
  items.forEach(it => sortLots(it.lots).forEach(l => { const n = daysLeft(l.exp); if (n <= SOON) soon.push({ it, l, n }); }));
  soon.sort((a, b) => a.n - b.n);
  const soonEl = $('#soon');
  soonEl.classList.toggle('hidden', !soon.length || !!q);
  soonEl.innerHTML = `<h3>Use soon</h3><div class="row">${soon.map(({ it, l, n }) =>
    `<button class="chip" data-open="${it.id}">${pic(it, '')}<span><b>${esc(it.name)}</b><small>${n < 0 ? 'expired ' + fmtExp(l.exp) : fmtLeft(l.exp)}</small></span></button>`).join('')}</div>`;
  // nav
  $('#cats').innerHTML = catGroups().map(g => g.map(c => `<button data-cat="${c.id}" class="${c.id === activeCat ? 'on' : ''}">${esc(c.name)}</button>`).join('')).join('<span class="sep" aria-hidden="true">•</span>');
  // sections
  const byCat = new Map(cats.map(c => [c.id, []]));
  items.forEach(it => { if (!q || (it.name + ' ' + (it.loc || '') + ' ' + (it.brand || '')).toLowerCase().includes(q)) (byCat.get(it.cat) || byCat.set(it.cat, []).get(it.cat)).push(it); });
  const html = cats.map(c => {
    const list = (byCat.get(c.id) || []).sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
    if (!list.length) return q ? '' : `<section class="cat" id="cat-${c.id}"><h2>${esc(c.name)}</h2><p class="note">Nothing here yet.</p></section>`;
    const units = list.reduce((a, i) => a + qtyOf(i), 0);
    return `<section class="cat" id="cat-${c.id}"><h2>${esc(c.name)} <small>${units} on hand</small></h2><div class="items">${list.map(row).join('')}</div></section>`;
  }).join('');
  $('#list').innerHTML = html || `<p class="empty-note">Nothing matches “${esc(query)}”.<br><button class="link" id="addFromSearch">Add it ✿</button></p>`;
  layoutCards();
  // shopping badge + app icon badge
  const need = items.filter(i => qtyOf(i) < (i.par ?? 1)).length;
  $('#shopBadge').textContent = need; $('#shopBadge').classList.toggle('hidden', !need);
  if ('setAppBadge' in navigator) { soon.length ? navigator.setAppBadge(soon.length).catch(() => {}) : navigator.clearAppBadge?.().catch(() => {}); }
}
function row(it) {
  const q = qtyOf(it), s = soonest(it), n = s ? daysLeft(s.exp) : Infinity;
  const cls = q === 0 ? 'out' : q < (it.par ?? 1) ? 'low' : '';
  return `<button class="item ${cls}" data-open="${it.id}">${pic(it)}
    <span><div class="nm">${esc(it.name)}</div><div class="meta">${it.loc ? `<span class="loc">${esc(it.loc)}</span>` : ''}${(it.codes || []).length > 1 ? `<span>${it.codes.length} kinds</span>` : ''}${it.brand ? `<span>${esc(it.brand)}</span>` : ''}</div></span>
    <span class="q"><div class="n">${q}<span class="par"> / ${it.par ?? 1}</span></div><div class="e ${n <= SOON ? 'soon' : ''}">${s ? (n < 0 ? 'expired' : 'exp ' + fmtExp(s.exp)) : ''}</div></span></button>`;
}
document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]'); if (o && !o.closest('.sheet')) return openItem(o.dataset.open);
  const c = e.target.closest('[data-cat]');
  if (c) jumpToCat(c.dataset.cat);
  if (e.target.id === 'addFromSearch') openItem(null, { name: query });
});
$('#q').addEventListener('input', e => { query = e.target.value; render(); });

// The list scrolls inside #scroller. Never use scrollIntoView here: on iPhone it can
// move the whole page and fight the finger (the old rubber-band bug).
const scroller = $('#scroller');
let jumping = 0;
function markCat(id) {
  activeCat = id;
  const nav = $('#cats');
  $$('.cats button').forEach(b => {
    b.classList.toggle('on', b.dataset.cat === id);
    if (b.dataset.cat === id) nav.scrollTo({ left: b.offsetLeft - nav.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' });
  });
}
const wide = () => innerWidth >= 700;   // category cards in columns
function jumpToCat(id) {
  const sec = $('#cat-' + id); if (!sec) return;
  if (wide()) { sec.classList.remove('glow'); void sec.offsetWidth; sec.classList.add('glow'); }
  markCat(id);
  const top = sec.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 52;
  jumping = Date.now();
  scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}
// keep the category word under-lined as you scroll
scroller.addEventListener('scroll', () => {
  if (Date.now() - jumping < 900) return;   // let a tapped jump finish first
  if (wide()) return;                         // cards sit side by side, so there's no single "current" one
  const lim = scroller.getBoundingClientRect().top + 120;
  let cur = null; for (const s of $$('section.cat')) { if (s.getBoundingClientRect().top < lim) cur = s.id.slice(4); }
  if (cur && cur !== activeCat) markCat(cur);
}, { passive: true });

// iPhone sometimes leaves the page shifted after the keyboard closes. Snap it back.
const settle = () => { if (!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) window.scrollTo(0, 0); };
document.addEventListener('focusout', () => setTimeout(settle, 60));
window.visualViewport?.addEventListener('resize', () => setTimeout(settle, 60));

// On iPad/computer, deal the category cards into columns left-to-right, each into
// whichever column is shortest, so A–Z reads across like her graph-paper page.
function layoutCards() {
  const list = $('#list'), secs = $$('section.cat', list);
  if (!wide() || !secs.length) { list.classList.remove('cols'); return; }
  const n = Math.max(1, Math.floor((list.clientWidth + 20) / (280 + 20)));
  list.classList.add('cols');
  const cols = Array.from({ length: n }, () => { const c = document.createElement('div'); c.className = 'col'; return c; });
  list.replaceChildren(...cols);
  for (const s of secs) cols.reduce((a, b) => (b.offsetHeight < a.offsetHeight ? b : a)).append(s);
}
let lastW = innerWidth;
addEventListener('resize', () => { if (Math.abs(innerWidth - lastW) > 40) { lastW = innerWidth; render(); } });

/* ───────────── Sheets ───────────── */
let onSheetClose = null;
function openSheet(html, onClose) {
  closeScanner();
  $('#sheetBody').innerHTML = html; onSheetClose = onClose || null;
  const v = $('#veil'); v.classList.remove('hidden'); requestAnimationFrame(() => { v.classList.add('show'); $('#sheet').classList.add('show'); });
  $('#sheet').scrollTop = 0;
  return $('#sheetBody');
}
function closeSheet() {
  document.activeElement?.blur?.();
  closeScanner(); onSheetClose?.(); onSheetClose = null;
  $('#veil').classList.remove('show'); $('#sheet').classList.remove('show');
  setTimeout(() => { if (!$('#sheet').classList.contains('show')) $('#veil').classList.add('hidden'); }, 300);
}
$('#veil').onclick = closeSheet;
// swipe down to close
(() => { let y0 = null; const sh = $('#sheet');
  sh.addEventListener('touchstart', e => { y0 = (sh.scrollTop <= 0 || e.target.closest('.grabbar')) ? e.touches[0].clientY : null; }, { passive: true });
  sh.addEventListener('touchend', e => { if (y0 != null && e.changedTouches[0].clientY - y0 > 110) closeSheet(); y0 = null; }, { passive: true }); })();
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

/* location picker: little bookcases, row 1 at the bottom */
function shelvesHTML(sel) {
  return `<div class="shelves">${DB.meta.shelves.map(s => `<div class="shelf">${'<span class="lbl">' + esc(s.id) + '</span>'}${Array.from({ length: s.rows }, (_, i) =>
    `<button type="button" data-loc="${esc(s.id)}${i + 1}" class="${sel === s.id + (i + 1) ? 'on' : ''}">${i + 1}</button>`).join('')}</div>`).join('')}</div>`;
}
function wireShelves(root, get, set) {
  root.addEventListener('click', e => { const b = e.target.closest('[data-loc]'); if (!b) return;
    const v = get() === b.dataset.loc ? '' : b.dataset.loc; set(v);
    $$('[data-loc]', root).forEach(x => x.classList.toggle('on', x.dataset.loc === v)); });
}

/* ───────────── Item sheet (view / edit / add by hand) ───────────── */
function openItem(id, preset = {}) {
  const isNew = !id;
  const d = isNew ? { id: uid(), name: '', cat: activeCat || DB.meta.cats[0].id, lots: [], par: 1, loc: '', img: '', codes: [], store: 'maceys', notes: '', order: 999, ...preset }
                  : clone(DB.items.get(id));
  if (!d) return;
  if (isNew && !d.lots.length) d.lots.push({ id: uid('l'), exp: '', qty: 1 });
  d.lots.sort((x, y) => (expDate(x.exp) || 9e15) - (expDate(y.exp) || 9e15));   // soonest first, like the picture
  const body = openSheet(`
    <div class="hero">
      <button class="picwrap" id="pickPic">${d.img ? `<img class="pic" src="${esc(d.img)}">` : `<div class="pic ph">${flowerPH}</div>`}<small>${d.img ? 'change' : 'add photo'}</small></button>
      <div style="flex:1;min-width:0">
        <label class="field" style="margin:0"><span>${isNew ? 'New item' : esc(DB.meta.cats.find(c => c.id === d.cat)?.name || '')}</span>
        <input id="fName" value="${esc(d.name)}" placeholder="What is it?" style="font:italic 600 24px Fraunces,serif"></label>
        <div class="note" id="fSum"></div>
      </div>
    </div>
    <div class="sec-title" style="color:var(--ink);margin-top:14px">On the shelf</div>
    <div class="lots" id="fLots"></div>
    <button class="link flourish" id="fAddLot">add another batch</button>
    <div class="sec-title" style="color:var(--ink);margin-top:20px">Where it lives</div>
    <div id="fShelves">${shelvesHTML(d.loc)}</div>
    <div class="cols">
      <label class="field"><span>Category</span><select id="fCat">${orderedCats().map(c => `<option value="${c.id}" ${c.id === d.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Keep on hand</span><input id="fPar" type="number" inputmode="numeric" min="0" value="${d.par ?? 1}"></label>
    </div>
    <div class="cols">
      <label class="field"><span>Usually buy at</span><select id="fStore">${Object.entries(STORES).map(([k, s]) => `<option value="${k}" ${k === d.store ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label>
      <label class="field"><span>Brand / size</span><input id="fBrand" value="${esc(d.brand || '')}"></label>
    </div>
    <div class="sec-title" style="color:var(--ink);margin-top:20px">Kinds we buy</div>
    <p class="note" style="margin:0 0 4px">Every barcode here counts as this item, so different flavors or brands all land in one place. Tap a picture to change it. The list shows the picture of whichever kind expires first.</p>
    <div id="fKinds"></div>
    <div class="acts" style="justify-content:flex-start;gap:24px;margin-top:8px">
      <button class="link flourish" id="fScanKind">scan another kind</button><button class="link mute" id="fTypeKind">type a barcode</button></div>
    <div class="cols hidden" id="fTypeRow" style="align-items:end"><label class="field"><span>Barcode number</span><input id="fTyped" inputmode="numeric"></label>
      <button class="link" id="fTypedGo" style="margin-bottom:18px">add</button></div>
    <label class="field"><span>Notes</span><input id="fNotes" value="${esc(d.notes || '')}"></label>
    <div class="acts">
      ${isNew ? '<span></span>' : '<button class="link warn" id="fDel">remove item</button>'}
      <span style="display:flex;gap:22px"><button class="link mute" id="fCancel">cancel</button><button class="link big flourish" id="fSave">${isNew ? 'Add it' : 'Save'}</button></span>
    </div>`);
  const drawLots = () => {
    const lots = d.lots;
    $('#fLots', body).innerHTML = lots.length ? lots.map((l, i) => { const n = daysLeft(l.exp);
      return `<div class="lot"><span class="when ${n <= SOON ? 'soon' : ''}">
        <input type="month" value="${/^\d{4}-\d{2}$/.test(l.exp) ? l.exp : ''}" data-exp="${i}" style="border:0;background:none;font-weight:600;font-size:16px;padding:0;max-width:170px" ${/^\d{4}$/.test(l.exp) ? 'class="hidden"' : ''}>
        ${/^\d{4}$/.test(l.exp) ? `<b>${l.exp}</b> <button class="link mute" data-yr="${i}" style="font-size:12px">change</button>` : ''}
        <small>${l.exp ? (fmtLeft(l.exp) || 'expires ' + fmtExp(l.exp)) : 'no date — tap to set'}</small>
        ${kindsOf(d).length ? `<select data-lkind="${i}" style="border:0;background:none;color:var(--accent);font-size:13px;font-weight:700;padding:0;max-width:190px;-webkit-appearance:none;appearance:none">
          <option value="">which kind? ▾</option>${kindsOf(d).map((k, j) => `<option value="${esc(k.code)}" ${k.code === l.code ? 'selected' : ''}>${esc(k.name || 'Kind ' + (j + 1))} ▾</option>`).join('')}</select>` : ''}</span>
        <span class="step"><button data-m="${i}">−</button><b>${l.qty}</b><button data-p="${i}">+</button></span></div>`; }).join('')
      : `<p class="note">None on the shelf right now.</p>`;
    const q = lots.reduce((a, l) => a + (+l.qty || 0), 0);
    $('#fSum', body).textContent = `${q} on hand · keep ${d.par ?? 1}` + (d.loc ? ` · shelf ${d.loc}` : '');
  };
  drawLots();
  body.addEventListener('click', e => {
    const t = e.target, m = t.dataset.m, p = t.dataset.p, yr = t.dataset.yr;
    if (m != null) { d.lots[m].qty = Math.max(0, d.lots[m].qty - 1); if (!d.lots[m].qty && d.lots.length > 1) d.lots.splice(m, 1); drawLots(); }
    if (p != null) { d.lots[p].qty++; drawLots(); }
    if (yr != null) { d.lots[yr].exp = ''; drawLots(); }
  });
  body.addEventListener('change', e => {
    const i = e.target.dataset.exp; if (i != null) { d.lots[i].exp = e.target.value; drawLots(); }
    const j = e.target.dataset.lkind; if (j != null) { if (e.target.value) d.lots[j].code = e.target.value; else delete d.lots[j].code; drawLots(); }
  });
  wireShelves($('#fShelves', body), () => d.loc, v => { d.loc = v; drawLots(); });
  $('#fAddLot', body).onclick = () => { d.lots.push({ id: uid('l'), exp: '', qty: 1 }); drawLots(); };
  $('#fPar', body).oninput = e => { d.par = Math.max(0, +e.target.value || 0); drawLots(); };
  $('#pickPic', body).onclick = () => choosePhoto(d.name, url => { d.img = url; $('#pickPic', body).innerHTML = `<img class="pic" src="${esc(url)}"><small>change</small>`; }, true);
  $('#fCancel', body).onclick = closeSheet;
  if (!isNew) $('#fDel', body).onclick = async () => { if (confirm(`Remove ${d.name} from the app entirely?`)) { await DB.deleteItem(d.id); closeSheet(); toast('Removed'); } };
  const collect = () => {
    d.name = $('#fName', body).value.trim(); if (!d.name) { $('#fName', body).focus(); toast('Give it a name first'); return false; }
    d.cat = $('#fCat', body).value; d.store = $('#fStore', body).value; d.brand = $('#fBrand', body).value.trim();
    d.notes = $('#fNotes', body).value.trim();
    $$('[data-kname]', body).forEach(inp => { const c = inp.dataset.kname; d.kinds = { ...(d.kinds || {}) }; d.kinds[c] = { ...(d.kinds[c] || {}), name: inp.value.trim() }; });
    d.lots = mergeLots(d.lots);
    return true;
  };
  const drawKinds = () => {
    const ks = kindsOf(d);
    $('#fKinds', body).innerHTML = ks.length ? `<div class="lots">${ks.map(k => `<div class="lot">
      <button data-kpic="${esc(k.code)}" aria-label="Change this kind's picture" style="flex:none">${k.img ? `<img class="thumb" src="${esc(k.img)}" alt="" style="width:40px;height:40px;pointer-events:none">` : `<div class="thumb ph" style="width:40px;height:40px;pointer-events:none">${flowerPH}</div>`}</button>
      <span class="when" style="min-width:0"><input data-kname="${esc(k.code)}" value="${esc(k.name || '')}" placeholder="name this kind, like Blueberry"
        style="border:0;background:none;font-weight:600;font-size:15px;padding:0;width:100%;outline:none"><small>${esc(k.code)}</small></span>
      <button class="link mute" data-rmkind="${esc(k.code)}" aria-label="Remove this barcode" style="font-size:22px;padding:0 4px">×</button></div>`).join('')}</div>`
      : `<p class="note">No barcodes yet. Scan one and it'll show up here.</p>`;
    if (kindsOf(d).length) $('#fKindTip', body)?.classList.remove('hidden');
  };
  drawKinds();
  body.addEventListener('click', e => { const c = e.target.dataset?.kpic; if (c == null) return;
    const k = (d.kinds || {})[c] || {};
    choosePhoto(`${d.name} ${k.name || ''}`.trim(), url => { collect(); d.kinds = { ...(d.kinds || {}) }; d.kinds[c] = { ...(d.kinds[c] || {}), img: url }; drawKinds(); drawLots(); }, e.target.closest('.lot'));
  });
  body.addEventListener('click', e => { const c = e.target.dataset?.rmkind; if (c == null) return;
    collect(); dropKind(d, c); drawKinds(); toast('Barcode removed (tap Save to keep it that way)'); });
  // scanning or typing a kind saves what's on screen first, then comes back here
  const attach = async code => { if (!collect()) return; await DB.saveItem(d); attachKind(d.id, code); };
  $('#fScanKind', body).onclick = async () => { if (!collect()) return; await DB.saveItem(d); openScanner({ attach: d.id }); };
  $('#fTypeKind', body).onclick = () => { $('#fTypeRow', body).classList.toggle('hidden'); $('#fTyped', body).focus(); };
  $('#fTypedGo', body).onclick = () => { const v = $('#fTyped', body).value.replace(/\s/g, ''); if (v) attach(normCode(v)); };
  $('#fSave', body).onclick = async () => {
    if (!collect()) return;
    await DB.saveItem(d); closeSheet(); toast(isNew ? 'Added ✿' : 'Saved ✿');
  };
  if (isNew && !d.name) setTimeout(() => $('#fName', body)?.focus(), 350);
}
function mergeLots(lots) {
  const m = new Map();
  for (const l of lots) {
    if (!(l.qty > 0)) continue; const k = (l.exp || '') + '|' + (l.code || '');
    if (m.has(k)) m.get(k).qty += l.qty;
    else m.set(k, { id: l.id || uid('l'), exp: l.exp || '', qty: l.qty, ...(l.code ? { code: l.code } : {}) });
  }
  return [...m.values()];
}

/* photo: camera / library / paste a web link / search the web */
let filePickCb = null;
$('#filePick').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f || !filePickCb) return;
  filePickCb(await shrink(f));
});
function shrink(file, max = 420) {
  return new Promise(res => { const img = new Image(); img.onload = () => {
    const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src); res(c.toDataURL('image/jpeg', .72)); };
    img.src = URL.createObjectURL(file); });
}
function choosePhoto(name, cb, anchor) {
  const pop = document.createElement('div');
  pop.className = 'choice';
  pop.innerHTML = `<button class="link big" data-a="file">Take or choose a photo</button>
    <button class="link big" data-a="url">Paste a picture link<small>long-press a picture online → Copy Image Address</small></button>
    <button class="link big" data-a="web">Find one online<small>opens a picture search for “${esc(name || 'this')}”</small></button>`;
  const host = anchor instanceof Element ? anchor : $('#sheetBody .hero');
  const old = $('#sheetBody .choice.photo'); if (old) { const same = old.previousElementSibling === host; old.remove(); if (same) return; }
  pop.classList.add('photo'); host.after(pop);
  pop.onclick = e => { const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'file') { filePickCb = u => { cb(u); pop.remove(); }; $('#filePick').click(); }
    if (a === 'url') { const u = prompt('Paste the picture link'); if (u && /^https?:\/\//.test(u.trim())) { cb(u.trim()); pop.remove(); } }
    if (a === 'web') window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent((name || '') + ' package')}`, '_blank');
  };
}

/* ───────────── Put away / take out ───────────── */
function heroHTML(it, line) {
  return `<div class="hero">${pic(it, 'pic')}<div><h2>${esc(it.name)}</h2><p class="sub">${line}</p></div></div>`;
}
function openPutAway(id, qtyDefault = 1, code = '') {
  const it = DB.items.get(id); let qty = qtyDefault, loc = it.loc || '';
  const ks = kindsOf(it);
  const kindPic = code && (it.kinds || {})[code]?.img;
  const body = openSheet(`<div class="hero">${kindPic ? `<img class="pic" src="${esc(kindPic)}" alt="">` : pic(it, 'pic')}<div><h2>${esc(it.name)}</h2>
      <p class="sub">${kindName(it, code) ? esc(kindName(it, code)) + ' · ' : ''}${qtyOf(it)} on hand${it.loc ? ' · shelf ' + esc(it.loc) : ''}</p></div></div>
    ${!code && ks.length > 1 ? `<label class="field"><span>Which kind</span><select id="paKind"><option value="">not sure</option>${ks.map((k, j) => `<option value="${esc(k.code)}">${esc(k.name || 'Kind ' + (j + 1))}</option>`).join('')}</select></label>` : ''}
    <div class="cols">
      <label class="field"><span>Expires</span><input type="month" id="paExp"></label>
      <div class="field"><span>How many</span><div class="step" style="padding-top:6px"><button id="paM">−</button><b id="paQ">${qty}</b><button id="paP">+</button></div></div>
    </div>
    <p class="note" id="paHint"></p>
    ${it.loc ? '' : `<div class="sec-title" style="color:var(--ink)">Which shelf?</div><div id="paShelves">${shelvesHTML('')}</div>`}
    <div class="acts"><button class="link mute" id="paCancel">cancel</button><button class="link big flourish" id="paGo">Tuck it away</button></div>`);
  const last = sortLots(it.lots).filter(l => l.exp).pop();
  if (last) { $('#paHint', body).textContent = `Last batch was ${fmtExp(last.exp)}.`; if (/^\d{4}-\d{2}$/.test(last.exp)) $('#paExp', body).value = last.exp; }
  $('#paM', body).onclick = () => { qty = Math.max(1, qty - 1); $('#paQ', body).textContent = qty; };
  $('#paP', body).onclick = () => { qty++; $('#paQ', body).textContent = qty; };
  if (!it.loc) wireShelves($('#paShelves', body), () => loc, v => loc = v);
  $('#paCancel', body).onclick = closeSheet;
  $('#paGo', body).onclick = async () => {
    const exp = $('#paExp', body).value;
    const kc = code || $('#paKind', body)?.value || (ks.length === 1 ? ks[0].code : '');
    await DB.mutate(id, x => { x.lots = mergeLots([...(x.lots || []), { exp, qty, ...(kc ? { code: kc } : {}) }]); if (loc) x.loc = loc; });
    closeSheet(); toast(`Tucked away ✿ ${loc ? 'on ' + loc : ''}`);
  };
}
function openTakeOut(id, code = '') {
  const it = DB.items.get(id), lots = sortLots(it.lots);
  if (!lots.length) return toast(`No ${it.name} on the shelf`);
  const o = lots[0], n = daysLeft(o.exp);
  const body = openSheet(`${heroHTML(it, `${qtyOf(it)} on hand${it.loc ? ' · shelf ' + esc(it.loc) : ''}`)}
    <h2 style="font-size:22px">Did you grab the oldest one?</h2>
    <p class="sub">${kindName(it, o.code) ? `It's the <b>${esc(kindName(it, o.code))}</b>. ` : ''}${o.exp ? `The soonest one expires <b style="color:${n <= SOON ? 'var(--warn)' : 'var(--ink)'}">${fmtExp(o.exp)}</b>${fmtLeft(o.exp) ? ' — ' + fmtLeft(o.exp) : ''}${o.qty > 1 ? ` (${o.qty} of those)` : ''}.` : 'No date on this one.'}</p>
    <div class="choice">
      <button class="link big flourish" id="toYes">Yes, that one</button>
      ${lots.length > 1 ? `<button class="link big" id="toOther">I took a different one</button>` : ''}
      <button class="link mute" id="toCancel">never mind</button>
    </div><div id="toLots"></div>`);
  const take = async lotId => {
    const out = await DB.mutate(id, x => { const l = x.lots.find(l => l.id === lotId) || sortLots(x.lots)[0]; if (l) l.qty--; x.lots = x.lots.filter(l => l.qty > 0); });
    closeSheet();
    const left = qtyOf(out);
    toast(left < (out.par ?? 1) ? `Enjoy! ${out.name} is on the shopping list` : `Enjoy! ${left} left`);
  };
  $('#toYes', body).onclick = () => take(o.id);
  $('#toCancel', body).onclick = closeSheet;
  if (lots.length > 1) $('#toOther', body).onclick = () => {
    const rest = lots.slice(1).sort((a, b) => (b.code === code) - (a.code === code));   // the kind you scanned first
    $('#toLots', body).innerHTML = `<div class="sugg">${rest.map(l => `<button data-lot="${l.id}">${kindName(it, l.code) ? esc(kindName(it, l.code)) + ' · ' : ''}expires ${l.exp ? fmtExp(l.exp) : '— no date'} <small>· ${l.qty} there</small></button>`).join('')}</div>`;
  };
  $('#toLots', body).onclick = e => { const b = e.target.closest('[data-lot]'); if (b) take(b.dataset.lot); };
}
function openUsePicker() {
  const body = openSheet(`<h2>What are you using?</h2><p class="sub">Or scan it — the barcode works for this too.</p>
    <label class="field"><span>Find it</span><input id="upQ" type="search" placeholder="Cheerios, flour…" autocomplete="off"></label><div class="sugg" id="upList"></div>`);
  const draw = () => { const q = $('#upQ', body).value.toLowerCase();
    const list = [...DB.items.values()].filter(i => qtyOf(i) > 0 && (!q || i.name.toLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 40);
    $('#upList', body).innerHTML = list.map(i => `<button data-take="${i.id}">${esc(i.name)} <small>· ${qtyOf(i)} ${i.loc ? '· ' + esc(i.loc) : ''}</small></button>`).join('') || '<p class="note">Nothing found.</p>'; };
  draw(); $('#upQ', body).oninput = draw;
  $('#upList', body).onclick = e => { const b = e.target.closest('[data-take]'); if (b) openTakeOut(b.dataset.take); };
  setTimeout(() => $('#upQ', body)?.focus(), 350);
}

/* ───────────── Scanner ───────────── */
let scanner = null;
async function closeScanner() { if (scanner) { const s = scanner; scanner = null; try { await s.stop(); s.clear(); } catch {} } }
let scanBusy = false;
function openScanner(opts = {}) {
  scanBusy = false;
  const target = opts.attach && DB.items.get(opts.attach);
  const body = openSheet(`<h2>${target ? 'Scan the other kind' : 'Scan a barcode'}</h2><p class="sub">${target ? `It'll count as <b>${esc(target.name)}</b>.` : 'Hold the code inside the frame.'}</p>
    <div id="reader"></div>
    <div class="cols" style="align-items:end"><label class="field"><span>Or type the number</span><input id="typed" inputmode="numeric" placeholder="0 12345 67890 5"></label>
    <button class="link" id="typedGo" style="margin-bottom:18px">look it up</button></div>`);
  $('#typedGo', body).onclick = () => { const v = $('#typed', body).value.replace(/\s/g, ''); if (v) onCode(v, opts); };
  const start = () => {
    if (!window.Html5Qrcode) return setTimeout(start, 200);
    const F = window.Html5QrcodeSupportedFormats;
    scanner = new Html5Qrcode('reader', { formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128, F.CODE_39, F.QR_CODE], verbose: false,
      experimentalFeatures: { useBarCodeDetectorIfSupported: true } });
    scanner.start({ facingMode: 'environment' }, { fps: 12, qrbox: (w, h) => ({ width: Math.floor(w * .86), height: Math.floor(Math.min(h, w) * .45) }), aspectRatio: 1.333 },
      text => { if (scanBusy) return; scanBusy = true; navigator.vibrate?.(30); onCode(text, opts); }, () => {})
      .catch(() => { $('#reader', body).innerHTML = `<p class="note" style="color:#fff;padding:20px">Camera isn't available here. Allow camera access, or type the number below.</p>`; });
  };
  start();
}
async function onCode(raw, opts = {}) {
  await closeScanner();
  if (/^i\s*love\s*you$/i.test(raw.trim())) return loveNote();
  const code = normCode(raw);
  if (opts.attach) return attachKind(opts.attach, code);
  const found = ownerOf(code);
  if (found) return openFound(found.id, code);
  openSheet(`<h2>Looking it up…</h2><p class="sub">${esc(code)}</p>`);
  const p = await lookup(code);
  openNew(code, p);
}
// add a barcode to an item from its own page ("scan another kind")
async function attachKind(id, code) {
  const it = DB.items.get(id);
  const prev = ownerOf(code);
  if (prev?.id === id) { toast('That one is already here'); return openItem(id); }
  openSheet(`<h2>Looking it up…</h2><p class="sub">${esc(code)}</p>`);
  const p = await lookup(code);
  if (prev) await DB.mutate(prev.id, x => dropKind(x, code));
  await DB.mutate(id, x => { addKind(x, code, p || { name: '' }); if (!x.img && p?.img) x.img = p.img; });
  toast(prev ? `Moved from ${prev.name} ✿` : `Added ${p?.name ? p.name : 'that kind'} to ${it.name} ✿`);
  openItem(id);
}
function openFound(id, code) {
  const it = DB.items.get(id), kind = code && (it.kinds || {})[code];
  const body = openSheet(`${heroHTML(it, `${kind?.name ? esc(kind.name) + ' · ' : ''}${qtyOf(it)} on hand${it.loc ? ' · shelf ' + esc(it.loc) : ''}`)}
    <div class="choice">
      <button class="link big flourish" id="fdIn">Putting it away<small>add to the shelf</small></button>
      <button class="link big flourish" id="fdOut">Taking one out<small>using it now</small></button>
      <button class="link mute" id="fdView">just looking</button>
    </div>`);
  $('#fdIn', body).onclick = () => openPutAway(id, 1, code || '');
  $('#fdOut', body).onclick = () => openTakeOut(id, code || '');
  $('#fdView', body).onclick = () => openItem(id);
}
function openNew(code, p) {
  const words = (p?.name || '').toLowerCase().split(/[^a-z0-9']+/).filter(w => w.length > 2);
  const all = [...DB.items.values()];
  const score = i => words.reduce((a, w) => a + (i.name.toLowerCase().includes(w) ? 1 : 0), 0);
  const guesses = words.length ? all.map(i => [score(i), i]).filter(x => x[0]).sort((a, b) => b[0] - a[0]).slice(0, 5).map(x => x[1]) : [];
  const body = openSheet(`<h2>${p ? 'New to us!' : "Hmm, we don't know this one"}</h2>
    ${p ? `<div class="result">${p.img ? `<img src="${esc(p.img)}">` : ''}<div><b>${esc(p.name)}</b><div class="note">${esc([p.brand, p.size].filter(Boolean).join(' · '))}</div></div></div>`
        : `<p class="sub">No picture or name found for ${esc(code)} — you can fill it in.</p>`}
    <div class="sec-title" style="color:var(--ink)">Is it one of ours?</div>
    <p class="note">Pick the item it belongs to and it'll be remembered. One item can have several kinds, so blueberry and regular Belvita can both count as Belvita.</p>
    <div class="sugg" id="nwGuess">${guesses.map(i => `<button data-link="${i.id}">${esc(i.name)} <small>· ${esc(DB.meta.cats.find(c => c.id === i.cat)?.name || '')}</small></button>`).join('')}</div>
    <label class="field"><span>Search our items</span><input id="nwQ" type="search" autocomplete="off"></label><div class="sugg" id="nwList"></div>
    <div class="acts"><button class="link mute" id="nwCancel">cancel</button><button class="link big flourish" id="nwNew">Add as a new item</button></div>`);
  $('#nwQ', body).oninput = e => { const q = e.target.value.toLowerCase();
    $('#nwList', body).innerHTML = q ? all.filter(i => i.name.toLowerCase().includes(q)).slice(0, 12).map(i => `<button data-link="${i.id}">${esc(i.name)} <small>· ${esc(DB.meta.cats.find(c => c.id === i.cat)?.name || '')}</small></button>`).join('') : ''; };
  body.addEventListener('click', async e => { const b = e.target.closest('[data-link]'); if (!b) return;
    const out = await DB.mutate(b.dataset.link, x => { addKind(x, code, p || { name: '' }); if (!x.img && p?.img) x.img = p.img; if (!x.brand && p?.brand) x.brand = p.brand; });
    toast(`Now counts as ${out.name} ✿`); openFound(out.id, code); });
  $('#nwCancel', body).onclick = closeSheet;
  $('#nwNew', body).onclick = () => openItem(null, { name: p?.name || '', img: p?.img || '', brand: [p?.brand, p?.size].filter(Boolean).join(' · '), codes: [code], kinds: { [code]: { name: p?.name || '', img: p?.img || '' } } });
}
async function lookup(code) {
  const tryJSON = async (url, t = 6000) => { const c = new AbortController(); const tm = setTimeout(() => c.abort(), t);
    try { const r = await fetch(url, { signal: c.signal }); return r.ok ? await r.json() : null; } catch { return null; } finally { clearTimeout(tm); } };
  const fields = 'product_name,product_name_en,generic_name,brands,quantity,image_front_url,image_front_small_url,image_url';
  for (const host of ['world.openfoodfacts.org', 'world.openproductsfacts.org', 'world.openbeautyfacts.org']) {
    for (const c of [code, code.replace(/^0/, '')]) {
      const j = await tryJSON(`https://${host}/api/v2/product/${c}?fields=${fields}`);
      const pr = j?.product; const name = pr && (pr.product_name_en || pr.product_name || pr.generic_name);
      if (name) return { name: name.trim(), brand: (pr.brands || '').split(',')[0].trim(), size: pr.quantity || '', img: pr.image_front_url || pr.image_url || pr.image_front_small_url || '' };
    }
  }
  const u = await tryJSON(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code.replace(/^0(?=\d{12}$)/, '')}`);
  const it = u?.items?.[0];
  if (it) return { name: it.title, brand: it.brand || '', size: it.size || '', img: (it.images || [])[0] || '' };
  return null;
}
function loveNote() {
  const body = openSheet(`<div style="text-align:center;padding:20px 0 10px">
    <button id="loveHeart" aria-label="More hearts" style="display:inline-block">
      <svg viewBox="0 0 64 64" width="96" height="96"><path d="M32 56S6 40 6 22a13 13 0 0 1 26-4 13 13 0 0 1 26 4c0 18-26 34-26 34Z" style="fill:var(--tulip1)"/></svg></button>
    <h2 style="font-size:36px">I love you Hun!</h2><p class="sub">You found the secret in the barcode ✿</p></div>`);
  const heart = $('#loveHeart', body);
  heart.onclick = () => heartShower(heart);
  setTimeout(() => heartShower(heart), 380);   // after the window slides up
}

// Hearts burst up out of the window, then shower down over the whole screen.
// (No broken or mending hearts.)
const HEARTS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🩵', '🤍', '💖', '💗', '💓', '💕', '💞', '💘', '💝', '❣️', '💟', '😍', '🥰'];
function heartShower(fromEl) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:80;pointer-events:none';
  document.body.append(cv);
  const dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  // draw each emoji once, then stamp copies (keeps it smooth on phones)
  const sprites = HEARTS.map(h => { const c = document.createElement('canvas'); c.width = c.height = 72;
    const x = c.getContext('2d'); x.font = '56px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(h, 36, 40); return c; });
  const r = fromEl?.getBoundingClientRect(), ox = r ? r.left + r.width / 2 : W / 2, oy = r ? r.top + r.height / 2 : H * .6;
  const pick = () => sprites[Math.floor(Math.random() * sprites.length)];
  const parts = [];
  // 1) fountain out of the pop-up
  const burst = reduce ? 0 : Math.round(Math.min(110, 50 + W / 8));
  for (let i = 0; i < burst; i++) {
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.5, sp = (H * 1.05 + Math.random() * H * .7);
    parts.push({ x: ox, y: oy, vx: Math.cos(a) * sp * .55, vy: Math.sin(a) * sp, t0: Math.random() * .45, s: 22 + Math.random() * 22,
      rot: (Math.random() - .5) * .6, vr: (Math.random() - .5) * 3, img: pick(), sway: Math.random() * 6 });
  }
  // 2) rain from the top across the whole screen
  const rain = reduce ? 40 : Math.round(Math.min(130, 60 + W / 6));
  for (let i = 0; i < rain; i++) {
    parts.push({ x: Math.random() * W, y: -40 - Math.random() * 60, vx: (Math.random() - .5) * 40, vy: 60 + Math.random() * 120,
      t0: (reduce ? 0 : .7) + Math.random() * 1.6, s: 18 + Math.random() * 24, rot: (Math.random() - .5) * .6, vr: (Math.random() - .5) * 2,
      img: pick(), sway: Math.random() * 6, rain: true });
  }
  const G = H * 1.1, start = performance.now(), END = 5.2;
  (function frame(now) {
    const t = (now - start) / 1000; ctx.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of parts) {
      const dt = t - p.t0; if (dt < 0) { alive++; continue; }
      const drag = p.rain ? 1 : 1 / (1 + dt * .9);
      const x = p.x + p.vx * dt * drag + Math.sin(dt * 2.4 + p.sway) * (p.rain ? 18 : 10) * Math.min(1, dt);
      const vyTerm = p.rain ? p.vy * dt + .5 * G * .35 * dt * dt : p.vy * dt * drag + .5 * G * dt * dt;
      const y = p.y + vyTerm;
      if (y > H + 60) continue;
      alive++;
      const fade = Math.min(1, dt * 6) * Math.min(1, (END - t) / .6);
      if (fade <= 0) continue;
      ctx.save(); ctx.globalAlpha = Math.max(0, fade); ctx.translate(x, y); ctx.rotate(p.rot + p.vr * dt);
      ctx.drawImage(p.img, -p.s / 2, -p.s / 2, p.s, p.s); ctx.restore();
    }
    if (alive && t < END) requestAnimationFrame(frame); else cv.remove();
  })(start);
  navigator.vibrate?.([20, 40, 20]);
}

/* ───────────── Shopping list ───────────── */
function shoppingData() {
  const need = [...DB.items.values()].map(i => ({ i, have: qtyOf(i), want: i.par ?? 1 })).filter(x => x.have < x.want);
  const groups = Object.keys(STORES).map(k => ({ k, s: STORES[k], rows: need.filter(x => (x.i.store || 'maceys') === k).sort((a, b) => a.i.name.localeCompare(b.i.name)) })).filter(g => g.rows.length);
  const soon = []; DB.items.forEach(i => sortLots(i.lots).forEach(l => { const n = daysLeft(l.exp); if (n <= SOON) soon.push({ i, l, n }); }));
  return { need, groups, soon: soon.sort((a, b) => a.n - b.n) };
}
function shoppingText() {
  const { groups, soon } = shoppingData();
  let t = 'Spencer Family · Shopping list\n';
  groups.forEach(g => { t += `\n${g.s.name}\n` + g.rows.map(x => `  ☐ ${x.i.name} (need ${x.want - x.have})`).join('\n') + '\n'; });
  if (soon.length) t += `\nUse soon\n` + soon.map(x => `  • ${x.i.name} — ${x.n < 0 ? 'expired' : 'exp'} ${fmtExp(x.l.exp)}`).join('\n') + '\n';
  return t;
}
function openShop() {
  const { need, groups, soon } = shoppingData();
  const body = openSheet(`<h2>Shopping list</h2><p class="sub">${need.length} thing${need.length === 1 ? '' : 's'} below what we like to keep on hand.</p>
    <div class="acts" style="margin-top:4px;justify-content:flex-start;gap:24px"><button class="link flourish" id="shShare">Share list</button><button class="link flourish" id="shMail">Email it to us now</button></div>
    ${groups.map(g => `<div class="store"><h3>${g.s.name} <a href="${g.s.home}" target="_blank" rel="noopener">${g.s.sub} ↗</a></h3>
      ${g.rows.map(x => `<div class="shop">${pic(x.i)}<span class="nm">${esc(x.i.name)}<small>have ${x.have} · keep ${x.want}${x.i.loc ? ' · ' + esc(x.i.loc) : ''}</small></span>
      <select data-store="${x.i.id}" style="border:0;background:none;color:var(--muted);font-size:12px;max-width:80px">${Object.entries(STORES).map(([k, s]) => `<option value="${k}" ${k === (x.i.store || 'maceys') ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
      <a href="${g.s.q(x.i.name)}" target="_blank" rel="noopener">find ↗</a></div>`).join('')}</div>`).join('') || '<p class="empty-note">Everything is stocked ✿</p>'}
    ${soon.length ? `<div class="store"><h3 style="color:var(--warn)">Use soon</h3>${soon.map(x => `<div class="shop">${pic(x.i)}<span class="nm">${esc(x.i.name)}<small>${x.n < 0 ? 'expired ' : 'exp '}${fmtExp(x.l.exp)} · ${x.l.qty} there${x.i.loc ? ' · ' + esc(x.i.loc) : ''}</small></span></div>`).join('')}</div>` : ''}`);
  $('#shShare', body).onclick = async () => { const t = shoppingText();
    if (navigator.share) navigator.share({ title: 'Shopping list', text: t }).catch(() => {}); else { await navigator.clipboard.writeText(t); toast('Copied ✿'); } };
  $('#shMail', body).onclick = async () => {
    if (DB.mode === 'cloud') { await DB.saveMeta({ reportRequested: true }); toast('On its way — usually within the hour'); }
    else location.href = `mailto:${DB.meta.emails.filter(Boolean).join(',')}?subject=${encodeURIComponent('Shopping list')}&body=${encodeURIComponent(shoppingText())}`;
  };
  body.addEventListener('change', async e => { const id = e.target.dataset.store; if (id) { await DB.mutate(id, x => x.store = e.target.value); openShop(); } });
}

/* ───────────── Settings ───────────── */
function openSettings() {
  const theme = dev.get('theme', 'blush'), m = DB.meta;
  const sw = t => { const holder = document.createElement('div'); holder.dataset.theme = t; document.body.append(holder);
    const cs = getComputedStyle(holder), g = n => cs.getPropertyValue(n).trim();
    const css = `background:conic-gradient(from 200deg,${g('--tulip1')} 0 30%,${g('--tulip2')} 0 55%,${g('--leaf')} 0 68%,${g('--bg')} 0 100%)`;
    holder.remove(); return css; };
  const signedIn = DB.mode === 'cloud' && DB.user;
  const body = openSheet(`<h2>Settings</h2>
    <div class="setsec">Colors <span class="note">— just for this device</span></div>
    <div class="themes">${THEMES.map(([k, n]) => `<button class="sw ${k === theme ? 'on' : ''}" data-theme-pick="${k}"><i style="${sw(k)}"></i>${n}</button>`).join('')}</div>
    <label class="toggle"><span>Opening bloom</span><input type="checkbox" id="stSplash" ${dev.get('splash', true) ? 'checked' : ''}></label>
    <button class="link" id="stReplay" style="margin-top:8px">watch it again</button>

    <div class="setsec">Sync</div>
    ${!CFG.firebase ? `<p class="note">Right now everything lives on this device only. Follow SETUP.md (step 2–3) to sync between phones, iPad and computer.</p>`
      : signedIn ? `<p class="note">Signed in as <b>${esc(DB.user.email)}</b> — changes sync to every device.</p><button class="link mute" id="stOut">sign out</button>`
      : `<label class="field"><span>Email</span><input id="stEmail" type="email" autocomplete="username" value="${esc(dev.get('lastEmail', ''))}"></label>
         <label class="field"><span>Password</span><input id="stPass" type="password" autocomplete="current-password"></label>
         <div class="acts" style="justify-content:flex-start;gap:24px"><button class="link big flourish" id="stIn">Sign in</button><button class="link" id="stNew">first time? create login</button></div>`}

    <div class="setsec">Alerts</div>
    <p class="note">A heads-up a month before anything expires, plus the weekly shopping list — on phones and by email.</p>
    <button class="link flourish" id="stPush">turn on alerts for this device</button>
    <p class="note" id="stPushNote"></p>
    <div class="cols">
      <label class="field"><span>Email 1</span><input id="stE1" type="email" value="${esc(m.emails?.[0] || '')}"></label>
      <label class="field"><span>Email 2</span><input id="stE2" type="email" value="${esc(m.emails?.[1] || '')}"></label>
    </div>
    <div class="cols">
      <label class="field"><span>Weekly list on</span><select id="stDay">${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => `<option value="${i}" ${i === +m.reportDay ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
      <label class="field"><span>Around</span><select id="stHour">${[6, 7, 8, 9, 10, 12, 15, 18, 20].map(h => `<option value="${h}" ${h === +m.reportHour ? 'selected' : ''}>${h % 12 || 12}${h < 12 ? ' am' : ' pm'}</option>`).join('')}</select></label>
    </div>

    <div class="setsec">Shelves</div>
    <p class="note">Letter = shelf, number = row from the bottom.</p>
    <div id="stShelves"></div>
    <div class="acts" style="justify-content:flex-start;gap:24px;margin-top:8px"><button class="link flourish" id="shAdd">add a shelf</button><button class="link mute" id="shDel">remove last</button></div>

    <div class="setsec">Categories</div>
    <div class="cols" style="align-items:end"><label class="field"><span>New category</span><input id="stCat"></label><button class="link" id="stCatGo" style="margin-bottom:18px">add</button></div>

    <div class="setsec">Backup</div>
    <div class="acts" style="justify-content:flex-start;gap:24px;margin-top:4px"><button class="link" id="stExport">download a backup</button><button class="link" id="stImport">restore a backup</button></div>

    <div class="setsec">A little secret</div>
    <div class="bigcode"><svg viewBox="-12 0 169 1" preserveAspectRatio="none" shape-rendering="crispEdges"><use href="#ilyPath"/></svg></div>
    <p class="note" style="text-align:center">Scan me with the app ✿</p>
    <p class="note" style="text-align:center;margin-top:26px">SF-FS v${VERSION}</p>`);
  const drawShelves = () => { $('#stShelves', body).innerHTML = DB.meta.shelves.map((s, i) => `<div class="toggle"><span class="serif" style="font-size:20px;font-style:italic">Shelf ${esc(s.id)}</span>
    <span class="step"><button data-sm="${i}">−</button><b>${s.rows}</b><button data-sp="${i}">+</button> <span class="note">rows</span></span></div>`).join(''); };
  drawShelves();
  body.addEventListener('click', async e => {
    const t = e.target.closest('[data-theme-pick]');
    if (t) { dev.set('theme', t.dataset.themePick); applyTheme(t.dataset.themePick); $$('.sw', body).forEach(x => x.classList.toggle('on', x === t)); }
    const sm = e.target.dataset.sm, sp = e.target.dataset.sp;
    if (sm != null || sp != null) { const sh = clone(DB.meta.shelves), i = sm ?? sp; sh[i].rows = Math.max(1, Math.min(12, sh[i].rows + (sp != null ? 1 : -1))); await DB.saveMeta({ shelves: sh }); drawShelves(); }
  });
  $('#stSplash', body).onchange = e => dev.set('splash', e.target.checked);
  $('#stReplay', body).onclick = () => { closeSheet(); setTimeout(() => location.reload(), 300); };
  $('#shAdd', body).onclick = async () => { const sh = clone(DB.meta.shelves); const last = sh.at(-1)?.id || '@';
    sh.push({ id: String.fromCharCode(last.charCodeAt(0) + 1), rows: 5 }); await DB.saveMeta({ shelves: sh }); drawShelves(); };
  $('#shDel', body).onclick = async () => { if (DB.meta.shelves.length > 1 && confirm('Remove the last shelf?')) { await DB.saveMeta({ shelves: DB.meta.shelves.slice(0, -1) }); drawShelves(); } };
  const saveEmails = () => DB.saveMeta({ emails: [$('#stE1', body).value.trim(), $('#stE2', body).value.trim()] });
  $('#stE1', body).onchange = saveEmails; $('#stE2', body).onchange = saveEmails;
  $('#stDay', body).onchange = e => DB.saveMeta({ reportDay: +e.target.value });
  $('#stHour', body).onchange = e => DB.saveMeta({ reportHour: +e.target.value });
  $('#stCatGo', body).onclick = async () => { const n = $('#stCat', body).value.trim(); if (!n) return;
    const id = n.toLowerCase().replace(/[^a-z0-9]+/g, '-'); if (DB.meta.cats.some(c => c.id === id)) return toast('Already have that one');
    await DB.saveMeta({ cats: [...DB.meta.cats, { id, name: n }] }); $('#stCat', body).value = ''; toast('Category added ✿'); };
  $('#stExport', body).onclick = () => { const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ meta: DB.meta, items: [...DB.items.values()] }, null, 1)], { type: 'application/json' }));
    a.download = `food-storage-${new Date().toISOString().slice(0, 10)}.json`; a.click(); };
  $('#stImport', body).onclick = () => $('#jsonPick').click();
  if (CFG.firebase && !signedIn) {
    const go = async create => { const em = $('#stEmail', body).value.trim(), pw = $('#stPass', body).value;
      try { await (create ? DB.fb.createUserWithEmailAndPassword : DB.fb.signInWithEmailAndPassword)(DB.fb.auth, em, pw); closeSheet(); toast('Welcome ✿'); }
      catch (err) { toast(err.code?.replace('auth/', '').replace(/-/g, ' ') || 'Could not sign in'); } };
    $('#stIn', body).onclick = () => go(false); $('#stNew', body).onclick = () => go(true);
  }
  if (signedIn) $('#stOut', body).onclick = async () => { unsubs.forEach(u => u()); await DB.fb.signOut(DB.fb.auth); closeSheet(); };
  $('#stPush', body).onclick = () => enablePush($('#stPushNote', body));
  pushStatus($('#stPushNote', body));
}
$('#jsonPick').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try { const j = JSON.parse(await f.text()); if (!Array.isArray(j.items)) throw 0;
    if (!confirm(`Restore ${j.items.length} items from this backup? It replaces what's here.`)) return;
    for (const id of [...DB.items.keys()]) if (!j.items.some(i => i.id === id)) await DB.deleteItem(id);
    for (const it of j.items) await DB.saveItem(it);
    if (j.meta) await DB.saveMeta(j.meta);
    toast('Restored ✿'); closeSheet();
  } catch { toast("That file doesn't look like a backup"); }
});

/* ───────────── Notifications ───────────── */
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
async function pushStatus(el) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) { el.textContent = isIOS && !standalone ? 'On iPhone/iPad: add this to your Home Screen first, then open it from there to turn on alerts.' : "This browser can't do alerts — email still works."; return; }
  const reg = await navigator.serviceWorker.getRegistration(); const sub = await reg?.pushManager.getSubscription();
  el.textContent = sub ? 'Alerts are on for this device ✿' : '';
}
async function enablePush(el) {
  if (DB.mode !== 'cloud') return (el.textContent = 'Sign in first (Sync above) so alerts know where to find our storage.');
  if (!CFG.vapidPublicKey) return (el.textContent = 'Alerts need the key from SETUP.md step 5.');
  if (!('PushManager' in window)) return pushStatus(el);
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return (el.textContent = 'Notifications were not allowed — you can change that in Settings › Notifications.');
  const reg = await navigator.serviceWorker.ready;
  const key = Uint8Array.from(atob(CFG.vapidPublicKey.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(CFG.vapidPublicKey.length / 4) * 4, '=')), c => c.charCodeAt(0));
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const json = sub.toJSON(); const id = btoa(json.endpoint).replace(/[^a-z0-9]/gi, '').slice(-40);
  const { doc, setDoc } = DB.fb;
  await setDoc(doc(DB.fb.db, DB.path('push'), id), { sub: json, who: DB.user.email, device: navigator.userAgent.slice(0, 120), created: Date.now() });
  reg.showNotification('Alerts are on ✿', { body: "We'll let you know a month before anything expires.", icon: 'icons/icon-192.png' });
  el.textContent = 'Alerts are on for this device ✿';
}

/* ───────────── Wire up ───────────── */
$('#goScan').onclick = () => { $('#goScan').classList.add('pulse'); setTimeout(() => $('#goScan').classList.remove('pulse'), 1100); openScanner(); };
$('#goAdd').onclick = () => openItem(null);
$('#goUse').onclick = openUsePicker;
$('#goShop').onclick = openShop;
$('#goSettings').onclick = openSettings;
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
DB.loadLocal(); render(); initCloud();
// deep links from notifications: ?view=shop
if (new URLSearchParams(location.search).get('view') === 'shop') setTimeout(openShop, dev.get('splash', true) ? 3400 : 200);
