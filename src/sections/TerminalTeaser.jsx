import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import TerminalPreview from '../components/TerminalPreview.jsx'

/* The copy stays quiet (no countdown, no urgency); the terminal under it is a working
   preview, marked testnet, that never sends anything. Same component as /terminal. */
export default function TerminalTeaser() {
  const { t } = useI18n()
  const c = t.terminal

  return (
    <section className="section section--dark terminal terminal--live" data-nav-theme="dark" id="terminal">
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
          <Link className="btn btn--blue" to="/terminal">
            {c.cta}
          </Link>
          <p className="terminal__legal mono">{c.disclaimer}</p>
        </div>
      </div>
      <div className="container terminal__live" data-reveal="up">
        <TerminalPreview />
      </div>
    </section>
  )
}
