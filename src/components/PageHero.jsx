import { useRef } from 'react'
import GradientWaves from './GradientWaves.jsx'
import HeroGrid from './HeroGrid.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'

/*
 * Hero for every inner page: same dark field, dot grid and gradient as the home, in a shorter frame.
 * Copy on the left, the page's own demo on the right. No pointer tilt or parallax (it read as templated); only the scroll drift stays. The numbered rail of sibling products that used to sit under the
 * copy is gone (Guia, Direção geral); product navigation lives in the header's Platform menu. A `rail` prop is ignored.
 */
export default function PageHero({ eyebrow, title, sub, actions, visual, backdrop, note, wide = false, centered = false, grid = true }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => root.current.querySelector(s)
        const rest = gsap.utils.toArray('.phero__sub, .phero__actions > *, .phero__note', root.current)
        const visual = q('.phero__visual')
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } }).from(q('.phero__eyebrow'), { autoAlpha: 0, y: 14, duration: 0.8 }, 0.3)
        if (rest.length) tl.from(rest, { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.09 }, 0.75)
        if (visual) tl.from(visual, { autoAlpha: 0, y: 40, scale: 0.97, duration: 1.3 }, 0.6)

        // Desktop only: the window drifts slower than the copy on scroll, and leans toward the pointer
        const dmm = gsap.matchMedia()
        dmm.add(MQ.desktop, () => {
          if (visual) {
            gsap.to(visual, {
              yPercent: -7,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
            })
          }
          gsap.to(q('.phero__copy'), {
            yPercent: 6,
            autoAlpha: 0.2,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: '35% top', end: 'bottom top', scrub: true },
          })
        })
        return () => dmm.revert()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className={`phero ${wide ? 'phero--wide' : ''} ${centered ? 'phero--center' : ''}`} data-nav-theme="dark">
      {/* first in the stack, so the blue gradient and the grain paint over it */}
      {backdrop && <div className="phero__backdrop">{backdrop}</div>}
      {grid && <HeroGrid />}
      <GradientWaves scrollTrigger={root} className="phero__waves" />
      <div className="hero__grain" aria-hidden="true" />
      <div className="container phero__grid">
        <div className="phero__copy">
          <p className="eyebrow phero__eyebrow">{eyebrow}</p>
          <h1 className="display phero__title" data-reveal="lines" data-delay="0.15">
            {title}
          </h1>
          {sub && <p className="phero__sub">{sub}</p>}
          {actions && <div className="phero__actions">{actions}</div>}
          {note && <p className="phero__note mono">{note}</p>}
        </div>
        {visual && (
          <div className="phero__visual">
            <div className="phero__tilt">{visual}</div>
          </div>
        )}
      </div>
    </section>
  )
}
