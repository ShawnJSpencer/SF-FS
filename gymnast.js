/* SF-FS · The gymnast (for the Gymnastics reveal)
   A side-view rig with real proportions (her height = 1): spine in three parts, neck and head, legs
   with feet, arms with hands. Key poses are eased together with smooth curves, planted hands and feet
   stay exactly where they touched the mat, and her braid is a little chain with real gravity. */
// Gymnast rig: side view, facing right. Units: her standing height = 1. y up, floor at 0.
(function (G) {
  const rad = d => d * Math.PI / 180, dir = (a, l = 1) => ({ x: Math.cos(rad(a)) * l, y: Math.sin(rad(a)) * l });
  const add = (p, q) => ({ x: p.x + q.x, y: p.y + q.y });
  const L = { s1: .095, s2: .1, s3: .095, nk: .05, hd: .135, th: .245, sh: .235, ft: .115, up: .182, fa: .146, hn: .09 };
  // keys: spine s1 s2 s3, neck nk, head hd; near/lead leg aT aS aF; far/support leg bT bS bF;
  // near arm nU nF nH; far arm fU fF fH.  c = contact weights {B, A, H, P}
  const KEYS = [], CONTACTS = [];   // contacts have their own timeline: [{ t, c }]
  function contactsAt(t) {
    const C = CONTACTS; let i = 0; while (i < C.length - 2 && t > C[i + 1].t) i++;
    const a = C[i], b = C[i + 1] || a, u = b.t > a.t ? Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))) : 1, s = u * u * (3 - 2 * u), c = {};
    for (const k of ['B', 'A', 'H', 'P']) c[k] = (a.c[k] || 0) + ((b.c[k] || 0) - (a.c[k] || 0)) * (t <= a.t ? 0 : s);
    return c;
  }
  function fk(p) {
    const o = { hip: { x: 0, y: 0 } };
    o.waist = add(o.hip, dir(p.s1, L.s1)); o.chest = add(o.waist, dir(p.s2, L.s2)); o.sh = add(o.chest, dir(p.s3, L.s3));
    o.nk = add(o.sh, dir(p.nk, L.nk)); o.crown = add(o.nk, dir(p.hd, L.hd));
    for (const [k, T, S, F] of [['a', 'aT', 'aS', 'aF'], ['b', 'bT', 'bS', 'bF']]) {
      const knee = add(o.hip, dir(p[T], L.th)), ank = add(knee, dir(p[S], L.sh)), u = dir(p[F]), v = dir(p[F] + 90);
      const at = (a, b) => ({ x: ank.x + u.x * a + v.x * b, y: ank.y + u.y * a + v.y * b });
      o[k] = { knee, ank, heel: at(-.045, -.028), ball: at(.075, -.034), toe: at(.115, -.012), top: at(.06, .016),
        kneeF: add(knee, dir(p[T] + 90 + (p[S] - p[T]) / 2, .045)) };
    }
    for (const [k, U, F, Hh] of [['n', 'nU', 'nF', 'nH'], ['f', 'fU', 'fF', 'fH']]) {
      const el = add(o.sh, dir(p[U], L.up)), wr = add(el, dir(p[F], L.fa));
      o[k] = { el, wr, palm: add(wr, dir(p[Hh], L.hn * .45)), tip: add(wr, dir(p[Hh], L.hn)) };
    }
    return o;
  }
  // Catmull-Rom (non-uniform) through the keys, per value
  function evalPose(t) {
    const K = KEYS; if (t <= K[0].t) return { ...K[0].p, c: contactsAt(t) };
    if (t >= K[K.length - 1].t) return { ...K[K.length - 1].p, c: contactsAt(t) };
    let i = 0; while (t > K[i + 1].t) i++;
    const k0 = K[Math.max(0, i - 1)], k1 = K[i], k2 = K[i + 1], k3 = K[Math.min(K.length - 1, i + 2)];
    const h = k2.t - k1.t, u = (t - k1.t) / h, u2 = u * u, u3 = u2 * u;
    const H = [2 * u3 - 3 * u2 + 1, u3 - 2 * u2 + u, -2 * u3 + 3 * u2, u3 - u2];
    const val = (a, b, c, d, ease) => {
      const m1 = i === 0 || ease ? 0 : (c - a) / (k2.t - k0.t) * h, m2 = i + 2 >= K.length || ease ? 0 : (d - b) / (k3.t - k1.t) * h;
      return H[0] * b + H[1] * m1 + H[2] * c + H[3] * m2;
    };
    const p = {};
    for (const key in k1.p) p[key] = val(k0.p[key], k1.p[key], k2.p[key], k3.p[key], k1.hold || k2.hold);
    return { ...p, c: contactsAt(t) };
  }
  // where the body is: each planted contact pins the hips so that contact stays put
  function solver() {
    const lat = {}; let root = null, lastX = 0;
    return function (pose) {
      const o = fk(pose), c = pose.c, pts = { B: o.b.ball, A: o.a.ball, H: { x: (o.n.palm.x + o.f.palm.x) / 2, y: Math.min(o.n.palm.y, o.f.palm.y) } };
      let sx = 0, sy = 0, sw = 0;
      for (const k of ['B', 'A', 'H']) {
        const w = c[k] || 0;
        if (w <= .001) { delete lat[k]; continue; }
        if (!lat[k]) lat[k] = { x: (root ? root.x : 0) + pts[k].x, y: 0 };
        sx += w * (lat[k].x - pts[k].x); sy += w * (lat[k].y - pts[k].y); sw += w;
      }
      if ((c.P || 0) > .001) {
        if (lat.P == null) lat.P = root ? root.x : 0;
        const low = Math.min(...['a', 'b'].flatMap(k => [o[k].heel.y, o[k].toe.y, o[k].ball.y, o[k].top.y, o[k].kneeF.y]));
        sx += c.P * lat.P; sy += c.P * (-low); sw += c.P;
      } else delete lat.P;
      root = sw ? { x: sx / sw, y: sy / sw } : root || { x: 0, y: .51 };
      return { root, o };
    };
  }
  G.GYM = { L, KEYS, CONTACTS, fk, evalPose, solver, dir, add, rad };
})(window);
// Fit keys so planted hands/feet truly touch the floor: solve one angle by bisection
(function (G) {
  const { fk } = G.GYM;
  function fit(k, keysToSet, lo, hi, err) {   // err(o) -> signed error; find angle in [lo,hi] with err≈0
    const set = a => keysToSet.forEach(([n, off]) => k.p[n] = a + off);
    let a0 = lo, a1 = hi; set(a0); let e0 = err(fk(k.p)); set(a1); const e1 = err(fk(k.p));
    if (e0 * e1 > 0) { set(Math.abs(e0) < Math.abs(e1) ? lo : hi); return false; }
    for (let i = 0; i < 40; i++) { const m = (a0 + a1) / 2; set(m); const em = err(fk(k.p)); if (em * e0 > 0) { a0 = m; e0 = em; } else a1 = m; }
    set((a0 + a1) / 2); return true;
  }
  G.GYM.fit = fit;
})(window);

