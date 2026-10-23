"""Home-screen icon: two tulips on a field of tiny white flowers (renders SVG -> PNG with Chromium)."""
import math, random, asyncio, sys
from playwright.async_api import async_playwright

def flower(x, y, r, rot):
    petals = ''.join(
        f'<ellipse cx="{x + math.cos(math.radians(a + rot)) * r * .62:.1f}" cy="{y + math.sin(math.radians(a + rot)) * r * .62:.1f}" '
        f'rx="{r * .5:.1f}" ry="{r * .34:.1f}" transform="rotate({a + rot:.0f} {x + math.cos(math.radians(a + rot)) * r * .62:.1f} {y + math.sin(math.radians(a + rot)) * r * .62:.1f})" fill="#fff"/>'
        for a in range(0, 360, 72))
    return petals + f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r * .26:.1f}" fill="#f6d36b"/>'

def svg():
    random.seed(7)
    S = 1024
    bg = '#e7a7b7'
    # tiny flowers on a soft spiral, kept out of the tulip area
    fl = []
    n = 230
    for i in range(n):
        rr = 34 * math.sqrt(i + .5); th = i * math.pi * (3 - math.sqrt(5)) + rr * .004
        x, y = S / 2 + rr * math.cos(th), S / 2 + rr * math.sin(th)
        if not (-30 < x < S + 30 and -30 < y < S + 30): continue
        if (x - 512) ** 2 / 330 ** 2 + (y - 530) ** 2 / 400 ** 2 < 1: continue
        fl.append(flower(x, y, 11 + random.random() * 9, random.random() * 72))
    # tulips (same shapes as the splash, scaled up and centered)
    t = '''
    <g transform="translate(512 548) scale(3.55) translate(-100 -122)">
      <path d="M100 200 C 98 160, 86 130, 72 92" stroke="#5f8f5a" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M100 200 C 102 165, 116 132, 130 100" stroke="#5f8f5a" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M99 196 C 70 186, 58 160, 60 138 C 80 150, 94 170, 99 196Z" fill="#7fae78"/>
      <path d="M101 196 C 132 184, 142 162, 142 146 C 122 156, 106 172, 101 196Z" fill="#8bb884"/>
      <path d="M72 96 C 48 92, 44 58, 50 40 C 58 52, 64 56, 72 46 C 80 56, 86 52, 94 40 C 100 58, 96 92, 72 96Z" fill="#d95c7c"/>
      <path d="M72 96 C 62 86, 60 64, 72 46 C 84 64, 82 86, 72 96Z" fill="#fff" opacity=".25"/>
      <path d="M130 104 C 108 100, 104 68, 110 50 C 118 62, 124 66, 132 56 C 140 66, 146 62, 154 50 C 160 68, 154 100, 130 104Z" fill="#fbe3ea"/>
      <path d="M130 104 C 120 94, 118 72, 132 56 C 144 72, 140 94, 130 104Z" fill="#fff" opacity=".55"/>
    </g>'''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">
      <rect width="{S}" height="{S}" fill="{bg}"/>
      <radialGradient id="g" cx="50%" cy="52%" r="45%"><stop offset="0" stop-color="#f3c6d1"/><stop offset="1" stop-color="{bg}" stop-opacity="0"/></radialGradient>
      <rect width="{S}" height="{S}" fill="url(#g)"/>
      {''.join(fl)}{t}</svg>'''

async def main(out):
    s = svg()
    open(f'{out}/tulip-icon.svg', 'w').write(s)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1024, 'height': 1024})
        await pg.set_content(f'<html><body style="margin:0">{s}</body></html>')
        await pg.screenshot(path=f'{out}/tulip-1024.png')
        await b.close()
    from PIL import Image
    big = Image.open(f'{out}/tulip-1024.png').convert('RGB')
    big.save(f'{out}/tulip-1024.png')
    for size in (512, 192, 180, 32):
        big.resize((size, size), Image.LANCZOS).save(f'{out}/tulip-{size}.png', optimize=True)

asyncio.run(main(sys.argv[1]))
