import { useRef } from 'react'
import { gsap } from '../../lib/gsap.js'
import { useLive } from '../../lib/live.js'

/* Research page visuals. Loose line drawings straight on the page (no cards, no shadows, no browser chrome); ink and slate
   strokes, only text takes the brand blue. Shapes are illustrative, never market data.
   - TypoCover: the two side covers of the opening (provisional typographic covers until the real ones are supplied).
   - LibraryScene: the research "usage recording" as a live scene (library, opening a report, audio player, band curve).
   - Draw: one specific drawing per Academy category.
   Everything is deterministic (no Math.random), so the server and client markup match. First render is the final state. */

const f = (n) => +n.toFixed(1)
const pts = (arr) => arr.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('')

/* ---------------------------------------------------------------- Typographic covers (opening) */
export function TypoCover({ variant, title, sub }) {
  return (
    <div className={`rs-tcover rs-tcover--${variant}`} style={{ aspectRatio: '552 / 309' }} aria-hidden="true">
      <div className="rs-tcover__t">
        <b>{title}</b>
        <span>{sub}</span>
      </div>
      <svg viewBox="0 0 200 160" className="rs-tcover__art" focusable="false">
        {variant === 'a' ? (
          <g>
            <circle cx="120" cy="80" r="52" />
            <circle cx="120" cy="80" r="34" />
            <path d="M120 28V132M68 80H172" />
            <path d="M83 43L157 117M157 43L83 117" />
          </g>
        ) : (
          <g>
            <path d="M20 118C48 112 62 70 88 74S124 126 150 104 176 50 190 42" />
            <path d="M20 134C48 128 62 90 88 94S124 140 150 124 176 76 190 68" />
            <path d="M20 100C48 94 62 52 88 56S124 108 150 86 176 32 190 24" />
          </g>
        )}
      </svg>
      <em>Rafael Teles</em>
    </div>
  )
}

/* ---------------------------------------------------------------- Research "recording": a live scene */
const ROW = 58
const SCROLL = 104
const PX0 = 250
const PX1 = 622
const base = (x) => 252 - 78 * ((x - PX0) / (PX1 - PX0)) - 26 * Math.sin((x - PX0) * 0.024)
const curve = (off, w = 0) => {
  const out = []
  for (let x = PX0; x <= PX1; x += 8) out.push([x, base(x) + off + w * Math.sin(x * 0.41) + w * 0.6 * Math.sin(x * 1.3)])
  return out
}
const BAND = {
  ru: curve(-30),
  rl: curve(-12),
  su: curve(6),
  sl: curve(24),
  price: curve(-7, 2.4),
}
const bandArea = (a, b) => pts(a) + 'L' + b.slice().reverse().map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z'
const P_FINAL = 0.62
const PL0 = 294
const PL1 = 612
const TICKS = [0, 0.25, 0.5, 0.75, 1]

const LIB = [
  { k: 'bars' },
  { k: 'title', a: 'The Compliance', b: 'Paradigm' },
  { k: 'bars' },
  { k: 'bars' },
  { k: 'title', a: 'Structural Market', b: 'Bands', sel: true },
  { k: 'title', a: 'Structural Analysis', b: 'of Bitcoin' },
  { k: 'bars' },
  { k: 'bars' },
]

