import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS, SOLUTION_LINKS } from '../lib/facts.js'
import { MEDIA_LOGOS } from '../lib/media-logos.js'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import Aurora from '../components/Aurora.jsx'
import GlowButton from '../components/GlowButton.jsx'
import Accordion from '../components/Accordion.jsx'
import { Section } from '../components/PageBlocks.jsx'
import Icon from '../components/preview/Icon.jsx'
import { Skyline, RegimeScene, TerminalScene, ReportScene } from '../components/visuals/InstitutionalVisuals.jsx'
import FinalCta from '../sections/FinalCta.jsx'

const SCENES = { 'alpha-intelligence': RegimeScene, 'terminal-intelligence': TerminalScene, research: ReportScene }
const SCENE_KEY = { 'alpha-intelligence': 'regime', 'terminal-intelligence': 'terminal', research: 'report' }
const SUPPORT_ICONS = ['users', 'chat', 'layers', 'shield']

/* Three wide rows, alternating: copy / visual, visual / copy, copy / visual. In the DOM the copy always comes first (reading
   order); the flipped row swaps sides with CSS only. Each CTA opens the solution's own form (provisional destination, see
   SOLUTION_LINKS in lib/facts.js, TODO(links review)). */
function Solutions({ p }) {
  return (
    <div id="solutions">
      <header className="inst-dark">
        <Aurora colorStops={['#0a1470', '#1a35d0', '#0a1470']} amplitude={1.2} blend={1} height={0.22} speed={0.7} glow={0.45} brightness={0.85} opacity={0.9} layers={2} direction="top" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div className="container inst-dark__head">
          <p className="eyebrow" data-reveal="fade">
            {p.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {p.title}
          </h2>
        </div>
      </header>
      <Section rule={false} className="inst-solutions">
      <div className="container">
        <div className="inst-sols">
          {p.items.map((it, i) => {
            const Scene = SCENES[it.key]
            return (
              <article className={`inst-sol${i % 2 ? ' inst-sol--flip' : ''}`} key={it.key}>
                <div className="inst-sol__copy" data-reveal="up">
                  <p className="eyebrow inst-sol__name">
                    {it.name}
                    {it.soon && <span className="inst-sol__soon">{it.soon}</span>}
                  </p>
                  <h3 className="inst-sol__title">{it.title}</h3>
                  <p className="inst-sol__text">{it.text}</p>
                  {it.support && <p className="inst-sol__support">{it.support}</p>}
                  {it.badge && (
                    <div className="inst-sol__trust">
                      <img className="inst-oranje" src="/brand/oranjebtc.svg" alt="OranjeBTC" width="657" height="199" />
                      <p className="inst-sol__badge">
                        <strong>{it.badge}</strong>
                        <span>{it.badgeNote}</span>
                      </p>
                    </div>
                  )}
                  <a className="link-arrow inst-sol__cta" href={SOLUTION_LINKS[it.key]}>
                    {p.cta} <span>→</span>
                  </a>
                </div>
                <div className="inst-sol__viz">
                  <Scene t={p.viz[SCENE_KEY[it.key]]} />
                </div>
              </article>
            )
          })}
        </div>
      </div>
      </Section>
    </div>
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
      {/* the skyline is the hero's backdrop: behind the blue gradient and behind the copy */}
      <PageHero
        eyebrow={p.eyebrow}
        title={p.hero.title}
        sub={p.hero.sub}
        actions={<GlowButton href={LINKS.sales}>{p.hero.cta}</GlowButton>}
        backdrop={<Skyline />}
        grid={false}
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
      <Support p={{ ...p.support, cta: p.hero.cta }} />

      <section id="proof" className="inst-trust" data-nav-theme="dark">
        <div className="container inst-trust__in">
          <h2 className="inst-trust__label" data-reveal="fade">
            {p.proof.eyebrow}
          </h2>
          <p className="inst-trust__line" data-reveal="fade" data-delay="0.1">
            {p.proof.statement}
          </p>
        </div>
      </section>

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
