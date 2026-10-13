import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { OnchainViz, DerivsViz, SentimentViz, MacroViz, ChartViz } from '../components/visuals/ConsViz.jsx'

const VIZ = [OnchainViz, DerivsViz, SentimentViz, MacroViz, ChartViz]
/* Each tool's slot inside the laptop screen, as a fraction of the screen box: [x, y, w, h].
   Five rects fully tile the screen (3 across the top half, 2 across the bottom), so once every
   widget has appeared there's no gap left — they ARE the finished, unified screen. */
const DOCK = [
  [0, 0, 1 / 3, 0.5],
  [1 / 3, 0, 1 / 3, 0.5],
  [2 / 3, 0, 1 / 3, 0.5],
  [0, 0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5, 0.5],
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

      // Scroll-driven, both breakpoints: each tool's simulated widget appears on its own, one
      // at a time, straight into its slot in the laptop screen — not a real screenshot cropped
      // and flown in, but the same kind of abstract panel used elsewhere on the site (Viz),
      // so the screen is visibly assembling itself rather than revealing a photo.
      const build = (scrollTrigger) => {
        const widgets = qa('.cons__widget')
        const count = q('.cons__count-n')
        const countLabel = q('.cons__count-l')

        gsap.set(widgets, { autoAlpha: 0, scale: 0.8 })
        count.textContent = widgets.length
        countLabel.textContent = c.tabs

        const tl = gsap.timeline({
          defaults: { ease: 'back.out(1.7)' },
          scrollTrigger: { ...scrollTrigger, scrub: 1 },
        })

        widgets.forEach((w, i) => {
          const at = i * 0.85
          tl.to(w, { autoAlpha: 1, scale: 1, duration: 0.55 }, at)
          const remaining = Math.max(1, widgets.length - 1 - i)
          tl.call(
            () => {
              count.textContent = remaining
              countLabel.textContent = remaining === 1 ? c.tabsOne : c.tabs
            },
            null,
            at + 0.25,
          )
        })
        tl.from(q('.cons__ai'), { autoAlpha: 0, y: 10, duration: 0.5 }, '+=0.1')
        tl.to({}, { duration: 0.35 })
      }

      // Entrance: the laptop slides in from the right and brakes smoothly into its place
      // (in-out: it builds up speed, then eases to a stop) when the section arrives.
      mm.add(MQ.motion, () => {
        const mac = q('.mac')
        gsap.set(mac, { xPercent: 75, autoAlpha: 0 })
        gsap.to(mac, {
          xPercent: 0,
          autoAlpha: 1,
          duration: 2.1,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: q('.cons__stage'), start: 'top 88%', once: true },
        })
      })

      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        build({
          trigger: q('.cons__pin'),
          start: 'top top',
          end: '+=170%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      })
      mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
        build({ trigger: q('.cons__stage'), start: 'top 75%', end: 'bottom 85%' })
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
              <span className="cons__count-n num">5</span>
              <span className="cons__count-l">{c.tabs}</span>
            </p>
          </div>

          <div className="cons__stage" role="img" aria-label={`${c.tools.join(', ')} → ${c.unified}`}>
            <div className="mac">
              <div className="mac__screen">
                {c.tools.map((tool, i) => {
                  const [dx, dy, dw, dh] = DOCK[i]
                  const Tool = VIZ[i]
                  return (
                    <div
                      className="cons__widget"
                      key={tool}
                      style={{ left: `${dx * 100}%`, top: `${dy * 100}%`, width: `${dw * 100}%`, height: `${dh * 100}%` }}
                    >
                      <div className="cons__widget-head mono">
                        <span>{tool}</span>
                        <i />
                      </div>
                      <div className="cons__widget-viz">
                        <Tool />
                      </div>
                    </div>
                  )
                })}
                <p className="cons__ai mono">
                  <img src="/figma/spark.svg" alt="" width="12" height="12" />
                  <span className="cons__ai-text">{c.aiLine}</span>
                </p>
              </div>
              <img className="mac__frame" src="/mockups/macbook.png" alt="" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
