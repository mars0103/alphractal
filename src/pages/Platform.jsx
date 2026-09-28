import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import PageShell from '../components/PageShell.jsx'
import GradientWaves from '../components/GradientWaves.jsx'
import HeroGrid from '../components/HeroGrid.jsx'
import GlowButton from '../components/GlowButton.jsx'
import { Section } from '../components/PageBlocks.jsx'
import MiniViz from '../components/MiniViz.jsx'
import FinalCta from '../sections/FinalCta.jsx'

const PREVIEW = { metrics: 'screen', 'alpha-ai': 'stream', mcp: 'lock', api: 'bars', dashboards: 'grid', macro: 'axis', research: 'livechart' }

/* Hub: centred hero like the home, then seven rows you can hover. */
export default function Platform() {
  const { t } = useI18n()
  const p = t.pages.hub
  const c = t.pages.common
  const hero = useRef(null)
  useMeta({ title: `${p.eyebrow[0]}${p.eyebrow.slice(1).toLowerCase()} · Alphractal`, description: p.sub })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from(hero.current.querySelectorAll('.hero__title .mask__in'), { yPercent: 118, duration: 1.3, stagger: 0.13 }, 0.3)
          .from(hero.current.querySelectorAll('.hero__sub, .hero__cta > *'), { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.8)
      })
      return () => mm.revert()
    },
    { scope: hero },
  )

  return (
    <PageShell>
      <section ref={hero} className="hero hero--hub" data-nav-theme="dark">
        <HeroGrid />
        <GradientWaves scrollTrigger={hero} />
        <div className="hero__grain" aria-hidden="true" />
        <div className="container hero__frame">
          <div className="hero__stack">
            <p className="eyebrow">{p.eyebrow}</p>
            <h1 className="display hero__title">
              {p.title.map((l) => (
                <span className="mask" key={l}>
                  <span className="mask__in">{l}</span>
                </span>
              ))}
            </h1>
            <p className="hero__sub">{p.sub}</p>
            <div className="hero__cta">
              <GlowButton href={LINKS.start}>{c.startFree}</GlowButton>
              <span className="hero__note">{c.noCard}</span>
            </div>
          </div>
        </div>
      </section>

      <Section id="resources">
        <div className="container">
          <p className="eyebrow" data-reveal="fade">
            {p.listEyebrow}
          </p>
          <ul className="hubrows" data-stagger>
            {p.rows.map((r, i) => (
              <li data-item key={r.key}>
                <Link to={r.to} className="hubrow">
                  <span className="hubrow__n mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="hubrow__t">
                    <h3>{r.title}</h3>
                    <p>{r.text}</p>
                  </span>
                  <span className="hubrow__viz">
                    <MiniViz kind={PREVIEW[r.key]} />
                  </span>
                  <span className="hubrow__go" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/terminal" className="hubterm" data-reveal="up">
            <span className="ring ring--soft" aria-hidden="true" />
            <span className="badge mono">{p.terminalEyebrow}</span>
            <h3>{p.terminalTitle}</h3>
            <p>{p.terminalText}</p>
            <span className="link-arrow">
              {c.explore} <span>→</span>
            </span>
          </Link>
        </div>
      </Section>

      <FinalCta title={c.ctaTitle} sub={c.ctaSub} primary={c.startFree} secondary={c.seePlatform} secondaryTo="/" />
    </PageShell>
  )
}
