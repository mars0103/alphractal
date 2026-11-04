import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import PageShell from '../components/PageShell.jsx'
import TechText from '../components/TechText.jsx'
import '../styles/p-terminal.css'

/*
 * Waitlist page: one dark, immersive screen (hero only) and the footer. The wordmark is the React Bits
 * "Tech Text" (letters turn into dashed vector paths under the cursor); the full title stays in the h1 for
 * readers and crawlers. Nothing here implies the terminal executes orders.
 */
export default function Terminal() {
  const { t } = useI18n()
  const p = t.pages.terminal
  useMeta({ title: 'Alpha Terminal · Alphractal', description: `${p.sub} ${p.body[0]}` })

  return (
    <PageShell className="terminal-page">
      <section className="tterm" data-nav-theme="dark">
        <div className="tterm__bg" aria-hidden="true">
          <i className="tterm__glow tterm__glow--a" />
          <i className="tterm__glow tterm__glow--b" />
          <i className="tterm__grid" />
          <i className="tterm__dots" />
        </div>
        <div className="container tterm__inner">
          <h1 className="tterm__h1">
            <span className="tterm__sr">{p.title}</span>
            <span className="tterm__word" aria-hidden="true">
              <TechText
                text={p.wordmark}
                fontFamily="'Albert Sans Variable', 'Albert Sans', system-ui, sans-serif"
                fontWeight={600}
                fontSize={220}
                letterSpacing={-0.045}
                color="#ffffff"
                accentColor="#4b6bff"
                align="left"
                labels={false}
                guides={false}
                specks={10}
                reach={170}
              />
            </span>
            <span className="tterm__tag" aria-hidden="true">
              {p.tagline}
            </span>
          </h1>
          <div className="tterm__copy">
            <p className="tterm__sub">{p.sub}</p>
            {p.body.map((b) => (
              <p className="tterm__p" key={b}>
                {b}
              </p>
            ))}
            <p className="tterm__promise">{p.promise}</p>
            <a className="btn tterm__btn" href={LINKS.waitlist}>
              {p.cta}
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
