import { useRef } from 'react'
import { gsap, MQ, useGSAP } from '../../lib/gsap.js'

/*
 * Page transition, white over dark. Place it right between a dark section and the white one that follows. A white sheet with
 * rounded top corners rises over the bottom of the dark section while the visitor scrolls, and stops where the scroll stops
 * (scrubbed, so it also goes back). Under prefers-reduced-motion the sheet is simply in place.
 * The dark section above needs ~120px of bottom padding so the sheet never covers its content.
 */
export default function WhiteWipe({ tone = 'var(--paper)' }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const sheet = root.current.querySelector('.hf-wipe__sheet')
        gsap.fromTo(
          sheet,
          { yPercent: 100 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 58%', scrub: 0.5 },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className="hf-wipe" aria-hidden="true" style={{ '--tone': tone }}>
      <div className="hf-wipe__sheet" />
    </div>
  )
}
