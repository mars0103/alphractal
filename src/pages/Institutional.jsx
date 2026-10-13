import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import { MEDIA_LOGOS } from '../lib/media-logos.js'
import { gsap, MQ } from '../lib/gsap.js'
import BorderGlow from '../components/BorderGlow.jsx'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import GlowButton from '../components/GlowButton.jsx'
import Accordion from '../components/Accordion.jsx'
import { Section } from '../components/PageBlocks.jsx'
import Icon from '../components/preview/Icon.jsx'
import { RegimeViz, TerminalViz, ReportCoverViz } from '../components/visuals/InstitutionalVisuals.jsx'
import FinalCta from '../sections/FinalCta.jsx'

// Real product screens (cropped from the app) paired with each technical area.
const SHOTS = {
  domains: '/product/data-screeners.webp',
  ai: '/product/alpha-ai-answer.webp',
  report: '/product/research.webp',
}
const SOLUTION_VIZ = { 'alpha-intelligence': RegimeViz, 'terminal-intelligence': TerminalViz, research: ReportCoverViz }
const SOLUTION_VIZ_KEY = { 'alpha-intelligence': 'regime', 'terminal-intelligence': 'terminal', research: 'report' }
const SUPPORT_ICONS = ['users', 'chat', 'layers', 'shield']

/* Each solution card links to the closest real page — neither Alpha Intelligence nor the
   terminal-partner offering has its own route yet, so they point at the platform hub and the
   Alpha Terminal page respectively (brief: use real destinations, never invent a URL). */
