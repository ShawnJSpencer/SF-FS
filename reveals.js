/* SF-FS · Secret reveals
   Armory (hold one finger on the opening animation) and Equestrian (hold two).
   Everything is drawn in code on stacked canvases inside the opening screen:
     window.SFFS_REVEAL.play('armory' | 'equestrian', hostElement, { launch })
   launch = this device already uses that style, so play a shorter version of the scene
   instead of transforming the flowers. Resolves when the scene is finished. */
(function () {
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TAU = Math.PI * 2, rad = d => d * Math.PI / 180;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    in3: t => t * t * t, in4: t => t * t * t * t, out3: t => 1 - (1 - t) ** 3,
    io: t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,
    back: t => { const c = 1.7; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
    smooth: t => t * t * (3 - 2 * t)
  };
  // random numbers that are the same every time (the scene looks designed, not noisy)
  const rng = seed => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

  function layer(host, z, css = '') {
    const W = host.clientWidth, H = host.clientHeight, c = document.createElement('canvas');
    c.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:${z};pointer-events:none;${css}`;
    c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
    const x = c.getContext('2d'); x.scale(DPR, DPR);
    host.append(c); return { c, x, W, H };
  }
  function off(w, h) {
    const c = document.createElement('canvas'); c.width = Math.ceil(w * DPR); c.height = Math.ceil(h * DPR);
    const x = c.getContext('2d'); x.scale(DPR, DPR); return { c, x, w, h };
  }
  function run(host, draw) {
    return new Promise(res => {
      const t0 = performance.now();
      const step = now => {
        const t = (now - t0) / 1000;
        if (host.__skip || draw(t) === false) return res();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  function wordsEl(host, z, html, css) {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:0;right:0;z-index:${z};text-align:center;pointer-events:none;opacity:0;${css}`;
    d.innerHTML = html; host.append(d); return d;
  }
  // take over what's already on screen: freeze its CSS animations at their current look so our fades win
  function oldLayers(host) {
    const els = [...host.children];
    els.forEach(e => { const cs = getComputedStyle(e); const o = cs.opacity, tf = cs.transform; e.style.animation = 'none'; e.style.opacity = o; if (tf && tf !== 'none') e.style.transform = tf; });
    void host.offsetWidth;   // let the browser take the frozen values before transitions start
    return els;
  }
  const hideOld = old => old.forEach(e => { e.style.transition = 'opacity .25s'; e.style.opacity = '0'; });

  /* ═════════════════════════ ARMORY ═════════════════════════ */
  function drawMetal(x, W, H) {
    const r = rng(7);
    const g = x.createLinearGradient(0, 0, W * .35, H);
    g.addColorStop(0, '#3b3e43'); g.addColorStop(.45, '#26292d'); g.addColorStop(1, '#131416');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // brushed steel
    for (let i = 0; i < H * 2.4; i++) {
      const y = r() * H, len = W * (.2 + r() * .9), x0 = r() * W - len * .3, light = r() < .5;
      x.strokeStyle = light ? `rgba(255,255,255,${.01 + r() * .035})` : `rgba(0,0,0,${.03 + r() * .07})`;
      x.lineWidth = r() < .9 ? .6 : 1.4; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + len, y + (r() - .5) * 2); x.stroke();
    }
    // a cold sheen across the plate
    const s = x.createLinearGradient(0, 0, W, H);
    s.addColorStop(.2, 'rgba(255,255,255,0)'); s.addColorStop(.4, 'rgba(210,225,240,.07)'); s.addColorStop(.52, 'rgba(255,255,255,0)');
    x.fillStyle = s; x.fillRect(0, 0, W, H);
    // panel seams and rivets
    for (const yy of [H * .18, H * .82]) {
      x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, yy + 1.5); x.lineTo(W, yy + 1.5); x.stroke();
      for (let xx = 18; xx < W; xx += 46) {
        const rg = x.createRadialGradient(xx - 1.2, yy - 8.2, .3, xx, yy - 7, 3.6);
        rg.addColorStop(0, '#8d9298'); rg.addColorStop(.6, '#3d4146'); rg.addColorStop(1, '#16171a');
        x.fillStyle = rg; x.beginPath(); x.arc(xx, yy - 7, 3.3, 0, TAU); x.fill();
      }
    }
    // scratches
    for (let i = 0; i < 70; i++) {
      const x0 = r() * W, y0 = r() * H, a = r() * TAU, l = 6 + r() * 40;
      x.strokeStyle = `rgba(255,255,255,${.03 + r() * .06})`; x.lineWidth = .6;
      x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(x0 + Math.cos(a) * l * .5 + (r() - .5) * 4, y0 + Math.sin(a) * l * .5, x0 + Math.cos(a) * l, y0 + Math.sin(a) * l); x.stroke();
    }
    // grit
    for (let i = 0; i < W * H / 160; i++) { x.fillStyle = `rgba(${r() < .55 ? '0,0,0' : '255,255,255'},${r() * .09})`; x.fillRect(r() * W, r() * H, 1, 1); }
    const v = x.createRadialGradient(W / 2, H * .45, Math.min(W, H) * .15, W / 2, H * .5, Math.hypot(W, H) * .62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.72)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
  }

  // Cartridges (real proportions, in mm): .22 LR, 9mm, .45 ACP, 5.56, .308, .50 BMG
  const CAL = [
    { L: 25, C: 15.6, D: 5.7, neck: 5.7, lead: 1, nose: 'round' },
    { L: 29.7, C: 19.2, D: 9.9, neck: 9.9, nose: 'round' },
    { L: 32.4, C: 22.8, D: 12, neck: 12, nose: 'flat' },
    { L: 57.4, C: 44.7, D: 9.6, neck: 6.4, nose: 'spitzer', sh: .78 },
    { L: 71.1, C: 51.2, D: 12, neck: 8.7, nose: 'spitzer', sh: .8 },
    { L: 138, C: 99, D: 20.4, neck: 14, nose: 'spitzer', sh: .78 }
  ];
  // one cartridge, pointing up, base at the bottom of the sprite
  function cartridgeSprite(cal, w, h) {
    const o = off(w + 2, h + 2), x = o.x;
    x.translate(1 + w / 2, 1 + h);
    const sx = w / cal.D, sy = h / cal.L;
    const bands = (stops) => { const g = x.createLinearGradient(-w / 2, 0, w / 2, 0); stops.forEach(([p, c]) => g.addColorStop(p, c)); return g; };
    const brass = bands([[0, '#22170a'], [.16, '#5e4318'], [.34, '#d6b06a'], [.46, '#f2dca0'], [.56, '#9a7330'], [.78, '#47320f'], [1, '#170f05']]);
    const copper = bands([[0, '#1e0a03'], [.2, '#5a2611'], [.38, '#c27b4c'], [.46, '#f0b58a'], [.58, '#8a4320'], [1, '#170702']]);
    const lead = bands([[0, '#1d1d20'], [.3, '#5c5c63'], [.45, '#b8b8c0'], [.6, '#55555c'], [1, '#161618']]);
    const X = v => v * sx, Y = v => -v * sy;
    // case
    const body = cal.D / 2, neck = cal.neck / 2, shY = cal.sh ? cal.C * cal.sh : cal.C;
    x.beginPath();
    x.moveTo(X(-body), Y(0)); x.lineTo(X(-body), Y(1.1)); x.lineTo(X(-body * .84), Y(1.4)); x.lineTo(X(-body * .84), Y(2.3)); x.lineTo(X(-body * .97), Y(2.7));
    x.lineTo(X(-body * .96), Y(shY));
    if (cal.sh) { x.lineTo(X(-neck), Y(shY + (cal.C - shY) * .45)); }
    x.lineTo(X(-neck), Y(cal.C)); x.lineTo(X(neck), Y(cal.C));
    if (cal.sh) x.lineTo(X(neck), Y(shY + (cal.C - shY) * .45));
    x.lineTo(X(body * .96), Y(shY)); x.lineTo(X(body * .97), Y(2.7)); x.lineTo(X(body * .84), Y(2.3)); x.lineTo(X(body * .84), Y(1.4)); x.lineTo(X(body), Y(1.1)); x.lineTo(X(body), Y(0)); x.closePath();
    x.fillStyle = brass; x.fill(); x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = .7; x.stroke();
    // bullet
    const bw = neck * .99, tipY = cal.L, baseY = cal.C - .2;
    x.beginPath(); x.moveTo(X(-bw), Y(baseY));
    if (cal.nose === 'spitzer') { x.lineTo(X(-bw), Y(baseY + (tipY - baseY) * .35)); x.quadraticCurveTo(X(-bw), Y(tipY - (tipY - baseY) * .1), X(0), Y(tipY)); x.quadraticCurveTo(X(bw), Y(tipY - (tipY - baseY) * .1), X(bw), Y(baseY + (tipY - baseY) * .35)); }
    else if (cal.nose === 'flat') { x.lineTo(X(-bw), Y(baseY + (tipY - baseY) * .3)); x.quadraticCurveTo(X(-bw), Y(tipY), X(-bw * .45), Y(tipY)); x.lineTo(X(bw * .45), Y(tipY)); x.quadraticCurveTo(X(bw), Y(tipY), X(bw), Y(baseY + (tipY - baseY) * .3)); }
    else { x.lineTo(X(-bw), Y(baseY + (tipY - baseY) * .25)); x.quadraticCurveTo(X(-bw), Y(tipY + 1), X(0), Y(tipY)); x.quadraticCurveTo(X(bw), Y(tipY + 1), X(bw), Y(baseY + (tipY - baseY) * .25)); }
    x.lineTo(X(bw), Y(baseY)); x.closePath();
    x.fillStyle = cal.lead ? lead : copper; x.fill(); x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = .6; x.stroke();
    // a crisp specular streak — shiny, but the whole round stays dark
    x.strokeStyle = 'rgba(255,240,210,.55)'; x.lineWidth = Math.max(.6, w * .07);
    x.beginPath(); x.moveTo(X(-body * .25), Y(3)); x.lineTo(X(-body * .25), Y(shY * .95)); x.stroke();
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(8,6,4,.34)'; x.fillRect(-w / 2 - 1, -h - 1, w + 2, h + 2);
    return o;
  }
  function hubSprite(r) {
    const o = off(r * 2 + 4, r * 2 + 4), x = o.x; x.translate(r + 2, r + 2);
    let g = x.createRadialGradient(-r * .3, -r * .35, r * .1, 0, 0, r);
    g.addColorStop(0, '#e0bd74'); g.addColorStop(.5, '#8d6a2e'); g.addColorStop(1, '#2a1d08');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill(); x.strokeStyle = '#120c04'; x.lineWidth = 1.4; x.stroke();
    x.strokeStyle = 'rgba(18,12,4,.6)'; x.lineWidth = 1.2; x.beginPath(); x.arc(0, 0, r * .86, 0, TAU); x.stroke();
    x.strokeStyle = 'rgba(255,230,170,.22)'; x.beginPath(); x.arc(0, 0, r * .82, 0, TAU); x.stroke();
    x.fillStyle = 'rgba(18,12,4,.72)'; x.font = `700 ${r * .26}px "Barlow Condensed","Arial Narrow",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('S F', 0, -r * .55); x.fillText('F S', 0, r * .58); x.fillText('★', -r * .56, 0); x.fillText('★', r * .56, 0);
    g = x.createRadialGradient(-r * .1, -r * .12, r * .02, 0, 0, r * .3);
    g.addColorStop(0, '#e9b48c'); g.addColorStop(.6, '#9a5e36'); g.addColorStop(1, '#3d1f0c');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r * .3, 0, TAU); x.fill(); x.strokeStyle = '#120c04'; x.lineWidth = 1.3; x.stroke();
    x.strokeStyle = 'rgba(18,12,4,.45)'; x.beginPath(); x.arc(0, 0, r * .21, 0, TAU); x.stroke();
    x.fillStyle = 'rgba(18,12,4,.6)'; x.beginPath(); x.arc(r * .03, -r * .03, r * .075, 0, TAU); x.fill();
    return o;
  }

  async function armory(host, { launch }) {
    const W = host.clientWidth, H = host.clientHeight, r = rng(42);
    const T = launch
      ? { metal: [0, .25], rust: .05, rustV: 2.1, hub: .65, ring0: .8, ringGap: .24, f1: 2.95, f2: 3.75, words: 4.25, end: 5.4 }
      : { metal: [.35, 2.0], rust: 1.05, rustV: 1, hub: 3.0, ring0: 3.25, ringGap: .34, f1: 6.0, f2: 6.95, words: 7.55, end: 8.9 };
    const old = oldLayers(host);
    const M = layer(host, 20, 'opacity:0'); drawMetal(M.x, W, H);
    const R = layer(host, 21);
    const S = layer(host, 22, 'opacity:0;filter:blur(2.5px)');
    const L = layer(host, 23);
    const F = layer(host, 24, 'opacity:0;mix-blend-mode:screen');
    const words = wordsEl(host, 25, `<div style="font:400 clamp(34px,10vw,64px)/1 'Black Ops One',Impact,sans-serif;letter-spacing:.04em;color:#d8cdbb;
        text-shadow:0 3px 0 #000,0 0 18px rgba(150,55,25,.45)">SPENCER FAMILY</div>
      <div style="margin-top:12px;font:700 clamp(14px,3.8vw,22px)/1 'Barlow Condensed','Arial Narrow',sans-serif;letter-spacing:.5em;color:#b9ab95;text-shadow:0 2px 0 #000">FOOD STORAGE</div>`,
      `bottom:calc(8vh + env(safe-area-inset-bottom));`);

    // the flowers go grey and cold, the tulips wilt
    if (!launch) {
      old.forEach(e => { e.style.transition = 'filter 1.5s ease-in, opacity 1.7s ease-in, transform 1.8s ease-in'; e.style.filter = 'grayscale(1) brightness(.42) contrast(1.35)'; });
      const t = host.querySelector('.tulips, .art');
      if (t) { t.style.transformOrigin = '50% 92%'; t.style.transform = 'translate(-50%,-50%) rotate(16deg) scale(.82)'; t.style.opacity = '0'; }
      const w = host.querySelector('.words'); if (w) { w.style.transition = 'opacity .6s'; w.style.opacity = '0'; }
    } else hideOld(old);

    /* rust: spots that start small, eat outward, seed new spots and bleed streaks downward */
    const spots = [];
    const RUST = [[34, 13, 7], [86, 32, 13], [128, 54, 20], [166, 84, 32]];
    const spawn = (t, x, y, R, v) => spots.push({ x, y, r: 0, R, v, born: t, kids: 0, fr: 0,
      edge: Array.from({ length: 5 }, (_, i) => [(.32 / (i + 1)) * (.5 + r()), 2 + i * 2 + Math.floor(r() * 3), r() * TAU]),
      drip: r() < .4 ? { len: 0, max: 40 + r() * 170, w: 1.4 + r() * 2.8, ox: (r() - .5) * R * .5 } : null });
    const seedRust = (t, n) => {
      for (let i = 0; i < n; i++) {
        const edge = r();
        const x = edge < .3 ? r() * W * .22 : edge < .6 ? W - r() * W * .22 : r() * W;
        const y = edge < .6 ? r() * H : (r() < .5 ? r() * H * .2 : H - r() * H * .22);
        spawn(t, x, y, (24 + r() * 80) * Math.max(.8, Math.min(W, H) / 420), (16 + r() * 20) * T.rustV);
      }
    };
    let seeded = 0;
    function growRust(t, dt) {
      if (seeded === 0 && t > T.rust) { seedRust(t, launch ? 9 : 6); seeded = 1; }
      if (seeded === 1 && t > T.rust + (launch ? .4 : .7)) { seedRust(t, 4); seeded = 2; }
      if (seeded === 2 && t > T.rust + (launch ? .9 : 1.6)) { seedRust(t, 3); seeded = 3; }
      const x = R.x;
      for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        const k = 1 - s.r / s.R;
        if (k > 0) {
          s.r += s.v * dt * (.3 + k); s.fr++;
          const edgeAt = a => 1 + s.edge.reduce((acc, [amp, f, ph]) => acc + amp * Math.sin(f * a + ph), 0);   // jagged outline
          // a faint stain spreads ahead of the rust
          if (s.fr % 5 === 0) { const g = x.createRadialGradient(s.x, s.y, s.r * .6, s.x, s.y, s.r * 1.45); g.addColorStop(0, 'rgba(40,16,6,.05)'); g.addColorStop(1, 'rgba(40,16,6,0)'); x.fillStyle = g; x.beginPath(); x.arc(s.x, s.y, s.r * 1.45, 0, TAU); x.fill(); }
          for (let j = 0; j < 18; j++) {
            const a = r() * TAU, lim = s.r * edgeAt(a), d = lim * Math.pow(r(), .7), q = d / Math.max(1, lim);
            const c = q < .4 ? 0 : q < .7 ? 1 : q < .9 ? 2 : 3, al = [.26, .2, .17, .2][c];
            const px = s.x + Math.cos(a) * d, py = s.y + Math.sin(a) * d * .88, sz = .6 + r() * (1.6 + s.r * .035);
            x.fillStyle = `rgba(${RUST[c][0]},${RUST[c][1]},${RUST[c][2]},${al})`;
            x.save(); x.translate(px, py); x.rotate(r() * TAU); x.fillRect(-sz / 2, -sz * .35, sz, sz * (.4 + r() * .6)); x.restore();   // flaky grains
          }
          if (r() < .35) { const a = r() * TAU, d = s.r * edgeAt(a) * .45 * r(); x.fillStyle = 'rgba(30,12,6,.16)'; x.beginPath(); x.ellipse(s.x + Math.cos(a) * d, s.y + Math.sin(a) * d, s.r * .1, s.r * .06, r() * 3, 0, TAU); x.fill(); }
          if (r() < .7) { x.fillStyle = 'rgba(12,5,3,.7)'; x.beginPath(); x.arc(s.x + (r() - .5) * s.r * 1.1, s.y + (r() - .5) * s.r * .9, .4 + r() * 1.4, 0, TAU); x.fill(); }   // pits
          if (r() < .6) { const a = r() * TAU, lim = s.r * edgeAt(a); x.fillStyle = `rgba(${r() < .5 ? '196,110,46' : '168,82,30'},.45)`; x.fillRect(s.x + Math.cos(a) * lim * .92, s.y + Math.sin(a) * lim * .82, 1.3, 1.3); }   // bright flecks at the edge
        }
        if (s.r > s.R * .42 && s.kids < 3 && r() < dt * 2.4 && spots.length < 80) {
          s.kids++; const a = r() * TAU, d = s.r * (.75 + r() * .6);
          spawn(t, s.x + Math.cos(a) * d, s.y + Math.sin(a) * d, s.R * (.4 + r() * .45), s.v * .92);
        }
        const dr = s.drip;
        if (dr && s.r > s.R * .3 && dr.len < dr.max) {
          const k2 = dr.len / dr.max, step = (26 * (1 - k2) + 5) * dt * T.rustV;
          const xa = s.x + dr.ox + Math.sin((s.y + dr.len) / 11) * 1.2;
          x.strokeStyle = `rgba(66,22,9,${.3 * (1 - k2) + .08})`; x.lineWidth = dr.w * (1 - k2 * .6); x.lineCap = 'round';
          x.beginPath(); x.moveTo(xa, s.y + dr.len); dr.len += step; x.lineTo(s.x + dr.ox + Math.sin((s.y + dr.len) / 11) * 1.2, s.y + dr.len); x.stroke();
        }
      }
    }

    /* the bullet throne: rings of rounds fanned like a throne of swords, smallest inside */
    const cx = W / 2, cy = H * .47, maxR = Math.min(W * .46, H * .36);
    const r0 = maxR * .14, gap = 3.5;
    const nat = CAL.map(c => ({ L: 14 + c.L * .32, D: 3 + c.D * .42 }));
    const k = (maxR - r0 - gap * 6) / nat.reduce((a, n) => a + n.L, 0);
    const sprites = CAL.map((c, i) => cartridgeSprite(c, nat[i].D * k, nat[i].L * k));
    const hub = hubSprite(r0 * 1.12);
    const A0 = rad(-203), A1 = rad(23);   // the fan, across the top
    const rounds = [];
    let rb = r0 + gap * .4;
    CAL.forEach((c, i) => {
      const Ld = nat[i].L * k, Dd = nat[i].D * k, rm = rb + Ld / 2;
      const n = Math.max(6, Math.floor((A1 - A0) * rm / (Dd * 1.22)));
      const sp = (A1 - A0) / n;
      for (let j = 0; j < n; j++) {
        if (r() < .06) continue;                                     // a few gaps — haphazard
        let a = A0 + sp * (j + .5) + (i % 2 ? sp * .5 : 0) + (r() - .5) * sp * .4;
        if (a > A1) continue;
        const up = Math.max(0, -Math.sin(a));                       // 1 straight up, 0 at the sides
        const crown = i >= 3 ? up ** 3 * maxR * .1 * (i - 2) / 3 : 0;  // taller toward the top, like a throne back
        rounds.push({ i, a, r: rb + crown + (r() - .5) * Dd * 1.1, tilt: (r() - .5) * .08,
          start: T.ring0 + i * T.ringGap + r() * .2, dur: .42 + r() * .08 });
      }
      rb += Ld + gap;
    });
    // a few heavy rounds below, like the throne's lower spikes
    for (const a of [rad(38), rad(58), rad(122), rad(142)]) rounds.push({ i: 5, a, r: r0 + 2, tilt: 0, start: T.ring0 + 5 * T.ringGap + .1, dur: .45, low: 1 });
    rounds.sort((p, q) => p.i - q.i);
    const lastLock = Math.max(...rounds.map(b => b.start + b.dur));
    let shakeUntil = 0, shakeAmp = 0;
    const ringShook = new Set();

    function drawThrone(t) {
      const x = L.x; x.clearRect(0, 0, W, H);
      for (const b of rounds) {
        const p = seg(t, b.start, b.start + b.dur); if (p <= 0) continue;
        const sp = sprites[b.i], len = nat[b.i].L * k;
        let rr = b.r * .25 + (b.r - b.r * .25) * E.in4(p);           // slow, then snaps out
        const q = seg(t, b.start + b.dur, b.start + b.dur + .14);
        if (p >= 1) {
          rr = b.r - 2.4 * Math.sin(Math.PI * q) * (1 - q);           // locks with a tiny recoil
          if (!ringShook.has(b.i) && b.i >= 3) { ringShook.add(b.i); shakeUntil = t + .14; shakeAmp = b.i === 5 ? 3.2 : 1.4; }
        }
        x.save(); x.translate(cx + Math.cos(b.a) * rr, cy + Math.sin(b.a) * rr); x.rotate(b.a + Math.PI / 2 + b.tilt);
        x.globalAlpha = clamp(p * 5);
        x.drawImage(sp.c, -sp.w / 2, -sp.h, sp.w, sp.h);
        if (p >= 1 && q < .6) { x.globalAlpha = .7 * (1 - q / .6); x.strokeStyle = '#ffe6b0'; x.lineWidth = Math.max(.8, sp.w * .18); x.beginPath(); x.moveTo(-sp.w * .2, -len * .92); x.lineTo(-sp.w * .2, -len * .55); x.stroke(); }
        x.restore();
      }
      const hp = seg(t, T.hub, T.hub + .45);
      if (hp > 0) { const s = E.back(hp); x.save(); x.translate(cx, cy); x.scale(s, s); x.drawImage(hub.c, -hub.w / 2, -hub.h / 2, hub.w, hub.h); x.restore(); }
    }

    /* lightning off-screen: the room flashes and the throne throws a shadow onto the metal */
    const sil = off(W, H);
    let silReady = false, flashDir = 0;
    function prepShadow(dir) {
      const s = S.x; s.clearRect(0, 0, W, H);
      const ox = dir * Math.max(16, maxR * .13), oy = Math.max(22, maxR * .17);
      s.drawImage(sil.c, ox, oy, W, H);
      const f = F.x; f.clearRect(0, 0, W, H);
      const lx = dir > 0 ? -W * .18 : W * 1.18, ly = -H * .14, rr = Math.hypot(W, H) * 1.25;
      const g = f.createRadialGradient(lx, ly, 0, lx, ly, rr);
      g.addColorStop(0, 'rgba(235,242,255,.95)'); g.addColorStop(.33, 'rgba(185,200,255,.42)'); g.addColorStop(1, 'rgba(110,130,200,0)');
      f.fillStyle = g; f.fillRect(0, 0, W, H);
    }
    const FLICK = [[0, 0], [.03, 1], [.09, .22], [.14, .95], [.22, .4], [.3, .7], [.48, .12], [.75, 0]];
    const flick = u => { if (u <= 0 || u >= .75) return 0; for (let i = 1; i < FLICK.length; i++) if (u <= FLICK[i][0]) return lerp(FLICK[i - 1][1], FLICK[i][1], (u - FLICK[i - 1][0]) / (FLICK[i][0] - FLICK[i - 1][0])); return 0; };

    let last = 0;
    await run(host, t => {
      const dt = Math.min(.05, t - last); last = t; host.__t = t;
      // metal creeps in, with a couple of dying-light flickers
      let ma = E.io(seg(t, T.metal[0], T.metal[1]));
      if (!launch && t > 1.1 && t < 1.9) ma *= 1 - .35 * (Math.sin(t * 47) > .82 ? 1 : 0);
      M.c.style.opacity = ma;
      growRust(t, dt);
      drawThrone(t);
      if (!silReady && (t > lastLock + .05 || t > T.f1 - .15)) {
        const s = sil.x; s.drawImage(L.c, 0, 0, W, H); s.globalCompositeOperation = 'source-in'; s.fillStyle = '#000'; s.fillRect(0, 0, W, H); silReady = true;
      }
      const f1 = flick(t - T.f1), f2 = flick(t - T.f2), fl = Math.max(f1, f2);
      const dir = f1 > 0 ? 1 : f2 > 0 ? -1 : 0;
      if (dir && dir !== flashDir) { prepShadow(dir); flashDir = dir; }
      F.c.style.opacity = fl * .9; S.c.style.opacity = Math.min(1, fl * 1.25) * .92;
      host.style.transform = t < shakeUntil ? `translate(${(Math.random() - .5) * shakeAmp * 2}px,${(Math.random() - .5) * shakeAmp * 2}px)` : '';
      // the words flicker on, like a bulb catching
      const wq = t - T.words;
      words.style.opacity = wq < 0 ? 0 : wq < .08 ? .8 : wq < .16 ? .1 : wq < .26 ? .9 : wq < .32 ? .35 : Math.min(1, .6 + wq);
      return t < T.end;
    });
    host.style.transform = '';
  }

  /* ═════════════════════════ EQUESTRIAN ═════════════════════════ */
  function drawCloud(x, cx, cy, s, a) {
    x.fillStyle = `rgba(255,255,255,${a})`;
    for (const [dx, dy, rr] of [[0, 0, 1], [.9, .15, .75], [-.9, .2, .7], [.4, -.45, .75], [-.35, -.35, .6], [1.6, .35, .5], [-1.6, .38, .45]]) { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, rr * s, 0, TAU); x.fill(); }
  }
  function makeTrees(W, H, yH, r) {
    const trees = [];
    for (let xx = -40; xx < W + 60; xx += 46 + r() * 40) {
      const h = H * (.13 + r() * .13), cw = h * (.55 + r() * .25);
      const blobs = [];
      for (let i = 0; i < 16; i++) { const by = r(); blobs.push({ dx: (r() - .5) * cw, dy: -h * (.35 + by * .65), r: cw * (.18 + r() * .2), lvl: by, shade: r() }); }
      blobs.sort((a, b) => b.dy - a.dy);
      trees.push({ x: xx, base: yH - H * .035, h, blobs, ph: r() * TAU, far: r() < .45 });
    }
    return trees.sort((a, b) => b.far - a.far);
  }
  function drawSky(x, W, H, yH, t, trees, clouds) {
    const g = x.createLinearGradient(0, 0, 0, yH);
    g.addColorStop(0, '#5fa9e3'); g.addColorStop(.62, '#a9d5f2'); g.addColorStop(1, '#e4f2f7');
    x.fillStyle = g; x.fillRect(0, 0, W, yH + 4);
    const sg = x.createRadialGradient(W * .12, H * .07, 0, W * .12, H * .07, Math.max(W, H) * .55);
    sg.addColorStop(0, 'rgba(255,252,225,.95)'); sg.addColorStop(.12, 'rgba(255,246,205,.55)'); sg.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = sg; x.fillRect(0, 0, W, yH);
    for (const c of clouds) drawCloud(x, ((c.x + t * c.v) % (W + 300)) - 150, c.y, c.s, c.a);
    // trees, swaying in the breeze (the tops move most)
    for (const tr of trees) {
      const sway = (lv) => Math.sin(t * 1.35 + tr.ph + lv * 1.7) * (2 + lv * 5.5) + Math.sin(t * 3.1 + tr.ph * 2) * lv * 1.4;
      x.strokeStyle = tr.far ? '#7a8e72' : '#5b4630'; x.lineWidth = tr.far ? 3 : 5;
      x.beginPath(); x.moveTo(tr.x, tr.base); x.quadraticCurveTo(tr.x + sway(.3) * .4, tr.base - tr.h * .3, tr.x + sway(.5) * .6, tr.base - tr.h * .55); x.stroke();
      for (const b of tr.blobs) {
        const light = b.dx < 0 ? 1 : 0;   // the sun is up and to the left
        x.fillStyle = tr.far ? ['#8fae8a', '#9dbb95', '#adc8a3'][Math.floor(b.shade * 2.99)]
          : (light ? ['#4f8a3f', '#6aa24f', '#86bb63'] : ['#3c6a32', '#4c7c3e', '#5f914a'])[Math.floor(b.shade * 2.99)];
        x.beginPath(); x.arc(tr.x + b.dx + sway(b.lvl), tr.base + b.dy, b.r, 0, TAU); x.fill();
      }
    }
    // haze where the trees meet the fence
    const hz = x.createLinearGradient(0, yH - H * .09, 0, yH);
    hz.addColorStop(0, 'rgba(230,242,240,0)'); hz.addColorStop(1, 'rgba(230,242,240,.55)');
    x.fillStyle = hz; x.fillRect(0, yH - H * .09, W, H * .09);
  }
  function smallJump(x, cx, by, s, c1, flowers) {
    const hgt = 90 * s, w = 150 * s;
    x.fillStyle = 'rgba(80,60,30,.18)'; x.beginPath(); x.ellipse(cx, by + 2 * s, w * .6, 6 * s, 0, 0, TAU); x.fill();
    for (const sx of [cx - w / 2, cx + w / 2]) { x.fillStyle = '#f7f7f2'; x.fillRect(sx - 4 * s, by - hgt, 8 * s, hgt); x.fillStyle = '#ddd'; x.fillRect(sx + 1.5 * s, by - hgt, 2.5 * s, hgt); }
    for (const [yy, ph] of [[by - hgt * .78, 0], [by - hgt * .45, 1]]) {
      x.save(); x.lineWidth = 7 * s; x.strokeStyle = '#fbfbf6'; x.beginPath(); x.moveTo(cx - w / 2, yy); x.lineTo(cx + w / 2, yy); x.stroke();
      x.strokeStyle = c1; x.setLineDash([14 * s, 14 * s]); x.lineDashOffset = ph * 14 * s; x.stroke(); x.restore();
    }
    if (flowers) for (let i = 0; i < 9; i++) { x.fillStyle = i % 2 ? '#3f7a37' : '#fff'; x.beginPath(); x.arc(cx - w * .38 + i * w * .095, by - 6 * s, (i % 2 ? 7 : 4) * s, 0, TAU); x.fill(); }
  }
  function drawMid(x, W, H, yH) {
    // white arena fence with dressage letters
    const top = yH - H * .07;
    x.fillStyle = 'rgba(70,90,60,.15)'; x.fillRect(0, yH - 3, W, 6);
    for (let px = 8; px < W + 40; px += Math.max(54, W / 7)) { x.fillStyle = '#f4f4ee'; x.fillRect(px, top - 6, 7, yH - top + 6); x.fillStyle = '#d5d6cc'; x.fillRect(px + 4.5, top - 6, 2.5, yH - top + 6); }
    for (const f of [0, .45, .85]) { const yy = top + (yH - top) * f; x.fillStyle = '#f7f7f1'; x.fillRect(0, yy, W, 5); x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, yy + 5, W, 2); }
    const letters = W > 700 ? ['A', 'K', 'E', 'H', 'C'] : ['K', 'E', 'H'];
    letters.forEach((L, i) => {
      const lx = W * (i + .5) / letters.length, ly = yH - 4, s = Math.max(20, H * .032);
      x.fillStyle = '#fff'; x.fillRect(lx - s / 2, ly - s * 1.3, s, s * 1.15); x.strokeStyle = '#2a2235'; x.lineWidth = 1.5; x.strokeRect(lx - s / 2, ly - s * 1.3, s, s * 1.15);
      x.fillStyle = '#2a2235'; x.font = `700 ${s * .75}px "Playfair Display",Georgia,serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(L, lx, ly - s * .72);
    });
  }
  function drawNear(x, W, H, yH, geo, r) {
    const g = x.createLinearGradient(0, yH, 0, H);
    g.addColorStop(0, '#e6d3ae'); g.addColorStop(.5, '#d8c19a'); g.addColorStop(1, '#c6aa80');
    x.fillStyle = g; x.fillRect(0, yH, W, H - yH);
    for (let i = 0; i < W * (H - yH) / 26; i++) { const yy = yH + r() * (H - yH); x.fillStyle = r() < .5 ? `rgba(120,90,55,${r() * .18})` : `rgba(255,250,235,${r() * .25})`; x.fillRect(r() * W, yy, 1 + r() * 1.5 * (yy - yH) / (H - yH), 1); }
    x.strokeStyle = 'rgba(150,115,75,.18)'; x.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) { const yy = yH + (H - yH) * (.15 + i * .1); x.beginPath(); x.moveTo(-20, yy); x.quadraticCurveTo(W / 2, yy + 12, W + 20, yy - 4); x.stroke(); }
    // other jumps around the arena, smaller with distance
    smallJump(x, W * .14, yH + H * .04, Math.max(.3, H / 2500), '#c8323a', 1);
    smallJump(x, W * .4, yH + H * .075, Math.max(.4, H / 2000), '#2f5fb3', 0);
    smallJump(x, W * .9, yH + H * .05, Math.max(.34, H / 2300), '#3f7a37', 1);
    // far standard + the two poles running back toward it (the near standard is drawn in front of the horse)
    const { ns, fs, ground } = geo;
    x.fillStyle = 'rgba(80,60,30,.2)'; x.beginPath(); x.ellipse((ns.x + fs.x) / 2, (ground + fs.base) / 2 + 6, (fs.x - ns.x) * .9, H * .02, -.2, 0, TAU); x.fill();
    standard(x, fs.x, fs.base, fs.h, fs.s, false);
    for (const k of [geo.top, geo.low]) {
      const y1 = ground - ns.h * k, y2 = fs.base - fs.h * k;
      x.save(); x.lineCap = 'round';
      x.strokeStyle = '#f9f8f3'; x.lineWidth = 11 * ns.s; x.beginPath(); x.moveTo(ns.x, y1); x.lineTo(fs.x, y2); x.stroke();
      x.strokeStyle = '#6b3fa0'; x.setLineDash([22 * ns.s, 22 * ns.s]); x.stroke();
      x.setLineDash([]); x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 3 * ns.s; x.beginPath(); x.moveTo(ns.x, y1 + 4 * ns.s); x.lineTo(fs.x, y2 + 3 * ns.s); x.stroke();
      x.restore();
    }
  }
  // a jump standard with a decorative wing and a flower box
  function standard(x, sx, base, h, s, wing) {
    if (wing) {
      x.fillStyle = '#fdfdf9';
      const ww = 62 * s;
      x.fillStyle = '#fdfdf9';
      x.beginPath(); x.moveTo(sx, base); x.lineTo(sx, base - h * .8); x.quadraticCurveTo(sx - ww * .45, base - h * .86, sx - ww, base - h * .5); x.lineTo(sx - ww, base); x.closePath(); x.fill();
      x.strokeStyle = '#d9d8cf'; x.lineWidth = 2 * s; x.stroke();
      x.strokeStyle = '#e4e3da'; x.lineWidth = 4 * s;
      for (let i = 1; i < 5; i++) { x.beginPath(); x.moveTo(sx - ww, base - h * .1 * i); x.lineTo(sx, base - h * .12 * i - h * .08); x.stroke(); }
      // flower box at the foot of the wing (a nod to the flowers)
      x.fillStyle = '#5a3d28'; x.fillRect(sx - ww - 12 * s, base - 20 * s, ww + 22 * s, 20 * s);
      for (let i = 0; i < 10; i++) { x.fillStyle = ['#3f7a37', '#6b3fa0', '#fff', '#c9b3e6'][i % 4]; x.beginPath(); x.arc(sx - ww - 6 * s + i * 8.5 * s, base - 22 * s - (i % 3) * 4 * s, (i % 4 === 0 ? 8 : 5.5) * s, 0, TAU); x.fill(); }
    }
    x.fillStyle = '#fbfbf7'; x.fillRect(sx - 7 * s, base - h, 14 * s, h);
    x.fillStyle = '#d7d6cd'; x.fillRect(sx + 3 * s, base - h, 4 * s, h);
    x.fillStyle = '#6b3fa0'; x.fillRect(sx - 8 * s, base - h - 10 * s, 16 * s, 12 * s);
    x.fillStyle = '#c9a24d'; x.beginPath(); x.arc(sx, base - h - 14 * s, 6 * s, 0, TAU); x.fill();
  }

  /* the horse: a white horse seen from the side, so close only the legs, belly, tail and the
     rider's boot in the stirrup show. Legs are jointed and driven by a canter cycle; the jump
     blends to a tucked, airborne pose and back. */
  function horseRig(LL) {
    return { LL, BL: LL * 1.55,
      F: [LL * .40, LL * .33, LL * .13], Hd: [LL * .40, LL * .38, LL * .13],
      wF: [LL * .14, LL * .068, LL * .062, LL * .048], wH: [LL * .19, LL * .075, LL * .064, LL * .05] };
  }
  // angles in degrees from straight down; positive points toward the horse's nose
  function gaitFront(p) {
    if (p < .45) { const s = p / .45; return [lerp(24, -26, s), 0, -12 * Math.sin(Math.PI * s)]; }
    const s = (p - .45) / .55; return [lerp(-26, 24, E.io(s)), 100 * Math.sin(Math.PI * Math.min(1, s * 1.15)), 45 * Math.sin(Math.PI * s)];
  }
  function gaitHind(p) {
    if (p < .42) { const s = p / .42; return [lerp(-4, -42, s), lerp(14, -24, s), -10 * Math.sin(Math.PI * s)]; }
    const s = (p - .42) / .58; return [lerp(-42, -4, E.io(s)), lerp(-24, 14, E.io(s)) + 62 * Math.sin(Math.PI * s), 50 * Math.sin(Math.PI * s)];
  }
  const JF = u => u < .14 ? [lerp(24, -10, u / .14), 0, 0] : u < .72 ? [72, 150, 40] : [lerp(72, 26, E.smooth(seg(u, .72, 1))), lerp(150, 0, E.smooth(seg(u, .72, .95))), 0];
  const JH = u => u < .3 ? [lerp(-20, -52, u / .3), lerp(0, -70, u / .3), 0] : u < .7 ? [-55, -40 + 60 * seg(u, .3, .7), 30] : [lerp(-55, -6, seg(u, .7, 1)), lerp(20, 10, seg(u, .7, 1)), 10];
  function legPoints(root, segs, ang, hind) {
    // hind: angles are [gaskin, cannon (absolute), pastern fold]; front: [forearm, knee fold, pastern fold]
    const pts = [root]; let a = rad(ang[0]), p = root;
    const step = (len, an) => { const q = { x: p.x + Math.sin(an) * len, y: p.y + Math.cos(an) * len }; pts.push(q); p = q; return an; };
    step(segs[0], a);
    const cannon = hind ? rad(ang[1]) : a - rad(ang[1]);
    step(segs[1], cannon);
    step(segs[2], cannon - rad(ang[2]) + rad(hind ? 18 : 20));
    return pts;
  }
  function drawLeg(x, pts, widths, near, hind) {
    const col = near ? '#f8f6f1' : '#d2cec4', shade = near ? 'rgba(168,160,148,.75)' : 'rgba(120,114,104,.6)';
    x.lineCap = 'round'; x.lineJoin = 'round';
    const quads = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], w1 = widths[i], w2 = widths[i + 1];
      const ang = Math.atan2(b.y - a.y, b.x - a.x), nx = -Math.sin(ang), ny = Math.cos(ang);
      quads.push({ a, b, w1, w2, nx, ny });
      x.beginPath();
      x.moveTo(a.x + nx * w1 / 2, a.y + ny * w1 / 2); x.lineTo(b.x + nx * w2 / 2, b.y + ny * w2 / 2);
      x.lineTo(b.x - nx * w2 / 2, b.y - ny * w2 / 2); x.lineTo(a.x - nx * w1 / 2, a.y - ny * w1 / 2); x.closePath();
      x.fillStyle = col; x.fill();
      x.beginPath(); x.arc(b.x, b.y, w2 * (i === 0 ? .66 : .6), 0, TAU); x.fill();   // knobby knee/hock, round fetlock
    }
    if (hind) {   // the point of the hock sticks out behind
      const q = quads[0], b = q.b; x.beginPath(); x.ellipse(b.x - q.w2 * .55, b.y - q.w2 * .35, q.w2 * .42, q.w2 * .55, .3, 0, TAU); x.fillStyle = col; x.fill();
    }
    // a soft shadow down the back of the leg (the sun is in front and above)
    for (const q of quads) {
      x.strokeStyle = shade; x.lineWidth = Math.max(1.2, q.w2 * .16);
      const side = q.ny > 0 ? -1 : 1;
      x.beginPath(); x.moveTo(q.a.x + side * q.nx * q.w1 * .42, q.a.y + side * q.ny * q.w1 * .42); x.lineTo(q.b.x + side * q.nx * q.w2 * .42, q.b.y + side * q.ny * q.w2 * .42); x.stroke();
    }
    // hoof
    const a = pts[pts.length - 2], b = pts[pts.length - 1], ang = Math.atan2(b.y - a.y, b.x - a.x), hw = widths[3] * 1.5, hh = widths[3] * 1.15;
    x.save(); x.translate(b.x, b.y); x.rotate(ang - Math.PI / 2);
    x.fillStyle = '#3b3733'; x.beginPath(); x.moveTo(-hw * .45, -2); x.lineTo(hw * .45, -2); x.lineTo(hw * .62, hh); x.lineTo(-hw * .55, hh); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(hw * .2, 0, hw * .2, hh * .9);
    x.restore();
  }
  function drawHorse(x, rig, hx, hy, poses, t, airborne, W, H) {
    const { LL, BL } = rig;
    const fRoot = { x: hx + BL * .30, y: hy - LL * .06 }, hRoot = { x: hx - BL * .31, y: hy - LL * .14 };
    const legs = {
      FR: legPoints({ x: fRoot.x + LL * .03, y: fRoot.y }, rig.F, poses.FR, false), HR: legPoints({ x: hRoot.x + LL * .03, y: hRoot.y }, rig.Hd, poses.HR, true),
      FL: legPoints(fRoot, rig.F, poses.FL, false), HL: legPoints(hRoot, rig.Hd, poses.HL, true)
    };
    // far-side legs first
    drawLeg(x, legs.HR, rig.wH, false, true); drawLeg(x, legs.FR, rig.wF, false);
    // tail: long white strands streaming back
    const tr = { x: hx - BL * .6, y: hy - LL * .62 };
    x.fillStyle = '#f4f2ec'; x.beginPath(); x.ellipse(tr.x + LL * .02, tr.y - LL * .04, LL * .05, LL * .1, .5, 0, TAU); x.fill();
    for (let i = 0; i < 26; i++) {
      const ph = i / 26, len = LL * (.7 + ph * .26), stream = airborne ? .95 : .48 + .1 * Math.sin(t * 5 + i);
      const w1 = Math.sin(t * 4.6 + i * .25) * LL * .04, w2 = Math.sin(t * 3.7 + i * .35) * LL * .045;
      x.strokeStyle = `rgba(${i % 4 ? '251,250,246' : '206,201,190'},${.55 + (i % 3) * .15})`; x.lineWidth = LL * (.005 + (i % 4) * .0028); x.lineCap = 'round';
      x.beginPath(); x.moveTo(tr.x, tr.y);
      x.bezierCurveTo(tr.x - LL * .12 * stream, tr.y + len * .3 + w1, tr.x - len * .5 * stream + w2, tr.y + len * .65,
        tr.x - len * .62 * stream + w1 - ph * LL * .08, tr.y + len * (airborne ? .62 : .95));
      x.stroke();
    }
    // the barrel (belly) — the top runs off the top of the screen
    // outline: rounded hindquarters behind, belly, then the chest sweeping forward into the neck
    x.beginPath();
    x.moveTo(hx - BL * .5, hy - LL * 1.6);
    x.bezierCurveTo(hx - BL * .6, hy - LL * 1.25, hx - BL * .66, hy - LL * .8, hx - BL * .58, hy - LL * .5);   // buttock
    x.bezierCurveTo(hx - BL * .54, hy - LL * .28, hx - BL * .44, hy - LL * .14, hx - BL * .32, hy - LL * .06);  // down the back of the thigh
    x.bezierCurveTo(hx - BL * .12, hy + LL * .02, hx + BL * .12, hy + LL * .02, hx + BL * .28, hy - LL * .02);  // belly
    x.bezierCurveTo(hx + BL * .42, hy - LL * .06, hx + BL * .5, hy - LL * .2, hx + BL * .53, hy - LL * .42);   // chest
    x.bezierCurveTo(hx + BL * .57, hy - LL * .62, hx + BL * .66, hy - LL * .85, hx + BL * .74, hy - LL * 1.15); // neck rising forward
    x.lineTo(hx + BL * .82, hy - LL * 1.8); x.lineTo(hx - BL * .5, hy - LL * 1.8); x.closePath();
    const bg = x.createLinearGradient(0, hy - LL * .7, 0, hy + 2);
    bg.addColorStop(0, '#ffffff'); bg.addColorStop(.72, '#f2f0eb'); bg.addColorStop(1, '#cdc9bf');
    x.fillStyle = bg; x.fill();
    x.strokeStyle = 'rgba(150,145,135,.35)'; x.lineWidth = 1.5; x.stroke();
    // muscle shading at shoulder and stifle
    x.strokeStyle = 'rgba(160,155,145,.25)'; x.lineWidth = LL * .02;
    x.beginPath(); x.arc(fRoot.x - LL * .02, fRoot.y - LL * .2, LL * .18, .6, 1.9); x.stroke();
    x.beginPath(); x.arc(hRoot.x + LL * .02, hRoot.y - LL * .22, LL * .22, .9, 2.3); x.stroke();
    // purple saddle pad with white piping, and the girth
    const padL = hx + BL * .02, padR = hx + BL * .3, padB = hy - LL * .29;
    x.beginPath(); x.moveTo(padL, -H); x.lineTo(padL, padB - LL * .05); x.quadraticCurveTo(padL, padB, padL + LL * .06, padB); x.lineTo(padR - LL * .06, padB); x.quadraticCurveTo(padR, padB, padR, padB - LL * .05); x.lineTo(padR, -H); x.closePath();
    x.fillStyle = '#6b3fa0'; x.fill();
    x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = LL * .009; x.beginPath(); x.moveTo(padL + LL * .025, -H); x.lineTo(padL + LL * .025, padB - LL * .045); x.quadraticCurveTo(padL + LL * .025, padB - LL * .022, padL + LL * .07, padB - LL * .022); x.lineTo(padR - LL * .07, padB - LL * .022); x.quadraticCurveTo(padR - LL * .025, padB - LL * .022, padR - LL * .025, padB - LL * .045); x.lineTo(padR - LL * .025, -H); x.stroke();
    x.fillStyle = 'rgba(40,15,60,.25)'; x.fillRect(padL, padB - LL * .012, padR - padL, LL * .012);
    const gx = hx + BL * .24;
    x.fillStyle = '#2a201a'; x.beginPath(); x.moveTo(gx - LL * .03, padB - LL * .02); x.lineTo(gx + LL * .03, padB - LL * .02); x.lineTo(gx + LL * .04, hy + LL * .015); x.lineTo(gx - LL * .02, hy + LL * .015); x.closePath(); x.fill();
    x.fillStyle = '#c0c3c6'; x.fillRect(gx - LL * .025, padB + LL * .02, LL * .05, LL * .03);
    // near-side legs
    drawLeg(x, legs.HL, rig.wH, true, true); drawLeg(x, legs.FL, rig.wF, true);
    // the rider's leg: white breeches, black tall boot, heel down in the stirrup
    const sway = Math.sin(t * 9) * LL * .006 * (airborne ? 0 : 1);
    const knee = { x: hx + BL * .2 + sway, y: padB - LL * .04 }, ankle = { x: hx + BL * .13 + sway, y: hy + LL * .015 }, toe = { x: ankle.x + LL * .12, y: ankle.y + LL * .015 };
    x.strokeStyle = '#4a4440'; x.lineWidth = LL * .012; x.beginPath(); x.moveTo(hx + BL * .16, -H); x.lineTo(ankle.x + LL * .02, ankle.y - LL * .01); x.stroke();
    x.strokeStyle = '#f2f0ea'; x.lineWidth = LL * .09; x.lineCap = 'round'; x.beginPath(); x.moveTo(knee.x + LL * .08, -H * .2); x.lineTo(knee.x, knee.y); x.stroke();
    x.fillStyle = '#121214';
    x.beginPath(); x.moveTo(knee.x - LL * .055, knee.y - LL * .03); x.lineTo(knee.x + LL * .06, knee.y - LL * .05);
    x.lineTo(ankle.x + LL * .045, ankle.y - LL * .02); x.lineTo(toe.x, toe.y - LL * .01); x.lineTo(toe.x - LL * .005, toe.y + LL * .028);
    x.lineTo(ankle.x - LL * .055, ankle.y + LL * .03); x.lineTo(ankle.x - LL * .04, ankle.y - LL * .04); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = LL * .008; x.beginPath(); x.moveTo(knee.x + LL * .02, knee.y); x.lineTo(ankle.x + LL * .018, ankle.y - LL * .04); x.stroke();
    x.strokeStyle = '#b8bcc0'; x.lineWidth = LL * .012; x.beginPath(); x.moveTo(ankle.x - LL * .02, ankle.y + LL * .035); x.lineTo(ankle.x + LL * .09, ankle.y + LL * .04); x.stroke();
    return legs;
  }

  async function equestrian(host, { launch }) {
    const W = host.clientWidth, H = host.clientHeight, r = rng(11);
    const yH = H * .55;
    const T = launch ? { sky: [0, .5], trees: [0, .5], mid: [.05, .55], near: [.1, .6], horse: .65, words: 3.3, end: 4.9 }
      : { sky: [.25, 1.4], trees: [.55, 1.7], mid: [.8, 1.8], near: [.5, 1.6], horse: 2.4, words: 6.4, end: 7.6 };
    const old = oldLayers(host);
    // the flowers blow away on the breeze
    if (!launch) {
      old.forEach((e, i) => { e.style.transition = `transform 1.8s cubic-bezier(.5,0,.7,.3) ${i * .05}s, opacity 1.6s ease-in ${.2 + i * .05}s, filter 1.6s`; e.style.transform = `translate(${W * 1.1}px,${-H * .06}px) rotate(14deg)`; e.style.opacity = '0'; e.style.filter = 'blur(2px)'; });
    } else hideOld(old);

    const SKY = layer(host, 20, 'opacity:0;filter:blur(1.2px)');
    const MID = layer(host, 21, 'opacity:0;filter:blur(.6px)');
    const NEAR = layer(host, 22, 'opacity:0');
    const HORSE = layer(host, 23);
    const FRONT = layer(host, 24, 'opacity:0');
    const PET = layer(host, 25);
    const words = wordsEl(host, 26, `<div style="font:italic 700 clamp(38px,10.5vw,70px)/1 'Playfair Display',Georgia,serif;color:#fff;text-shadow:0 2px 14px rgba(30,40,70,.45)">Spencer Family</div>
      <div style="margin-top:12px;font:700 clamp(13px,3.6vw,20px)/1 Lato,system-ui,sans-serif;letter-spacing:.42em;color:#fff;text-shadow:0 1px 8px rgba(30,40,70,.5)">FOOD STORAGE</div>`,
      'top:calc(9vh + env(safe-area-inset-top));transform:translateY(10px);transition:opacity .9s ease,transform .9s ease;');

    const trees = makeTrees(W, H, yH, r);
    const clouds = Array.from({ length: 5 }, () => ({ x: r() * (W + 300), y: H * (.05 + r() * .2), s: H * (.025 + r() * .03), v: 6 + r() * 10, a: .75 + r() * .2 }));
    drawMid(MID.x, W, H, yH);

    const ground = H * .94, LL = Math.min(ground - H * .4, W * .92);
    const rig = horseRig(LL);
    const sc = LL / 520;
    const geo = { ground, top: .74, low: .44,
      ns: { x: W * .7, h: LL * .95, s: sc }, fs: { x: W * .7 + Math.max(56, W * .13), base: ground - H * .08, h: LL * .95 * .8, s: sc * .8 } };
    geo.fs.h = geo.ns.h * .8;
    drawNear(NEAR.x, W, H, yH, geo, r);
    standard(FRONT.x, geo.ns.x, ground, geo.ns.h, sc, true);

    // petals and pollen riding the breeze
    const petals = Array.from({ length: launch ? 30 : 150 }, (_, i) => ({ x: r() * W * (launch ? 1 : .9), y: r() * H, vx: 90 + r() * 200, vy: -10 + r() * 20, rot: r() * TAU, vr: (r() - .5) * 6, s: 3 + r() * 5,
      c: ['#ffffff', '#ffe4ec', '#fff5d6', '#f7cfdb'][i % 4], t0: launch ? 99 : r() * .9 }));
    const pollen = Array.from({ length: 26 }, () => ({ x: r() * W, y: r() * yH, vx: 14 + r() * 26, ph: r() * TAU }));

    // the run: canter in from the left, jump the purple-and-white fence, canter away
    const v = LL * .95, cadence = .7;
    const jumpX = (geo.ns.x + geo.fs.x) / 2, Tj = .92;
    const x0 = -rig.BL * .62, dist = (W + rig.BL * 1.25) - x0;
    const tTake = (jumpX - LL * .18 - x0) / v - Tj / 2;
    const fadeIn = (el, a) => el.c.style.opacity = E.io(seg(curT, a[0], a[1]));
    let curT = 0, hyS = null, lastStanceHy = null;

    await run(host, t => {
      curT = t;
      fadeIn(SKY, T.sky); fadeIn(MID, T.mid); fadeIn(NEAR, T.near); FRONT.c.style.opacity = E.io(seg(t, T.near[0] + .15, T.near[1] + .15));
      drawSky(SKY.x, W, H, yH, t, trees, clouds);

      // petals
      const p = PET.x; p.clearRect(0, 0, W, H);
      for (const q of petals) {
        const tt = t - q.t0; if (tt < 0) continue;
        const px = q.x + q.vx * tt * (1 + tt * .6), py = q.y + q.vy * tt + Math.sin(tt * 3 + q.rot) * 14;
        if (px > W + 20) continue;
        p.save(); p.translate(px, py); p.rotate(q.rot + q.vr * tt); p.globalAlpha = clamp(1.6 - tt * .5);
        p.fillStyle = q.c; p.beginPath(); p.ellipse(0, 0, q.s, q.s * .55, 0, 0, TAU); p.fill(); p.restore();
      }
      p.globalAlpha = .7;
      for (const q of pollen) { const px = (q.x + q.vx * t) % W, py = q.y + Math.sin(t * 1.4 + q.ph) * 6; p.fillStyle = 'rgba(255,250,220,.8)'; p.beginPath(); p.arc(px, py, 1.3, 0, TAU); p.fill(); }
      p.globalAlpha = 1;

      // the horse
      const h = HORSE.x; h.clearRect(0, 0, W, H);
      const ht = t - T.horse;
      if (ht > 0) {
        const hx = x0 + v * ht;
        const ph = (ht * cadence) % 1;
        const gp = { HL: gaitHind(ph), HR: gaitHind((ph + .82) % 1), FL: gaitFront((ph + .8) % 1), FR: gaitFront((ph + .66) % 1) };
        const u = (ht - tTake) / Tj, air = u > 0 && u < 1;
        const w = air ? Math.min(E.smooth(seg(u, 0, .16)), 1 - E.smooth(seg(u, .82, 1))) : 0;
        const poses = {};
        for (const key of ['HL', 'HR', 'FL', 'FR']) {
          const j = key[0] === 'F' ? JF(clamp(u + (key === 'FR' ? .03 : 0))) : JH(clamp(u + (key === 'HR' ? .04 : 0)));
          poses[key] = gp[key].map((a, i) => lerp(a, j[i], w));
        }
        // keep the legs on the ground: the lowest hoof in stance sets the body height
        const probe = drawHorseProbe(rig, hx, 0, poses);
        const stance = ['HL', 'HR', 'FL', 'FR'].filter(key => (key[0] === 'F' ? ((key === 'FL' ? (ph + .8) % 1 : (ph + .66) % 1) < .45) : ((key === 'HL' ? ph : (ph + .82) % 1) < .42)));
        let hy;
        if (stance.length && !air) { hy = ground - Math.max(...stance.map(k2 => probe[k2])); lastStanceHy = hy; }
        else hy = (lastStanceHy ?? ground - LL) - (air ? 0 : LL * .015);
        if (air) hy = (lastStanceHy ?? ground - LL) - LL * .4 * Math.sin(Math.PI * u) + LL * .05 * w;
        hyS = hyS == null ? hy : lerp(hyS, hy, air ? .5 : .35);
        // shadow on the sand
        const lift = clamp(((ground - LL) - hyS) / (LL * .4));
        h.fillStyle = `rgba(90,65,35,${.16 - lift * .08})`; h.beginPath(); h.ellipse(hx, ground + 2, rig.BL * (.34 - lift * .06), LL * .022, 0, 0, TAU); h.fill();
        drawHorse(h, rig, hx, hyS, poses, t, air, W, H);
        if (hx - rig.BL * .6 > W && t < T.words) T.words = t;           // gone: bring in the words
      }
      if (t > T.words) { words.style.opacity = 1; words.style.transform = 'none'; }
      return t < Math.max(T.end, T.words + 1.5);
    });
  }
  // where each hoof lands (relative to the belly line) for a given pose — used to keep feet on the ground
  function drawHorseProbe(rig, hx, hy, poses) {
    const { LL, BL } = rig, fRoot = { x: hx + BL * .30, y: hy - LL * .06 }, hRoot = { x: hx - BL * .31, y: hy - LL * .14 };
    const tip = pts => pts[pts.length - 1].y + rig.wF[3] * 1.15;
    return { FL: tip(legPoints(fRoot, rig.F, poses.FL, false)), FR: tip(legPoints(fRoot, rig.F, poses.FR, false)),
      HL: tip(legPoints(hRoot, rig.Hd, poses.HL, true)), HR: tip(legPoints(hRoot, rig.Hd, poses.HR, true)) };
  }

  window.SFFS_REVEAL = {
    play(kind, host, opts = {}) { host.__skip = false; return (kind === 'armory' ? armory : equestrian)(host, opts); }
  };
})();
