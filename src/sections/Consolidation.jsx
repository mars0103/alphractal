import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { LOGO_GRADIENTS, LOGO_OUTLINES, LOGO_PATHS, LOGO_VIEWBOX } from '../lib/logoShapes.js'

/* Where each tool's card floats, as [left%, top%, rotation°, scale] of the stage. */
const SPOTS = [
  [19, 25, -4, 1],
  [50, 12, 2, 1.06],
  [81, 25, 4, 1],
  [17, 74, 3, 0.96],
  [50, 86, -2, 1.04],
  [83, 74, -3, 0.98],
]

/* One small, distinct picture per tool, drawn in the blues of the home gradient. */
function Micro({ kind }) {
  const stroke = { stroke: 'url(#sxLine)', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (kind) {
    case 0: // on-chain: a small network
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          <g {...stroke}>
            <path d="M12 30 34 12 58 26 84 10M34 12 40 36 58 26 70 38 84 10" />
          </g>
          {[[12, 30], [34, 12], [58, 26], [84, 10], [40, 36], [70, 38]].map(([x, y]) => (
            <circle key={x + y} cx={x} cy={y} r="3" fill="#cfd8ff" />
          ))}
        </svg>
      )
    case 1: // derivatives: candles
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          {[[10, 8, 26, 1], [22, 14, 30, 0], [34, 6, 22, 1], [46, 12, 34, 0], [58, 4, 20, 1], [70, 10, 28, 1], [82, 2, 18, 1], [94, 8, 24, 0]].map(([x, y, h, up]) => (
            <g key={x}>
              <path d={`M${x} ${y - 3}V${y + h + 3}`} stroke="#6f86ff" strokeWidth="1" />
              <rect x={x - 3} y={y} width="6" height={h} rx="1.2" fill={up ? '#cfd8ff' : '#3a52ff'} />
            </g>
          ))}
        </svg>
      )
    case 2: // sentiment: a gauge
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          <path d="M14 40A36 36 0 0 1 86 40" stroke="#26317a" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M14 40A36 36 0 0 1 70 10" stroke="url(#sxLine)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M50 40 66 16" stroke="#e8edff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="40" r="3.4" fill="#e8edff" />
        </svg>
      )
    case 3: // macro: an area line
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          <path d="M4 34C16 30 22 12 34 16S52 36 62 24 78 8 96 12V44H4Z" fill="url(#sxArea)" />
          <path d="M4 34C16 30 22 12 34 16S52 36 62 24 78 8 96 12" {...stroke} />
        </svg>
      )
    case 4: // AI: a spark with lines
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          <path d="M22 22C22 14 26 10 34 10C26 10 22 6 22 -2C22 6 18 10 10 10C18 10 22 14 22 22Z" transform="translate(4 8) scale(1.1)" fill="#e8edff" />
          <g stroke="url(#sxLine)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M46 14H92M46 24H80M46 34H68" />
          </g>
        </svg>
      )
    default: // terminal: order book + button
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          {[[6, 6, 52, 0], [6, 14, 38, 0], [6, 22, 60, 1], [6, 30, 44, 1]].map(([x, y, w, buy]) => (
            <rect key={y} x={x} y={y} width={w} height="5" rx="2" fill={buy ? '#6f86ff' : '#2b3894'} />
          ))}
          <rect x="68" y="14" width="26" height="16" rx="4" fill="url(#sxLine)" />
        </svg>
      )
  }
}

/* THE SOLUTION. Six black glass cards, one per tool, float on a clean white stage with a blue glow. On scroll, each one
   is drawn into the centre and gone; the Alphractal symbol is then traced in a fine line, filled and crossed by one clean
   reflection, and the wordmark rises into place. No glow, no shadow, no dark box. Scroll-scrubbed; without motion the
   finished logo is shown and the cards are hidden. */
