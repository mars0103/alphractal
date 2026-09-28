import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'

/* Deliberately quiet: no hype motion, no screenshot, static badge, no countdown (moodboard §06.08). */
export default function TerminalTeaser() {
  const { t } = useI18n()
  const c = t.terminal

  return (
    <section className="section terminal" data-nav-theme="paper" id="terminal">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="container terminal__grid">
        <div>
          <span className="badge mono" data-reveal="fade">
            {c.badge}
          </span>
          <h2 className="h2 terminal__title" data-reveal="lines">
            {c.title}
          </h2>
        </div>
        <div className="terminal__copy" data-reveal="fade" data-delay="0.1">
          {c.body.map((p, i) => (
            <p className={i ? 'terminal__note' : 'lede'} key={p}>
              {p}
            </p>
          ))}
          <Link className="btn btn--ink" to="/terminal">
            {c.cta}
          </Link>
          <p className="terminal__legal mono">{c.disclaimer}</p>
        </div>
      </div>
    </section>
  )
}