export function LibraryScene() {
  const root = useRef(null)
  useLive(root, (el) => {
    const q = (s) => el.querySelector(s)
    const qa = (s) => [...el.querySelectorAll(s)]
    const list = q('.rl-list')
    const sel = q('.rl-sel')
    const under = q('.rl-under')
    const rep = q('.rl-rep')
    const draws = qa('.rl-rep [data-draw]')
    const fills = qa('.rl-fill')
    const player = q('.rl-player')
    const prog = q('.rl-prog')
    const head = q('.rl-head')
    const ticks = qa('.rl-tick')
    const price = q('.rl-price')
    const dot = q('.rl-dot')
    const len = price.getTotalLength()
    let tl = null

    const paintP = (p) => {
      prog.style.strokeDashoffset = (1 - p).toFixed(3)
      head.setAttribute('cx', (PL0 + (PL1 - PL0) * p).toFixed(1))
      ticks.forEach((t, i) => t.classList.toggle('is-on', TICKS[i] <= p + 0.001))
    }
    const rider = (p) => {
      const pt = price.getPointAtLength(p * len)
      dot.setAttribute('cx', pt.x.toFixed(1))
      dot.setAttribute('cy', pt.y.toFixed(1))
    }

    // the state before the first frame: library at the top, nothing opened
    gsap.set(list, { y: 0 })
    gsap.set(sel, { fill: '#0b0d14' })
    gsap.set([under, ...draws], { strokeDashoffset: 1 })
    gsap.set([rep, player, ...fills, dot], { autoAlpha: 0 })
    paintP(0)

    return {
      start() {
        const p = { v: 0 }
        const g = { v: 0 }
        tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, defaults: { immediateRender: false } })
        tl.fromTo(list, { y: 0 }, { y: -SCROLL, duration: 1.9, ease: 'power2.inOut' }, 0.4)
          .fromTo(sel, { fill: '#0b0d14' }, { fill: '#4b6bff', duration: 0.5 }, 2.2)
          .fromTo(under, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, 2.2)
          .fromTo(rep, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 2.9)
          .fromTo(draws, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.18, ease: 'power2.inOut' }, 3.1)
          .fromTo(fills, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 4.9)
          .fromTo(dot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 3.3)
          .fromTo(g, { v: 0 }, { v: 1, duration: 3.1, ease: 'power2.inOut', onUpdate: () => rider(g.v) }, 3.3)
          .fromTo(player, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 5.4)
          .fromTo(p, { v: 0 }, { v: 1, duration: 6, ease: 'none', onUpdate: () => paintP(p.v) }, 6)
          .to([rep, player], { autoAlpha: 0, duration: 0.6 }, 13)
          .to([list], { y: 0, duration: 0.8, ease: 'power2.inOut' }, 13.1)
          .to(under, { strokeDashoffset: 1, duration: 0.3 }, 13.1)
          .to(sel, { fill: '#0b0d14', duration: 0.3 }, 13.1)
      },
      toggle(on) {
        if (tl) (on ? tl.resume() : tl.pause())
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })

  return (
    <div ref={root} className="rl" aria-hidden="true">
      <div className="rl-zoom live-zoom">
        <svg viewBox="0 0 640 400" className="rl-svg" focusable="false">
          <defs>
            <clipPath id="rl-clip">
              <rect x="0" y="0" width="224" height="400" />
            </clipPath>
          </defs>
          {/* library: rows scroll up, Structural Market Bands is picked */}
          <g clipPath="url(#rl-clip)">
            <g className="rl-list" transform={`translate(0 ${-SCROLL})`}>
              {LIB.map((r, i) => {
                const y = 40 + i * ROW
                return (
                  <g key={i}>
                    {r.k === 'title' ? (
                      <text className={r.sel ? 'rl-sel rl-t' : 'rl-t'} x="0" y={y} fill={r.sel ? '#4b6bff' : undefined}>
                        <tspan x="0">{r.a}</tspan>
                        <tspan x="0" dy="16">
                          {r.b}
                        </tspan>
                      </text>
                    ) : (
                      <>
                        <path className="g t1" d={`M0 ${y - 4}H${150 - (i % 3) * 24}`} />
                        <path className="g t1" d={`M0 ${y + 12}H${96 + (i % 2) * 36}`} />
                      </>
                    )}
                    <path className="g t1" d={`M0 ${y + 30}H204`} />
                    {r.sel && <path className="rl-under" pathLength="1" d={`M0 ${y + 30}H204`} />}
                  </g>
                )
              })}
            </g>
          </g>
          <path className="g t1" d="M232 14V386" />

          {/* the opened report: title, text, the chart with its four curves traced */}
          <g className="rl-rep">
            <text className="rl-h" x={PX0} y="46">
              Structural Market Bands
            </text>
            <text className="rl-by" x={PX0} y="68">
              Rafael Teles
            </text>
            <path data-draw pathLength="1" className="g t1" d={`M${PX0} 94H${PX1}M${PX0} 110H${PX1 - 34}`} />
            <path data-draw pathLength="1" className="g t1" d={`M${PX0} 132V290H${PX1}`} />
            <path className="rl-fill rl-fill--r" d={bandArea(BAND.ru, BAND.rl)} />
            <path className="rl-fill rl-fill--s" d={bandArea(BAND.su, BAND.sl)} />
            <path data-draw pathLength="1" className="t1" d={pts(BAND.ru)} />
            <path data-draw pathLength="1" className="t1" d={pts(BAND.rl)} />
            <path data-draw pathLength="1" className="g t1" d={pts(BAND.su)} />
            <path data-draw pathLength="1" className="g t1" d={pts(BAND.sl)} />
            <path data-draw pathLength="1" className="rl-price t2" d={pts(BAND.price)} />
            <circle className="rl-dot" r="4.5" cx={PX1} cy={f(BAND.price[BAND.price.length - 1][1])} />
          </g>

          {/* the audio player: progress advances through the chapters */}
          <g className="rl-player">
            <path className="g t1" d={`M${PX0} 322H${PX1}`} />
            <circle className="t1" cx="264" cy="356" r="14" />
            <path className="ink" d="M259.5 349.5L271 356L259.5 362.5Z" />
            <path className="g t1" d={`M${PL0} 356H${PL1}`} />
            <path className="rl-prog t2" pathLength="1" d={`M${PL0} 356H${PL1}`} style={{ strokeDashoffset: 1 - P_FINAL }} />
            {TICKS.map((t) => (
              <path key={t} className={`rl-tick${t <= P_FINAL ? ' is-on' : ''}`} d={`M${f(PL0 + (PL1 - PL0) * t)} 345V367`} />
            ))}
            <circle className="rl-head" r="5" cx={f(PL0 + (PL1 - PL0) * P_FINAL)} cy="356" />
          </g>
        </svg>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Academy drawings (one per category) */
const sopr = (() => {
  const a = []
  for (let x = 30; x <= 450; x += 6) a.push([x, 150 - 44 * Math.sin(x * 0.031) - 22 * Math.sin(x * 0.087 + 1) - 7 * Math.sin(x * 0.31)])
  return pts(a)
})()
const lessonLine = 'M40 240L90 226L140 233L190 204L240 211L290 188L340 195L390 176L440 181'

const DRAWINGS = {
  start: (
    <>
      <path data-draw pathLength="1" className="t3" d="M40 40H250" />
      <path data-draw pathLength="1" className="g t1" d="M40 62H150" />
      {[92, 108, 124, 140].map((y, i) => (
        <path key={y} data-draw data-pulse={i} pathLength="1" className="g t1" d={`M40 ${y}H${[440, 408, 428, 300][i]}`} />
      ))}
      <path data-draw pathLength="1" className="g t1" d="M40 170V255H440" />
      <path data-draw data-path="a" pathLength="1" className="t2" d={lessonLine} />
      <circle data-in data-ride="a" r="4.5" className="dot" cx="440" cy="181" />
      <path data-draw data-pulse="2" pathLength="1" className="g t1" d="M40 277H372" />
    </>
  ),
  metrics: (
    <>
      <path data-draw pathLength="1" className="g t1" d="M30 30V270M30 270H450" />
      <path data-draw pathLength="1" className="g t1" d="M30 150H450" />
      <text data-in x="2" y="141">
        1.0
      </text>
      <path data-draw data-path="a" pathLength="1" className="t2" d={sopr} />
      <circle data-in data-ride="a" r="4.5" className="dot" cx="450" cy="150" />
    </>
  ),
  playbooks: (
    <>
      {[70, 240, 410].map((x, i) => (
        <g key={x}>
          <circle data-in cx={x} cy="110" r="26" className="t1" />
          <path data-draw pathLength="1" className="g t1" d={`M${x - 34} 176H${x + 34}M${x - 34} 194H${x + 12}M${x - 34} 212H${x + 24}`} />
        </g>
      ))}
      <path data-draw pathLength="1" className="t2" d="M58 120L66 106L74 112L84 98" />
      <path data-draw pathLength="1" className="t2" d="M228 102H252M228 118H246" />
      <path data-draw pathLength="1" className="t2" d="M398 110L407 119L424 100" />
      <path data-draw data-path="a" pathLength="1" className="g t1" d="M98 110H212M268 110H382" />
      <path data-draw pathLength="1" className="t1" d="M204 102L214 110L204 118M374 102L384 110L374 118" />
      <circle data-in data-ride="a" r="4.5" className="dot" cx="98" cy="110" />
    </>
  ),
  concepts: (
    <>
      {/* UTXO: one output spent into two */}
      <circle data-in cx="30" cy="110" r="20" className="t1" />
      <path data-draw data-path="a" pathLength="1" className="g t1" d="M50 110C70 110 74 76 96 76" />
      <path data-draw data-path="b" pathLength="1" className="g t1" d="M50 110C70 110 74 144 96 144" />
      <circle data-in cx="112" cy="76" r="14" className="t1" />
      <circle data-in cx="112" cy="144" r="10" className="t1" />
      <circle data-in data-ride="a" r="3.5" className="dot" cx="50" cy="110" />
      <circle data-in data-ride="b" r="3.5" className="dot" cx="50" cy="110" />
      <text data-in x="20" y="196">
        UTXO
      </text>
      {/* Basis: futures and spot converge */}
      <path data-draw pathLength="1" className="g t1" d="M186 70V150" />
      <path data-draw data-path="c" pathLength="1" className="t2" d="M186 70C214 70 244 92 286 100" />
      <path data-draw pathLength="1" className="g t2" d="M186 150C214 142 244 118 286 108" />
      <circle data-in data-ride="c" r="3.5" className="dot" cx="186" cy="70" />
      <text data-in x="186" y="196">
        Basis
      </text>
      {/* Finalization: blocks gain confirmations */}
      {[336, 376, 416].map((x) => (
        <circle data-in key={x} cx={x} cy="110" r="12" className="fillink" />
      ))}
      <path data-draw data-path="d" pathLength="1" className="g t1" d="M348 110H364M388 110H404M428 110H444" />
      <circle data-in data-pulse="1" cx="456" cy="110" r="12" className="t1 dash" />
      <text data-in x="336" y="196">
        Finalization
      </text>
    </>
  ),
  features: (
    <>
      {/* chart */}
      <path data-draw pathLength="1" className="g t1" d="M20 60V180H150" />
      <path data-draw data-path="a" pathLength="1" className="t2" d="M20 160L42 140L64 148L88 108L110 120L132 84L150 92" />
      <circle data-in data-ride="a" r="4" className="dot" cx="150" cy="92" />
      <text data-in x="20" y="214">
        Charts
      </text>
      {/* dashboard */}
      <path data-draw pathLength="1" className="g t1" d="M190 60H300M190 60V180" />
      <path data-draw data-pulse="0" pathLength="1" className="t2" d="M200 90H282M200 118H250M200 146H270" />
      <path data-draw data-pulse="2" pathLength="1" className="g t1" d="M200 170H300" />
      <text data-in x="190" y="214">
        Dashboards
      </text>
      {/* alert */}
      <g data-swing>
        <path data-draw pathLength="1" className="t2" d="M394 78c-20 0-32 16-32 38v20l-10 14h84l-10-14v-20c0-22-12-38-32-38z" />
        <path data-draw pathLength="1" className="t1" d="M383 164a11 8 0 0 0 22 0" />
      </g>
      <path data-draw data-pulse="1" pathLength="1" className="g t1" d="M440 84c10 6 16 16 18 28M348 84c-10 6-16 16-18 28" />
      <text data-in x="340" y="214">
        Alerts
      </text>
    </>
  ),
}

export function Draw({ kind }) {
  const root = useRef(null)
  useLive(root, (el) => {
    const draws = [...el.querySelectorAll('[data-draw]')]
    const ins = [...el.querySelectorAll('[data-in]')]
    const dots = [...el.querySelectorAll('[data-ride]')].map((d) => {
      const p = el.querySelector(`[data-path="${d.dataset.ride}"]`)
      return { d, p, len: p.getTotalLength(), k: d.dataset.ride === 'b' ? 0.5 : 0 }
    })
    const pulses = [...el.querySelectorAll('[data-pulse]')].map((p) => ({ p, ph: +p.dataset.pulse * 1.7 }))
    const swing = el.querySelector('[data-swing]')
    let t = 0
    let tl = null
    gsap.set(draws, { strokeDashoffset: 1 })
    gsap.set(ins, { autoAlpha: 0 })
    if (swing) gsap.set(swing, { svgOrigin: '394 74' })
    return {
      start() {
        tl = gsap.timeline()
        tl.to(draws, { strokeDashoffset: 0, duration: 1.3, stagger: 0.1, ease: 'power2.inOut' }, 0.1).to(ins, { autoAlpha: 1, duration: 0.6, stagger: 0.12 }, 0.5)
      },
      frame(dt) {
        t += dt
        dots.forEach(({ d, p, len, k }) => {
          const u = (t * 0.16 + k) % 1
          const pt = p.getPointAtLength(u * len)
          d.setAttribute('cx', pt.x.toFixed(1))
          d.setAttribute('cy', pt.y.toFixed(1))
        })
        pulses.forEach(({ p, ph }) => {
          p.style.opacity = (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.8 + ph))).toFixed(2)
        })
        if (swing) gsap.set(swing, { rotation: Math.sin(t * 2.4) * 7 * Math.max(0, Math.sin(t * 0.5)) })
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })
  return (
    <div ref={root} className="res-dw" aria-hidden="true">
      <div className="res-draw live-zoom">
        <svg viewBox="0 0 480 300" focusable="false">
          {DRAWINGS[kind]}
        </svg>
      </div>
    </div>
  )
}
