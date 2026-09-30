import { useMemo, useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { bandPath, movingAverage, series, toPath } from '../lib/chart.js'
import BorderGlow from '../components/BorderGlow.jsx'

// Ticker → real brand color, used as the chip's glow tint when picked (public/coins/<ticker>.svg
// is the matching badge — see public/coins/README.md for where they came from / how to add one).
const ASSETS = [
  ['BTC', '#f7931a'],
  ['ETH', '#627eea'],
  ['SOL', '#14f195'],
  ['BNB', '#f3ba2f'],
  ['XRP', '#23292f'],
  ['ADA', '#0033ad'],
  ['AVAX', '#e84142'],
  ['LINK', '#2a5ada'],
  ['DOT', '#e6007a'],
  ['DOGE', '#c2a633'],
  ['ATOM', '#2e3148'],
  ['MATIC', '#8247e5'],
]
const W = 640
const H = 360

/* Steps 01 → 03 as one scroll-scrubbed scene: choose an asset, watch a proprietary chart draw, ask the AI. */
export default function HowItWorks() {
  const { t } = useI18n()
  const h = t.how
  const root = useRef(null)

  const chart = useMemo(() => {
    const base = series(56, 5, { drift: 0.0085, vol: 0.07, start: 0.24 })
    const ma = movingAverage(base, 6)
    const upper = ma.map((v) => Math.min(0.97, v + 0.15))
    const lower = ma.map((v) => Math.max(0.03, v - 0.15))
    return {
      price: toPath(base, W, H, 26),
      upper: toPath(upper, W, H, 26),
      lower: toPath(lower, W, H, 26),
      band: bandPath(upper, lower, W, H, 26),
    }
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)

      const build = (scrollTrigger) => {
        const chips = qa('.chip-a')
        const scene1 = q('.scene--assets')
        const scene2 = q('.scene--chart')
        const scene3 = q('.scene--ask')
        const steps = qa('.how__step')
        const fill = q('.how__fill')
        const draws = qa('.scene--chart [data-draw]')
        const pills = qa('.scene--ask .pill')
        let current = -1

        gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set([scene2, scene3], { autoAlpha: 0 })
        gsap.set(q('.chart__band'), { autoAlpha: 0 })
        gsap.set(scene1, { autoAlpha: 1 })
        gsap.set(q('.assets__pick'), { autoAlpha: 0, y: 8 })
        gsap.set(chips, { autoAlpha: 0, y: 14 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            ...scrollTrigger,
            scrub: 1,
            onUpdate: (self) => {
              gsap.set(fill, { scaleY: self.progress })
              const idx = self.progress < 0.34 ? 0 : self.progress < 0.68 ? 1 : 2
              if (idx !== current) {
                current = idx
                steps.forEach((s, i) => s.classList.toggle('is-active', i === idx))
              }
            },
          },
        })

        // 01: assets appear, the highlight travels, BTC is chosen
        tl.to(chips, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04 }, 0)
        tl.to(chips[0], { className: '+=is-picked', duration: 0.01 }, 0.7)
        tl.to(q('.assets__pick'), { autoAlpha: 1, y: 0, duration: 0.3 }, 0.7)
        // 02: the proprietary chart draws itself
        tl.to(scene1, { autoAlpha: 0, y: -24, duration: 0.35 }, 1.05)
        tl.to(scene2, { autoAlpha: 1, duration: 0.3 }, 1.1)
        tl.to(draws[0], { strokeDashoffset: 0, duration: 0.9, ease: 'none' }, 1.15)
        tl.to(q('.chart__band'), { autoAlpha: 1, duration: 0.5 }, 1.55)
        tl.to(draws.slice(1), { strokeDashoffset: 0, duration: 0.7, stagger: 0.1, ease: 'none' }, 1.55)
        // 03: the AI answers from the chart, and cites it
        tl.to(scene2, { y: -16, opacity: 0.32, duration: 0.5 }, 2.15)
        tl.to(scene3, { autoAlpha: 1, duration: 0.3 }, 2.2)
        tl.from(q('.ask__q'), { autoAlpha: 0, y: 14, duration: 0.35 }, 2.25)
        tl.from(qa('.ask__line'), { scaleX: 0, transformOrigin: '0 50%', duration: 0.4, stagger: 0.1 }, 2.5)
        tl.from(pills, { autoAlpha: 0, scale: 0.85, duration: 0.3, stagger: 0.12 }, 2.9)
        tl.to({}, { duration: 0.3 })
      }

      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        build({
          trigger: q('.how__pin'),
          start: 'top top',
          end: '+=260%',
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      })
      mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
        build({ trigger: q('.how__grid'), start: 'top 55%', end: 'bottom 70%' })
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [h] },
  )

  return (
    <section ref={root} className="section how" data-nav-theme="paper" id="how">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="how__pin">
        <div className="container how__grid">
          <div className="how__copy">
            <p className="eyebrow" data-reveal="fade">
              {h.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {h.title}
            </h2>
            <ol className="how__steps">
              <span className="how__track" aria-hidden="true">
                <i className="how__fill" />
              </span>
              {h.steps.map((s, i) => (
                <li className={`how__step ${i === 0 ? 'is-active' : ''}`} key={s.n}>
                  <span className="how__n mono">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <BorderGlow className="how__panel" aria-hidden="true">
            <div className="scene scene--assets">
              <p className="scene__label mono">{h.pick}</p>
              <div className="assets">
                {ASSETS.map(([a, color]) => (
                  <span className="chip-a" key={a} style={{ '--coin': color }}>
                    <img className="chip-a__coin" src={`/coins/${a.toLowerCase()}.svg`} alt="" width="20" height="20" loading="lazy" />
                    <span className="chip-a__sym">{a}</span>
                  </span>
                ))}
              </div>
              <p className="assets__pick mono">BTC · 1,000+</p>
            </div>

            <div className="scene scene--chart">
              <div className="chart__head">
                <span className="mono">cvdd_channel</span>
                <span>{h.chartLabel}</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="chart">
                {[0.2, 0.4, 0.6, 0.8].map((y) => (
                  <line key={y} x1="0" x2={W} y1={y * H} y2={y * H} stroke="rgba(154,161,178,.14)" strokeWidth="1" />
                ))}
                <path className="chart__band" d={chart.band} fill="rgba(75,107,255,.16)" />
                <path d={chart.upper} stroke="#4b6bff" strokeWidth="1.6" fill="none" data-draw pathLength="1" />
                <path d={chart.lower} stroke="#4b6bff" strokeWidth="1.6" fill="none" data-draw pathLength="1" />
                <path d={chart.price} stroke="#fbf8f8" strokeWidth="2" fill="none" data-draw pathLength="1" />
              </svg>
              <p className="chart__note mono">{h.chartSub}</p>
            </div>

            <div className="scene scene--ask">
              <div className="ask__q">
                <span className="mono">{h.askLabel}</span>
                <p>{h.askText}</p>
              </div>
              <div className="ask__lines">
                <i className="ask__line" style={{ width: '92%' }} />
                <i className="ask__line" style={{ width: '78%' }} />
                <i className="ask__line" style={{ width: '55%' }} />
              </div>
              <div className="ask__cites">
                <span className="mono">{h.cited}</span>
                <span className="pill">cvdd_channel</span>
                <span className="pill">fractal_cycle</span>
              </div>
            </div>
          </BorderGlow>
        </div>
      </div>
    </section>
  )
}
