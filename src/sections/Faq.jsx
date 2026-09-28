import { useI18n } from '../i18n/I18nProvider.jsx'
import Accordion from '../components/Accordion.jsx'

/* Simple accordion (moodboard §06.09): height tween, no gradient icons. */
export default function Faq() {
  const { t } = useI18n()
  const f = t.faq

  return (
    <section className="section faq" data-nav-theme="paper" id="faq">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="container faq__grid">
        <div className="section__head faq__head">
          <p className="eyebrow" data-reveal="fade">
            {f.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {f.title}
          </h2>
        </div>
        <Accordion items={f.items} idPrefix="faq" />
      </div>
    </section>
  )
}
