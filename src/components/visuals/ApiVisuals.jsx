import { useMemo, useRef } from 'react'
import { gsap } from '../../lib/gsap.js'
import { useLive } from '../../lib/live.js'

/* Visuals of /platform/api. Loose line drawings, no boxes, no glow, no tilt. They grow in when first on screen, keep moving
   while visible and, on a mouse, zoom under the pointer (lib/live.js). Shapes only: the PriceUSD line is illustrative, never
   a market quote. Everything is deterministic (no Math.random) so server and client markup match. */

/* ---------------------------------------------------------------- Hero flow */
const FW = 560
const FH = 330
const REQ_Y = 78
const NODE = { x: 244, y: REQ_Y, r: 32 }
const CH = { x: 330, y: 168, w: 226, h: 120, n: 58 } // the PriceUSD trace
const BRANCH_Y = [176, 218, 260]
const DESTS = ['Research pipeline', 'Analytics dashboard', 'Automated workflow']

const pv = (i) => 0.5 + 0.22 * Math.sin(i * 0.05) + 0.1 * Math.sin(i * 0.13 + 1) + 0.045 * Math.sin(i * 0.9) + 0.025 * Math.sin(i * 2.3 + 1) + 0.012 * Math.sin(i * 5.1 + 2)
const chartPath = (head) => {
  let d = ''
  for (let k = 0; k < CH.n; k++) {
    const x = CH.x + (k / (CH.n - 1)) * CH.w
    const y = CH.y + 14 + (1 - pv(head - CH.n + k)) * (CH.h - 28)
    d += `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}
const headY = (head) => CH.y + 14 + (1 - pv(head)) * (CH.h - 28)
const C0 = 140
const branchD = (y) => `M${NODE.x} ${NODE.y + NODE.r}V${y - 16}Q${NODE.x} ${y} ${NODE.x - 16} ${y}H150`
const REQ_D = `M0 ${REQ_Y}H${NODE.x - NODE.r - 8}`
const RES_D = `M${NODE.x + NODE.r} ${REQ_Y}H${CH.x - 12}`

/* A pulse is a 3px dot that rides a path; `at(p)` places it at fraction p of the path. */
function rider(path, dot) {
  const L = path.getTotalLength()
  return (p) => {
    const pt = path.getPointAtLength(L * p)
    dot.setAttribute('cx', pt.x.toFixed(1))
    dot.setAttribute('cy', pt.y.toFixed(1))
  }
}

export function HeroFlow() {
  const root = useRef(null)
  const first = useMemo(() => chartPath(C0), [])

  useLive(root, (el, state) => {
    const q = (s) => el.querySelector(s)
    const qa = (s) => [...el.querySelectorAll(s)]
    const clips = qa('.apf__clip rect') // req1, req2, json x4, chart
    const [c1, c2, ...rest] = clips
    const jsonClips = rest.slice(0, 4)
    const chartClip = rest[4]
    const dots = qa('.apf__dot')
    const [dReq, dRes, ...dBr] = dots
    const ring = q('.apf__ring')
    const lines = qa('.apf__link')
    const branches = qa('.apf__branch')
    const ends = qa('.apf__end')
    const labels = qa('.apf__dest')
    const key = q('.apf__key')
    const head = q('.apf__head')
    const chartLine = q('.apf__chart')
    const rideReq = rider(q('.apf__link--req'), dReq)
    const rideRes = rider(q('.apf__link--res'), dRes)
    const rideBr = branches.map((b, i) => rider(b, dBr[i]))
    const lite = window.matchMedia('(max-width: 991px)').matches
    const W = (r) => +r.dataset.w
    const width = (r, w) => r.setAttribute('width', w.toFixed(1))
    let loop = null
    let intro = null
    let tape = C0
    let live = false

    const reset = () => {
      ;[c1, c2, ...jsonClips].forEach((r) => width(r, 0))
      gsap.set([...lines, ...branches], { opacity: 0.35 })
      gsap.set([...ends, ...labels], { autoAlpha: 0 })
      gsap.set(ring, { opacity: 0.55 })
      gsap.set(key, { autoAlpha: 0 })
      gsap.set(dots, { autoAlpha: 0 })
    }
    reset()
    width(chartClip, 0)
    gsap.set(head, { autoAlpha: 0 })

    const type = (tl, rect, at, per = 0.026) => {
      const o = { w: 0 }
      const n = Math.max(4, Math.round(W(rect) / 7))
      tl.to(o, { w: W(rect), duration: n * per, ease: `steps(${n})`, onUpdate: () => width(rect, o.w) }, at)
      return n * per
    }
    const pulse = (tl, at, ride, dot, dur) => {
      const o = { p: 0 }
      tl.set(dot, { autoAlpha: 1 }, at)
      tl.to(o, { p: 1, duration: dur, ease: 'power1.inOut', onUpdate: () => ride(o.p) }, at)
      tl.set(dot, { autoAlpha: 0 }, at + dur)
    }

    const build = () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4, paused: !state.on })
      tl.call(reset, null, 0)
      const d1 = type(tl, c1, 0.2)
      const d2 = type(tl, c2, 0.2 + d1)
      tl.to(key, { autoAlpha: 1, duration: 0.3 }, 0.2 + d1)
      tl.to(lines[0], { opacity: 1, duration: 0.4 }, 0.2 + d1 + d2)
      const t0 = 0.2 + d1 + d2 + 0.1
      pulse(tl, t0, rideReq, dReq, 0.9)
      tl.to(ring, { opacity: 1, duration: 0.35 }, t0 + 0.8)
      tl.to(lines[1], { opacity: 1, duration: 0.4 }, t0 + 1.0)
      pulse(tl, t0 + 1.0, rideRes, dRes, 0.7)
      let at = t0 + 1.6
      jsonClips.forEach((r) => {
        at += type(tl, r, at, 0.02)
      })
      // the three outputs: three fine branches, one pulse each
      branches.forEach((b, i) => {
        const s = at + 0.2 + i * 0.35
        tl.to(b, { opacity: 1, duration: 0.4 }, s)
        pulse(tl, s, rideBr[i], dBr[i], 0.9)
        tl.to([ends[i], labels[i]], { autoAlpha: 1, duration: 0.4 }, s + 0.8)
      })
      tl.to({}, { duration: 2.2 }) // hold, then the next pass retypes everything
      return tl
    }

    const paintChart = () => {
      chartLine.setAttribute('d', chartPath(tape))
      head.setAttribute('cy', headY(tape).toFixed(1))
    }

    return {
      start() {
        const o = { w: 0 }
        intro = gsap.timeline({ onComplete: () => (live = true) })
        intro.to(o, { w: CH.w + 20, duration: lite ? 1.6 : 2.6, ease: 'power1.inOut', delay: 3.4, onUpdate: () => width(chartClip, o.w) })
        intro.to(head, { autoAlpha: 1, duration: 0.4 }, '-=0.4')
        loop = build()
      },
      frame(dt) {
        if (!live) return
        tape += dt * 5
        paintChart()
      },
      toggle(on) {
        if (loop) loop.paused(!on)
        if (intro) intro.paused(!on)
      },
      kill() {
        if (loop) loop.kill()
        if (intro) intro.kill()
      },
    }
  })

  const jsonLines = [
    ['[{', []],
    ['  "time": "2023-11-07T05:31:56Z",', ['  ', 'k:"time"', ': ', 's:"2023-11-07T05:31:56Z"', ',']],
    ['  "priceUSD": 123', ['  ', 'k:"priceUSD"', ': ', 'n:123']],
    ['}]', []],
  ]

  return (
    <div className="api-flow" ref={root} role="group" aria-label="Request and response flow: your application sends GET /btc/market/PriceUSD with an API key to the Alphractal API, which returns a JSON response to a research pipeline, an analytics dashboard or an automated workflow">
      <div className="apf__zoom live-zoom">
        <svg viewBox={`0 0 ${FW} ${FH}`} className="apf" focusable="false">
          <defs>
            <g className="apf__clip">
              {[
                { id: 'a', x: 0, y: 8, w: 190, h: 24 },
                { id: 'b', x: 0, y: 36, w: 220, h: 24 },
                ...[0, 1, 2, 3].map((i) => ({ id: `j${i}`, x: CH.x - 4, y: 22 + i * 20, w: 236, h: 22 })),
                { id: 'c', x: CH.x - 14, y: CH.y - 20, w: CH.w + 20, h: CH.h + 40 },
              ].map((r) => (
                <clipPath id={`apf-${r.id}`} key={r.id}>
                  <rect x={r.x} y={r.y} width={r.w} height={r.h} data-w={r.w} />
                </clipPath>
              ))}
            </g>
          </defs>

          {/* the request: typed, with the key masked */}
          <text className="apf__code apf__code--req" x="0" y="26" clipPath="url(#apf-a)">
            GET /btc/market/PriceUSD
          </text>
          <text className="apf__code apf__key" x="0" y="52" clipPath="url(#apf-b)">
            <tspan className="apf__k">X-Api-Key</tspan>: ••••••••••••••••
          </text>
          <path className="apf__link apf__link--req" d={REQ_D} />
          <path className="apf__arrow" d={`M${NODE.x - NODE.r - 14} ${REQ_Y - 5}l6 5l-6 5`} />

          {/* the API: a label and a 1px ring */}
          <text className="apf__name" x={NODE.x} y="26" textAnchor="middle">
            ALPHRACTAL API
          </text>
          <circle className="apf__ring" cx={NODE.x} cy={NODE.y} r={NODE.r} />

          {/* the response: JSON typed out from the node */}
          <path className="apf__link apf__link--res" d={RES_D} />
          <path className="apf__arrow" d={`M${CH.x - 18} ${REQ_Y - 5}l6 5l-6 5`} />
          {jsonLines.map(([plain, toks], i) => (
            <text className="apf__code apf__json" x={CH.x} y={38 + i * 20} key={i} clipPath={`url(#apf-j${i})`}>
              {toks.length
                ? toks.map((t, k) => {
                    const m = /^([ksn]):(.*)$/.exec(t)
                    return m ? (
                      <tspan className={`apf__${m[1]}`} key={k}>
                        {m[2]}
                      </tspan>
                    ) : (
                      <tspan key={k}>{t}</tspan>
                    )
                  })
                : plain}
            </text>
          ))}

          {/* the PriceUSD series, traced */}
          <g className="apf__chartwrap">
            <text className="apf__cap" x={CH.x} y={CH.y - 4}>
              priceUSD
            </text>
            {[0.25, 0.5, 0.75].map((k) => (
              <line key={k} className="apf__grid" x1={CH.x} x2={CH.x + CH.w} y1={CH.y + 14 + k * (CH.h - 28)} y2={CH.y + 14 + k * (CH.h - 28)} />
            ))}
            <line className="apf__axis" x1={CH.x} x2={CH.x + CH.w} y1={CH.y + CH.h} y2={CH.y + CH.h} />
            <g clipPath="url(#apf-c)">
              <path className="apf__chart" d={first} />
              <circle className="apf__head" cx={CH.x + CH.w} cy={headY(C0)} r="3.2" />
            </g>
          </g>

          {/* the three outputs */}
          {BRANCH_Y.map((y, i) => (
            <g key={y}>
              <path className="apf__branch" d={branchD(y)} />
              <circle className="apf__end" cx="150" cy={y} r="2.6" />
              <text className="apf__dest" x="0" y={y + 4}>
                {DESTS[i]}
              </text>
            </g>
          ))}
          {/* pulses (hidden until the loop runs) */}
          {['req', 'res', 'b0', 'b1', 'b2'].map((k) => (
            <circle className="apf__dot" key={k} r="3" cx="0" cy="0" />
          ))}
        </svg>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Family drawings
   One small line drawing per data family (120 x 64). Paths carry pathLength=1 so they can be drawn in; `data-live` marks the
   part that keeps moving afterwards. Hover redraws it and zooms into the part under the cursor. */
