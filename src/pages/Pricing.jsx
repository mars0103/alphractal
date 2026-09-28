import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import GlowButton from '../components/GlowButton.jsx'
import { Section } from '../components/PageBlocks.jsx'
import FinalCta from '../sections/FinalCta.jsx'

const HREF = { start: LINKS.start, plans: LINKS.plans, sales: LINKS.sales }

/* What each plan includes. No paid price appears here: the app resolves it (brief §5.7, §7.1). */
export default function Pricing() {
  const { t } = useI18n()
  const p = t.pages.pricing
  const c = t.pages.common
  useMeta({ title: `${t.nav.pricing} · Alphractal`, description: p.sub })

  return (
    <PageShell>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        sub={p.sub}
        actions={
          <>
            <GlowButton href={LINKS.start}>{c.startFree}</GlowButton>
            <a className="link-arrow phero__more" href={LINKS.plans}>
              {p.seePricing} <span>→</span>
            </a>
          </>
        }
        note={c.noCard}
      />

      <Section id="plans">
        <div className="container">
          <ul className="plans" data-stagger>
            {p.plans.map((pl) => (
              <li className={`plan ${pl.featured ? 'plan--featured' : ''}`} data-item key={pl.key}>
                <span className="ring ring--soft" aria-hidden="true" />
                <span className="plan__name mono">{pl.name}</span>
                <b className="plan__price display">{pl.price}</b>
                <span className="plan__note">{pl.note}</span>
                <a className={`btn btn--sm ${pl.featured ? 'btn--blue' : 'btn--ink'}`} href={HREF[pl.href]}>
                  {pl.cta}
                </a>
              </li>
            ))}
          </ul>

          <h2 className="h2 plans__title" data-reveal="lines">
            {p.rowsTitle}
          </h2>
          <div className="matrix" data-reveal="up">
            <table>
              <thead>
                <tr>
                  {p.cols.map((col, i) => (
                    <th key={col + i} scope="col" className={`mono ${i === 2 ? 'is-pro' : ''}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.rows.map((r) => (
                  <tr key={r[0]}>
                    {r.map((cell, i) =>
                      i === 0 ? (
                        <th scope="row" key={i}>
                          {cell}
                        </th>
                      ) : (
                        <td key={i} className={i === 2 ? 'is-pro' : ''}>
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="plans__note mono" data-reveal="fade">
            {p.note}
          </p>
        </div>
      </Section>

      <FinalCta title={c.ctaTitle} sub={c.ctaSub} primary={c.startFree} secondary={c.seePlatform} />
    </PageShell>
  )
}