export default function Consolidation() {
  const { t } = useI18n()
  const c = t.consolidation
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)

      const build = (scrollTrigger) => {
        const stage = q('.sx__stage')
        const cards = qa('.sx__card')
        const strokes = qa('.sx__stroke')
        const fills = qa('.sx__fill')
        const shine = q('#sxShine')
        const letters = qa('.sx__letter')
        const logo = q('.sx__logo')
        const count = q('.cons__count-n')
        const countLabel = q('.cons__count-l')

        // the centre of the stage, and where each card sits relative to it
        const centre = () => ({ x: stage.offsetWidth / 2, y: stage.offsetHeight * 0.47 })
        const offs = (el) => {
          const k = centre()
          return { x: k.x - (el.offsetLeft + el.offsetWidth / 2), y: k.y - (el.offsetTop + el.offsetHeight / 2) }
        }

        gsap.set(cards, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: (i) => SPOTS[i][2] })
        gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1, autoAlpha: 1 })
        gsap.set(fills, { fillOpacity: 0 })
        gsap.set(letters, { autoAlpha: 0, yPercent: 60 })
        gsap.set(logo, { autoAlpha: 1, scale: 0.94 })
        count.textContent = cards.length
        countLabel.textContent = c.tools

        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { ...scrollTrigger, scrub: 1, invalidateOnRefresh: true } })

        // 1 · the cards drift for a beat, then each one is drawn to the centre and gone; the count drops with them
        tl.to({}, { duration: 0.7 })
        cards.forEach((el, i) => {
          const at = 0.7 + i * 0.09
          tl.to(el, { x: () => offs(el).x, y: () => offs(el).y, scale: 0.2, rotation: SPOTS[i][2] * 3, duration: 0.95, ease: 'power3.in' }, at)
          tl.to(el, { autoAlpha: 0, duration: 0.2, ease: 'none' }, at + 0.8)
          tl.call(
            () => {
              const left = Math.max(1, cards.length - 1 - i)
              count.textContent = left
              countLabel.textContent = left === 1 ? c.toolsOne : c.tools
            },
            null,
            at + 0.85,
          )
        })

        // 2 · the symbol is drawn in a fine line, filled, and crossed by one clean reflection; no glow
        tl.to(logo, { scale: 1, duration: 1.7, ease: 'power2.out' }, 2.0)
        tl.to(strokes, { strokeDashoffset: 0, duration: 1.2, stagger: 0.1, ease: 'power2.inOut' }, 2.1)
        tl.to(fills, { fillOpacity: 1, duration: 0.8, stagger: 0.06, ease: 'power1.inOut' }, 3.0)
        tl.to(strokes, { autoAlpha: 0, duration: 0.5, ease: 'none' }, 3.5)
        tl.fromTo(shine, { attr: { x1: -90, x2: -30 } }, { attr: { x1: 190, x2: 250 }, duration: 1.1, ease: 'power2.inOut' }, 3.5)

        // 3 · the wordmark rises into place, letter by letter
        tl.to(letters, { autoAlpha: 1, yPercent: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out' }, 3.6)
        tl.to({}, { duration: 0.5 })
      }

      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        build({ trigger: q('.cons__pin'), start: 'top top', end: '+=240%', pin: true, anticipatePin: 1 })
      })
      mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
        build({ trigger: q('.sx__stage'), start: 'top 82%', end: 'bottom 28%' })
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [c] },
  )

  return (
    <section ref={root} className="section cons" data-nav-theme="paper" id="solution">
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
              {c.body.map((p) => (
                <p className="lede" key={p}>
                  {p}
                </p>
              ))}
            </div>
            <p className="cons__count mono" aria-hidden="true">
              <span className="cons__count-n num">6</span>
              <span className="cons__count-l">{c.tools}</span>
            </p>
          </div>

          <div className="cons__stage sx__stage" role="img" aria-label={`${c.topics.join(', ')} → ${c.unified}`}>
            <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="sxLine" x1="0" x2="1">
                  <stop offset="0" stopColor="#4b6bff" />
                  <stop offset="1" stopColor="#bcc8ff" />
                </linearGradient>
                <linearGradient id="sxArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#4b6bff" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#4b6bff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {c.topics.map((topic, i) => (
              <div className="sx__card" key={topic} style={{ left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%`, '--s': SPOTS[i][3], '--d': `${i * -1.1}s` }} aria-hidden="true">
                <div className="sx__card-in">
                  <span className="sx__card-name">{topic}</span>
                  <Micro kind={i} />
                </div>
              </div>
            ))}

            <svg className="sx__logo" viewBox={LOGO_VIEWBOX} aria-hidden="true">
              <defs>
                {LOGO_GRADIENTS.map((g) => (
                  <linearGradient key={g.id} id={g.id} gradientUnits="userSpaceOnUse" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>
                    {g.stops.map(([o, c]) => (
                      <stop key={o + c} offset={o} stopColor={c} />
                    ))}
                  </linearGradient>
                ))}
                <linearGradient id="sxShine" gradientUnits="userSpaceOnUse" x1="-90" y1="0" x2="-30" y2="40">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {LOGO_PATHS.map((s, i) => (
                <path key={i} className="sx__fill" d={s.d} fill={s.fill} fillOpacity="1" />
              ))}
              {LOGO_OUTLINES.map((d, i) => (
                <path key={`s${i}`} className="sx__stroke" d={d} pathLength="1" fill="none" stroke="#1749ff" strokeWidth="1.4" strokeLinejoin="round" />
              ))}
              {LOGO_OUTLINES.map((d, i) => (
                <path key={`h${i}`} d={d} fill="url(#sxShine)" />
              ))}
            </svg>
            <p className="sx__word" aria-hidden="true">
              {Array.from(c.unified).map((ch, i) => (
                <span className="sx__letter" key={i}>
                  {ch}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
