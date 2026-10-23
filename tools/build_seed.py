import json, re, sys
sys.path.insert(0, __file__.rsplit('/',1)[0])
from seed_src import SEED

def norm(d):
    if re.fullmatch(r"\d{4}", d): return d
    m, y = d.split('/'); return f"20{int(y):02d}-{int(m):02d}"

cats, items = [], []
n = 0
for cname, emoji, rows in SEED:
    cid = re.sub(r'[^a-z0-9]+', '-', cname.lower()).strip('-')
    cats.append({"id": cid, "name": cname, "emoji": emoji})
    for i, (name, qty, exps) in enumerate(rows):
        n += 1
        exps = sorted(norm(e) for e in exps)
        lots = []
        if qty > 0:
            if not exps: lots = [{"exp": "", "qty": qty}]
            else:
                base, extra = divmod(qty, len(exps)) if qty >= len(exps) else (1, 0)
                use = exps[:qty]
                for j, e in enumerate(use):
                    lots.append({"exp": e, "qty": base + (1 if j >= len(use) - extra else 0)})
        for j, l in enumerate(lots): l["id"] = f"l{n}-{j}"
        items.append({"id": f"i{n:03d}", "name": name, "cat": cid, "order": i, "lots": lots,
                      "par": 1, "loc": "", "img": "", "codes": [], "store": "costco", "notes": ""})
out = {"cats": cats, "items": items}
open(sys.argv[1], 'w').write("window.SFFS_SEED = " + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ";\n")
print(len(cats), "categories,", len(items), "items,", sum(sum(l['qty'] for l in i['lots']) for i in items), "units")
