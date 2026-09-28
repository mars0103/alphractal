import { useI18n } from '../i18n/I18nProvider.jsx'
import CitationChat from '../components/CitationChat.jsx'

export default function Grounded() {
  const { t } = useI18n()
  const g = t.grounded

  return (
    <section className="section section--dark grounded" data-nav-theme="dark" id="grounded">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="container split">
        <div className="grounded__copy">
          <p className="eyebrow" data-reveal="fade">
            {g.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {g.title}
          </h2>
          <div className="grounded__body" data-stagger>
            {g.body.map((p) => (
              <p className="lede" data-item key={p}>
                {p}
              </p>
            ))}
          </div>
          <p className="grounded__legal mono" data-reveal="fade">
            {g.disclaimer}
          </p>
        </div>

        <div data-reveal="scale">
          <CitationChat />
        </div>
      </div>
    </section>
  )
}
