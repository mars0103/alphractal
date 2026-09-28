"""One-off wiring: routes for the new pages and per-page metadata. Run from the site folder."""
import re

def rw(path, fn):
    s = open(path, encoding='utf-8').read()
    s2 = fn(s)
    open(path, 'w', encoding='utf-8').write(s2)

# styles + routes
rw('src/main.jsx', lambda s: s.replace("import './styles/pages.css'\n", "import './styles/pages.css'\nimport './styles/content.css'\n"))
rw('src/App.jsx', lambda s: s
   .replace("import Vs from './pages/Vs.jsx'\n", "import Vs from './pages/Vs.jsx'\nimport Legal from './pages/Legal.jsx'\nimport Blog from './pages/Blog.jsx'\nimport Post from './pages/Post.jsx'\n")
   .replace('          <Route path="/vs/:slug" element={<Vs />} />\n',
            '          <Route path="/vs/:slug" element={<Vs />} />\n'
            '          <Route path="/privacy" element={<Legal kind="privacy" />} />\n'
            '          <Route path="/terms" element={<Legal kind="terms" />} />\n'
            '          <Route path="/blog" element={<Blog />} />\n'
            '          <Route path="/blog/:slug" element={<Post />} />\n'))

IMPORT = "import { useI18n } from '../i18n/I18nProvider.jsx'"
HOOK = "import { useMeta } from '../hooks/useMeta.js'"

def add_meta(path, anchor, call):
    def fn(s):
        if 'useMeta' in s:
            return s
        s = s.replace(IMPORT, IMPORT + '\n' + HOOK, 1)
        assert anchor in s, (path, anchor)
        return s.replace(anchor, anchor + '\n' + call, 1)
    rw(path, fn)

rw('src/pages/Home.jsx', lambda s: s.replace('const { lang } = useI18n()', 'const { lang, t } = useI18n()', 1))
add_meta('src/pages/Home.jsx', 'const { lang, t } = useI18n()',
         "  useMeta({ title: `Alphractal — ${t.hero.title.join(' ')}`, description: t.hero.sub })")
add_meta('src/pages/Platform.jsx', 'const hero = useRef(null)',
         "  useMeta({ title: `${p.eyebrow[0]}${p.eyebrow.slice(1).toLowerCase()} · Alphractal`, description: p.sub })")
add_meta('src/pages/Feature.jsx', 'const f = t.pages.features[slug]',
         "  const row = t.pages.hub.rows.find((r) => r.key === slug)\n  useMeta({ title: `${row ? row.title : slug} · Alphractal`, description: f?.hero.sub })")
add_meta('src/pages/Terminal.jsx', 'const p = t.pages.terminal',
         "  useMeta({ title: 'Alpha Terminal · Alphractal', description: p.body[0] })")
add_meta('src/pages/Institutional.jsx', 'const c = t.pages.common',
         "  useMeta({ title: `${t.nav.institutional} · Alphractal`, description: p.sub })")
add_meta('src/pages/About.jsx', 'const c = t.pages.common',
         "  useMeta({ title: `${t.nav.about} · Alphractal`, description: p.body[0] })")
add_meta('src/pages/Pricing.jsx', 'const c = t.pages.common',
         "  useMeta({ title: `${t.nav.pricing} · Alphractal`, description: p.sub })")
add_meta('src/pages/Vs.jsx', 'const page = v.pages[slug]',
         "  useMeta({ title: page ? `${v.titleFn(page.name)} · Alphractal` : 'Alphractal', description: page?.sub })")
add_meta('src/pages/Soon.jsx', 'const { t } = useI18n()',
         "  useMeta({ title: 'Alphractal', noindex: true })")
print('wired')