const W2 = 120
const sine = (x0, x1, mid, amp, period, phase = 0) => {
  let d = ''
  for (let x = x0; x <= x1; x += 2) d += `${x === x0 ? 'M' : 'L'}${x} ${(mid + amp * Math.sin(((x + phase) / period) * Math.PI * 2)).toFixed(1)}`
  return d
}
const P = (d, extra = {}) => <path className="fd" pathLength="1" d={d} {...extra} />

const CANDLES = [
  [34, 24, 18, 40],
  [28, 38, 22, 44],
  [36, 26, 20, 41],
  [24, 16, 10, 30],
  [18, 28, 12, 34],
  [30, 20, 14, 36],
  [22, 12, 6, 28],
] // open y, close y, high y, low y

const DRAWINGS = {
  market: (
    <>
      {P('M4 58H116')}
      {CANDLES.map(([o, c, h, l], i) => {
        const x = 12 + i * 16
        const top = Math.min(o, c)
        const g = (
          <g key={i} className={i === CANDLES.length - 1 ? 'fd-live' : undefined} data-live="breathe" data-d="0.82">
            {P(`M${x} ${h}V${l}`)}
            {P(`M${x - 4} ${top}h8v${Math.abs(o - c)}h-8Z`, { className: c < o ? 'fd fd--up' : 'fd' })}
          </g>
        )
        return g
      })}
    </>
  ),
  chain: (
    <>
      <g className="fd-live" data-live="scroll" data-d="40">
        {P(sine(-44, 164, 30, 14, 40))}
        {P(sine(-44, 164, 40, 7, 20, 6), { className: 'fd fd--soft' })}
      </g>
      {P('M4 58H116')}
    </>
  ),
  deriv: (
    <>
      {P('M4 58H116')}
      {[30, 22, 36, 18, 28, 42, 30, 36, 24, 32].map((h, i) => (
        <g key={i} className="fd-live" data-live="breathe" data-d={i % 2 ? '0.78' : '1.12'}>
          {P(`M${10 + i * 11} 58V${58 - h}h6V58`)}
        </g>
      ))}
    </>
  ),
  liq: (
    <>
      {[8, 14, 20, 26, 32, 38, 44, 50].map((y, i) => (
        <g key={y} className="fd-live" data-live="blink" data-d={0.25 + (i % 3) * 0.18}>
          {P(`M${[6, 20, 12, 30, 8, 24, 16, 4][i]} ${y}H${[110, 100, 114, 92, 106, 116, 98, 112][i]}`, { strokeWidth: 1 + (i % 4) * 1.4 })}
        </g>
      ))}
      {P('M4 44L24 36L40 40L58 22L74 28L92 14L116 20', { className: 'fd fd--ink' })}
    </>
  ),
  flows: (
    <>
      {P('M52 14h28v36H52Z')}
      {P('M4 24H44M38 18l6 6l-6 6')}
      {P('M88 40h28M110 34l6 6l-6 6')}
      <circle className="fd-live fd-dot" data-live="slide" data-dx="34" cx="6" cy="24" r="2.2" />
      <circle className="fd-live fd-dot" data-live="slide" data-dx="26" cx="88" cy="40" r="2.2" />
    </>
  ),
  cycle: (
    <>
      <g className="fd-live" data-live="scroll" data-d="60">
        {P(sine(-64, 184, 32, 20, 60))}
      </g>
      {P('M4 58H116')}
    </>
  ),
  macro: (
    <>
      {P('M16 52A44 44 0 0 1 104 52')}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = Math.PI + (i / 4) * Math.PI
        return <g key={i}>{P(`M${(60 + 44 * Math.cos(a)).toFixed(1)} ${(52 + 44 * Math.sin(a)).toFixed(1)}L${(60 + 38 * Math.cos(a)).toFixed(1)} ${(52 + 38 * Math.sin(a)).toFixed(1)}`)}</g>
      })}
      <g className="fd-live" data-live="rock" data-d="22" data-o="60 52">
        {P('M60 52L60 20', { className: 'fd fd--ink' })}
      </g>
    </>
  ),
  search: (
    <>
      {P('M6 14H66M6 30H84M6 46H52')}
      <g className="fd-live" data-live="slide" data-dy="-8">
        {P('M98 38A11 11 0 1 1 98 37.9M106 46l8 8', { className: 'fd fd--ink' })}
      </g>
    </>
  ),
}

