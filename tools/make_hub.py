"""Builds /guides/ (a list of every jurisdiction guide) from the Alberta guide's shell."""
import os, re, glob, json, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = open(os.path.join(ROOT, 'alberta-divorce-guide/index.html'), encoding='utf-8').read()
CA = ['alberta','british-columbia','manitoba','new-brunswick','newfoundland-and-labrador','northwest-territories','nova-scotia','nunavut','ontario','prince-edward-island','quebec','saskatchewan','yukon']
UK = ['england-and-wales','scotland','northern-ireland']
AU = ['australia']
def name(slug):
    t = open(os.path.join(ROOT, slug + '-divorce-guide/index.html'), encoding='utf-8').read()
    n = re.search(r'<title>Divorce in (.*?):', t).group(1)
    return re.sub(r'^the ', '', n).replace('&amp;', '&')
slugs = sorted(os.path.basename(os.path.dirname(p)).replace('-divorce-guide', '') for p in glob.glob(os.path.join(ROOT, '*-divorce-guide/index.html')))
US = [s for s in slugs if s not in CA + UK + AU]
groups = [('Canada', CA), ('United States', sorted(US, key=lambda s: name(s))), ('United Kingdom', UK), ('Australia', AU)]
assert all(os.path.exists(os.path.join(ROOT, s + '-divorce-guide/index.html')) for _, g in groups for s in g)
url = 'https://thedivorceangels.com/guides/'
desc = 'Plain-language financial guides to divorce for every Canadian province and territory, every US state and Washington, D.C., England and Wales, Scotland, Northern Ireland and Australia.'
t = T
t = re.sub(r'<!-- Alberta Divorce Financial Guide \|.*?-->', '<!-- Divorce Financial Guides hub | Your Divorce Angel | lists every jurisdiction guide; Oct 2026 -->', t, count=1)
t = re.sub(r'<title>.*?</title>', '<title>Divorce Financial Guides by Province, State and Country | Your Divorce Angel</title>', t, count=1)
t = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % html.escape(desc), t, count=1)
t = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, t, count=1)
items = [{"@type": "ListItem", "position": i + 1, "name": "Divorce in %s: A Financial Guide" % name(s), "url": "https://thedivorceangels.com/%s-divorce-guide/" % s}
         for i, s in enumerate([s for _, g in groups for s in g])]
ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Divorce Financial Guides", "description": desc, "url": url,
      "isPartOf": {"@id": "https://thedivorceangels.com/#website"}, "mainEntity": {"@type": "ItemList", "itemListElement": items}}
crumb = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://thedivorceangels.com/"},
    {"@type": "ListItem", "position": 2, "name": "Divorce Financial Guides", "item": url}]}
t = re.sub(r'<!-- =+ JSON-LD BLOCK 3: ARTICLE =+ -->\s*<script type="application/ld\+json">.*?</script>\s*<!-- =+ JSON-LD BLOCK 4: FAQ PAGE =+ -->\s*<script type="application/ld\+json">.*?</script>',
           lambda m: '<!-- ===================== JSON-LD BLOCK 3: COLLECTION ===================== -->\n<script type="application/ld+json">\n' + json.dumps(ld, indent=2, ensure_ascii=False) + '\n</script>', t, count=1, flags=re.S)
t = re.sub(r'(<!-- =+ JSON-LD BLOCK 5: BREADCRUMB =+ -->\s*<script type="application/ld\+json">).*?(</script>)', lambda m: m.group(1) + '\n' + json.dumps(crumb, indent=2) + '\n' + m.group(2), t, count=1, flags=re.S)
css = '''  .guide-group{margin:40px 0 10px;}
  .guide-group h2{font-size:30px;margin:0 0 14px;}
  .guide-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;list-style:none;margin:0 !important;padding:0;}
  .guide-grid li{margin:0;}
  .guide-grid a{display:block;padding:12px 16px;border:1px solid var(--line);border-radius:10px;background:#fff;text-decoration:none;color:var(--ink);font-size:19px;line-height:1.3;transition:border-color .15s,background .15s;}
  .guide-grid a:hover,.guide-grid a:focus-visible{border-color:var(--sage);background:var(--pale);}
  .guide-count{font-size:16px;color:var(--muted);font-weight:400;margin-left:6px;}
</style>'''
t = t.replace('</style>', css, 1)
hero = '''<header class="hero">
  <div class="wrap">
    <div class="breadcrumb"><a href="https://thedivorceangels.com/">Home</a> &nbsp;›&nbsp; Guides</div>
    <div class="eyebrow">Guides</div>
    <h1>Divorce and your money,<br>wherever you <span class="brand-italic">live</span></h1>
    <p class="lede">How property, pensions, support and taxes work in a divorce depends on where you live. Pick your province, state or country for a plain-language guide to the rules that apply to you.</p>
    <p class="updated">Each guide is reviewed against that place's own family law. General financial guidance, not legal advice.</p>
  </div>
</header>'''
body = ['<main>\n  <div class="wrap">\n']
for label, g in groups:
    body.append('    <section class="guide-group">\n      <h2>%s<span class="guide-count">%d guides</span></h2>\n      <ul class="guide-grid">\n' % (label, len(g)) if len(g) > 1 else '    <section class="guide-group">\n      <h2>%s</h2>\n      <ul class="guide-grid">\n' % label)
    body += ['        <li><a href="https://thedivorceangels.com/%s-divorce-guide/">%s</a></li>\n' % (s, html.escape(name(s))) for s in g]
    body.append('      </ul>\n    </section>\n')
body.append('''
    <div class="cta">
      <h2>See your own numbers</h2>
      <p><span class="brand-italic" style="color:#fff;">Your Divorce Angel</span> applies your province's or state's rules to your real numbers, so you can compare settlement options before you negotiate.</p>
      <a class="btn" href="https://app.thedivorceangels.com">Start free →</a>
      <p class="trust">🔒 Your data is encrypted and never sold or shared with third parties.</p>
    </div>

    <p class="disclaimer">These guides are general financial information about divorce and separation. They are not legal advice, and laws and individual circumstances change. Always consult a licensed family lawyer where you live for advice specific to your situation.</p>
  </div>
</main>''')
a = t.index('<!-- ========== HERO ========== -->'); b = t.index('</main>') + len('</main>')
t = t[:a] + '<!-- ========== HERO ========== -->\n' + hero + '\n\n<!-- ========== MAIN ========== -->\n' + ''.join(body) + t[b:]
assert t.count('Alberta') == 2, t.count('Alberta')  # its list link and its schema entry
os.makedirs(os.path.join(ROOT, 'guides'), exist_ok=True)
open(os.path.join(ROOT, 'guides/index.html'), 'w', encoding='utf-8').write(t)
print('guides/index.html', sum(len(g) for _, g in groups), [ (l, len(g)) for l, g in groups])
