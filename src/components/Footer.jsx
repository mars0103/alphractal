import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LINKS } from '../lib/facts.js'

export default function Footer() {
  const { t } = useI18n()
  const f = t.footer

  return (
    <footer className="footer" data-nav-theme="dark">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img src="/brand/logo-full.svg" alt="Alphractal" width="220" height="48" />
          <p>{f.tagline}</p>
          <div className="footer__social">
            <a href={LINKS.x} rel="noopener noreferrer">
              X
            </a>
            <a href={LINKS.telegram} rel="noopener noreferrer">
              Telegram
            </a>
            <a href={LINKS.linkedin} rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
        {f.cols.map((col) => (
          <nav key={col.title} className="footer__col" aria-label={col.title}>
            <h2 className="eyebrow">{col.title}</h2>
            <ul>
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container footer__base">
        <span>{f.rights}</span>
        <span className="footer__legal">
          {f.legal.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </span>
        <span>{f.disclaimer}</span>
      </div>
    </footer>
  )
}
