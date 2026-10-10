"""Builds a jurisdiction guide page from a content dict, using the Alberta guide as the template
(same head, styles, header, nav and footer). Run: python3 tools/make_guide.py <content.py>"""
import json, re, sys, html, os, importlib.util
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES = {}
def template(name):
    if name not in TEMPLATES: TEMPLATES[name] = open(os.path.join(ROOT, name + '-divorce-guide/index.html'), encoding='utf-8').read()
    return TEMPLATES[name]

def esc(s): return html.escape(s, quote=True)
def strip(s): return html.unescape(re.sub(r'<[^>]+>', '', s))

def build(g):
    url = 'https://thedivorceangels.com/%s-divorce-guide/' % g['slug']
    name = g['name']
    tpl = g.get('template', 'alberta')
    t = template(tpl)
    TN = tpl.replace('-', ' ').title()
    # head comment
    t = re.sub(r'<!-- ' + TN + r' Divorce Financial Guide \|.*?-->', '<!-- %s Divorce Financial Guide | Your Divorce Angel | %s -->' % (name, g['verified']), t, count=1)
    t = re.sub(r'<title>.*?</title>', '<title>Divorce in %s: A Financial Guide (2026) | Your Divorce Angel</title>' % esc(g.get('title_name', name)), t, count=1)
    t = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % esc(g['desc']), t, count=1)
    t = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % url, t, count=1)
    for prop, val in (('og:title', 'Divorce in %s: A Financial Guide' % g.get('title_name', name)), ('og:description', g['desc']), ('og:url', url)):
        t = re.sub(r'(<meta property="%s" content=")[^"]*(">)' % prop, lambda m: m.group(1) + esc(val) + m.group(2), t)
    # JSON-LD article / FAQ / breadcrumb
    art = {"@context": "https://schema.org", "@type": "Article", "headline": "Divorce in %s: A Financial Guide" % g.get('title_name', name),
           "description": g['desc'], "about": g['about'], "inLanguage": "en",
           "isPartOf": {"@id": "https://thedivorceangels.com/#website"}, "publisher": {"@id": "https://thedivorceangels.com/#organization"},
           "author": {"@id": "https://thedivorceangels.com/#organization"}, "dateModified": "2026-10-10", "mainEntityOfPage": url}
    faq = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in g['faqs']]}
    crumb = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://thedivorceangels.com/"},
        {"@type": "ListItem", "position": 2, "name": "Divorce in %s: A Financial Guide" % g.get('title_name', name), "item": url}]}
    def swap_ld(t, label, obj):
        pat = r'(<!-- =+ JSON-LD BLOCK \d: %s =+ -->\s*<script type="application/ld\+json">)\s*.*?(</script>)' % label
        new, n = re.subn(pat, lambda m: m.group(1) + '\n' + json.dumps(obj, indent=2, ensure_ascii=False) + '\n' + m.group(2), t, count=1, flags=re.S)
        assert n == 1, label
        return new
    t = swap_ld(t, 'ARTICLE', art); t = swap_ld(t, 'FAQ PAGE', faq); t = swap_ld(t, 'BREADCRUMB', crumb)
    # hero + main
    hero = '''<header class="hero">
  <div class="wrap">
    <div class="breadcrumb"><a href="https://thedivorceangels.com/">Home</a> &nbsp;›&nbsp; %s Divorce Financial Guide</div>
    <div class="eyebrow">%s</div>
    <h1>Divorce in %s:<br>What It Means for Your <span class="brand-italic">Finances</span></h1>
    <p class="lede">%s</p>
    <p class="updated">%s Updated October 2026. General financial guidance, not legal advice.</p>
  </div>
</header>''' % (name, g.get('eyebrow', name), g.get('title_name', name), g['lede'], g['reviewed'])
    body = ['<main>\n  <div class="wrap">\n', '    <p>%s</p>\n' % g['intro'],
            '    <div class="callout">\n      <div class="label">The short version</div>\n      <p>%s</p>\n    </div>\n' % g['short']]
    for item in g['sections']:
        kind = item[0]
        if kind == 'h2': body.append('\n    <h2>%s</h2>\n' % item[1])
        elif kind == 'h3': body.append('    <h3>%s</h3>\n' % item[1])
        elif kind == 'p': body.append('    <p>%s</p>\n' % item[1])
        elif kind == 'ul': body.append('    <ul>\n' + ''.join('      <li>%s</li>\n' % x for x in item[1]) + '    </ul>\n')
        elif kind == 'callout': body.append('\n    <div class="callout">\n      <div class="label">%s</div>\n      <p>%s</p>\n    </div>\n' % (item[1], item[2]))
    body.append('\n    <div class="keyfacts">\n      <h3>%s divorce finance, at a glance</h3>\n      <table class="facts">\n' % name)
    body += ['        <tr><th>%s</th><td>%s</td></tr>\n' % r for r in g['glance']]
    body.append('      </table>\n    </div>\n\n    <h2>Questions worth asking before you negotiate</h2>\n    <ul>\n')
    body += ['      <li>%s</li>\n' % q for q in g['questions']]
    body.append('    </ul>\n\n    <h2>%s divorce: common questions</h2>\n    <div class="faq">\n' % name)
    body += ['      <details>\n        <summary>%s</summary>\n        <p>%s</p>\n      </details>\n' % (q, a) for q, a in g['faqs']]
    body.append('''    </div>

    <!-- ========== MID-PAGE CTA ========== -->
    <div class="cta">
      <h2>See your %s numbers before you decide</h2>
      <p><span class="brand-italic" style="color:#fff;">Your Divorce Angel</span> builds your complete financial picture, models settlement scenarios against %s rules, and prepares you for every negotiation, so you walk in knowing exactly what you are giving up and what you are keeping.</p>
      <a class="btn" href="https://app.thedivorceangels.com">Start with clarity →</a>
      <p class="trust">🔒 Your data is encrypted and never sold or shared with third parties.</p>
    </div>

    <p class="disclaimer">%s</p>
  </div>
</main>''' % (name, g.get('possessive', name + "'s"), g['disclaimer']))
    a = t.index('<!-- ========== HERO ========== -->'); b = t.index('</main>') + len('</main>')
    t = t[:a] + '<!-- ========== HERO ========== -->\n' + hero + '\n\n<!-- ========== MAIN ========== -->\n' + ''.join(body) + t[b:]
    if TN not in name:
        assert TN not in t.replace(tpl + '-divorce-guide', ''), [t[m.start()-60:m.start()+20] for m in re.finditer(TN, t)][:3]
    out = os.path.join(ROOT, g['slug'] + '-divorce-guide', 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(t)
    words = len(strip(''.join(body)).split())
    return out, words

if __name__ == '__main__':
    spec = importlib.util.spec_from_file_location('c', sys.argv[1]); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    for g in m.GUIDES:
        print(*build(g))