// keyframes: t seconds, p = absolute angles (deg, 0 = right, 90 = up; a back walkover turns the body a full
// 360°, so angles keep climbing instead of wrapping), c = planted contacts (B support foot, A lead foot, H hands, P split)
(function (GYM) {
  const K = (t, c, p, extra = {}) => GYM.KEYS.push({ t, c, p, ...extra });
  const arms = (n, f) => ({ nU: n[0], nF: n[1], nH: n[2], fU: f[0], fF: f[1], fH: f[2] });
  const sp = (a, b, c, nk, hd) => ({ s1: a, s2: b, s3: c, nk, hd });
  const legA = (a, b, c) => ({ aT: a, aS: b, aF: c }), legB = (a, b, c) => ({ bT: a, bS: b, bF: c });
  K(-1.5, { B: 1 }, { ...sp(90, 90, 90, 91, 91), ...legA(-90, -90, -2), ...legB(-90, -90, 0), ...arms([-86, -88, -88], [-92, -92, -92]) });
  K(-.8,  { B: 1 }, { ...sp(90, 90, 91, 92, 93), ...legA(-68, -68, -60), ...legB(-90, -90, 0), ...arms([10, 14, 18], [2, 6, 10]) });
  K(0,    { B: 1 }, { ...sp(90, 90, 91, 92, 92), ...legA(-66, -66, -58), ...legB(-90, -90, 0), ...arms([95, 95, 95], [87, 87, 87]) });
  K(.5,   { B: 1 }, { ...sp(100, 110, 121, 130, 136), ...legA(-10, -8, 0), ...legB(-95, -92, 0), ...arms([132, 134, 136], [127, 129, 131]) });
  K(1.0,  { B: 1 }, { ...sp(130, 178, 224, 246, 254), ...legA(62, 64, 68), ...legB(-88, -86, -2), ...arms([240, 243, 247], [236, 239, 243]) });
  K(1.38, { B: 1, H: 1 }, { ...sp(165, 215, 265, 275, 283), ...legA(96, 98, 102), ...legB(-60, -72, -8), ...arms([272, 272, 360], [270, 270, 360]) }, { fitH: 1 });
  K(1.85, { H: 1 }, { ...sp(262, 268, 272, 280, 288), ...legA(198, 200, 205), ...legB(20, 22, 28), ...arms([270, 270, 360], [268, 268, 360]) });
  K(2.3,  { H: 1, A: 1 }, { ...sp(318, 336, 350, 356, 366), ...legA(250, 250, 345), ...legB(62, 64, 70), ...arms([286, 286, 360], [284, 284, 360]) }, { fitA: 1 });
  // after the first foot lands she stays folded low: the landing leg slides forward under her to become
  // the front leg, the trailing leg keeps rotating over the top and down behind her, then her chest lifts
  K(2.5,  { A: 1 }, { ...sp(330, 346, 358, 364, 372), ...legA(256, 256, 350), ...legB(92, 94, 100), ...arms([318, 322, 365], [314, 318, 362]) });
  K(2.8,  { P: 1 }, { ...sp(356, 368, 376, 380, 386), ...legA(296, 300, 330), ...legB(132, 134, 140), ...arms([372, 374, 376], [366, 368, 370]) });
  K(3.1,  { P: 1 }, { ...sp(380, 392, 402, 406, 410), ...legA(336, 338, 362), ...legB(166, 167, 174), ...arms([400, 404, 408], [392, 396, 400]) });
  K(3.45, { P: 1 }, { ...sp(430, 442, 452, 456, 460), ...legA(358, 358, 374), ...legB(178, 178, 184), ...arms([450, 456, 462], [440, 446, 452]) });
  K(3.8,  { P: 1 }, { ...sp(452, 453, 458, 462, 468), ...legA(360, 360, 375), ...legB(180, 180, 185), ...arms([478, 480, 485], [466, 468, 472]) });
  K(5.2,  { P: 1 }, { ...sp(452, 453, 458, 462, 468), ...legA(360, 360, 375), ...legB(180, 180, 185), ...arms([478, 480, 485], [466, 468, 472]) }, { hold: 1 });
  // make the planted hands and feet truly reach the floor
  for (const k of GYM.KEYS) {
    if (k.fitH) GYM.fit(k, [['bT', 0]], -75, -20, o => Math.min(o.n.palm.y, o.f.palm.y) - o.b.ball.y);   // bend the support knee until the hands reach
    if (k.fitA) GYM.fit(k, [['aT', 0], ['aS', 0]], 215, 280, o => o.a.ball.y - Math.min(o.n.palm.y, o.f.palm.y));
  }
  // who's on the floor, when
  GYM.CONTACTS.push({ t: -3, c: { B: 1 } }, { t: 1.30, c: { B: 1 } }, { t: 1.38, c: { B: 1, H: 1 } }, { t: 1.48, c: { H: 1 } },
    { t: 2.24, c: { H: 1 } }, { t: 2.3, c: { H: 1, A: 1 } }, { t: 2.4, c: { H: 1, A: 1 } }, { t: 2.48, c: { A: 1 } }, { t: 2.55, c: { A: 1 } }, { t: 2.75, c: { P: 1 } }, { t: 9, c: { P: 1 } });
})(window.GYM);

