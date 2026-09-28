import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import PageShell from '../components/PageShell.jsx'
import { Section } from '../components/PageBlocks.jsx'

/*
 * Deliberately still (moodboard §07): no screenshot, no mock, no countdown, no urgency, no reveal choreography.
 * The roadmap disclaimer is mandatory and verbatim (brief §5.5).
 */
export default function Terminal() {
  const { t } = useI18n()
  const p = t.pages.terminal
  useMeta({ title: 'Alpha Terminal · Alphractal', description: p.body[0] })

  return (
    <PageShell className="terminal-page">
      <section className="tpage" data-nav-theme="paper">
        <div className="container tpage__grid">
          <div>
            <span className="badge mono">{p.eyebrow}</span>
            <h1 className="display tpage__title">{p.title}</h1>
          </div>
          <div className="tpage__copy">
            {p.body.map((b, i) => (
              <p className={i ? 'tpage__p' : 'lede'} key={b}>
                {b}
              </p>
            ))}
            <p className="tpage__promise">{p.promise}</p>
            <dl className="tpage__status mono">
              <dt>{p.status}</dt>
              <dd>{p.statusValue}</dd>
            </dl>
            <a className="btn btn--ink" href={LINKS.waitlist}>
              {p.cta}
            </a>
            <p className="terminal__legal mono">{p.disclaimer}</p>
          </div>
        </div>
      </section>

      <Section id="what">
        <div className="container">
          <p className="eyebrow">{p.factsTitle}</p>
          <ul className="tfacts">
            {p.facts.map(([k, v]) => (
              <li key={k}>
                <h3>{k}</h3>
                <p>{v}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="direction">
        <div className="container split split--even split--top">
          <div>
            <p className="eyebrow">{p.directionEyebrow}</p>
            <span className="badge mono tpage__tag">{p.directionTag}</span>
          </div>
          <p className="lede tpage__dir">{p.direction}</p>
        </div>
      </Section>
    </PageShell>
  )
}
