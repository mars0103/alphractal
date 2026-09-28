import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { FACTS } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'

/* The 152px band between the two full-bleed rules in the Figma (y 1171 → 1323). Numbers count up once. */
export default function Band() {
  const { t, num } = useI18n()
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.utils.toArray('[data-count]', root.current).forEach((el) => {
          const end = Number(el.dataset.count)
          const state = { v: 0 }
          el.textContent = num(0)
          gsap.to(state, {
            v: end,
            duration: 2.2,
            ease: 'power3.out',
            onUpdate: () => (el.textContent = num(Math.round(state.v))),
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [num] },
  )

  return (
    <section ref={root} className="band" data-nav-theme="paper" aria-label="Alphractal in numbers">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="container band__grid" data-stagger>
        {t.band.map((b) => (
          <div className="band__cell" data-item key={b.key}>
            <span className="band__num display num">
              <span data-count={FACTS[b.key]}>{num(FACTS[b.key])}</span>+
            </span>
            <span className="band__label mono">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="hrule hrule--end">
        <i data-reveal="rule" />
      </div>
    </section>
  )
}
