import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'

export default function Soon() {
  const { t } = useI18n()
  useMeta({ title: 'Alphractal', noindex: true })
  return (
    <section className="soon" data-nav-theme="paper">
      <div className="container soon__inner">
        <p className="eyebrow">{t.soon.eyebrow}</p>
        <h1 className="display">{t.soon.title}</h1>
        <p className="lede">{t.soon.text}</p>
        <Link className="btn btn--ink" to="/">
          {t.soon.back}
        </Link>
      </div>
    </section>
  )
}