function Solutions({ p }) {
  return (
    <Section id="solutions">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {p.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {p.title}
          </h2>
        </div>
        <div className="inst-cards" data-stagger>
          {p.items.map((it) => {
            const Viz = SOLUTION_VIZ[it.key]
            return (
              <article className="inst-card" data-item key={it.key}>
                <span className="ring ring--soft" aria-hidden="true" />
                <p className="eyebrow inst-card__name">{it.name}</p>
                <h3>{it.title}</h3>
                <p className="inst-card__text">{it.text}</p>
                {it.support && <p className="inst-card__support">{it.support}</p>}
                {it.badge && (
                  <p className="inst-card__badge">
                    <strong>{it.badge}</strong>
                    <span>{it.badgeNote}</span>
                  </p>
                )}
                {Viz && (
                  <div className="inst-card__viz">
                    <Viz t={p.viz[SOLUTION_VIZ_KEY[it.key]]} />
                  </div>
                )}
                <Link to={it.to} className="link-arrow inst-card__cta">
                  {p.cta} <span>→</span>
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/* Three technical areas, each an accordion row paired with the matching product visual —
   open one, the panel on the right swaps to it. Reuses the .faq__* look (see Accordion.jsx /
   Faq.jsx) but stays a local component: the content here is a list of sub-rows per area, not
   a single string answer, so it can't go through the shared Accordion as-is. */
function Areas({ p }) {
  const root = useRef(null)
  const [open, setOpen] = useState(0)

  const toggle = (i) => {
    const reduce = window.matchMedia(MQ.reduced).matches
    const panels = root.current.querySelectorAll('.faq__a')
    const next = open === i ? open : i // one area always stays expanded, like the CryptoQuant reference
    panels.forEach((el, k) => {
      gsap.killTweensOf(el)
      gsap.to(el, { height: k === next ? 'auto' : 0, duration: reduce ? 0 : 0.6, ease: 'power3.inOut' })
    })
    setOpen(next)
  }

  return (
    <Section id="areas">
      <div className="container inst-areas">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {p.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {p.title}
          </h2>
        </div>
        <div className="inst-areas__grid">
          <ul ref={root} className="faq__list inst-areas__list" data-reveal="up">
            {p.items.map((area, i) => (
              <li className={`faq__item ${open === i ? 'is-open' : ''}`} key={area.q}>
                <h3>
                  <button type="button" className="faq__q" aria-expanded={open === i} onClick={() => toggle(i)}>
                    <span>{area.q}</span>
                    <i aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq__a" style={{ height: i === 0 ? 'auto' : 0 }} aria-hidden={open !== i}>
                  <p className="inst-areas__lede">{area.lede}</p>
                  <dl className="inst-rows">
                    {area.rows.map(([k, v]) => (
                      <div className="inst-row" key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {area.note && <p className="inst-areas__note mono">{area.note}</p>}
                </div>
              </li>
            ))}
          </ul>
          <div className="inst-areas__viz" data-reveal="up" data-delay="0.15">
            <figure className="inst-shot">
              <span className="inst-shot__glow" aria-hidden="true" />
              <div className="inst-shot__frame">
                <div className="inst-shot__bar" aria-hidden="true">
                  <span className="inst-shot__dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="inst-shot__url">app.alphractal.com</span>
                  <span />
                </div>
                <div className="inst-shot__stage">
                  {p.items.map((area, i) => (
                    <img
                      key={area.viz}
                      className={`inst-shot__img${open === i ? ' is-on' : ''}`}
                      src={SHOTS[area.viz]}
                      alt={open === i ? area.q : ''}
                      aria-hidden={open !== i}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Support({ p }) {
  return (
    <Section id="support">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {p.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {p.title}
          </h2>
          <p className="lede">{p.sub}</p>
        </div>
        <ul className="inst-support" data-stagger>
          {p.items.map(([k, v], i) => (
            <li className="inst-support__item" data-item key={k}>
              <span className="inst-support__icon">
                <Icon name={SUPPORT_ICONS[i]} />
              </span>
              <h3>{k}</h3>
              <p>{v}</p>
            </li>
          ))}
        </ul>
        <GlowButton href={LINKS.sales} className="inst-support__cta">
          {p.cta}
        </GlowButton>
      </div>
    </Section>
  )
}

export default function Institutional() {
  const { t } = useI18n()
  const p = t.pages.institutional
  useMeta({ title: `${t.nav.institutional} · Alphractal`, description: p.hero.sub })
  const mediaNames = [...p.media.primary, ...p.media.secondary].filter((n) => MEDIA_LOGOS[n])

  return (
    <PageShell>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.hero.title}
        sub={p.hero.sub}
        actions={<GlowButton href={LINKS.sales}>{p.hero.cta}</GlowButton>}
      />

      <Section id="media">
        <div className="container">
          <p className="inst-media__title mono" data-reveal="fade">
            {p.media.title}
          </p>
        </div>
        <div className="inst-marquee" data-reveal="fade">
          <ul className="inst-marquee__track">
            {[...mediaNames, ...mediaNames].map((name, i) => {
              const logo = MEDIA_LOGOS[name]
              return (
                <li className="inst-marquee__logo" key={`${name}-${i}`} aria-hidden={i >= mediaNames.length ? 'true' : undefined}>
                  <img src={logo.src} alt={i < mediaNames.length ? name : ''} width={Math.round(logo.w * 1.2)} height={Math.round(logo.h * 1.2)} />
                </li>
              )
            })}
          </ul>
        </div>
      </Section>

      <Solutions p={p.solutions} />
      <Areas p={p.areas} />
      <Support p={{ ...p.support, cta: p.hero.cta }} />

      <Section id="proof" dark>
        <div className="container inst-proof">
          <p className="eyebrow" data-reveal="fade">
            {p.proof.eyebrow}
          </p>
          <p className="inst-proof__statement h2" data-reveal="lines">
            {p.proof.statement}
          </p>
        </div>
      </Section>

      <Section id="faq">
        <div className="container faq__grid">
          <div className="section__head faq__head">
            <p className="eyebrow" data-reveal="fade">
              {p.faqEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {p.faqTitle}
            </h2>
          </div>
          <Accordion items={p.faq} idPrefix="inst-faq" />
        </div>
      </Section>

      <FinalCta title={p.ctaTitle} sub={p.ctaSub} primary={p.hero.cta} primaryHref={LINKS.sales} secondaryTo="/" />
    </PageShell>
  )
}
