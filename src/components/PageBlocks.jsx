import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import CountUp from './CountUp.jsx'
import MiniViz from './MiniViz.jsx'

/* A ruled section opener */
export function Section({ id, dark = false, theme, children, className = '' }) {
  return (
    <section
      id={id}
      className={`section ${dark ? 'section--dark' : ''} ${className}`}
      data-nav-theme={theme || (dark ? 'dark' : 'paper')}
    >
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      {children}
    </section>
  )
}

/* Problem: two columns, the claim on the left and the plain explanation on the right */
export function Problem({ eyebrow, title, text }) {
  return (
    <Section id="problem">
      <div className="container split split--even">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <div className="problem__text" data-stagger>
          {text.map((p, i) => (
            <p key={p} className={i ? 'problem__p' : 'lede'} data-item>
              {p}
            </p>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* How it works: 3–4 ruled blocks, each with its own small looping picture */
export function Steps({ eyebrow, title, steps, kinds }) {
  return (
    <Section id="how">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <div className={`steps steps--${steps.length}`} data-stagger>
          {steps.map((s, i) => (
            <div className="step" data-item key={s.title}>
              <span className="ring ring--soft step__ring" aria-hidden="true" />
              <div className="step__viz">
                <MiniViz kind={kinds[i]} />
              </div>
              <span className="step__n mono">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* What you get: numbered, specific rows */
export function Gains({ eyebrow, title, items }) {
  return (
    <Section id="gains">
      <div className="container split split--even split--top">
        <div className="section__head gains__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <ul className="gains" data-stagger>
          {items.map((g, i) => (
            <li className="gain" data-item key={g.title}>
              <span className="gain__n mono">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* Proof: one number, one sentence, optionally a real quote. Dark band. */
export function ProofBand({ eyebrow, big, big2, label, text, quote, quoteBy, legal }) {
  const numeric = /^(\d+)(%?)$/.exec(big || '')
  return (
    <Section id="proof" dark>
      <div className="container proofband">
        <p className="eyebrow" data-reveal="fade">
          {eyebrow}
        </p>
        <div className="proofband__grid">
          <div>
            <p className="proofband__big display" data-reveal="up">
              {numeric ? <CountUp value={Number(numeric[1])} suffix={numeric[2]} /> : big}
              {big2 && <span>{big2}</span>}
            </p>
            {label && (
              <p className="proofband__label mono" data-reveal="fade" data-delay="0.15">
                {label}
              </p>
            )}
          </div>
          <div className="proofband__text" data-reveal="up" data-delay="0.15">
            {text && <p className="lede">{text}</p>}
            {quote && (
              <figure className="proofband__quote">
                <blockquote lang="en">{quote}</blockquote>
                <figcaption className="mono">{quoteBy}</figcaption>
              </figure>
            )}
          </div>
        </div>
        {legal && (
          <p className="proofband__legal mono" data-reveal="fade">
            {legal}
          </p>
        )}
      </div>
    </Section>
  )
}

/* Related: 2–3 neighbouring features */
export function Related({ keys, eyebrow, title }) {
  const { t } = useI18n()
  const rows = t.pages.hub.rows.filter((r) => keys.includes(r.key))
  return (
    <Section id="related">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <div className={`rel rel--${rows.length}`} data-stagger>
          {rows.map((r) => (
            <Link to={r.to} className="rel__card" data-item key={r.key}>
              <span className="ring ring--soft" aria-hidden="true" />
              <h3>{r.title}</h3>
              <p>{r.text}</p>
              <span className="link-arrow">
                {t.pages.common.explore} <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  )
}
