import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import Viz, { VIZ_KINDS } from '../components/Viz.jsx'

/* Where the five windows sit before they converge, as a fraction of the stage: [x, y, rotation] */
const SCATTER = [
  [-0.3, -0.3, -5],
  [0.3, -0.34, 4],
  [-0.34, 0.3, 3],
  [0.32, 0.3, -4],
  [0, -0.02, 6],
]

export default function Consolidation() {
  const { t } = useI18n()
  const c = t.consolidation
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)

      // Desktop: pinned, scroll-driven. Five windows converge into one.
      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        const stage = q('.cons__stage')
        const wins = qa('.win')
        const uni = q('.uni')
        const count = q('.cons__count-n')
        const countLabel = q('.cons__count-l')
        const paths = qa('.uni [data-draw]')
        const state = { n: 5 }

        count.textContent = 5
        countLabel.textContent = c.tabs
        gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(wins, { left: '50%', top: '50%', xPercent: -50, yPercent: -50 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: q('.cons__pin'),
            start: 'top top',
            end: '+=170%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        wins.forEach((w, i) => {
          const [fx, fy, rot] = SCATTER[i]
          tl.fromTo(
            w,
            { x: () => fx * stage.offsetWidth, y: () => fy * stage.offsetHeight, rotation: rot, scale: 1, autoAlpha: 1 },
            { x: 0, y: 0, rotation: 0, scale: 0.94, duration: 1 },
            i * 0.05,
          )
        })
        tl.to(
          state,
          {
            n: 1,
            duration: 1.1,
            ease: 'none',
            onUpdate: () => {
              const n = Math.max(1, Math.round(state.n))
              count.textContent = n
              countLabel.textContent = n === 1 ? c.tabsOne : c.tabs
            },
          },
          0,
        )
        tl.to(wins, { autoAlpha: 0, scale: 0.8, duration: 0.35, stagger: 0.04 }, 1.1)
        tl.fromTo(uni, { autoAlpha: 0, scale: 0.9, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6 }, 1.15)
        tl.from(qa('.uni__cell'), { autoAlpha: 0, y: 14, stagger: 0.06, duration: 0.35 }, 1.4)
        tl.to(paths, { strokeDashoffset: 0, duration: 0.5, stagger: 0.05 }, 1.5)
        tl.from(q('.uni__ai'), { autoAlpha: 0, y: 10, duration: 0.3 }, 1.85)
        tl.to({}, { duration: 0.35 }) // hold the finished state for a beat before the pin releases
      })

      // Mobile: no pin, the same story in reveals
      mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
        gsap.from(qa('.win'), {
          autoAlpha: 0,
          y: 40,
          rotation: (i) => (i % 2 ? 2 : -2),
          stagger: 0.09,
          duration: 0.9,
          scrollTrigger: { trigger: q('.cons__stage'), start: 'top 82%', once: true },
        })
        gsap.from(q('.uni'), {
          autoAlpha: 0,
          y: 50,
          duration: 1,
          scrollTrigger: { trigger: q('.uni'), start: 'top 88%', once: true },
        })
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [c] },
  )

  return (
    <section ref={root} className="section cons" data-nav-theme="paper" id="one-terminal">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="cons__pin">
        <div className="container cons__grid">
          <div className="cons__copy">
            <p className="eyebrow" data-reveal="fade">
              {c.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {c.title}
            </h2>
            <div className="cons__body" data-reveal="up" data-delay="0.15">
              {c.body.map((p, i) => (
                <p className={i ? 'cons__punch' : 'lede'} key={p}>
                  {p}
                </p>
              ))}
            </div>
            <p className="cons__count mono" aria-hidden="true">
              <span className="cons__count-n num">1</span>
              <span className="cons__count-l">{c.tabsOne}</span>
            </p>
          </div>

          <div className="cons__stage" role="img" aria-label={`${c.tools.join(', ')} → ${c.unified}`}>
            {c.tools.map((tool, i) => (
              <div className="win" key={tool}>
                <div className="win__bar mono">
                  <span>{tool}</span>
                  <i />
                </div>
                <Viz kind={VIZ_KINDS[i]} />
              </div>
            ))}

            <div className="uni">
              <div className="ring ring--dark" aria-hidden="true" />
              <div className="uni__bar">
                <img src="/figma/logo-mark.svg" alt="" width="20" height="18" />
                <strong>{c.unified}</strong>
                <span className="mono">{c.unifiedNote}</span>
              </div>
              <div className="uni__grid">
                {c.tools.map((tool, i) => (
                  <div className="uni__cell" key={tool}>
                    <span className="mono">{tool}</span>
                    <Viz kind={VIZ_KINDS[i]} />
                  </div>
                ))}
                <div className="uni__ai">
                  <span className="uni__spark" aria-hidden="true" />
                  {c.aiLine}
                </div>
              </div>
              <span className="uni__tag mono">{c.illustrative}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
