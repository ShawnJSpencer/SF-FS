"""Builds the home-screen icons: a Code 128 barcode that scans as "I love you"."""
import sys, json
from PIL import Image, ImageDraw

PAT = ["212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
"221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231",
"213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321",
"232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133",
"112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131",
"311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422",
"121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211",
"221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212",
"421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113",
"411311","113141","114131","311141","411131","211412","211214","211232","2331112"]

def code128b(text):
    vals = [104] + [ord(c) - 32 for c in text]
    chk = (104 + sum((i + 1) * v for i, v in enumerate(vals[1:]))) % 103
    vals += [chk, 106]
    mods = []
    for v in vals:
        for k, w in enumerate(PAT[v]):
            mods += [1 if k % 2 == 0 else 0] * int(w)
    return mods

MODS = code128b("I love you")

def icon(size, bg, fg, path, quiet=10):
    # Integer pixels per module so every bar is crisp.
    n = len(MODS) + 2 * quiet
    px = max(1, size // n)
    w = n * px
    img = Image.new("RGB", (size, size), bg)
    d = ImageDraw.Draw(img)
    x0 = (size - w) // 2 + quiet * px
    top, bot = int(size * 0.18), int(size * 0.82)
    for i, m in enumerate(MODS):
        if m: d.rectangle([x0 + i * px, top, x0 + (i + 1) * px - 1, bot], fill=fg)
    img.save(path)

if __name__ == "__main__":
    out = sys.argv[1]
    bg, fg = (253, 246, 243), (92, 64, 72)   # blush paper, plum ink
    for s in (180, 192, 512, 1024):
        icon(s, bg, fg, f"{out}/icon-{s}.png")
    icon(32, bg, fg, f"{out}/favicon-32.png", quiet=0)
    print("modules:", len(MODS))
    # bar widths for the in-app SVG barcode
    print(json.dumps(MODS).replace(" ", ""))
