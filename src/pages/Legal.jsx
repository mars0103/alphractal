import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import PageShell from '../components/PageShell.jsx'
import legal from '../content/legal.json'

/* Privacy Policy and Terms of Service, migrated word for word from the live site (scripts/migrate-content.mjs). */
export default function Legal({ kind }) {
  const { t } = useI18n()
  const l = t.pages.legal
  const doc = legal[kind]

  useMeta({ title: `${doc.title} · Alphractal`, description: l[kind].meta })

  // Number the h2 anchors and split off the "Last updated" line
  const { html, toc, updated } = useMemo(() => {
    const toc = []
    let n = 0
    const html = doc.html.replace(/<h2>(.*?)<\/h2>/g, (_, text) => {
      const id = `s${++n}`
      toc.push({ id, text: text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'") })
      return `<h2 id="${id}">${text}</h2>`
    })
    const m = /^<p>(Last updated:[^<]*)<\/p>/.exec(html)
    return { html: m ? html.slice(m[0].length) : html, toc, updated: m ? m[1] : '' }
  }, [doc])

  return (
    <PageShell>
      <section className="legal" data-nav-theme="paper">
        <div className="container legal__grid">
          <aside className="legal__toc" aria-label={l.contents}>
            <p className="eyebrow">{l.contents}</p>
            <ol>
              {toc.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.text}</a>
                </li>
              ))}
            </ol>
          </aside>
          <article className="legal__doc">
            <p className="eyebrow">{l.updated}</p>
            <h1 className="display legal__title">{doc.title}</h1>
            <p className="legal__updated mono">{updated}</p>
            {l.langNote && <p className="legal__note">{l.langNote}</p>}
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </div>
      </section>
    </PageShell>
  )
}
