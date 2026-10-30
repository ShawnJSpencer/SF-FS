/* SF-FS · Secret reveals
   Armory (hold one finger on the opening animation), Equestrian (hold two) and Gymnastics (hold three).
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

  // res < 1 draws the layer at lower resolution, which the browser smooths when it scales it up: a soft
  // focus without a CSS blur (on iPad, Safari draws faint seams between the tiles of a blurred canvas)
  function layer(host, z, css = '', res = 1) {
    const W = host.clientWidth, H = host.clientHeight, c = document.createElement('canvas');
    c.style.cssText = `position:absolute;inset:0;width:100%;height:100%;z-index:${z};pointer-events:none;${css}`;
    const d = DPR * res; c.width = Math.round(W * d); c.height = Math.round(H * d);
    const x = c.getContext('2d'); x.scale(d, d);
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
  // the same detailed cartridges as the menu petals, drawn from styles.js
  const CART_KEYS = ['22', '9', '45', '556', '308', '50'];
  function loadCarts() {
    const S = window.SFFS_STYLES;
    if (!S || !S.cartSVG) return Promise.resolve([]);
    return Promise.all(CART_KEYS.map(k => new Promise(res => {
      const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null);
      im.src = 'data:image/svg+xml,' + encodeURIComponent(S.cartSVG(k));
    })));
  }
  function cartridgeImgSprite(im, key, w, h) {
    const c = window.SFFS_STYLES.CARTS[key], m = c.D * .55, s = h / c.L, iw = 2 * m * s;
    const o = off(Math.max(w, iw) + 2, h + 2), x = o.x;
    x.drawImage(im, 1 + Math.max(w, iw) / 2 - m * s, 1 + h - (c.L + .6) * s, iw, (c.L + 1.2) * s);
    // a touch darker, so the lightning has something to reveal
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(8,6,4,.14)'; x.fillRect(0, 0, o.w, o.h);
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
    const carts = await loadCarts();
    const W = host.clientWidth, H = host.clientHeight, r = rng(42);
    const T = launch
      ? { metal: [0, .25], rust: .05, rustV: 2.1, hub: .65, ring0: .8, ringGap: .24, f1: 2.95, f2: 3.75, words: 4.25, end: 5.4 }
      : { metal: [.35, 2.0], rust: 1.05, rustV: 1, hub: 3.0, ring0: 3.25, ringGap: .34, f1: 6.0, f2: 6.95, words: 7.55, end: 8.9 };
    const old = oldLayers(host);
    const M = layer(host, 20, 'opacity:0'); drawMetal(M.x, W, H);
    const R = layer(host, 21);
    const S = layer(host, 22, 'opacity:0', .28);   // low resolution = a soft shadow edge
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
    const nat = CAL.map(c => { const L = 14 + c.L * .32; return { L, D: carts.length ? L * c.D / c.L * 1.08 : 3 + c.D * .42 }; });   // true-to-life widths
    const k = (maxR - r0 - gap * 6) / nat.reduce((a, n) => a + n.L, 0);
    const sprites = CAL.map((c, i) => carts[i] ? cartridgeImgSprite(carts[i], CART_KEYS[i], nat[i].D * k, nat[i].L * k) : cartridgeSprite(c, nat[i].D * k, nat[i].L * k));
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

  /* ── The horse ──
     A white horse seen from low down and close, so mostly legs show. Real proportions, in units of
     LL (ground-to-belly height): legs as long as the barrel is deep, knees and hocks where they
     belong, slim cannons. Hooves stay planted while they carry weight (the legs bend to reach
     them), each swinging leg follows a path, and the jump has a proper arc: the front end lifts,
     the body sails over in slow motion, then the hindquarters come up so the folded hind legs clear
     the top rail. Body frame: x toward the nose, y down, origin on the belly line between the legs. */
  const LEG = {
    // root, bone lengths [upper, cannon, pastern], hoof height, which way the middle joint bends,
    // the pastern's angle when standing (degrees; 90 = straight down), widths down the leg
    F: { root: [.6, 0], L: [.47, .35, .115], hoof: .1, bend: -1, pst: 50, w: [.22, .155, .118, .084, .116, .078, .09] },
    H: { root: [-.6, -.02], L: [.45, .42, .115], hoof: .1, bend: 1, pst: 56, w: [.3, .19, .148, .094, .122, .084, .096] }
  };
  const HOOF = [[.03, -.005], [.078, .1], [-.044, .1], [-.052, .03], [-.032, -.01]];   // standing hoof, around the coronet
  function ik(R, T, L1, L2, bend) {
    const dx = T.x - R.x, dy = T.y - R.y, phi = Math.atan2(dy, dx);
    const d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + .5, (L1 + L2) * .999);
    const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), an = phi + bend * a;
    return { J: { x: R.x + Math.cos(an) * L1, y: R.y + Math.sin(an) * L1 }, F: { x: R.x + Math.cos(phi) * d, y: R.y + Math.sin(phi) * d } };
  }
  // a smooth path through keyframes [[s, x, y], …] (Catmull-Rom)
  function spline(keys, s) {
    let i = 0; while (i < keys.length - 2 && s > keys[i + 1][0]) i++;
    const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)];
    const u = clamp((s - k1[0]) / (k2[0] - k1[0])), u2 = u * u, u3 = u2 * u;
    const out = [];
    for (const c of [1, 2]) {
      const m1 = (k2[c] - k0[c]) * .5, m2 = (k3[c] - k1[c]) * .5;
      out.push((2 * u3 - 3 * u2 + 1) * k1[c] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * k2[c] + (u3 - u2) * m2);
    }
    return out;
  }
  // a tapered, jointed leg through root → knee/hock → fetlock → coronet, with the hoof
  function drawLeg(x, P, spec, LL, psi, near) {
    const [R, J, F, C] = P, w = spec.w.map(v => v * LL), mid = (a, b, k = .5) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
    const pts = [R, mid(R, J, .45), J, mid(J, F), F, mid(F, C), C];
    const dirTop = Math.atan2(J.y - R.y, J.x - R.x);
    pts.unshift({ x: R.x - Math.cos(dirTop) * w[0] * .5, y: R.y - Math.sin(dirTop) * w[0] * .5 }); const ww = [w[0] * 1.05, ...w];
    // how far each side sits from the bone: the fetlock and the gaskin bulge out behind
    const back = [.5, .5, .56, .5, .5, .62, .5, .5], hind = spec === LEG.H;
    if (hind) back[2] = .62;
    const L = [], Rr = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b.x - a.x, dy = b.y - a.y; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
      const nx = -dy, ny = dx;   // points behind the leg when it hangs down
      L.push({ x: p.x + nx * ww[i] * back[i], y: p.y + ny * ww[i] * back[i] }); Rr.push({ x: p.x - nx * ww[i] * (1 - back[i]), y: p.y - ny * ww[i] * (1 - back[i]) });
    });
    const outline = () => {
      x.beginPath(); x.moveTo(L[0].x, L[0].y);
      for (let i = 1; i < L.length - 1; i++) x.quadraticCurveTo(L[i].x, L[i].y, (L[i].x + L[i + 1].x) / 2, (L[i].y + L[i + 1].y) / 2);
      x.lineTo(L[L.length - 1].x, L[L.length - 1].y); x.lineTo(Rr[Rr.length - 1].x, Rr[Rr.length - 1].y);
      for (let i = Rr.length - 2; i > 0; i--) x.quadraticCurveTo(Rr[i].x, Rr[i].y, (Rr[i].x + Rr[i - 1].x) / 2, (Rr[i].y + Rr[i - 1].y) / 2);
      x.lineTo(Rr[0].x, Rr[0].y); x.closePath();
    };
    const g = x.createLinearGradient(R.x, R.y, C.x, C.y);
    if (near) { g.addColorStop(0, '#f9f8f4'); g.addColorStop(.18, '#f9f8f4'); g.addColorStop(.45, '#f3f1ec'); g.addColorStop(.8, '#e2ded6'); g.addColorStop(1, '#cdc8bf'); }
    else { g.addColorStop(0, '#d9d5cc'); g.addColorStop(.6, '#cbc6bc'); g.addColorStop(1, '#b4aea4'); }
    outline(); x.fillStyle = g; x.fill();
    x.beginPath(); x.arc(R.x, R.y, w[0] * .5, 0, TAU); x.fill();
    // the point of the hock, and the knee's flat front
    const jn = Math.atan2(F.y - J.y, F.x - J.x);
    const bn = { x: -Math.sin(jn), y: Math.cos(jn) };   // 'behind', across the cannon
    // shading: down the back of the leg, a touch of light down the front
    x.save(); outline(); x.clip();
    x.lineCap = 'round'; x.lineJoin = 'round';
    const edge = (arr, col, wd) => { x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); x.moveTo(arr[0].x, arr[0].y); for (let i = 1; i < arr.length; i++) x.lineTo(arr[i].x, arr[i].y); x.stroke(); };
    edge(L.slice(2), near ? 'rgba(150,140,126,.3)' : 'rgba(90,84,76,.3)', LL * .05);
    edge(L.slice(2), near ? 'rgba(130,121,108,.32)' : 'rgba(80,74,66,.3)', LL * .016);
    if (near) edge(Rr.slice(3, 6), 'rgba(255,255,255,.7)', LL * .012);
    // tendons down the back of the cannon
    if (near) { const a = mid(J, F, .18), b = mid(J, F, .82), off = w[3] * .2; x.strokeStyle = 'rgba(160,150,138,.38)'; x.lineWidth = LL * .006; x.beginPath(); x.moveTo(a.x + bn.x * off, a.y + bn.y * off); x.lineTo(b.x + bn.x * off, b.y + bn.y * off); x.stroke(); }
    x.restore();
    // hoof, turned with the pastern
    x.save(); x.translate(C.x, C.y); x.rotate(psi - rad(spec.pst)); x.scale(LL, LL);
    x.beginPath(); HOOF.forEach(([hx, hy], i) => i ? x.lineTo(hx, hy) : x.moveTo(hx, hy)); x.closePath();
    const hg = x.createLinearGradient(-.05, 0, .08, .1); hg.addColorStop(0, near ? '#3b3734' : '#2b2826'); hg.addColorStop(.6, near ? '#58524c' : '#3a3632'); hg.addColorStop(1, near ? '#2a2725' : '#1f1d1b');
    x.fillStyle = hg; x.fill();
    x.fillStyle = near ? '#a39d93' : '#7d776f'; x.beginPath(); x.moveTo(-.034, -.012); x.lineTo(.032, -.007); x.lineTo(.036, .006); x.lineTo(-.04, .006); x.closePath(); x.fill();   // coronet band
    if (near) { x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = .008; x.beginPath(); x.moveTo(.04, .01); x.lineTo(.066, .09); x.stroke(); }
    x.restore();
  }
  // the barrel, chest and hindquarters (the back runs off the top of the screen), the tack and the rider's leg
  function drawTail(x, LL, b, t, stream) {
    x.save(); x.translate(b.x, b.y); x.rotate(-b.th); x.scale(LL, LL);
    const px = 1 / LL;
    // tail: the dock, then long white hair streaming behind
    x.save(); x.translate(-.9, -.74);
    x.fillStyle = '#efede7'; x.beginPath(); x.moveTo(-.02, -.05); x.quadraticCurveTo(-.09, .05, -.1 - stream * .05, .3); x.lineTo(-.05 - stream * .04, .32); x.quadraticCurveTo(-.03, .08, .04, -.02); x.closePath(); x.fill();
    // the hair: a soft, full shape that flares toward the end, then fine strands over it
    const wv1 = Math.sin(t * 3.1) * .05, wv2 = Math.sin(t * 2.3 + 1) * .07;
    const spine = (u, k) => {   // point along the tail; k = -1…1 across it
      const P = [[-.06, .08], [-.1 - stream * .12, .36], [-.15 - stream * .3 + wv1, .72 - stream * .22], [-.12 - stream * .58 + wv2, 1.08 - stream * .36]];
      const m = 1 - u, c = [m * m * m, 3 * m * m * u, 3 * m * u * u, u * u * u];
      const px0 = c.reduce((a, cc, i) => a + cc * P[i][0], 0), py0 = c.reduce((a, cc, i) => a + cc * P[i][1], 0);
      const u2 = Math.min(1, u + .01), m2 = 1 - u2, c2 = [m2 * m2 * m2, 3 * m2 * m2 * u2, 3 * m2 * u2 * u2, u2 * u2 * u2];
      const dx = c2.reduce((a, cc, i) => a + cc * P[i][0], 0) - px0 || -1e-3, dy = c2.reduce((a, cc, i) => a + cc * P[i][1], 0) - py0, n = Math.hypot(dx, dy) || 1;
      const wd = .035 + .085 * Math.sin(Math.PI * Math.min(1, u * .62 + .05)) + .02 * u;
      const ripple = Math.sin(u * 9 - t * 5 + k * 2) * .008 * u;
      return [px0 - dy / n * wd * k + ripple, py0 + dx / n * wd * k];
    };
    x.beginPath();
    for (let i = 0; i <= 24; i++) { const [a, c] = spine(i / 24, -1); i ? x.lineTo(a, c) : x.moveTo(a, c); }
    for (let i = 0; i <= 8; i++) { const k = -1 + i / 4, [a, c] = spine(1, k); x.lineTo(a, c + (1 - k * k) * .03 + (i % 2) * .012); }
    for (let i = 24; i >= 0; i--) { const [a, c] = spine(i / 24, 1); x.lineTo(a, c); }
    x.closePath();
    const tg = x.createLinearGradient(-.3, 0, .05, 0); tg.addColorStop(0, '#e4e1d9'); tg.addColorStop(.5, '#f7f6f2'); tg.addColorStop(1, '#dedad1');
    x.fillStyle = tg; x.globalAlpha = .96; x.fill(); x.globalAlpha = 1;
    x.lineCap = 'round';
    for (let s2 = 0; s2 < 26; s2++) {
      const k = -.9 + 1.8 * ((s2 * 7) % 26) / 25, end = .9 + ((s2 * 13) % 9) / 90;
      x.strokeStyle = s2 % 4 === 0 ? 'rgba(185,178,166,.55)' : 'rgba(255,255,255,.8)'; x.lineWidth = (s2 % 3 + 1) * px;
      x.beginPath(); for (let i = 0; i <= 16; i++) { const u = .12 + (end - .12) * i / 16, [a, c] = spine(u, k); i ? x.lineTo(a, c) : x.moveTo(a, c); } x.stroke();
    }
    x.restore();
    x.restore();
  }
  function drawBody(x, LL, b, t, air, accent) {
    x.save(); x.translate(b.x, b.y); x.rotate(-b.th); x.scale(LL, LL);
    const px = 1 / LL;
    // the silhouette
    const body = () => {
      x.beginPath(); x.moveTo(1.08, -3);
      x.bezierCurveTo(1.04, -1.6, 1.02, -.75, .93, -.38);          // underside of the neck to the point of the shoulder
      x.bezierCurveTo(.89, -.2, .83, -.05, .72, .05);              // chest
      x.quadraticCurveTo(.61, .13, .5, .06);
      x.bezierCurveTo(.44, .035, .38, .03, .3, .03);               // behind the elbow
      x.bezierCurveTo(.1, .03, -.12, .0, -.3, -.07);               // belly, rising to the flank
      x.bezierCurveTo(-.4, -.11, -.46, -.13, -.48, -.1);           // tucked up into the stifle
      x.bezierCurveTo(-.49, -.05, -.47, -.01, -.45, .03);
      x.quadraticCurveTo(-.6, .15, -.75, .03);
      x.bezierCurveTo(-.82, -.05, -.89, -.18, -.93, -.32);         // back of the thigh
      x.bezierCurveTo(-.96, -.42, -.98, -.52, -.95, -.62);         // point of the buttock
      x.bezierCurveTo(-.93, -.7, -.9, -.76, -.87, -.82);
      x.lineTo(-.84, -3); x.closePath();
    };
    body(); x.fillStyle = '#f9f8f4'; x.fill();
    x.save(); body(); x.clip();
    // shade underneath, light from above and in front
    const sh = x.createLinearGradient(0, -.32, 0, .07); sh.addColorStop(0, 'rgba(150,140,125,0)'); sh.addColorStop(1, 'rgba(150,140,125,.2)');
    x.fillStyle = sh; x.fillRect(-1.2, -.35, 2.4, .45);
    const hs = x.createLinearGradient(-1, 0, -.6, 0); hs.addColorStop(0, 'rgba(150,140,125,.28)'); hs.addColorStop(1, 'rgba(150,140,125,0)');
    x.fillStyle = hs; x.fillRect(-1.1, -1, .5, 1.1);
    // muscles: shoulder, elbow, flank, stifle and hamstring
    x.lineCap = 'round';
    const line = (d, a) => { a *= .3; for (const [wd, al] of [[.06, a * .3], [.025, a * .45], [.008, a * .6]]) { x.strokeStyle = `rgba(150,140,126,${al})`; x.lineWidth = wd; x.stroke(new Path2D(d)); } };
    line('M.9 -.46 Q.74 -.32 .67 -.06', .3); line('M.48 -.04 Q.42 -.2 .46 -.38', .22); line('M-.27 -.09 Q-.3 -.3 -.2 -.52', .2);
    line('M-.48 -.12 Q-.57 -.36 -.52 -.64', .22); line('M-.87 -.24 Q-.78 -.09 -.73 .01', .28); line('M.78 .0 Q.74 .03 .71 .05', .25);
    x.restore();
    x.strokeStyle = 'rgba(150,145,135,.25)'; x.lineWidth = 1 * px; body(); x.stroke();
    // saddle pad: square dressage pad with white piping
    const pad = new Path2D('M-.24 -3 L-.24 -.42 Q-.24 -.35 -.17 -.35 L.38 -.35 Q.45 -.35 .45 -.42 L.45 -3 Z');
    x.fillStyle = 'rgba(60,50,40,.12)'; x.fillRect(-.22, -.35, .65, .025);
    const pg = x.createLinearGradient(0, -.9, 0, -.35); pg.addColorStop(0, accent); pg.addColorStop(1, mixRGB(accent, '#000000', .18));
    x.fillStyle = pg; x.fill(pad);
    x.save(); x.clip(pad); x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 1 * px;
    for (let i = -6; i < 6; i++) { x.beginPath(); x.moveTo(-.3 + i * .09, -.35); x.lineTo(-.3 + i * .09 + .5, -1.4); x.stroke(); }
    x.restore();
    x.strokeStyle = 'rgba(255,255,255,.92)'; x.lineWidth = 2.6 * px;
    x.beginPath(); x.moveTo(-.215, -3); x.lineTo(-.215, -.43); x.quadraticCurveTo(-.215, -.375, -.16, -.375); x.lineTo(.37, -.375); x.quadraticCurveTo(.425, -.375, .425, -.43); x.lineTo(.425, -3); x.stroke();
    // long dressage saddle flap
    const flap = new Path2D('M-.03 -3 L-.03 -.57 Q-.02 -.47 .08 -.46 L.29 -.475 Q.37 -.48 .37 -.58 L.37 -3 Z');
    const fg = x.createLinearGradient(-.03, 0, .37, 0); fg.addColorStop(0, '#16110e'); fg.addColorStop(.55, '#2a221d'); fg.addColorStop(1, '#120e0b');
    x.fillStyle = fg; x.fill(flap);
    x.save(); x.clip(flap); x.setLineDash([3 * px, 2.5 * px]); x.strokeStyle = 'rgba(220,210,195,.35)'; x.lineWidth = 1 * px;
    x.beginPath(); x.moveTo(-.005, -3); x.lineTo(-.005, -.57); x.quadraticCurveTo(.0, -.495, .085, -.487); x.lineTo(.29, -.5); x.quadraticCurveTo(.345, -.505, .345, -.58); x.lineTo(.345, -3); x.stroke(); x.restore();
    // girth: black, with its elastic ends and buckles just below the flap
    x.fillStyle = '#1d1815'; x.beginPath(); x.moveTo(.14, -.5); x.lineTo(.25, -.5); x.lineTo(.255, .035); x.lineTo(.15, .04); x.closePath(); x.fill();
    x.fillStyle = '#c9ccd0'; x.fillRect(.145, -.44, .045, .03); x.fillRect(.205, -.44, .045, .03);
    x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1 * px; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(.15, -.35 + i * .06); x.lineTo(.25, -.35 + i * .06); x.stroke(); }
    // stirrup leather
    x.fillStyle = '#2b211b'; x.fillRect(.155, -.5, .028, .4);
    // the rider: breeches to the knee, black tall boot, heel down in the stirrup, a small spur
    const sway = air ? 0 : Math.sin(t * 7) * .006;
    x.save(); x.translate(sway, 0);
    x.fillStyle = '#f1efe8'; x.beginPath(); x.moveTo(.1, -3); x.lineTo(.31, -3); x.lineTo(.3, -.7); x.lineTo(.13, -.66); x.closePath(); x.fill();
    x.fillStyle = 'rgba(160,150,135,.25)'; x.fillRect(.1, -1.4, .04, .74);
    const boot = new Path2D('M.135 -.68 L.295 -.74 C.27 -.5 .235 -.26 .215 -.12 C.24 -.08 .27 -.05 .285 -.005 L.265 .022 L.105 .045 C.075 .04 .062 .02 .066 -.02 C.1 -.22 .125 -.46 .135 -.68 Z');
    const bg2 = x.createLinearGradient(.07, 0, .3, 0); bg2.addColorStop(0, '#060607'); bg2.addColorStop(.6, '#1b1b1e'); bg2.addColorStop(1, '#09090a');
    x.fillStyle = bg2; x.fill(boot);
    x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 2 * px; x.lineCap = 'round'; x.beginPath(); x.moveTo(.262, -.64); x.quadraticCurveTo(.23, -.38, .214, -.16); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 5 * px; x.beginPath(); x.moveTo(.255, -.6); x.quadraticCurveTo(.228, -.38, .218, -.2); x.stroke();
    x.strokeStyle = '#cfd3d7'; x.lineWidth = 2.2 * px; x.beginPath(); x.moveTo(.07, -.012); x.lineTo(.03, -.002); x.stroke(); x.fillStyle = '#cfd3d7'; x.beginPath(); x.arc(.028, -.002, 3 * px, 0, TAU); x.fill();
    // stirrup iron: the near branch runs in front of the foot
    x.strokeStyle = '#c4c9ce'; x.lineWidth = 3.2 * px; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(.125, .042); x.lineTo(.232, .03); x.moveTo(.13, .04); x.quadraticCurveTo(.12, -.06, .17, -.11); x.quadraticCurveTo(.225, -.06, .23, .03); x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1 * px; x.beginPath(); x.moveTo(.135, .02); x.quadraticCurveTo(.13, -.05, .168, -.1); x.stroke();
    x.restore();
    x.restore();
  }
  const mixRGB = (a, b, k) => { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };

  // The run, planned in "horse time": canter in on the left lead, jump, land and canter away
  function planRun(LL, ground, jumpX) {
    const v = 1.15, f = .85, D = .36;                       // speed (LL per second), strides per second, share of a stride a hoof is down
    const x0 = -1.1 * LL, X = tau => x0 + v * LL * tau;
    const P = { A: 1.8, apex: .28, up: 28, down: 22, off: .1, pre: .5, post: .9, hl: .45 };
    const tMid = (jumpX + P.off * LL - x0) / (v * LL), A = P.A, tA = tMid - A / 2, tB = tMid + A / 2, apex = P.apex, thU = rad(P.up), thD = rad(P.down);
    function bodyAt(tau) {
      let y = ground - .96 * LL, th = 0;
      const calm = clamp(1 - E.smooth(seg(tau, tA - 1.4, tA - .7)) + E.smooth(seg(tau, tB + .4, tB + 1.2)));
      const ph = TAU * f * tau;
      y += LL * .02 * Math.cos(ph) * calm; th += rad(1.5) * Math.sin(ph + .9) * calm;
      if (tau > tA - P.pre && tau < tA) { th += thU * E.smooth(seg(tau, tA - P.pre, tA)); y += LL * .035 * Math.sin(Math.PI * seg(tau, tA - P.pre, tA)); }
      else if (tau >= tA && tau < tB) { const s = (tau - tA) / A; th += (s < .5 ? thU : thD) * Math.cos(Math.PI * s); y -= LL * (apex * 4 * s * (1 - s) + .06 * s); }
      else if (tau >= tB && tau < tB + P.post) { const k = E.smooth(seg(tau, tB, tB + P.post)); th -= thD * (1 - k); y -= LL * .06 * (1 - k); }
      return { x: X(tau), y, th };
    }
    const OFF = { HR: 0, HL: .16, FR: .21, FL: .37 }, plants = { HR: [], HL: [], FR: [], FL: [] };
    const add = (k, on, off, dx) => { const m = (on + off) / 2; plants[k].push({ on, off, x: rootAt(bodyAt(m), k, LL).x + dx * LL }); };
    // approach: the last stride's forelegs are the take-off; then both hinds come under and push off
    const a1 = tA - 1.14 / f;
    for (const k in OFF) for (let n = -6; n <= (k[0] === 'F' ? 0 : 0); n++) { const on = a1 + (n + OFF[k]) / f; add(k, on, on + D / f, k[0] === 'F' && n === 0 ? -.02 : .03); }
    add('HR', a1 + .82 / f, tA + .02, -.14); add('HL', a1 + .86 / f, tA, -.1);
    // landing: the leading fore, the other fore, then the hinds; then canter away
    add('FL', tB, tB + .4, .1); add('FR', tB + .1, tB + .48, .06);
    const a2 = tB + P.hl;
    add('HR', a2, a2 + D / f, .1); add('HL', a2 + .16 / f, a2 + (.16 + D) / f, .08);
    for (const k in OFF) for (let n = 1; n <= 7; n++) { const on = a2 + (n + OFF[k]) / f; add(k, on, on + D / f, .03); }
    for (const k in plants) plants[k].sort((p, q) => p.on - q.on);
    return { v, bodyAt, plants, tMid, tA, tB, warp: tau => 1 - .15 * Math.exp(-(((tau - tMid) / .9) ** 2)) };
  }
  function rootAt(b, k, LL) {
    const [rx, ry] = LEG[k[0]].root, a = -b.th, ca = Math.cos(a), sa = Math.sin(a);
    return { x: b.x + (rx * ca - ry * sa) * LL, y: b.y + (rx * sa + ry * ca) * LL };
  }
  // where a leg is at horse-time tau: planted (bend to reach the hoof) or swinging along its path
  function legPose(run, k, tau, b, LL, ground) {
    const spec = LEG[k[0]], front = k[0] === 'F', [L1, L2, L3] = spec.L.map(v => v * LL), ps = rad(spec.pst);
    const R = rootAt(b, k, LL), list = run.plants[k];
    const standFet = (p, psi) => { const C = { x: p.x - .015 * LL, y: ground - spec.hoof * LL }; return { x: C.x - Math.cos(psi) * L3, y: C.y - Math.sin(psi) * L3 }; };
    let cur = list.find(p => tau >= p.on && tau <= p.off);
    let T, psi = ps, k01 = 0;
    if (cur) {
      T = standFet(cur, ps);
      if (front) {   // under load the fetlock sinks rather than the knee buckling
        for (let a = 0; a <= 30; a += 3) { const tt = standFet(cur, ps - rad(a)); if (Math.hypot(tt.x - R.x, tt.y - R.y) >= (L1 + L2) * .975 || a === 30) { T = tt; psi = ps - rad(a); break; } }
      }
    } else {
      let i = list.findIndex(p => p.on > tau); if (i < 0) i = list.length; const prev = list[i - 1], next = list[i];
      const lift = prev ? prev.off : next.on - .8, land = next ? next.on : lift + .8;
      const s = clamp((tau - lift) / (land - lift));
      const rel = (p, at) => { const r = rootAt(run.bodyAt(at), k, LL), f = standFet(p, ps); return [(f.x - r.x) / LL, (f.y - r.y) / LL]; };
      const A = prev ? rel(prev, lift) : [front ? -.28 : -.3, .78], B = next ? rel(next, land) : [.3, .78];
      const jump = lift <= run.tA + .05 && land >= run.tB - .05;
      const keys = jump
        ? (front ? [[0, ...A], [.18, -.02, .52], [.32, .12, .33], [.62, .15, .34], [.84, .36, .58], [1, ...B]]
                 : [[0, ...A], [.1, -.46, .64], [.3, -.12, .4], [.45, -.03, .32], [.7, -.06, .34], [.86, -.24, .6], [1, ...B]])
        : (front ? [[0, ...A], [.35, -.17, .44], [.72, .22, .55], [1, ...B]]
                 : [[0, ...A], [.35, -.3, .56], [.7, .05, .6], [1, ...B]]);
      const [rx, ry] = spline(keys, s);
      T = { x: R.x + rx * LL, y: R.y + ry * LL };
      k01 = jump ? Math.sin(Math.PI * s) ** .35 : Math.sin(Math.PI * s) ** .55;
      psi = { fold: rad(jump ? (front ? 125 : 140) : (front ? 80 : 55)), k: k01 };
    }
    const { J, F } = ik(R, T, L1, L2, spec.bend);
    let g = Math.atan2(F.y - J.y, F.x - J.x); if (g < -Math.PI / 2) g += TAU;
    const ang = typeof psi === 'number' ? psi : lerp(ps, g + psi.fold, psi.k);
    const C = { x: F.x + Math.cos(ang) * L3, y: F.y + Math.sin(ang) * L3 };
    return { P: [R, J, F, C], psi: ang, planted: !!cur, R, T, Lmax: (L1 + L2) * .999 };
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

    const SKY = layer(host, 20, 'opacity:0', .4);
    const MID = layer(host, 21, 'opacity:0', .6);
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

    const ground = H * .94, LL = Math.min(H * .52, W * 1.15);   // close and low: the legs are big
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

    // the run: canter in from the left on the left lead, jump the purple-and-white fence, canter away
    const plan = planRun(LL, ground, (geo.ns.x + geo.fs.x) / 2);
    const KEYS = ['HR', 'FR', 'HL', 'FL'], dust = [];
    const fadeIn = (el, a) => el.c.style.opacity = E.io(seg(curT, a[0], a[1]));
    let curT = 0, tau = 0, lastT = null, gone = false, shiftS = 0;
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

      // the horse (its clock slows down over the fence)
      const h = HORSE.x; h.clearRect(0, 0, W, H);
      if (t > T.horse && !gone) {
        const dt = lastT == null ? 0 : Math.min(.1, t - lastT); lastT = t;
        const prevTau = tau; tau += dt * plan.warp(tau);
        const air = tau > plan.tA && tau < plan.tB, b0 = plan.bodyAt(tau);
        const posesAt = b => Object.fromEntries(KEYS.map(k => [k, legPose(plan, k, tau, b, LL, ground)]));
        // a planted hoof that can't be reached pulls the body down a little (no floating hooves)
        let poses = posesAt(b0), need = 0;
        if (!air) for (const k of KEYS) if (poses[k].planted) {
          const { R, T: Tg, Lmax } = poses[k], dx = Tg.x - R.x;
          if (Math.abs(dx) < Lmax) need = Math.max(need, (Tg.y - Math.sqrt(Lmax * Lmax - dx * dx)) - R.y);
        }
        shiftS = lerp(shiftS, need, .5);
        const b = { ...b0, y: b0.y + shiftS };
        if (shiftS > .5) poses = posesAt(b);
        // sand kicked up where hooves land
        for (const k of KEYS) for (const p of plan.plants[k]) if (p.on > prevTau && p.on <= tau)
          for (let i = 0; i < 7; i++) dust.push({ x: p.x + (r() - .5) * LL * .08, y: ground, vx: (r() - .7) * LL * .25, vy: -LL * (.05 + r() * .12), s: LL * (.012 + r() * .02), born: t });
        // shadow on the sand
        const lift = clamp((ground - .96 * LL - b.y) / (.6 * LL));
        h.fillStyle = `rgba(90,65,35,${.18 - lift * .1})`; h.beginPath(); h.ellipse(b.x - LL * .05, ground + 3, LL * (1 - lift * .25), LL * .03, 0, 0, TAU); h.fill();
        for (const k of KEYS) { const C = poses[k].P[3]; if (C.y > ground - LL * .16) { h.fillStyle = 'rgba(80,58,30,.22)'; h.beginPath(); h.ellipse(C.x + LL * .015, ground + 1, LL * .07, LL * .012, 0, 0, TAU); h.fill(); } }
        // far legs, tail, near legs, then the body over the tops of the legs (the elbow and thigh overlap them)
        drawLeg(h, poses.HR.P, LEG.H, LL, poses.HR.psi, false); drawLeg(h, poses.FR.P, LEG.F, LL, poses.FR.psi, false);
        drawTail(h, LL, b, t, air ? .85 : .5 + .08 * Math.sin(t * 3));
        drawLeg(h, poses.HL.P, LEG.H, LL, poses.HL.psi, true); drawLeg(h, poses.FL.P, LEG.F, LL, poses.FL.psi, true);
        drawBody(h, LL, b, t, air, '#6b3fa0');
        if (b.x - 1.4 * LL > W) { gone = true; if (t < T.words) T.words = t; }   // gone: bring in the words
      }
      for (const d of dust) {
        const a = t - d.born; if (a > 1.3) continue;
        h.fillStyle = `rgba(205,180,140,${.45 * (1 - a / 1.3)})`; h.beginPath(); h.arc(d.x + d.vx * a, d.y + d.vy * a + LL * .08 * a * a, d.s * (1 + a * 1.5), 0, TAU); h.fill();
      }
      if (t > T.words) { words.style.opacity = 1; words.style.transform = 'none'; }
      return t < Math.max(T.end, T.words + 1.5);
    });
  }
  /* ═════════════════════════ GYMNASTICS ═════════════════════════
     The flowers go dark, the gym's big lights clunk on one by one, and a gymnast on the spring floor
     presents, does a back walkover and slides down into the splits with a salute. The gym is drawn
     soft-focus behind her; chalk dust drifts through the window light. */
  function drawGymBG(x, W, H, yW, r) {
    const f = H / 900;
    // back wall and the steel roof trusses
    let g = x.createLinearGradient(0, 0, 0, yW); g.addColorStop(0, '#cfd6de'); g.addColorStop(.55, '#e7eaee'); g.addColorStop(1, '#dde1e6');
    x.fillStyle = g; x.fillRect(0, 0, W, yW);
    x.fillStyle = '#56616e'; x.fillRect(0, 0, W, H * .045);
    x.strokeStyle = '#6c7783'; x.lineWidth = 3 * f;
    x.beginPath(); for (let px = -40; px < W + 80; px += 80 * f) { x.moveTo(px, H * .045); x.lineTo(px + 40 * f, 0); x.lineTo(px + 80 * f, H * .045); } x.stroke();
    // painted block wall
    x.strokeStyle = 'rgba(120,130,140,.12)'; x.lineWidth = 1;
    for (let y = H * .05, row = 0; y < yW; y += 22 * f, row++) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke();
      for (let px = (row % 2) * 24 * f; px < W; px += 48 * f) { x.beginPath(); x.moveTo(px, y); x.lineTo(px, y + 22 * f); x.stroke(); } }
    // tall windows full of daylight
    const nWin = Math.max(3, Math.round(W / (300 * f)));
    for (let i = 0; i < nWin; i++) {
      const ww = W / nWin * .62, wx = W / nWin * (i + .19), wy = H * .09, wh = H * .2;
      g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d4ecfa');
      x.fillStyle = '#9aa4ae'; x.fillRect(wx - 5 * f, wy - 5 * f, ww + 10 * f, wh + 10 * f);
      x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
      x.fillStyle = '#9aa4ae'; for (let k = 1; k < 4; k++) x.fillRect(wx + ww * k / 4 - 2 * f, wy, 4 * f, wh); x.fillRect(wx, wy + wh * .5 - 2 * f, ww, 4 * f);
    }
    // blue wall padding along the bottom of the wall
    x.fillStyle = '#2f64a3'; x.fillRect(0, yW - H * .075, W, H * .075);
    x.fillStyle = 'rgba(255,255,255,.12)'; for (let px = 0; px < W; px += 90 * f) x.fillRect(px, yW - H * .075, 2 * f, H * .075);
    // banners hanging from the trusses
    const ban = [['#7cc3ef', '#ffffff'], ['#ffffff', '#4aa3df'], ['#c9a24d', '#ffffff'], ['#4aa3df', '#ffffff'], ['#ffffff', '#7cc3ef']];
    const nb = Math.max(3, Math.round(W / (240 * f)));
    for (let i = 0; i < nb; i++) {
      const bx = W * (i + .5) / nb, bw = 46 * f, bh = H * .17, [c1, c2] = ban[i % ban.length];
      x.fillStyle = c1; x.beginPath(); x.moveTo(bx - bw / 2, H * .045); x.lineTo(bx + bw / 2, H * .045); x.lineTo(bx + bw / 2, H * .045 + bh); x.lineTo(bx, H * .045 + bh - 14 * f); x.lineTo(bx - bw / 2, H * .045 + bh); x.closePath(); x.fill();
      x.fillStyle = c2; x.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * TAU * 2 / 5, rr = 9 * f; x.lineTo(bx + Math.cos(a) * rr, H * .045 + bh * .42 + Math.sin(a) * rr); } x.closePath(); x.fill();
      x.fillRect(bx - bw / 2, H * .045 + bh * .12, bw, 3 * f);
    }
    // the apparatus, out of focus: uneven bars on the left, a balance beam on the right, stacked mats
    const fl = yW + H * .035;
    x.strokeStyle = '#c3c9cf'; x.lineWidth = 6 * f; x.lineCap = 'round';
    const ub = W * .08;
    for (const [px, top] of [[ub, H * .22], [ub + 70 * f, H * .22], [ub + 150 * f, H * .3], [ub + 220 * f, H * .3]]) { x.beginPath(); x.moveTo(px, fl); x.lineTo(px, top); x.stroke(); }
    x.strokeStyle = '#d9b98a'; x.lineWidth = 7 * f;
    x.beginPath(); x.moveTo(ub - 8 * f, H * .23); x.lineTo(ub + 78 * f, H * .23); x.moveTo(ub + 142 * f, H * .31); x.lineTo(ub + 228 * f, H * .31); x.stroke();
    x.strokeStyle = 'rgba(120,130,140,.6)'; x.lineWidth = 1.5 * f; x.beginPath(); x.moveTo(ub, H * .22); x.lineTo(ub - 40 * f, fl); x.moveTo(ub + 220 * f, H * .3); x.lineTo(ub + 260 * f, fl); x.stroke();
    x.fillStyle = '#2f64a3'; x.fillRect(ub - 30 * f, fl - 10 * f, 290 * f, 12 * f);
    const bx0 = W * .6, bx1 = Math.min(W - 20 * f, bx0 + 420 * f), by = fl - H * .1;
    x.fillStyle = '#b8a07a'; x.fillRect(bx0, by - 9 * f, bx1 - bx0, 14 * f); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(bx0, by - 9 * f, bx1 - bx0, 3 * f);
    x.strokeStyle = '#8f98a2'; x.lineWidth = 5 * f; x.beginPath(); for (const px of [bx0 + 40 * f, bx1 - 40 * f]) { x.moveTo(px, by + 5 * f); x.lineTo(px - 18 * f, fl); x.moveTo(px, by + 5 * f); x.lineTo(px + 18 * f, fl); } x.stroke();
    for (let i = 0; i < 4; i++) { x.fillStyle = ['#2f64a3', '#d24d57', '#2f64a3', '#3f7fc4'][i]; x.fillRect(W * .86 - i * 3 * f, fl - (i + 1) * 13 * f, W * .16, 12 * f); }
    // foam pit in the corner: a field of colored cubes
    for (let i = 0; i < 70; i++) { x.fillStyle = ['#e85d75', '#f2c14e', '#4aa3df', '#5cbf8a', '#ffffff'][i % 5]; x.fillRect(W * .02 + r() * W * .2, fl - 6 * f - r() * 14 * f, 10 * f, 10 * f); }
    // gym floor beyond the mat
    g = x.createLinearGradient(0, yW, 0, yW + H * .06); g.addColorStop(0, '#b9b2a6'); g.addColorStop(1, '#a89f92');
    x.fillStyle = g; x.fillRect(0, yW, W, H - yW);
  }
  function drawSpringFloor(x, W, H, yC, fy) {
    // the competition floor: blue carpet, a white boundary line, faint seams running toward us
    let g = x.createLinearGradient(0, yC, 0, H); g.addColorStop(0, '#2c64ab'); g.addColorStop(.35, '#3573bd'); g.addColorStop(1, '#2a5d9f');
    x.fillStyle = g; x.fillRect(0, yC, W, H - yC);
    x.fillStyle = '#f4f6f8'; x.fillRect(0, yC + (fy - yC) * .12, W, Math.max(3, (fy - yC) * .05));
    x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 1;
    for (let i = -12; i <= 12; i++) { x.beginPath(); x.moveTo(W / 2 + i * W * .04, yC); x.lineTo(W / 2 + i * W * .18, H); x.stroke(); }
    for (let i = 0; i < 2600; i++) { const yy = yC + Math.random() ** 1.4 * (H - yC); x.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(10,30,70,.07)'; x.fillRect(Math.random() * W, yy, 1.4, 1.4); }
    // the light from above, pooled where she performs
    g = x.createRadialGradient(W * .5, fy, 0, W * .5, fy, Math.max(W, H) * .45); g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, yC, W, H - yC);
  }

  async function gymnastics(host, { launch }) {
    const W = host.clientWidth, H = host.clientHeight, r = rng(7), GY = window.GYM, GD = window.GYMDRAW;
    if (!GY || !GD) return;
    const T = launch
      ? { dark: [0, .2], lights: [.18, .3, .42], start: .3, from: -.7, words: 4.95, end: 6.3 }
      : { dark: [.1, .65], lights: [.8, 1.15, 1.5], start: 1.45, from: -1.5, words: 7.05, end: 8.7 };
    const old = oldLayers(host);
    const BLACK = layer(host, 20, 'opacity:0');
    BLACK.x.fillStyle = '#0d1420'; BLACK.x.fillRect(0, 0, W, H);
    // background and floor are drawn wider than the screen so the camera can follow her (background slower: parallax)
    const wide = (z, m, res = 1) => { const c = document.createElement('canvas'), d = DPR * res;
      c.style.cssText = `position:absolute;left:${-m}px;top:0;width:${W + m}px;height:${H}px;z-index:${z};pointer-events:none;opacity:0;will-change:transform`;
      c.width = Math.round((W + m) * d); c.height = Math.round(H * d); const x = c.getContext('2d'); x.scale(d, d); host.append(c); return { c, x, w: W + m }; };
    const GYMN = layer(host, 23, 'opacity:0'), FX = layer(host, 24);
    const words = wordsEl(host, 25, `<div style="font:italic 800 clamp(36px,10vw,66px)/1 Montserrat,'Nunito',system-ui,sans-serif;letter-spacing:-.01em;color:#1d4f8f;text-shadow:0 0 3px #fff,0 0 18px rgba(255,255,255,.95),0 0 40px rgba(255,255,255,.8)">Spencer Family</div>
      <div style="margin-top:12px;font:800 clamp(13px,3.6vw,20px)/1 Nunito,system-ui,sans-serif;letter-spacing:.46em;color:#3c7fc8;text-shadow:0 0 10px #fff,0 0 20px rgba(255,255,255,.9)">FOOD STORAGE</div>`,
      'top:calc(7vh + env(safe-area-inset-top));transform:translateY(10px);transition:opacity .9s ease,transform .9s ease;');

    // how big she is, and the camera that follows her
    const yW = H * .5, fy = H * .83, yC = H * .6;
    // run the routine once ahead of time: how wide she gets at most, how tall, and where the camera will travel
    const span = o => { const xs = [o.hip, o.sh, o.crown, o.a.toe, o.b.toe, o.a.heel, o.b.heel, o.n.tip, o.f.tip].map(p => p.x); return [Math.min(...xs), Math.max(...xs)]; };
    const pre = GY.solver(); let wmax = 0, ymax = 0, cmin = 1e9, cmax = -1e9;
    for (let gt = T.from; gt <= 4.6; gt += 1 / 60) {
      const { root, o } = pre(GY.evalPose(gt)), [lo, hi] = span(o);
      wmax = Math.max(wmax, hi - lo); cmin = Math.min(cmin, root.x + (lo + hi) / 2); cmax = Math.max(cmax, root.x + (lo + hi) / 2);
      for (const p of [o.crown, o.n.tip, o.f.tip]) ymax = Math.max(ymax, root.y + p.y);
    }
    const S = Math.min(H * .46, W * .86 / wmax, (fy - H * .05) / ymax);
    const mF = Math.ceil((cmax - cmin) * S + 40), mB = Math.ceil((cmax - cmin) * S * .45 + 40);
    const BG = wide(21, mB, .45), FLOOR = wide(22, mF);
    drawGymBG(BG.x, BG.w, H, yW, r);
    drawSpringFloor(FLOOR.x, FLOOR.w, H, yC, fy);
    let cam = null;
    const dust = Array.from({ length: 70 }, () => ({ x: r() * W, y: H * (.1 + r() * .6), vx: 3 + r() * 8, vy: -2 + r() * 4, s: .6 + r() * 1.6, ph: r() * TAU }));
    const puffs = [];
    const nL = Math.max(3, Math.round(W / 260)), lamps = Array.from({ length: nL }, (_, i) => ({ x: W * (i + .5) / nL, y: H * .035 }));
    // the big gym lights: each one clunks on, flickers, then warms up
    const lightOf = (t, i) => { const li = T.lights[Math.min(i, 2)] + (i > 2 ? (i - 2) * .06 : 0), d = t - li;
      return d < 0 ? 0 : d < .05 ? 1 : d < .1 ? .25 : Math.min(1, .7 + (d - .1) * 1.4); };
    const level = t => (lightOf(t, 0) + lightOf(t, 1) + lightOf(t, 2)) / 3;

    const solve = GY.solver(); let braid = null, lastT = null, prevC = null;
    await run(host, t => {
      // flowers fade into the dark, then the gym appears under its lights
      BLACK.c.style.opacity = E.io(seg(t, T.dark[0], T.dark[1]));
      if (t > T.dark[1]) hideOld(old);
      const lv = level(t);
      BG.c.style.opacity = lv; FLOOR.c.style.opacity = lv; GYMN.c.style.opacity = Math.min(1, lv * 1.05);

      // FX: lamp glows, window light, chalk dust, little puffs where hands and feet land
      const fx = FX.x; fx.clearRect(0, 0, W, H);
      lamps.forEach((l, i) => { const on = lightOf(t, i); if (!on) return;
        const gg = fx.createRadialGradient(l.x, l.y, 0, l.x, l.y, H * .16); gg.addColorStop(0, `rgba(255,252,235,${.9 * on})`); gg.addColorStop(.12, `rgba(255,248,220,${.45 * on})`); gg.addColorStop(1, 'rgba(255,248,220,0)');
        fx.fillStyle = gg; fx.fillRect(l.x - H * .16, 0, H * .32, H * .2);
        fx.fillStyle = `rgba(255,255,250,${on})`; fx.beginPath(); fx.ellipse(l.x, l.y, 16, 6, 0, 0, TAU); fx.fill(); });
      if (lv > .05) {
        fx.globalAlpha = lv * .5;
        const sh = fx.createLinearGradient(0, H * .1, W * .4, H * .8); sh.addColorStop(0, 'rgba(255,255,245,.22)'); sh.addColorStop(1, 'rgba(255,255,245,0)');
        fx.fillStyle = sh; fx.beginPath(); fx.moveTo(W * .1, H * .1); fx.lineTo(W * .32, H * .1); fx.lineTo(W * .75, H * .85); fx.lineTo(W * .4, H * .85); fx.closePath(); fx.fill();
        fx.globalAlpha = lv;
        for (const d of dust) { const px = (d.x + d.vx * t) % W, py = d.y + d.vy * t + Math.sin(t * .9 + d.ph) * 6; fx.fillStyle = 'rgba(255,255,255,.55)'; fx.beginPath(); fx.arc(px, py, d.s, 0, TAU); fx.fill(); }
        fx.globalAlpha = 1;
      }

      // the gymnast
      const gt = Math.min(4.6, T.from + Math.max(0, t - T.start)), dt = lastT == null ? 1 / 60 : Math.min(.05, Math.max(.001, t - lastT)); lastT = t;
      const pose = GY.evalPose(gt), { root, o: rel } = solve(pose);
      const o = {}; for (const k in rel) o[k] = rel[k].x !== undefined ? { x: rel[k].x + root.x, y: rel[k].y + root.y } : Object.fromEntries(Object.entries(rel[k]).map(([a, b]) => [a, { x: b.x + root.x, y: b.y + root.y }]));
      const an = GD.braidAnchor(o, pose);
      if (!braid) { braid = GD.braidInit(o); for (let i = 0; i < 90; i++) GD.braidStep(braid, an.root, an.down, o, 1 / 60); }
      GD.braidStep(braid, an.root, an.down, o, dt);
      const g = GYMN.x; g.clearRect(0, 0, W, H);
      // the camera eases along after her; the floor moves with it, the far wall less
      const [lo, hi] = span(o), target = (lo + hi) / 2;
      if (cam == null) cam = target; else cam += (target - cam) * (1 - Math.exp(-dt * 2.2));
      const ox = W / 2 - S * cam, shift = (cmax - cam) * S;
      FLOOR.c.style.transform = `translateX(${shift}px)`; BG.c.style.transform = `translateX(${shift * .45}px)`;
      // her shadow on the mat
      g.fillStyle = 'rgba(10,25,55,.28)'; g.beginPath(); g.ellipse(ox + S * (lo + hi) / 2, fy + 4, S * (hi - lo) / 2 + 10, Math.max(5, S * .025), 0, 0, TAU); g.fill();
      g.save(); g.translate(ox, fy); g.scale(S, -S);
      GD.drawGymnast(g, { o, pose, braid, look: { smile: gt > 3.6 ? 1 : 0 } });
      g.restore();
      // chalk puffs when hands or feet land
      const c = pose.c;
      if (prevC) for (const [k, p] of [['H', o.n.palm], ['A', o.a.ball], ['P', o.hip]]) if ((c[k] || 0) > .5 && (prevC[k] || 0) <= .5)
        for (let i = 0; i < 9; i++) puffs.push({ x: p.x + (r() - .5) * .06, y: fy, vx: (r() - .5) * S * .5, vy: -S * (.08 + r() * .2), s: S * (.01 + r() * .015), born: t });
      prevC = c;
      for (const pf of puffs) { const a = t - pf.born; if (a > 1.4) continue;
        const px = ox + pf.x * S + pf.vx * a * .5, py = pf.y + pf.vy * a * (1 - a * .35), rr = pf.s * (1 + a * 2.2), al = .32 * (1 - a / 1.4) ** 1.5;
        const pg = g.createRadialGradient(px, py, 0, px, py, rr); pg.addColorStop(0, `rgba(255,255,255,${al})`); pg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = pg; g.beginPath(); g.arc(px, py, rr, 0, TAU); g.fill(); }

      if (t > T.words) { words.style.opacity = 1; words.style.transform = 'none'; }
      return t < T.end;
    });
  }

  window.SFFS_REVEAL = {
    play(kind, host, opts = {}) { host.__skip = false; return ({ armory, equestrian, gymnastics }[kind] || equestrian)(host, opts); }
  };
})();
