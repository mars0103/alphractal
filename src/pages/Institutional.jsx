import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import GlowButton from '../components/GlowButton.jsx'
import CountUp from '../components/CountUp.jsx'
import { Section } from '../components/PageBlocks.jsx'
import FinalCta from '../sections/FinalCta.jsx'

/* Allium-style structure (Understand / Operationalize / Build), by team. Dry tone: mono numbers, no decorative charts. */
export default function Institutional() {
  const { t } = useI18n()
  const p = t.pages.institutional
  const c = t.pages.common
  useMeta({ title: `${t.nav.institutional} · Alphractal`, description: p.sub })

  const numbers = (
    <div className="vpanel inum">
      <span className="ring ring--dark" aria-hidden="true" />
      <ul>
        {p.numbers.map((n) => (
          <li key={n.label}>
            <b className="inum__v display">
              <CountUp value={n.value} suffix={n.suffix} />
            </b>
            <span className="mono">{n.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <PageShell>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        sub={p.sub}
        visual={numbers}
        actions={
          <>
            <GlowButton href={LINKS.sales}>{p.primary}</GlowButton>
            <a className="link-arrow phero__more" href="#tiers">
              {p.secondary} <span>→</span>
            </a>
          </>
        }
      />

      <Section id="structure">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {p.structureEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {p.structureTitle}
            </h2>
          </div>
          <div className="pillars" data-stagger>
            {p.columns.map((col, i) => (
              <article className="pillar" data-item key={col.key}>
                <span className="ring ring--soft" aria-hidden="true" />
                <span className="pillar__n mono">{String(i + 1).padStart(2, '0')}</span>
                <h3>{col.title}</h3>
                <p className="pillar__who mono">{col.who}</p>
                <ul>
                  {col.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="tiers" dark>
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {p.tiersEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {p.tiersTitle}
            </h2>
          </div>
          <ul className="tiers" data-stagger>
            {p.tiers.map((tier) => (
              <li className="tier" data-item key={tier.name}>
                <span className="mono">{tier.name}</span>
                <b className="display num">
                  {tier.price}
                  <small>{tier.per}</small>
                </b>
              </li>
            ))}
          </ul>
          <p className="tiers__note mono" data-reveal="fade">
            {p.tiersNote}
          </p>
        </div>
      </Section>

      <Section id="trust">
        <div className="container">
          <p className="eyebrow" data-reveal="fade">
            {p.trustEyebrow}
          </p>
          <ul className="tfacts" data-stagger>
            {p.trust.map(([k, v]) => (
              <li data-item key={k}>
                <h3>{k}</h3>
                <p>{v}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta
        title={p.ctaTitle}
        sub={p.ctaSub}
        primary={p.primary}
        primaryHref={LINKS.sales}
        secondary={c.startFree}
        secondaryTo="/"
      />
    </PageShell>
  )
}