// Drawing the gymnast. Everything in rig units (her height = 1, y up); the caller sets the transform.
(function (G) {
  const { dir, add } = G.GYM;
  const SKIN = { base: '#f3cfb4', shade: 'rgba(190,120,95,.38)', deep: '#e3ad90', far: '#e2b89c' };
  const LEO = { base: '#9fd6f6', mid: '#7cc3ef', deep: '#4f9fd8', far: '#86bfe4', farDeep: '#4a8cc2' };
  const HAIR = { base: '#e6c46c', light: '#f7e3a4', dark: '#c49a42', deep: '#a77d30' };
  const rot = v => ({ x: -v.y, y: v.x }), norm = v => { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l }; };
  const lerpP = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
  // smooth closed (or open) path through points: Catmull-Rom as Béziers
  function spath(x, P, closed = true, k = 1 / 6) {
    const n = P.length, g = i => closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
    x.moveTo(P[0].x, P[0].y);
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      x.bezierCurveTo(p1.x + (p2.x - p0.x) * k, p1.y + (p2.y - p0.y) * k, p2.x - (p3.x - p1.x) * k, p2.y - (p3.y - p1.y) * k, p2.x, p2.y);
    }
    if (closed) x.closePath();
  }
  // outline around a chain of points; front side = left of the direction of travel (flip = other side)
  function outline(C, F, B, flip = false, capStart = true, capEnd = true) {
    const fr = [], bk = [];
    C.forEach((p, i) => {
      const d = norm({ x: C[Math.min(C.length - 1, i + 1)].x - C[Math.max(0, i - 1)].x, y: C[Math.min(C.length - 1, i + 1)].y - C[Math.max(0, i - 1)].y });
      let n = rot(d); if (flip) n = { x: -n.x, y: -n.y };
      fr.push({ x: p.x + n.x * F[i], y: p.y + n.y * F[i] }); bk.push({ x: p.x - n.x * B[i], y: p.y - n.y * B[i] });
    });
    const capPt = (i, s) => { const j = s < 0 ? 1 : C.length - 2, d = norm({ x: C[i].x - C[j].x, y: C[i].y - C[j].y }), r = (F[i] + B[i]) / 2 * .9;
      const n = rot(d), c = { x: C[i].x + n.x * (F[i] - B[i]) / 2 * (flip ? -1 : 1), y: C[i].y + n.y * (F[i] - B[i]) / 2 * (flip ? -1 : 1) };
      return { x: c.x + d.x * r, y: c.y + d.y * r }; };
    const pts = [...fr];
    if (capEnd) pts.push(capPt(C.length - 1, 1));
    pts.push(...bk.reverse());
    if (capStart) pts.push(capPt(0, -1));
    return { pts, fr, bk: bk.reverse() };
  }
  const fillPath = (x, pts, fill) => { x.beginPath(); spath(x, pts); x.fillStyle = fill; x.fill(); };
  // soft shading along one edge of a shape: stroke that edge wide and faint, clipped to the shape
  function edgeShade(x, shape, edge, col, w) {
    x.save(); x.beginPath(); spath(x, shape); x.clip();
    x.lineJoin = 'round'; x.lineCap = 'round';
    for (const [k, a] of [[1, .13], [.55, .2], [.22, .3]]) { x.strokeStyle = col.replace('A)', a + ')'); x.lineWidth = w * k; x.beginPath(); spath(x, edge, false); x.stroke(); }
    x.restore();
  }
  const along = (a, b, k) => lerpP(a, b, k);

  function leg(x, o, hip, side, far) {
    const L = o[side], C = [hip, along(hip, L.knee, .3), along(hip, L.knee, .66), L.knee, along(L.knee, L.ank, .25), along(L.knee, L.ank, .55), along(L.knee, L.ank, .85), L.ank];
    const F = [.068, .06, .048, .036, .03, .026, .021, .018], B = [.072, .058, .044, .031, .043, .034, .022, .017];
    const sh = outline(C, F, B, false, true, false);
    // the foot, in its own frame: u toward the toes, v up from the sole
    const u = norm({ x: L.toe.x - L.ank.x, y: L.toe.y - L.ank.y }), fa = Math.atan2(L.top.y - L.ank.y, L.top.x - L.ank.x);
    const pd = dir(0); void pd;
    const ang = Math.atan2(u.y, u.x) + Math.atan2(.012, .115), uu = { x: Math.cos(ang), y: Math.sin(ang) }, vv = rot(uu);
    const at = (a, b) => ({ x: L.ank.x + uu.x * a + vv.x * b, y: L.ank.y + uu.y * a + vv.y * b });
    const foot = [at(-.022, .02), at(-.048, .004), at(-.046, -.022), at(-.03, -.031), at(.02, -.026), at(.07, -.033), at(.104, -.026), at(.12, -.014), at(.114, -.002), at(.08, .006), at(.04, .016), at(.012, .022)];
    const col = far ? SKIN.far : SKIN.base;
    fillPath(x, foot, col); fillPath(x, sh.pts, col);
    edgeShade(x, sh.pts, sh.bk.slice(1), far ? 'rgba(150,90,70,A)' : 'rgba(180,110,85,A)', .05);
    edgeShade(x, foot, foot.slice(2, 7), 'rgba(170,100,80,A)', .03);
    if (!far) {   // light down the front of the shin, a kneecap, toenails' sheen
      edgeShade(x, sh.pts, sh.fr.slice(3, 7), 'rgba(255,240,228,A)', .016);
      x.save(); x.beginPath(); spath(x, sh.pts); x.clip();
      const kn = L.knee, d = norm({ x: L.ank.x - L.knee.x, y: L.ank.y - L.knee.y }), n = rot(d), kc = { x: kn.x + n.x * .022, y: kn.y + n.y * .022 };
      let g = x.createRadialGradient(kc.x, kc.y, 0, kc.x, kc.y, .022); g.addColorStop(0, 'rgba(255,245,235,.55)'); g.addColorStop(1, 'rgba(255,245,235,0)');
      x.fillStyle = g; x.beginPath(); x.arc(kc.x, kc.y, .022, 0, 7); x.fill();
      const kb = { x: kn.x + n.x * .03 + d.x * .02, y: kn.y + n.y * .03 + d.y * .02 }; g = x.createRadialGradient(kb.x, kb.y, 0, kb.x, kb.y, .014); g.addColorStop(0, 'rgba(190,120,95,.18)'); g.addColorStop(1, 'rgba(190,120,95,0)');
      x.fillStyle = g; x.beginPath(); x.arc(kb.x, kb.y, .014, 0, 7); x.fill();
      x.restore();
    }
    return { shape: sh.pts };
  }
  function arm(x, o, sh, side, far) {
    const A = o[side], C = [sh, along(sh, A.el, .4), A.el, along(A.el, A.wr, .4), A.wr];
    const F = [.034, .029, .023, .026, .018], B = [.04, .03, .024, .027, .018];
    const s = outline(C, F, B, false, true, false);
    // hand: fingers together, thumb on the front side
    const u = norm({ x: A.tip.x - A.wr.x, y: A.tip.y - A.wr.y }), v = rot(u), at = (a, b) => ({ x: A.wr.x + u.x * a + v.x * b, y: A.wr.y + u.y * a + v.y * b });
    const hand = [at(-.004, .017), at(.03, .021), at(.045, .026), at(.055, .022), at(.05, .016), at(.07, .015), at(.09, .008), at(.092, -.004), at(.07, -.012), at(.035, -.017), at(-.004, -.017)];
    fillPath(x, hand, far ? SKIN.far : SKIN.base);
    edgeShade(x, hand, hand.slice(7), 'rgba(170,100,80,A)', .02);
    fillPath(x, s.pts, far ? LEO.far : LEO.base);
    edgeShade(x, s.pts, s.bk, far ? 'rgba(40,90,150,A)' : 'rgba(50,110,170,A)', .04);
    if (!far) edgeShade(x, s.pts, s.fr.slice(1), 'rgba(255,255,255,A)', .02);
    // cuff
    const d = norm({ x: A.wr.x - A.el.x, y: A.wr.y - A.el.y }), n = rot(d), c = along(A.el, A.wr, .96);
    x.strokeStyle = far ? '#5b98c9' : '#6db6e8'; x.lineWidth = .006; x.beginPath(); x.moveTo(c.x + n.x * .019, c.y + n.y * .019); x.lineTo(c.x - n.x * .019, c.y - n.y * .019); x.stroke();
  }
  function torso(x, o) {
    const below = along(o.hip, o.waist, -.32);   // the seat of the leotard dips just below the hip joint
    const C = [below, o.hip, o.waist, o.chest, along(o.chest, o.sh, .6), o.sh];
    // front is the belly side: right of the spine's direction
    const F = [.035, .056, .046, .058, .05, .038], B = [.06, .076, .047, .05, .055, .05];
    const s = outline(C, F, B, true, true, true);
    const g = x.createLinearGradient(below.x, below.y, o.sh.x, o.sh.y);
    g.addColorStop(0, LEO.mid); g.addColorStop(.55, LEO.base); g.addColorStop(1, LEO.mid);
    fillPath(x, s.pts, g);
    edgeShade(x, s.pts, s.bk, 'rgba(40,100,165,A)', .06);
    edgeShade(x, s.pts, s.fr.slice(1, 4), 'rgba(255,255,255,A)', .02);
    // a sweep of crystals across the leotard
    x.save(); x.beginPath(); spath(x, s.pts); x.clip();
    for (let i = 0; i < 14; i++) { const k = i / 13, p = along(lerpP(o.hip, o.waist, .5), o.sh, k), n = rot(norm({ x: o.sh.x - o.hip.x, y: o.sh.y - o.hip.y }));
      const off = (k - .5) * .09 + Math.sin(k * 6) * .01, q = { x: p.x - n.x * off, y: p.y - n.y * off };
      x.fillStyle = i % 3 ? 'rgba(255,255,255,.85)' : 'rgba(210,240,255,.95)'; x.beginPath(); x.arc(q.x, q.y, i % 3 ? .0035 : .005, 0, 7); x.fill(); }
    x.restore();
    return s.pts;
  }
  // head, in its own frame: origin at the top of the neck, +y toward the crown, face toward +x
  function head(x, o, pose, look) {
    const a = (pose.hd - 90) * Math.PI / 180;
    x.save(); x.translate(o.nk.x, o.nk.y); x.rotate(a);
    // neck
    const neckBack = o.sh;
    x.restore();
    // neck drawn in world: from shoulders to head base
    const nb = along(o.sh, o.nk, -.2), d = norm({ x: o.nk.x - o.sh.x, y: o.nk.y - o.sh.y }), n = rot(d);
    const hb = { x: o.nk.x, y: o.nk.y };
    const neck = [{ x: nb.x - n.x * .028, y: nb.y - n.y * .028 }, { x: hb.x - n.x * .021 + d.x * .02, y: hb.y - n.y * .021 + d.y * .02 }, { x: hb.x + n.x * .024 + d.x * .02, y: hb.y + n.y * .024 + d.y * .02 }, { x: nb.x + n.x * .03, y: nb.y + n.y * .03 }];
    x.beginPath(); spath(x, neck); x.fillStyle = SKIN.base; x.fill();
    edgeShade(x, neck, [neck[2], neck[3]], 'rgba(170,100,80,A)', .02);
    void neckBack;
    x.save(); x.translate(o.nk.x, o.nk.y); x.rotate(a); x.scale(1.08, 1.08);
    const P = (px, py) => ({ x: px, y: py });
    const face = [P(-.012, .14), P(.036, .131), P(.058, .11), P(.063, .093), P(.059, .084), P(.064, .077), P(.081, .06), P(.068, .051), P(.066, .045), P(.07, .04), P(.063, .035), P(.067, .03), P(.06, .024), P(.063, .016), P(.052, .004), P(.022, .006), P(-.006, .026), P(-.035, .024), P(-.07, .055), P(-.07, .1), P(-.05, .13)];
    x.beginPath(); spath(x, face); x.fillStyle = SKIN.base; x.fill();
    // cheek, jaw shadow
    let g = x.createRadialGradient(.036, .05, 0, .036, .05, .03); g.addColorStop(0, 'rgba(240,140,140,.35)'); g.addColorStop(1, 'rgba(240,140,140,0)');
    x.fillStyle = g; x.beginPath(); x.arc(.036, .05, .03, 0, 7); x.fill();
    x.save(); x.beginPath(); spath(x, face); x.clip(); x.strokeStyle = 'rgba(180,110,90,.18)'; x.lineWidth = .012; x.beginPath(); x.moveTo(.05, .006); x.quadraticCurveTo(.015, .002, -.008, .028); x.stroke(); x.restore();
    // ear
    x.fillStyle = SKIN.deep; x.beginPath(); x.ellipse(-.012, .066, .012, .019, -.15, 0, 7); x.fill();
    x.strokeStyle = 'rgba(160,90,70,.5)'; x.lineWidth = .003; x.beginPath(); x.ellipse(-.011, .067, .007, .012, -.15, -1.2, 2.2); x.stroke();
    // eye: brown iris in profile, upper lashes
    x.fillStyle = '#fbf7f4'; x.beginPath(); x.moveTo(.036, .079); x.quadraticCurveTo(.047, .089, .058, .081); x.quadraticCurveTo(.049, .072, .036, .079); x.fill();
    x.fillStyle = '#6b4024'; x.beginPath(); x.ellipse(.051, .0795, .0045, .0068, 0, 0, 7); x.fill();
    x.fillStyle = '#2a170c'; x.beginPath(); x.ellipse(.0525, .0795, .002, .0035, 0, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.arc(.0535, .082, .0012, 0, 7); x.fill();
    x.strokeStyle = '#4a2e1c'; x.lineWidth = .0035; x.lineCap = 'round';
    x.beginPath(); x.moveTo(.035, .08); x.quadraticCurveTo(.047, .0905, .059, .082); x.stroke();
    x.lineWidth = .002; x.beginPath(); x.moveTo(.058, .082); x.lineTo(.064, .085); x.moveTo(.055, .085); x.lineTo(.06, .089); x.stroke();
    x.strokeStyle = 'rgba(150,90,70,.4)'; x.lineWidth = .0018; x.beginPath(); x.moveTo(.038, .076); x.quadraticCurveTo(.048, .071, .056, .077); x.stroke();
    // brow (fair, she's blonde), nostril, lips
    x.strokeStyle = '#b48a52'; x.lineWidth = .004; x.beginPath(); x.moveTo(.034, .093); x.quadraticCurveTo(.048, .099, .06, .094); x.stroke();
    x.strokeStyle = 'rgba(160,90,70,.55)'; x.lineWidth = .0025; x.beginPath(); x.moveTo(.068, .053); x.quadraticCurveTo(.064, .05, .067, .049); x.stroke();
    x.fillStyle = '#e29a96'; x.beginPath(); x.moveTo(.06, .036); x.quadraticCurveTo(.066, .043, .07, .039); x.quadraticCurveTo(.068, .036, .064, .0355); x.quadraticCurveTo(.068, .032, .067, .029); x.quadraticCurveTo(.062, .028, .06, .033); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(150,70,70,.6)'; x.lineWidth = .002; x.beginPath(); x.moveTo(.06, .0355); x.quadraticCurveTo(.064 + look.smile * .002, .035 - look.smile * .003, .068, .0362); x.stroke();
    // hair: pulled back smooth into the braid, a few lighter strands
    const hair = [P(.052, .118), P(.03, .133), P(-.012, .143), P(-.05, .132), P(-.075, .1), P(-.076, .06), P(-.062, .032), P(-.04, .028), P(-.03, .05), P(-.022, .08), P(-.004, .094), P(.02, .103), P(.04, .108)];
    g = x.createLinearGradient(.04, .14, -.07, .03); g.addColorStop(0, HAIR.light); g.addColorStop(.45, HAIR.base); g.addColorStop(1, HAIR.dark);
    x.beginPath(); spath(x, hair); x.fillStyle = g; x.fill();
    x.save(); x.beginPath(); spath(x, hair); x.clip(); x.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const k = i / 8; x.strokeStyle = i % 2 ? 'rgba(255,240,190,.55)' : 'rgba(170,125,50,.4)'; x.lineWidth = .0025;
      x.beginPath(); x.moveTo(.045 - k * .03, .118 + k * .02); x.quadraticCurveTo(-.03 + k * .01, .125 - k * .01, -.06, .045 + k * .01); x.stroke(); }
    x.restore();
    x.restore();
    // where the braid leaves the head, in world
    const ca = Math.cos(a), sa = Math.sin(a), W = (px, py) => ({ x: o.nk.x + px * ca - py * sa, y: o.nk.y + px * sa + py * ca });
    return { root: W(-.062, .04), down: { x: -.2 * ca + sa, y: -.2 * sa - ca } };
  }
  // where the braid leaves the head, and which way is "down the back of the head", in world
  function braidAnchor(o, pose) {
    const a = (pose.hd - 90) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    return { root: { x: o.nk.x + (-.062 * ca - .04 * sa) * 1.08, y: o.nk.y + (-.062 * sa + .04 * ca) * 1.08 }, down: norm({ x: -.2 * ca + sa, y: -.2 * sa - ca }) };
  }

  /* the braid: a chain that swings with gravity and lies along her back */
  function braidInit(o, n = 16, len = .27) {
    const P = []; const root = add(o.nk, { x: -.06, y: .03 });
    for (let i = 0; i < n; i++) P.push({ x: root.x - .012, y: root.y - i * len / (n - 1), px: root.x - .012, py: root.y - i * len / (n - 1) });
    return { P, seg: len / (n - 1) };
  }
  // A braid is heavy, soft and a little springy near the head: air drag, stiffness that fades toward
  // the tail, the first links held in the direction it leaves the head, and her back as a wall.
  function braidStep(b, rootPos, down, o, dt) {
    const steps = Math.max(1, Math.min(14, Math.round(dt / (1 / 240)))), h = dt / steps, g = 6.3, n = b.P.length;
    const caps = [[o.hip, o.waist, .066], [o.waist, o.chest, .066], [o.chest, o.sh, .07], [o.sh, o.nk, .045]];
    for (let s = 0; s < steps; s++) {
      const P = b.P; P[0].x = rootPos.x; P[0].y = rootPos.y;
      for (let i = 1; i < n; i++) { const p = P[i], drag = .968 + .006 * (i / n), vx = (p.x - p.px) * drag, vy = (p.y - p.py) * drag;
        p.px = p.x; p.py = p.y; p.x += vx; p.y += vy - g * h * h; }
      for (let it = 0; it < 7; it++) {
        // the first links leave the head heading down the back of the neck
        for (const [k, w] of [[1, .4], [2, .1]]) { const t = { x: P[0].x + down.x * b.seg * k, y: P[0].y + down.y * b.seg * k }; P[k].x += (t.x - P[k].x) * w; P[k].y += (t.y - P[k].y) * w; }
        for (let i = 1; i < n; i++) { const a = P[i - 1], c = P[i], dx = c.x - a.x, dy = c.y - a.y, dd = Math.hypot(dx, dy) || 1e-6, k = (dd - b.seg) / dd;
          if (i === 1) { c.x -= dx * k; c.y -= dy * k; } else { a.x += dx * k * .5; a.y += dy * k * .5; c.x -= dx * k * .5; c.y -= dy * k * .5; } }
        // stiffer where it's thick near the head, looser toward the tail
        for (let i = 2; i < n; i++) { const a = P[i - 2], c = P[i], m = P[i - 1], st = .11 * (1 - i / n) + .015; m.x += ((a.x + c.x) / 2 - m.x) * st; m.y += ((a.y + c.y) / 2 - m.y) * st; }
        for (let i = 1; i < n; i++) { const p = P[i];
          for (const [A, B, r] of caps) { const ab = { x: B.x - A.x, y: B.y - A.y }, l = Math.hypot(ab.x, ab.y), d = { x: ab.x / l, y: ab.y / l }, nb = { x: -d.y, y: d.x };
            // when her back faces up (face-down) the braid just slides off to the side of her; the wall fades
            // back in as she rises, and pushing the braid never flings it (its momentum isn't changed)
            const wall = Math.max(0, Math.min(1, (.6 - nb.y) / .3)); if (!wall) continue;
            const along = (p.x - A.x) * d.x + (p.y - A.y) * d.y; if (along < -.02 || along > l + .02) continue;
            const side = (p.x - A.x) * nb.x + (p.y - A.y) * nb.y;
            if (side < r && side > -.025) { const k = (r - side) * wall * .5; p.x += nb.x * k; p.y += nb.y * k; p.px += nb.x * k; p.py += nb.y * k; } }
          if (p.y < .012) p.y = .012; }
      }
    }
  }
  // the braid as hair: a soft tapered plait of three strands crossing, a blue tie, a loose tail and a few flyaways
  function braidDraw(x, b) {
    const P = b.P, n = P.length;
    const g = i => P[Math.max(0, Math.min(n - 1, i))];
    const C = [];
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < 5; k++) { const u = k / 5, p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2), u2 = u * u, u3 = u2 * u;
      C.push({ x: .5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
               y: .5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3) }); }
    C.push({ x: P[n - 1].x, y: P[n - 1].y });
    const S = [0]; for (let i = 1; i < C.length; i++) S.push(S[i - 1] + Math.hypot(C[i].x - C[i - 1].x, C[i].y - C[i - 1].y));
    const total = S[S.length - 1], tieS = total * .82;
    const at = s => { let i = 1; while (i < S.length - 1 && S[i] < s) i++; const k = (s - S[i - 1]) / ((S[i] - S[i - 1]) || 1), p = lerpP(C[i - 1], C[i], k), d = norm({ x: C[i].x - C[i - 1].x, y: C[i].y - C[i - 1].y }); return { p, d, n: rot(d) }; };
    const wOf = s => .024 - .009 * Math.min(1, s / tieS) + .004 * Math.max(0, 1 - s / .03);
    // body of the braid
    const L = [], R = [];
    for (let s = 0; s <= tieS + 1e-6; s += tieS / 24) { const { p, n: nn } = at(s), w = wOf(s) * (.92 + .08 * Math.sin(s / .017 * Math.PI)); L.push({ x: p.x + nn.x * w, y: p.y + nn.y * w }); R.push({ x: p.x - nn.x * w, y: p.y - nn.y * w }); }
    const body = [...L, ...R.reverse()];
    x.beginPath(); spath(x, body); x.fillStyle = HAIR.dark; x.fill();
    // the plaits: lobes that alternate side to side, each crossing down toward the middle
    x.save(); x.beginPath(); spath(x, body); x.clip();
    const step = .016;
    for (let s = .004, k = 0; s < tieS; s += step / 2, k++) {
      const { p, d, n: nn } = at(s), w = wOf(s), sg = k % 2 ? 1 : -1, A = (u, v) => ({ x: p.x + d.x * u + nn.x * v * sg, y: p.y + d.y * u + nn.y * v * sg });
      const lobe = [A(-step * .25, w * 1.05), A(step * .45, w * .9), A(step * 1.05, w * .05), A(step * .8, -w * .32), A(step * .2, w * .15)];
      const lg = x.createLinearGradient(lobe[0].x, lobe[0].y, lobe[2].x, lobe[2].y); lg.addColorStop(0, HAIR.light); lg.addColorStop(.55, HAIR.base); lg.addColorStop(1, HAIR.dark);
      x.beginPath(); spath(x, lobe); x.fillStyle = lg; x.fill();
      x.strokeStyle = 'rgba(140,100,35,.55)'; x.lineWidth = .0022; x.beginPath(); spath(x, [lobe[2], lobe[3], lobe[4]], false); x.stroke();
      x.strokeStyle = 'rgba(255,245,210,.55)'; x.lineWidth = .0014; x.beginPath(); spath(x, [A(0, w * .8), A(step * .4, w * .62), A(step * .8, w * .2)], false); x.stroke();
    }
    x.restore();
    // a few flyaway hairs
    x.lineCap = 'round'; x.strokeStyle = 'rgba(240,215,140,.6)'; x.lineWidth = .0012;
    for (const [s0, sg, len] of [[.05, 1, .02], [.11, -1, .024], [.17, 1, .018]]) { if (s0 > tieS) continue; const { p, d, n: nn } = at(s0), w = wOf(s0);
      x.beginPath(); x.moveTo(p.x + nn.x * w * sg, p.y + nn.y * w * sg); x.quadraticCurveTo(p.x + nn.x * (w + .01) * sg + d.x * len * .5, p.y + nn.y * (w + .01) * sg + d.y * len * .5, p.x + nn.x * (w + .006) * sg + d.x * len, p.y + nn.y * (w + .006) * sg + d.y * len); x.stroke(); }
    // the tail below the tie: loose strands that fan a little and follow the braid's swing
    const T = at(tieS);
    for (let i = 0; i < 16; i++) { const v = (i / 15 - .5) * 2, len = (total - tieS) * (.85 + .3 * Math.abs(Math.sin(i * 2.3))), pts = [];
      for (let k = 0; k <= 6; k++) { const s2 = Math.min(total, tieS + len * k / 6), q = at(s2), spread = .006 + .012 * k / 6; pts.push({ x: q.p.x + q.n.x * v * spread, y: q.p.y + q.n.y * v * spread }); }
      x.strokeStyle = i % 4 === 0 ? HAIR.dark : i % 3 === 0 ? HAIR.light : HAIR.base; x.lineWidth = .0026 - .0008 * Math.abs(v); x.beginPath(); spath(x, pts, false); x.stroke(); }
    // hair tie
    x.fillStyle = '#5aa9e0'; x.beginPath(); x.ellipse(T.p.x, T.p.y, .008, .0125, Math.atan2(T.d.y, T.d.x), 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = .0015; x.beginPath(); x.ellipse(T.p.x, T.p.y, .005, .009, Math.atan2(T.d.y, T.d.x), -1, 1); x.stroke();
  }
  function drawGymnast(x, st) {
    const { o, pose, braid, look } = st;
    x.lineJoin = 'round';
    arm(x, o, o.sh, 'f', true);
    braidDraw(x, braid);   // just behind her: down her back, or on the far side of her when it falls that way
    leg(x, o, o.hip, 'b', true);
    leg(x, o, o.hip, 'a', false);
    torso(x, o);
    const h = head(x, o, pose, look);
    arm(x, o, o.sh, 'n', false);
    return h;
  }
  G.GYMDRAW = { drawGymnast, braidInit, braidStep, braidAnchor };
})(window);