export function FamilyDraw({ kind }) {
  const root = useRef(null)

  useLive(root, (el, state) => {
    const draws = [...el.querySelectorAll('.fd')]
    const lives = [...el.querySelectorAll('.fd-live')]
    const frame = el.querySelector('.fd-frame')
    let loops = []
    let t = null
    gsap.set(draws, { strokeDashoffset: 1 })

    const drawIn = () => {
      if (t) t.kill()
      t = gsap.fromTo(draws, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: { each: 0.045, from: 'start' }, ease: 'power2.inOut' })
    }
    const move = (n, i) => {
      const k = n.dataset.live
      const d = +n.dataset.d || 0
      const base = { repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.12 }
      if (k === 'breathe') return gsap.to(n, { ...base, scaleY: d, transformOrigin: '50% 100%', duration: 1.5 + (i % 3) * 0.3 })
      if (k === 'blink') return gsap.to(n, { ...base, opacity: d, duration: 1.6 + (i % 3) * 0.4 })
      if (k === 'slide') return gsap.to(n, { ...base, x: +n.dataset.dx || 0, y: +n.dataset.dy || 0, duration: 1.8 })
      if (k === 'rock') return gsap.fromTo(n, { rotation: -d, svgOrigin: n.dataset.o }, { rotation: d, svgOrigin: n.dataset.o, ...base, duration: 2.2 })
      return gsap.to(n, { x: -d, repeat: -1, ease: 'none', duration: d / 4 }) // scroll: seamless, one period per loop
    }
    return {
      start() {
        drawIn()
        loops = lives.map(move)
        if (!state.on) loops.forEach((l) => l.pause())
        frame.addEventListener('pointerenter', drawIn)
      },
      toggle(on) {
        loops.forEach((l) => l.paused(!on))
      },
      kill() {
        if (t) t.kill()
        loops.forEach((l) => l.kill())
        frame.removeEventListener('pointerenter', drawIn)
      },
    }
  })

  return (
    <div ref={root} className="fdraw" aria-hidden="true">
      <div className="fd-frame live-zoom">
        <svg viewBox={`0 0 ${W2} 64`} className="fd-svg" focusable="false">
          {DRAWINGS[kind]}
        </svg>
      </div>
    </div>
  )
}
