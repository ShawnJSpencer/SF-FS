/* SF-FS · Styles
   A "style" is a whole look: fonts, background texture, its own set of color choices, the logo,
   the picture shown when an item has no photo, the menu button, the menu petals and the opening
   animation. Floral is the original. Armory and Equestrian are secret (unlocked by holding one or
   two fingers on the opening animation). Loaded before anything draws, so the right look shows
   from the very first frame. */
(function () {
  const svg = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
  const noise = (freq, alpha, color = '0 0 0', oct = 2) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${oct}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${color.split(' ')[0]} 0 0 0 0 ${color.split(' ')[1]} 0 0 0 0 ${color.split(' ')[2]} 0 0 0 ${alpha} 0'/></filter><rect width='220' height='220' filter='url(#n)'/></svg>`)}")`;

  /* A .50 BMG cartridge drawn to its real measurements in millimeters (tip at the top):
     copper-jacketed bullet with a knurled cannelure, bottleneck brass case with a faint annealing
     tint on the neck and shoulder, rimless base with its extractor groove, a slick of gun oil and
     a little tarnish. `p` keeps the ids unique when it's drawn inline. */
  function cartridge(p) {
    const sym = pts => 'M' + pts.map(([x, y]) => `${x} ${y}`).join(' L') + ' L' + pts.slice().reverse().map(([x, y]) => `${-x} ${y}`).join(' L') + 'Z';
    const BR = `<stop offset="0" stop-color="#1c1309"/><stop offset=".1" stop-color="#5a3f16"/><stop offset=".25" stop-color="#cfa65c"/><stop offset=".31" stop-color="#f4e1a6"/><stop offset=".38" stop-color="#c49647"/><stop offset=".6" stop-color="#76551f"/><stop offset=".8" stop-color="#9b7837"/><stop offset=".92" stop-color="#47320f"/><stop offset="1" stop-color="#150e06"/>`;
    const body = sym([[9, 59.5], [10.2, 128.6]]), shoulder = sym([[7.1, 52.4], [9, 59.6]]),
      groove = sym([[8.6, 130.4], [8.6, 133.3]]), rim = sym([[10.2, 134.9], [10.2, 137.4], [9.8, 138]]),
      bevel1 = sym([[10.2, 128.5], [8.6, 130.5]]), bevel2 = sym([[8.6, 133.2], [10.2, 135]]),
      whole = sym([[7.1, 39], [7.1, 52.4], [9, 59.5], [10.2, 128.6], [8.6, 130.4], [8.6, 133.3], [10.2, 134.9], [10.2, 137.4], [9.8, 138]]),
      bullet = 'M-.6 .5 Q0 -.15 .6 .5 C2.3 3.3 5.7 12.6 6.49 25 L6.49 39.6 L-6.49 39.6 L-6.49 25 C-5.7 12.6 -2.3 3.3 -.6 .5Z';
    return `<defs>
      <linearGradient id="${p}br">${BR}</linearGradient>
      <linearGradient id="${p}cu"><stop offset="0" stop-color="#220b04"/><stop offset=".12" stop-color="#682a10"/><stop offset=".28" stop-color="#e09a70"/><stop offset=".36" stop-color="#f6c8a4"/><stop offset=".46" stop-color="#b05c2c"/><stop offset=".74" stop-color="#6a2c12"/><stop offset=".88" stop-color="#8c4626"/><stop offset="1" stop-color="#1e0a03"/></linearGradient>
      <linearGradient id="${p}an" gradientUnits="userSpaceOnUse" x1="0" y1="39" x2="0" y2="74"><stop offset="0" stop-color="#6a4a8a" stop-opacity=".22"/><stop offset=".35" stop-color="#4a6296" stop-opacity=".15"/><stop offset=".62" stop-color="#a0603a" stop-opacity=".2"/><stop offset="1" stop-color="#a0603a" stop-opacity="0"/></linearGradient>
      <linearGradient id="${p}sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d0" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
      <linearGradient id="${p}gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset=".7" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#ffe9b0" stop-opacity=".25"/></linearGradient>
      <linearGradient id="${p}oil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5aa8"/><stop offset=".3" stop-color="#58d4ff"/><stop offset=".6" stop-color="#9bff7a"/><stop offset="1" stop-color="#ffd25a"/></linearGradient>
      <pattern id="${p}kn" width=".75" height="3" patternUnits="userSpaceOnUse"><rect width=".75" height="3" fill="#3a1608"/><rect width=".32" height="3" fill="#c97f55"/></pattern>
      <clipPath id="${p}cc"><path d="${whole}"/></clipPath><clipPath id="${p}bc"><path d="${bullet}"/></clipPath>
      <filter id="${p}bl" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation=".45"/></filter>
      <filter id="${p}bl2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter>
      <filter id="${p}tn" filterUnits="userSpaceOnUse" x="-11" y="-1" width="22" height="140"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .06  0 0 0 0 .02  2.4 0 0 0 -1.25"/></filter>
    </defs>
    <path d="${bullet}" fill="url(#${p}cu)"/>
    <g clip-path="url(#${p}bc)">
      <rect x="-6.5" y="34.3" width="13" height="2.7" fill="url(#${p}kn)"/>
      <rect x="-6.5" y="34.3" width="13" height="2.7" fill="url(#${p}cu)" opacity=".45"/>
      <path d="M-6.5 34.3 H6.5 M-6.5 37 H6.5" stroke="#1a0802" stroke-width=".35" opacity=".7"/>
      <path d="M-.5 2.2 C-1.6 6, -3 14, -3.15 25 L-3.15 34" stroke="#fff1e2" stroke-width=".8" fill="none" opacity=".55" filter="url(#${p}bl)"/>
      <path d="M1.2 4 C2.6 9, 4.4 17, 4.9 25 L4.9 34" stroke="#ffd9c0" stroke-width=".4" fill="none" opacity=".2" filter="url(#${p}bl)"/>
      <rect x="-7" y="-1" width="14" height="41" fill="#000" filter="url(#${p}tn)" opacity=".35"/>
    </g>
    <path d="M7.1 39 L7.1 52.5 L-7.1 52.5 L-7.1 39Z" fill="url(#${p}br)"/>
    <path d="${shoulder}" fill="url(#${p}br)"/><path d="${shoulder}" fill="url(#${p}sh)"/>
    <path d="${body}" fill="url(#${p}br)"/>
    <path d="${bevel1}" fill="url(#${p}br)"/><path d="${bevel1}" fill="#000" opacity=".35"/>
    <path d="${groove}" fill="url(#${p}br)"/><path d="${groove}" fill="url(#${p}gr)"/>
    <path d="${bevel2}" fill="url(#${p}br)"/><path d="${bevel2}" fill="#fff0c0" opacity=".14"/>
    <path d="${rim}" fill="url(#${p}br)"/>
    <g clip-path="url(#${p}cc)">
      <rect x="-11" y="38" width="22" height="40" fill="url(#${p}an)"/>
      <path d="M-11 39.15 H11" stroke="#140c04" stroke-width=".55" opacity=".8"/><path d="M-11 39.75 H11" stroke="#fff1c4" stroke-width=".3" opacity=".35"/>
      <rect x="-3.6" y="40" width=".9" height="12" fill="#fffbe8" opacity=".5" filter="url(#${p}bl)"/>
      <path d="M-3.4 53 L-4.4 59.5" stroke="#fffbe8" stroke-width="1.1" opacity=".55" filter="url(#${p}bl)"/>
      <path d="M-4.5 61 L-4.9 127" stroke="#fffbe8" stroke-width="1.2" opacity=".75" filter="url(#${p}bl)"/>
      <path d="M5.4 62 L5.9 126" stroke="#fff3cf" stroke-width=".6" opacity=".2" filter="url(#${p}bl)"/>
      <path d="M-11 137.45 H11" stroke="#fff1c4" stroke-width=".25" opacity=".3"/>
      <ellipse cx="1.4" cy="93" rx="4.6" ry="17" transform="rotate(-11 1.4 93)" fill="url(#${p}oil)" opacity=".1" filter="url(#${p}bl2)"/>
      <path d="M-1.6 79 C-.6 88, .4 98, 3.4 108" stroke="#fffdf2" stroke-width=".7" fill="none" opacity=".3" filter="url(#${p}bl)"/>
      <ellipse cx="-3.4" cy="112" rx="3.2" ry="6" fill="#000" opacity=".16" filter="url(#${p}bl2)"/>
      <circle cx="-4.1" cy="86" r=".4" fill="#fff" opacity=".85"/><circle cx="2.6" cy="101.5" r=".28" fill="#fff" opacity=".7"/>
      <rect x="-11" y="38" width="22" height="101" fill="#000" filter="url(#${p}tn)" opacity=".28"/>
    </g>
    <path d="${whole}" fill="none" stroke="#0e0904" stroke-width=".35" opacity=".75"/>
    <path d="${bullet}" fill="none" stroke="#120602" stroke-width=".3" opacity=".7"/>`;
  }
  const cartURI = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11 -1 22 140">${cartridge('c')}</svg>`)}")`;

  /* A show-ribbon rosette for the Equestrian menu: pleated outer ruffle, a second ruffle, a gold
     ring, the center disk, and two swallow-tailed ribbons hanging in an upside-down V. Drawn with
     each color choice's real colors (CSS variables can't reach inside a background picture). */
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  function rosette(acc, acc2, card) {
    const cx = 50, cy = 50, ring = (n, r0, r1, c1, c2, sc) => {
      let wedges = '', edge = '';
      for (let i = 0; i < n; i++) {
        const a0 = i / n * 2 * Math.PI, a1 = (i + 1) / n * 2 * Math.PI, am = (a0 + a1) / 2;
        const P = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
        wedges += `<path d="M${cx} ${cy} L${P(r1 + 3, a0)} L${P(r1 + 3, am)}Z" fill="${c1}"/><path d="M${cx} ${cy} L${P(r1 + 3, am)} L${P(r1 + 3, a1)}Z" fill="${c2}"/>`;
        edge += (i ? ' Q' : 'M' + P(r1, a0) + ' Q') + `${P(r1 + sc, am)} ${P(r1, a1)}`;
      }
      return { wedges, edge: edge + 'Z' };
    };
    const outer = ring(30, 30, 46.5, mix(acc, '#ffffff', .22), mix(acc, '#000000', .12), 2.6);
    const inner = ring(40, 30, 37, mix(acc2, '#ffffff', .25), mix(acc2, '#000000', .1), 1.6);
    const tail = rot => `<g transform="rotate(${rot} 50 52)"><path d="M39 52 H61 V131 L50 120 L39 131Z" fill="url(#rt)"/>
      <path d="M41.5 52 V127.5 M58.5 52 V127.5" stroke="${mix(acc2, '#ffffff', .2)}" stroke-width="1.1" opacity=".8"/>
      <path d="M39 70 L61 64 V74 L39 82Z" fill="#000" opacity=".12"/></g>`;
    const body = `<defs>
      <linearGradient id="rt"><stop offset="0" stop-color="${mix(acc, '#000000', .35)}"/><stop offset=".22" stop-color="${acc}"/><stop offset=".45" stop-color="${mix(acc, '#ffffff', .28)}"/><stop offset=".7" stop-color="${acc}"/><stop offset="1" stop-color="${mix(acc, '#000000', .4)}"/></linearGradient>
      <radialGradient id="rs"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".05"/></radialGradient>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e2a0"/><stop offset=".5" stop-color="#b8892f"/><stop offset="1" stop-color="#f1d58a"/></linearGradient>
      <radialGradient id="rc" cx="45%" cy="40%"><stop offset=".7" stop-color="${card}"/><stop offset="1" stop-color="${mix(card, '#000000', .12)}"/></radialGradient>
      <clipPath id="ro"><path d="${outer.edge}"/></clipPath><clipPath id="ri"><path d="${inner.edge}"/></clipPath></defs>
      ${tail(17)}${tail(-17)}
      <g clip-path="url(#ro)">${outer.wedges}<circle cx="50" cy="50" r="50" fill="url(#rs)"/></g>
      <path d="${outer.edge}" fill="none" stroke="${mix(acc, '#000000', .35)}" stroke-width=".6" opacity=".6"/>
      <g clip-path="url(#ri)">${inner.wedges}<circle cx="50" cy="50" r="38" fill="url(#rs)"/></g>
      <circle cx="50" cy="50" r="31" fill="none" stroke="url(#rg)" stroke-width="2.6"/>
      <circle cx="50" cy="50" r="29.6" fill="url(#rc)"/>
      <circle cx="50" cy="50" r="27.6" fill="none" stroke="${mix(acc, card, .5)}" stroke-width=".6" stroke-dasharray="1.4 1.2"/>`;
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 135">${body}</svg>`)}")`;
  }

  /* ── Art (logo · no-photo picture · menu button · big opening art) ── */
  const ART = {
    tulips: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/>
      <g fill="#fff"><circle cx="12" cy="20" r="2.2"/><circle cx="52" cy="16" r="2"/><circle cx="50" cy="44" r="2.2"/><circle cx="14" cy="46" r="2"/><circle cx="26" cy="10" r="1.6"/><circle cx="40" cy="54" r="1.6"/></g>
      <path d="M32 58 C 31 48, 26 38, 22 30M32 58 C 33 48, 38 40, 42 32" style="stroke:var(--leaf)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M22 31 C 13 30, 12 18, 14 12 C 17 17, 19 18, 22 14 C 25 18, 27 17, 30 12 C 32 19, 30 30, 22 31Z" style="fill:var(--tulip1,var(--accent))"/>
      <path d="M42 33 C 33 32, 32 20, 34 14 C 37 19, 39 20, 42 16 C 45 20, 47 19, 50 14 C 52 21, 50 32, 42 33Z" style="fill:var(--tulip2,var(--accent2))"/>`),
    flower: svg('0 0 24 24', `<g fill="currentColor" opacity=".9">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="12" cy="6.5" rx="3.2" ry="4.6" transform="rotate(${a} 12 12)"/>`).join('')}</g><circle cx="12" cy="12" r="2.6" fill="#f6d36b"/>`),
    flowerMenu: svg('0 0 32 32', `<g class="mflower">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="16" cy="8.6" rx="3.4" ry="5" transform="rotate(${a} 16 16)"/>`).join('')}<circle cx="16" cy="16" r="2.6"/></g>`),

    // Armory: the base of a cartridge — rim, extractor ring, primer with its rings and a firing-pin dent
    headstamp: svg('0 0 64 64', `<defs><radialGradient id="hsB" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#d9b56c"/><stop offset=".5" stop-color="#8d6a2e"/><stop offset="1" stop-color="#2f220c"/></radialGradient>
      <radialGradient id="hsP" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#e2b08a"/><stop offset=".6" stop-color="#9a5e36"/><stop offset="1" stop-color="#43230f"/></radialGradient></defs>
      <circle cx="32" cy="32" r="30.5" fill="url(#hsB)" stroke="#1a1208" stroke-width="1.5"/>
      <circle cx="32" cy="32" r="26.5" fill="none" stroke="#1a1208" stroke-opacity=".6" stroke-width="1.4"/>
      <circle cx="32" cy="32" r="25" fill="none" stroke="#f3dca0" stroke-opacity=".25" stroke-width=".8"/>
      <g fill="#1a1208" fill-opacity=".7" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="700" font-size="7.5" text-anchor="middle">
        <text x="32" y="17">S F</text><text x="32" y="53">F S</text><text x="16" y="35">★</text><text x="48" y="35">★</text></g>
      <circle cx="32" cy="32" r="9.5" fill="url(#hsP)" stroke="#1a1208" stroke-width="1.6"/>
      <circle cx="32" cy="32" r="6.6" fill="none" stroke="#1a1208" stroke-opacity=".45" stroke-width="1"/>
      <circle cx="33" cy="31" r="2.3" fill="#1a1208" opacity=".55"/><circle cx="32.4" cy="30.4" r="1" fill="#fff" opacity=".25"/>`),
    bullet50: svg('0 0 32 32', `<g stroke="none" transform="translate(16.5 15.5) rotate(38) scale(.22) translate(0 -69)">${cartridge('m')}</g>`),
    // Equestrian
    horseHead: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/>
      <path d="M22 56 L23.5 41 C 19 36, 17.5 28, 21 21 C 24 14, 30 9.5, 35.5 8.5 L37 3.5 L40 8.5 C 45 10, 50.5 16, 54 24.5 C 55.5 28.5, 54 32, 50.5 32.5 C 46.8 33, 43.5 31.2, 41 29 C 38.5 33, 37 38, 37.6 44 L39.5 56 Z" style="fill:var(--ink)"/>
      <path d="M36.5 10 C 39 16, 45 22, 52 25.5 M41 29 L44.5 22.5 M33 12.5 C 30 18, 29 24, 30 31" fill="none" style="stroke:var(--accent2)" stroke-width="2" stroke-linecap="round"/>
      <circle cx="44" cy="17.5" r="1.4" style="fill:var(--card)"/>
      <path d="M23 41 C 28 40, 33 41, 37.5 43" fill="none" style="stroke:var(--accent)" stroke-width="3.4" stroke-linecap="round"/>`),
    horseshoe: svg('0 0 24 24', `<path d="M6.5 21 C 3.2 16, 3 9, 6.5 5.2 C 9.8 1.6, 14.2 1.6, 17.5 5.2 C 21 9, 20.8 16, 17.5 21 L14.6 21 C 17 16.5, 17.4 10.5, 15 7.4 C 13.4 5.4, 10.6 5.4, 9 7.4 C 6.6 10.5, 7 16.5, 9.4 21 Z" fill="currentColor"/>
      <g fill="#fff" opacity=".85"><circle cx="6.4" cy="9.4" r=".75"/><circle cx="5.7" cy="13.2" r=".75"/><circle cx="6.5" cy="17" r=".75"/><circle cx="17.6" cy="9.4" r=".75"/><circle cx="18.3" cy="13.2" r=".75"/><circle cx="17.5" cy="17" r=".75"/></g>`),
    horseshoeMenu: svg('0 0 32 32', `<g class="mflower"><path d="M9 28 C 4.6 21.5, 4.3 12, 9 7 C 13.4 2.2, 18.6 2.2, 23 7 C 27.7 12, 27.4 21.5, 23 28 M12.6 28 C 9.4 22, 9 14, 12 10 C 14.2 7.4, 17.8 7.4, 20 10 C 23 14, 22.6 22, 19.4 28"/>
      <circle cx="8" cy="13" r=".9"/><circle cx="7.6" cy="18" r=".9"/><circle cx="24" cy="13" r=".9"/><circle cx="24.4" cy="18" r=".9"/></g>`),
    // Chalkboard
    chalkJar: svg('0 0 64 64', `<g fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--ink)" stroke-width="2.3" stroke-dasharray="1 .01">
      <path d="M21 14 C 21 11, 43 11, 43 14 L43 18 C 43 20, 21 20, 21 18 Z" style="stroke:var(--accent)"/><path d="M22.5 19.5 C 18 23, 16 27, 16.5 33 L17 51 C 17.2 55.5, 46.8 55.5, 47 51 L47.5 33 C 48 27, 46 23, 41.5 19.5"/>
      <path d="M22 34 L42 34 L42 45 L22 45 Z" style="stroke:var(--accent2)"/><path d="M26 39.5 C 29 37.8, 35 41.2, 38 39.5" style="stroke:var(--accent2)"/></g>`),
    chalkStar: svg('0 0 24 24', `<path d="M12 3 L14.4 9.2 L21 9.6 L15.9 13.8 L17.6 20.3 L12 16.7 L6.4 20.3 L8.1 13.8 L3 9.6 L9.6 9.2 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>`),
    // Retro kitchen
    cherries: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--accent2)" opacity=".35"/>
      <path d="M22 42 C 24 30, 30 20, 40 13 M42 44 C 41 32, 40 22, 40 13" fill="none" stroke="#3d6b3a" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M40 13 C 46 9, 53 11, 55 16 C 49 19, 44 18, 40 13Z" fill="#5a9a4a"/>
      <circle cx="21" cy="46" r="9" style="fill:var(--accent)"/><circle cx="43" cy="48" r="9" style="fill:var(--accent)"/>
      <ellipse cx="18" cy="43" rx="2.4" ry="1.6" fill="#fff" opacity=".7"/><ellipse cx="40" cy="45" rx="2.4" ry="1.6" fill="#fff" opacity=".7"/>`),
    cherry: svg('0 0 24 24', `<path d="M10 14 C 11 9, 13 6, 16 3" fill="none" stroke="#3d6b3a" stroke-width="1.4" stroke-linecap="round"/><circle cx="10" cy="16.5" r="5" fill="currentColor"/><ellipse cx="8.3" cy="14.8" rx="1.4" ry=".9" fill="#fff" opacity=".7"/>`),
    // Pioneer ledger
    quill: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/>
      <path d="M20 46 C 20 40, 44 40, 44 46 L44 54 C 44 57, 20 57, 20 54 Z" style="fill:var(--ink)"/><ellipse cx="32" cy="46" rx="12" ry="3" style="fill:var(--accent)" opacity=".8"/>
      <path d="M33 45 C 36 33, 42 20, 52 8 C 49 19, 45 28, 37 38" style="fill:var(--card);stroke:var(--ink)" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M33 45 L52 8" fill="none" style="stroke:var(--ink)" stroke-width="1.2"/>`),
    fleuron: svg('0 0 24 24', `<path d="M12 4 C 9 8, 9 11, 12 13 C 15 11, 15 8, 12 4Z M12 13 C 8 13, 5 15, 4 19 C 7 18, 9 16, 12 13Z M12 13 C 16 13, 19 15, 20 19 C 17 18, 15 16, 12 13Z M12 13 L12 20" fill="currentColor" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"/>`),
    quillMenu: svg('0 0 32 32', `<g class="mflower"><path d="M8 26 C 12 16, 18 9, 27 4 C 24 13, 19 19, 11 24 Z"/><path d="M8 26 L27 4 M6 28 L9 25"/></g>`),
    // Starry night
    moon: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/>
      <path d="M38 12 C 26 13, 18 22, 18 33 C 18 44, 27 53, 38 53 C 42 53, 45.5 52, 48 50 C 36.5 49, 29 41.5, 29 32 C 29 22.5, 35 15, 43 13 C 41.5 12.4, 39.8 12, 38 12Z" style="fill:var(--accent)"/>
      <g style="fill:var(--accent2)"><path d="M47 22 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2Z"/><circle cx="51" cy="38" r="1.3"/><circle cx="44" cy="44" r="1"/></g>`),
    star: svg('0 0 24 24', `<path d="M12 2.5 L14.2 9.8 L21.5 12 L14.2 14.2 L12 21.5 L9.8 14.2 L2.5 12 L9.8 9.8 Z" fill="currentColor"/>`),
    starMenu: svg('0 0 32 32', `<g class="mflower"><path d="M16 3 L18.8 13.2 L29 16 L18.8 18.8 L16 29 L13.2 18.8 L3 16 L13.2 13.2 Z"/></g>`),
    // Holiday (by season)
    pumpkin: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/><path d="M32 17 C 33 12, 36 10, 39 9" fill="none" stroke="#5c6b2a" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="22" cy="36" rx="11" ry="14" style="fill:var(--accent)"/><ellipse cx="42" cy="36" rx="11" ry="14" style="fill:var(--accent)"/><ellipse cx="32" cy="36" rx="10" ry="15" style="fill:var(--accent2)"/>`),
    tree: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/><path d="M32 8 L44 26 L38 26 L48 40 L40 40 L50 52 L14 52 L24 40 L16 40 L26 26 L20 26 Z" style="fill:var(--accent2)"/>
      <rect x="29" y="52" width="6" height="6" fill="#6b4a2a"/><circle cx="27" cy="34" r="2" style="fill:var(--accent)"/><circle cx="38" cy="45" r="2" style="fill:var(--accent)"/><circle cx="34" cy="24" r="1.8" fill="#f2c94c"/><path d="M32 4 l1.4 3 3.2 .3 -2.4 2.1 .7 3.1 -2.9 -1.6 -2.9 1.6 .7 -3.1 -2.4 -2.1 3.2 -.3Z" fill="#f2c94c"/>`),
    heart: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/><path d="M32 52 S 12 39, 12 25 a10 10 0 0 1 20 -3 a10 10 0 0 1 20 3 C 52 39, 32 52, 32 52Z" style="fill:var(--accent)"/><ellipse cx="23" cy="24" rx="3.5" ry="2.2" fill="#fff" opacity=".55"/>`),
    blossom: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="32" cy="20" rx="7" ry="11" transform="rotate(${a} 32 32)" style="fill:var(--accent2)"/>`).join('')}<circle cx="32" cy="32" r="6" style="fill:var(--accent)"/>`),
    sun: svg('0 0 64 64', `<circle cx="32" cy="32" r="31" style="fill:var(--soft)"/><g style="stroke:var(--accent)" stroke-width="3" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) => `<line x1="32" y1="9" x2="32" y2="15" transform="rotate(${i * 30} 32 32)"/>`).join('')}</g><circle cx="32" cy="32" r="12" style="fill:var(--accent2)"/><circle cx="32" cy="32" r="9" style="fill:var(--accent)"/>`)
  };
  const menuOf = icon => svg('0 0 32 32', `<g class="mflower">${icon}</g>`);

  /* ── Opening-animation particles (one sprite, stamped many times in a spiral) ── */
  const P = {
    flower(c) { c.fillStyle = 'rgba(255,255,255,.96)'; for (let k = 0; k < 5; k++) { c.save(); c.rotate(k * Math.PI * 2 / 5); c.beginPath(); c.ellipse(0, -14, 9, 14, 0, 0, Math.PI * 2); c.fill(); c.restore(); } c.fillStyle = '#f6dc8a'; c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill(); },
    chalk(c) { for (let k = 0; k < 9; k++) { c.fillStyle = `rgba(250,250,240,${.25 + Math.random() * .6})`; c.beginPath(); c.arc((Math.random() - .5) * 26, (Math.random() - .5) * 26, 2 + Math.random() * 6, 0, Math.PI * 2); c.fill(); } },
    dot(color) { return c => { c.fillStyle = color; c.beginPath(); c.arc(0, 0, 20, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-7, -7, 6, 4, -.6, 0, Math.PI * 2); c.fill(); }; },
    ink(c) { c.fillStyle = 'rgba(40,24,12,.85)'; c.beginPath(); c.arc(0, 0, 11, 0, Math.PI * 2); c.fill(); for (let k = 0; k < 7; k++) { const a = Math.random() * 6.28, d = 12 + Math.random() * 14; c.beginPath(); c.arc(Math.cos(a) * d, Math.sin(a) * d, 1.5 + Math.random() * 4, 0, Math.PI * 2); c.fill(); } },
    star(c) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 26); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(.25, 'rgba(255,240,200,.8)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 26, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fffbe8'; c.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 4 : 18, a = k * Math.PI / 4; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); },
    leaf(colors) { return c => { c.fillStyle = colors[Math.floor(Math.random() * colors.length)]; c.beginPath(); c.moveTo(0, -22); c.bezierCurveTo(16, -10, 14, 12, 0, 22); c.bezierCurveTo(-14, 12, -16, -10, 0, -22); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -18); c.lineTo(0, 22); c.stroke(); }; },
    snow(c) { c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 3.4; c.lineCap = 'round'; for (let k = 0; k < 6; k++) { c.save(); c.rotate(k * Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -22); c.moveTo(0, -12); c.lineTo(6, -18); c.moveTo(0, -12); c.lineTo(-6, -18); c.stroke(); c.restore(); } },
    heart(color) { return c => { c.fillStyle = color; c.beginPath(); c.moveTo(0, 18); c.bezierCurveTo(-26, 0, -14, -22, 0, -8); c.bezierCurveTo(14, -22, 26, 0, 0, 18); c.fill(); }; }
  };

  /* ── The styles ── */
  const T = (bg, card, ink, muted, accent, accent2, soft, leaf, warn, splash, tulip1, tulip2, grid) => ({ bg, card, ink, muted, accent, accent2, soft, leaf, warn, splash, tulip1: tulip1 || accent, tulip2: tulip2 || accent2, grid: grid || 'rgba(0,0,0,.03)' });
  const season = (d = new Date()) => { const m = d.getMonth(); return m >= 8 && m <= 10 ? 'fall' : (m === 11 || m === 0) ? 'winter' : m === 1 ? 'val' : m <= 4 ? 'spring' : 'summer'; };

  const STYLES = [
    { id: 'floral', name: 'Floral', blurb: 'The original', fonts: null,
      colors: [['blush', 'Blush Peony', '#fdf6f3', '#e7a7b7'], ['lavender', 'Lavender', '#f7f4fb', '#b9a8dc'], ['sage', 'Sage & Daisy', '#f4f6f0', '#a3bb98'], ['buttercup', 'Buttercup', '#fffaf0', '#efc664'],
        ['hydrangea', 'Hydrangea', '#f2f8f8', '#93c0cc'], ['peach', 'Peach Blossom', '#fff6f0', '#f1b18f'], ['wildflower', 'Wildflower', '#fbf8f2', '#cf89a6'], ['moonlit', 'Moonlit', '#26222c', '#3e3448']],
      logo: ART.tulips, ph: ART.flower, menu: ART.flowerMenu, petal: 'flower', sprite: P.flower, art: null },

    { id: 'chalk', name: 'Pantry Chalkboard', blurb: 'Chalk on slate', dark: true,
      fonts: { d: "'Cabin Sketch','Patrick Hand',cursive", b: "'Patrick Hand','Comic Sans MS',cursive", i: 'normal' },
      tex: `${noise(.55, .09, '1 1 1', 3)},radial-gradient(ellipse at 20% 15%,rgba(255,255,255,.05),transparent 55%),radial-gradient(ellipse at 80% 70%,rgba(255,255,255,.04),transparent 50%)`, texSize: '220px 220px,100% 100%,100% 100%',
      colors: [['slate', 'Slate', T('#2b3133', '#323a3c', '#f2f0e8', '#a9aea8', '#f7e27c', '#9fc7d8', '#3f4749', '#a8d39a', '#f29b8f', '#263032', '#f7e27c', '#f29bb5')],
        ['greenboard', 'Schoolhouse green', T('#24392f', '#2b4237', '#f1f3ea', '#a8b8ab', '#f5d76e', '#f2a7c3', '#36503f', '#bfe3a5', '#f4a090', '#1f3329')],
        ['blueboard', 'Blue board', T('#22303f', '#293848', '#eef2f6', '#a3b1bf', '#ffd27a', '#a6e3e9', '#344557', '#b3e0a1', '#ff9e8f', '#1d2a37')]],
      logo: ART.chalkJar, ph: ART.chalkStar, menu: menuOf('<path d="M16 5 L19 13 L27 13.5 L20.7 18.6 L22.9 26.5 L16 22 L9.1 26.5 L11.3 18.6 L5 13.5 L13 13 Z" stroke-dasharray="2.4 1.6"/>'), petal: 'chalk', sprite: P.chalk, art: ART.chalkJar },

    { id: 'retro', name: 'Retro Kitchen', blurb: '1950s diner',
      fonts: { d: "'Righteous','Fraunces',sans-serif", b: "'Karla',system-ui,sans-serif", i: 'normal' },
      tex: 'repeating-linear-gradient(0deg,color-mix(in srgb,var(--accent) 6%,transparent) 0 14px,transparent 14px 28px),repeating-linear-gradient(90deg,color-mix(in srgb,var(--accent) 6%,transparent) 0 14px,transparent 14px 28px)', texSize: 'auto',
      colors: [['cherry', 'Cherry & teal', T('#fbf3e2', '#fffaf0', '#3b2a2a', '#9b8577', '#d6293e', '#5fc4bd', '#f4e3c4', '#5fa88a', '#d6293e', '#5fc4bd', '#d6293e', '#f7d046')],
        ['mint', 'Mint & pink', T('#eef8f3', '#fbfffd', '#2d3b36', '#869a91', '#2bb3a3', '#f39bb0', '#d7efe5', '#2bb3a3', '#e2475b', '#f39bb0')],
        ['mustard', 'Mustard & blue', T('#fdf6e3', '#fffcf2', '#3a3122', '#9c8f74', '#e0a526', '#3f8fa8', '#f6e7bd', '#6aa56b', '#c9473a', '#3f8fa8')]],
      logo: ART.cherries, ph: ART.cherry, menu: menuOf('<path d="M13 21 C 14 14, 17 9, 22 5"/><circle cx="12" cy="24" r="5"/><circle cx="22" cy="23" r="5"/><path d="M17 12 C 19 15, 21 18, 22 18"/>'), petal: 'retro', sprite: P.dot('#d6293e'), art: ART.cherries },

    { id: 'ledger', name: 'Pioneer Ledger', blurb: 'Ink on old paper',
      fonts: { d: "'IM Fell English',Georgia,serif", b: "'Courier Prime','Courier New',monospace", i: 'italic' },
      tex: `linear-gradient(90deg,transparent 54px,rgba(160,40,30,.22) 54px 55px,transparent 55px 58px,rgba(160,40,30,.22) 58px 59px,transparent 59px),repeating-linear-gradient(0deg,rgba(60,90,130,.13) 0 1px,transparent 1px 30px),${noise(.8, .07, '.35 .22 .1', 3)}`, texSize: '100% 100%,auto,220px 220px',
      colors: [['sepia', 'Sepia', T('#f1e6cf', '#f7efdc', '#3d2b1a', '#8a7356', '#7a3b1e', '#b98e5a', '#e3d3b0', '#6b7a3c', '#9e2b1e', '#d9c7a0')],
        ['inkblue', 'Ink blue', T('#eef0e6', '#f6f7ef', '#1f2a44', '#6f7787', '#233c78', '#9aa8c8', '#dde1d3', '#5a7a4a', '#a33a2a', '#cdd3c0')],
        ['oxblood', 'Oxblood', T('#efe3d6', '#f6ece1', '#3a1c1c', '#8d6c66', '#7d1f2a', '#c89a7a', '#e2cfbf', '#6d7b47', '#a12a1f', '#d8bfa8')]],
      logo: ART.quill, ph: ART.fleuron, menu: ART.quillMenu, petal: 'seal', sprite: P.ink, art: ART.quill },

    { id: 'starry', name: 'Starry Night', blurb: 'Moon and stars', dark: true,
      fonts: { d: "'Cormorant Garamond',Georgia,serif", b: "'Josefin Sans',system-ui,sans-serif", i: 'italic' },
      tex: 'radial-gradient(1.2px 1.2px at 20px 30px,rgba(255,255,255,.55),transparent),radial-gradient(1px 1px at 90px 80px,rgba(255,255,255,.4),transparent),radial-gradient(1.6px 1.6px at 150px 20px,rgba(255,240,200,.6),transparent),radial-gradient(1px 1px at 60px 140px,rgba(255,255,255,.35),transparent),radial-gradient(1.3px 1.3px at 170px 160px,rgba(200,215,255,.5),transparent)', texSize: '200px 190px',
      colors: [['midnight', 'Midnight', T('#0f1630', '#18213f', '#eef0ff', '#9aa3c7', '#f6d68a', '#8fa6ff', '#232d52', '#8fd3c1', '#ff8f9f', '#0b1128', '#f6d68a', '#c9d4ff')],
        ['aurora', 'Aurora', T('#0e1f26', '#15303a', '#e9fbf7', '#8fb3ad', '#7ef0c8', '#b48cff', '#1d3c47', '#7ef0c8', '#ff8fa3', '#0a181e')],
        ['dusk', 'Dusk', T('#221a33', '#2d2343', '#f6eefc', '#b3a2c7', '#ffb37a', '#d38cff', '#3a2e55', '#9fd6b0', '#ff8f9f', '#1a1328')]],
      logo: ART.moon, ph: ART.star, menu: ART.starMenu, petal: 'starry', sprite: P.star, art: ART.moon },

    { id: 'holiday', name: 'Holiday', blurb: 'Changes with the season',
      fonts: { d: "'Berkshire Swash',Georgia,serif", b: "'Nunito',system-ui,sans-serif", i: 'normal' },
      tex: 'radial-gradient(circle at 12px 12px,color-mix(in srgb,var(--accent) 12%,transparent) 2px,transparent 2.5px),radial-gradient(circle at 36px 30px,color-mix(in srgb,var(--accent2) 14%,transparent) 1.6px,transparent 2px)', texSize: '48px 44px',
      colors: [['hol-auto', 'By the date', null],
        ['hol-fall', 'Fall harvest', T('#fbf1e4', '#fffaf3', '#4a2a17', '#a07f66', '#d9692b', '#f2b45a', '#f5dfc4', '#7c8b3a', '#b83a26', '#d9692b')],
        ['hol-winter', 'Christmas', T('#f1f6f6', '#fbfefe', '#1f3a33', '#7f9a93', '#c0283a', '#2f7a5a', '#dceae6', '#2f7a5a', '#c0283a', '#2f6b52')],
        ['hol-val', 'Valentine', T('#fff1f3', '#fffafa', '#4d1f2c', '#b0808d', '#e0436a', '#ffb3c4', '#ffdfe6', '#8fb08f', '#c0283a', '#e0436a')],
        ['hol-spring', 'Spring', T('#f5f9ee', '#fdfffa', '#34452b', '#8fa182', '#8bbf5a', '#f2a7cf', '#e3efd2', '#6fa64a', '#d1495b', '#b9dd8e')],
        ['hol-summer', 'Summer', T('#f3f7fc', '#fdfeff', '#1c2c4a', '#7d8aa3', '#c9283e', '#2f5fb3', '#dde6f3', '#3c9a6a', '#c9283e', '#2f5fb3')]],
      seasonal: { fall: { logo: ART.pumpkin, sprite: P.leaf(['#fff1dc']) }, winter: { logo: ART.tree, sprite: P.snow },
        val: { logo: ART.heart, sprite: P.heart('#ff8fab') }, spring: { logo: ART.blossom, sprite: P.leaf(['#f6c3dc', '#ffffff', '#bfe3a0']) }, summer: { logo: ART.sun, sprite: P.star } },
      ph: ART.star, menu: ART.starMenu, petal: 'ornament' },

    { id: 'armory', name: 'Armory', blurb: 'Gunmetal, brass and rust', secret: 1, dark: true,
      fonts: { d: "'Black Ops One',Impact,sans-serif", b: "'Barlow Condensed','Arial Narrow',sans-serif", i: 'normal' },
      tex: `${noise(.95, .14, '0 0 0', 3)},repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 1px,transparent 1px 3px),${noise(.012, .22, '.35 .12 .05', 2)},linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.25))`, texSize: '220px 220px,auto,620px 620px,100% 100%',
      colors: [['brass', 'Brass', T('#17181a', '#202225', '#e6dfd3', '#8e877c', '#c9a35a', '#7d6234', '#2e3135', '#8a9a5b', '#c0532f', '#101113', '#c9a35a', '#8a5a2b', 'rgba(255,255,255,.02)')],
        ['steel', 'Gunmetal blue', T('#15191d', '#1d2329', '#e1e6ea', '#8a949d', '#8fb2cc', '#4c6377', '#2b333b', '#7f9a6a', '#c2553a', '#0f1316')],
        ['od', 'OD green', T('#191b15', '#22251c', '#e3e2d2', '#8e8d78', '#a7b56c', '#5a6338', '#2f3326', '#a7b56c', '#c0532f', '#12140f')],
        ['rust', 'Copper & rust', T('#1a1513', '#241d1a', '#eadbd0', '#957f73', '#c9723f', '#7a3a22', '#33292a', '#8a8a5a', '#d0583a', '#140f0d')]],
      logo: ART.headstamp, ph: ART.headstamp, menu: ART.bullet50, petal: 'bullet', reveal: 'armory' },

    { id: 'equestrian', name: 'Equestrian', blurb: 'Dressage, jumps and show ribbons', secret: 2,
      fonts: { d: "'Playfair Display',Georgia,serif", b: "'Lato',system-ui,sans-serif", i: 'italic' },
      tex: `${noise(.7, .05, '.45 .32 .18', 2)},repeating-linear-gradient(90deg,rgba(120,90,60,.035) 0 2px,transparent 2px 9px)`, texSize: '220px 220px,auto',
      colors: [['purplepad', 'Purple saddle pad', T('#f7f4ef', '#fffdf9', '#2a2235', '#8a8296', '#6b3fa0', '#c9b3e6', '#ece4f3', '#4f7a4a', '#b0303a', '#9cc7e8')],
        ['hunter', 'Hunter green', T('#f4f3ec', '#fdfdf8', '#1f2a22', '#7d887f', '#2f5a3a', '#c8a95a', '#e2e6da', '#2f5a3a', '#a8322d', '#a9cfe3')],
        ['navygold', 'Navy & gold', T('#f5f3ee', '#fffdf8', '#1b2338', '#7c8297', '#1f3a6b', '#c9a24d', '#e3e5ec', '#4f7a4a', '#b0303a', '#a3c4e0')],
        ['bay', 'Bay & tan', T('#f6f0e6', '#fffaf2', '#3a2416', '#957b66', '#8a4b26', '#d9b88a', '#efe2cf', '#5b7a43', '#a8322d', '#b7d4e6')]],
      logo: ART.horseHead, ph: ART.horseshoe, menu: ART.horseshoeMenu, petal: 'rosette', reveal: 'equestrian' }
  ];
  const byId = id => STYLES.find(s => s.id === id) || STYLES[0];

  // Holiday "by the date" picks the season's colors
  function resolveColor(styleId, colorId) {
    const st = byId(styleId);
    let c = st.colors.find(x => x[0] === colorId) || st.colors[0];
    if (c[0] === 'hol-auto') c = st.colors.find(x => x[0] === 'hol-' + season());
    return c;
  }
  // status-bar colors before the page has styles: [page color, opening-animation color]
  function barColors(styleId, colorId) {
    const c = resolveColor(styleId, colorId);
    return Array.isArray(c[2]) || typeof c[2] === 'string' ? [c[2], c[3]] : [c[2].bg, c[2].splash];
  }
  // art that depends on the season (Holiday)
  function artFor(st) {
    if (st.seasonal) { const s = st.seasonal[season()]; return { ...st, logo: s.logo, art: s.logo, sprite: s.sprite }; }
    return st;
  }

  /* ── Write the CSS for every style ── */
  let css = '';
  for (const st of STYLES) {
    if (st.fonts) css += `[data-style="${st.id}"][data-style]{--fd:${st.fonts.d};--fb:${st.fonts.b};--fi:${st.fonts.i};font-synthesis:none;--tex:${st.tex};--texsize:${st.texSize};${st.dark ? 'color-scheme:dark;' : ''}}\n`;
    for (const [cid, , tok] of st.colors) {
      if (!tok || typeof tok === 'string') continue;
      css += `[data-style="${st.id}"][data-theme="${cid}"]{${Object.entries(tok).map(([k, v]) => `--${k}:${v}`).join(';')}}\n`;
    }
  }
  // Equestrian rosettes, in each color choice's colors
  for (const [cid, , tok] of byId('equestrian').colors) css += `[data-style="equestrian"][data-theme="${cid}"] .petal{background-image:${rosette(tok.accent, tok.accent2, tok.card)}}\n`;
  // menu petals, per style
  css += `
[data-style="armory"] .bloom{--bloom-extra:62}
[data-style="equestrian"] .bloom{--bloom-extra:16}
[data-style="armory"] .petal{width:76px;height:196px;margin:-98px 0 0 -38px;padding:0;border:0;box-shadow:none;background:none;border-radius:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
[data-style="armory"] .petal::before{content:"";position:absolute;left:50%;top:0;width:24px;height:153px;margin-left:-12px;background:${cartURI} center/contain no-repeat;
  filter:drop-shadow(2px 7px 5px rgba(0,0,0,.65)) drop-shadow(0 0 1px rgba(0,0,0,.8))}
[data-style="armory"] .petal .pc{position:relative;z-index:1;margin-top:158px;background:linear-gradient(#26282b,#141516);border:1px solid rgba(201,163,90,.45);border-radius:4px;padding:3px 7px 4px;box-shadow:0 6px 12px -6px #000,inset 0 1px 0 rgba(255,255,255,.08)}
[data-style="armory"] .petal svg{stroke:#e6dfd3;width:20px;height:20px}
[data-style="armory"] .petal b{color:#e6dfd3;letter-spacing:.06em;text-transform:uppercase;font-size:11px}
[data-style="equestrian"] .petal{width:92px;height:124px;margin:-46px 0 0 -46px;transform-origin:46px 46px;padding:0;border:0;border-radius:0;box-shadow:none;
  background:center top/100% auto no-repeat;filter:drop-shadow(0 6px 7px rgba(40,25,10,.28));display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
[data-style="equestrian"] .petal .pc{margin-top:24px;gap:1px}
[data-style="equestrian"] .petal svg{width:22px;height:22px}
[data-style="equestrian"] .petal b{font-size:10.5px}
[data-style="chalk"] .petal{background:color-mix(in srgb,var(--bg) 80%,transparent);border:2px dashed color-mix(in srgb,var(--ink) 70%,transparent);box-shadow:none}
[data-style="retro"] .petal{border-radius:999px;width:84px;height:84px;margin:-42px 0 0 -42px;border:3px solid var(--card);
  background:radial-gradient(circle at 30% 30%,#fff6 0 10%,transparent 11%),var(--accent);box-shadow:0 0 0 2px var(--accent),0 10px 22px -12px var(--ink)}
[data-style="retro"] .petal svg{stroke:#fff}[data-style="retro"] .petal b{color:#fff}
[data-style="ledger"] .petal{border-radius:46% 54% 50% 50%/52% 48% 52% 48%;width:80px;height:80px;margin:-40px 0 0 -40px;border:0;
  background:radial-gradient(circle at 40% 35%,color-mix(in srgb,var(--accent) 70%,#fff),var(--accent) 60%,color-mix(in srgb,var(--accent) 70%,#000));box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 80%,transparent),0 10px 22px -12px #000}
[data-style="ledger"] .petal svg{stroke:#f7efdc}[data-style="ledger"] .petal b{color:#f7efdc}
[data-style="starry"] .petal{border-radius:50%;width:80px;height:80px;margin:-40px 0 0 -40px;background:radial-gradient(circle,var(--soft),var(--bg));border:1.5px solid var(--accent);box-shadow:0 0 22px -4px var(--accent)}
[data-style="holiday"] .petal{border-radius:50%;width:80px;height:80px;margin:-40px 0 0 -40px;border:0;background:radial-gradient(circle at 32% 30%,#fff8 0 12%,transparent 13%),var(--accent);box-shadow:0 10px 22px -12px var(--ink)}
[data-style="holiday"] .petal::before{content:"";position:absolute;top:-7px;left:50%;width:16px;height:10px;margin-left:-8px;border-radius:3px;background:#c9a24d}
[data-style="holiday"] .petal svg{stroke:#fff}[data-style="holiday"] .petal b{color:#fff}
/* gritty touches for Armory */
[data-style="armory"] section.cat,[data-style="armory"] .sheet,[data-style="armory"] .card{border:1px solid rgba(255,255,255,.05);box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 14px 30px -18px #000}
[data-style="armory"] .cats button.on::after{background:linear-gradient(90deg,transparent,var(--accent),transparent);height:2px}
[data-style="armory"] .item .nm,[data-style="armory"] .link,[data-style="armory"] .fam{letter-spacing:.03em}
[data-style="armory"] header h1{text-transform:uppercase;letter-spacing:.03em;font-size:22px;white-space:nowrap}
[data-style] header .sync{white-space:nowrap}
[data-style="chalk"] header h1,[data-style="chalk"] section.cat h2{text-shadow:0 0 1px currentColor}
[data-style="ledger"] .item{border-bottom-style:solid}
[data-style="starry"] header h1{text-shadow:0 0 18px color-mix(in srgb,var(--accent) 50%,transparent)}
`;
  const el = document.createElement('style'); el.id = 'styleSheet'; el.textContent = css;
  document.head.append(el);

  window.SFFS_STYLES = { list: STYLES, byId, resolveColor, barColors, artFor, season, ART };
})();
