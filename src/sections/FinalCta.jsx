import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LINKS } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import GradientWaves from '../components/GradientWaves.jsx'
import GlowButton from '../components/GlowButton.jsx'

/* Mirrors the hero to close the loop: the same gradient, flipped, paper → ink. Copy is overridable per page. */
export default function FinalCta({ title, sub, primary, primaryHref = LINKS.start, secondary, secondaryTo = '/platform' }) {
  const { t } = useI18n()
  const c = t.cta
  const lines = title || c.title
  const root = useRef(null)
  const gate = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => root.current.querySelector(s)
        const qa = (s) => gsap.utils.toArray(s, root.current)
        gsap
          .timeline({ scrollTrigger: { trigger: q('.cta__stack'), start: 'top 78%', once: true } })
          .from(qa('.cta .mask__in'), { yPercent: 118, duration: 1.3, stagger: 0.13, ease: 'power4.out' })
          .from(q('.cta__sub'), { autoAlpha: 0, y: 16, duration: 0.9 }, 0.6)
          .from(qa('.cta__actions > *'), { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.1 }, 0.8)
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [lines] },
  )

  return (
    <div ref={root} className="cta-wrap">
      <div className="cta__top" data-nav-theme="paper" />
      <section ref={gate} className="cta" data-nav-theme="dark" id="start">
        <div className="cta__flip">
          <GradientWaves interactive={false} scrollTrigger={gate} />
        </div>
        <div className="container cta__stack">
          <h2 className="display cta__title">
            {lines.map((line) => (
              <span className="mask" key={line}>
                <span className="mask__in">{line}</span>
              </span>
            ))}
          </h2>
          <p className="cta__sub">{sub || c.sub}</p>
          <div className="cta__actions">
            <GlowButton href={primaryHref}>{primary || c.primary}</GlowButton>
            {(secondary || !title) && (
              <Link to={secondaryTo} className="link-arrow">
                {secondary || c.secondary} <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
