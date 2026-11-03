import { useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/gsap.js'
import { useLive } from '../lib/live.js'

/* Drawings for /platform/mcp: loose line work straight on the page, no cards, no chrome, no market data.
   Everything is deterministic (no Math.random in render) and finished by default, so the server markup is the final
   state; under reduced motion nothing runs. Each scene draws itself in when it first comes into view and keeps moving
   while it is on screen. Charts also zoom under the mouse (useZoom). Ink for lines; the brand blue only on text. */

const f1 = (n) => +n.toFixed(1)

/* Types `full` into `el` while `p.n` runs from 0 to full.length. */
function typeInto(el, full, duration) {
  const p = { n: 0 }
  return gsap.to(p, { n: full.length, duration, ease: 'none', onUpdate: () => (el.textContent = full.slice(0, Math.round(p.n))) })
}

/* ---------------------------------------------------------------- Conversations (HTML, drawn on paper)
   One runner for the two chats: the question types, then every [data-seq] element appears in DOM order (lines draw from
   the left, ticks draw), the finished state holds, fades, and the sequence plays again for as long as it is on screen. */
function runConvo(el, state) {
  const typed = el.querySelector('.mcpx-q__typed')
  const caret = el.querySelector('.mcpx-q__caret')
  // the text is kept aside: a second run (dev double mount) finds the element already emptied
  const full = (typed.dataset.full ||= typed.textContent)
  const seq = [...el.querySelectorAll('[data-seq]')]
  const cycle = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.5 })
  let pos = 0.2
  seq.forEach((n) => {
    const line = n.classList.contains('mcpx-sq')
    cycle.fromTo(n, line ? { autoAlpha: 0, scaleX: 0 } : { autoAlpha: 0, y: 8 }, line ? { autoAlpha: 1, scaleX: 1, duration: 0.7, ease: 'power2.out', transformOrigin: '0 50%' } : { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, pos)
    const tick = n.querySelector('.mcpx-tick path')
    if (tick) cycle.fromTo(tick, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, pos + 0.3)
    pos += line ? 0.2 : 0.7
  })
  cycle.to(seq, { autoAlpha: 0, duration: 0.6 }, pos + 3.2)
  gsap.set(seq, { autoAlpha: 0 })
  gsap.set(caret, { autoAlpha: 1 })
  typed.textContent = ''
  let ready = false
  let intro = null
  return {
    start() {
      intro = typeInto(typed, full, 1.7)
      intro.eventCallback('onComplete', () => {
        ready = true
        gsap.to(caret, { autoAlpha: 0, duration: 0.3, delay: 0.4 })
        cycle.paused(!state.on)
      })
    },
    toggle(on) {
      if (ready) cycle.paused(!on)
    },
    kill() {
      if (intro) intro.kill()
      cycle.kill()
    },
  }
}

const Tick = () => (
  <svg className="mcpx-tick" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M2.5 8.5l3.5 3.5L13.5 4" pathLength="1" />
  </svg>
)

/* The word-like dashes of a written line: an answer drawn, not a skeleton box. */
const Sq = ({ w = '100%' }) => <span className="mcpx-sq" data-seq="" style={{ '--w': w }} />

const Quote = ({ text }) => (
  <p className="mcpx-q">
    <span className="mcpx-q__m">“</span>
    <span className="mcpx-q__typed">{text}</span>
    <span className="mcpx-q__m">”</span>
    <i className="mcpx-q__caret" aria-hidden="true" />
  </p>
)

/* Problem: the question, the assistant consulting Alphractal with the real tool names, the answer with two references. */
const QUESTION = 'Which metrics can I use to test this thesis?'
const CONSULT = ['search_metrics', 'get_metric_info', 'get_metric_data']

export function ProblemChat() {
  const root = useRef(null)
  useLive(root, runConvo)
  return (
    <div ref={root} className="mcpx-convo" role="img" aria-label="A question, the assistant consulting Alphractal tools through MCP, then an answer with two references">
      <Quote text={QUESTION} />
      <div className="mcpx-consult">
        <p className="mcpx-consult__k" data-seq="">
          Consulting Alphractal
        </p>
        <ul>
          {CONSULT.map((t) => (
            <li key={t} data-seq="">
              <Tick />
              <code>{t}</code>
            </li>
          ))}
        </ul>
      </div>
      <div className="mcpx-ans">
        <Sq w="96%" />
        <Sq w="88%" />
        <p className="mcpx-ans__refline" data-seq="">
          <span className="mcpx-sq mcpx-sq--inline" style={{ '--w': '62%' }} />
          <b>[1]</b>
          <b>[2]</b>
        </p>
        <ol className="mcpx-refs">
          <li data-seq="">
            <b>[1]</b>
            <span className="mcpx-sq mcpx-sq--ref" style={{ '--w': '46%' }} />
          </li>
          <li data-seq="">
            <b>[2]</b>
            <span className="mcpx-sq mcpx-sq--ref" style={{ '--w': '34%' }} />
          </li>
        </ol>
      </div>
    </div>
  )
}

/* Step 3: a grounded conversation. The copy of the step names what to review: sources, dates and limitations. */
const ASKED = 'Summarize Bitcoin’s recent liquidation activity and distinguish the observed data from a directional forecast.'

export function GroundedChat() {
  const root = useRef(null)
  useLive(root, runConvo)
  return (
    <div ref={root} className="mcpx-convo mcpx-convo--b" role="img" aria-label="A market question answered with Alphractal context, with sources, dates and limitations to review">
      <Quote text={ASKED} />
      <div className="mcpx-ans">
        <Sq w="94%" />
        <Sq w="100%" />
        <Sq w="71%" />
      </div>
      <ul className="mcpx-review">
        {['Sources', 'Dates', 'Limitations'].map((t) => (
          <li key={t} data-seq="">
            <Tick />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------- Step 1: the connection screen, in line style */
const TABS = ['Claude', 'Cursor', 'Gemini', 'Copilot']
const TAB_W = 112
const URL = 'https://mcp.alphractal.com/mcp'
const ROWS = [
  [34, 250],
  [34, 206],
  [34, 232],
]

export function ConnectDraw() {
  const root = useRef(null)
  const [copied, setCopied] = useState(false)
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(URL)
    } catch {
      const t = document.createElement('textarea')
      t.value = URL
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  useLive(root, (el, state) => {
    const under = el.querySelector('.mcpx-cu')
    const text = el.querySelector('.mcpx-cu-url')
    const caret = el.querySelector('.mcpx-cu-caret')
    const rows = [...el.querySelectorAll('.mcpx-cu-row')]
    const copy = el.querySelector('.mcpx-cu-copy')
    const tabs = [...el.querySelectorAll('.mcpx-cu-tab')]
    const full = (text.dataset.full ||= text.textContent)
    const cycle = gsap.timeline({ paused: true, repeat: -1 })
    // the client tab moves on every few seconds and its instructions are drawn again
    for (let i = 1; i <= TABS.length; i++) {
      const at = (i - 1) * 3.4
      const to = i % TABS.length
      cycle.to(under, { x: to * TAB_W, duration: 0.7, ease: 'power3.inOut' }, at + 2.7)
      cycle.call(() => tabs.forEach((t, k) => t.classList.toggle('is-on', k === to)), null, at + 2.9)
      cycle.fromTo(rows, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.18, ease: 'power2.out' }, at + 3.1)
      cycle.fromTo(copy, { autoAlpha: 0.3 }, { autoAlpha: 1, duration: 0.5 }, at + 3.1)
    }
    gsap.set(rows, { strokeDashoffset: 1 })
    gsap.set([under, copy], { autoAlpha: 0 })
    gsap.set(caret, { autoAlpha: 1 })
    text.textContent = ''
    let ready = false
    let tl = null
    return {
      start() {
        tl = gsap.timeline({ onComplete: () => ((ready = true), cycle.paused(!state.on)) })
        tl.to(under, { autoAlpha: 1, duration: 0.4 })
        tl.add(typeInto(text, full, 1.5), 0.4)
        tl.to(copy, { autoAlpha: 1, duration: 0.4 }, 1.7)
        tl.to(rows, { strokeDashoffset: 0, duration: 0.9, stagger: 0.18, ease: 'power2.out' }, 1.9)
        tl.to(caret, { autoAlpha: 0, duration: 0.3 }, 2.2)
      },
      toggle(on) {
        if (ready) cycle.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
        cycle.kill()
      },
    }
  })

  return (
    <div ref={root} className="mcpx-draw">
      <svg viewBox="0 0 450 250" role="img" aria-label="Choose your AI client, then paste the server URL" focusable="false">
        <line className="mcpx-ln" x1="0" x2="450" y1="42" y2="42" />
        {TABS.map((t, i) => (
          <text key={t} className={`mcpx-cu-tab${i === 0 ? ' is-on' : ''}`} x={i * TAB_W + 2} y="28">
            {t}
          </text>
        ))}
        <line className="mcpx-cu" x1="0" x2="86" y1="42" y2="42" />
        <rect className="mcpx-ln" x="0.5" y="84" width="449" height="46" rx="5" />
        <text className="mcpx-cu-url" x="18" y="112">
          {URL}
        </text>
        <rect className="mcpx-cu-caret" x="19" y="99" width="1.5" height="22" />
        <g className="mcpx-cu-copy">
          <rect className="mcpx-ln" x="402" y="98" width="15" height="17" rx="2" />
          <path className="mcpx-ln" d="M406 94h13a2 2 0 012 2v14" />
        </g>
        {ROWS.map(([x, w], i) => (
          <path key={i} className="mcpx-cu-row" d={`M${x} ${166 + i * 30}h${w}`} pathLength="1" />
        ))}
        {ROWS.map(([, w], i) => (
          <circle key={`c${i}`} className="mcpx-cu-dot" cx="10" cy={166 + i * 30} r="3" />
        ))}
      </svg>
      <button type="button" className={`mcpx-copybtn${copied ? ' is-copied' : ''}`} onClick={copyUrl} aria-label="Copy the server URL">
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}

/* ---------------------------------------------------------------- Example sequences (line charts that zoom) */
const CW = 360
const CHH = 190

/* a) a price line with one marked point and two report references */
const priceY = (x) => 118 - 26 * Math.sin(x * 0.026 + 0.6) - 12 * Math.sin(x * 0.071 + 1.3) - 5 * Math.sin(x * 0.19) - (x - 10) * 0.07
const PRICE = (() => {
  let d = ''
  for (let x = 10; x <= 350; x += 4) d += `${x === 10 ? 'M' : 'L'}${x} ${f1(priceY(x))}`
  return d
})()
const MARK_X = 214

export function ThesisSeq() {
  const root = useRef(null)
  useLive(root, (el, state) => {
    const line = el.querySelector('.mcpx-price')
    const dot = el.querySelector('.mcpx-travel')
    const ring = el.querySelector('.mcpx-ring')
    const rest = [...el.querySelectorAll('.mcpx-th-late')]
    const links = [...el.querySelectorAll('.mcpx-th-link')]
    const len = line.getTotalLength()
    let u = 0
    let live = false
    let tl = null
    let pulse = null
    gsap.set(line, { strokeDashoffset: 1 })
    gsap.set(links, { strokeDashoffset: 1 })
    gsap.set([...rest, dot], { autoAlpha: 0 })
    return {
      start() {
        tl = gsap.timeline({ onComplete: () => ((live = true), gsap.set(dot, { autoAlpha: 1 })) })
        tl.to(line, { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut' })
        tl.to(rest, { autoAlpha: 1, duration: 0.5, stagger: 0.12 }, 1.5)
        tl.to(links, { strokeDashoffset: 0, duration: 0.8, stagger: 0.2 }, 1.9)
        pulse = gsap.to(ring, { attr: { r: 11 }, opacity: 0.25, duration: 1.6, repeat: -1, ease: 'sine.out' })
      },
      frame(dt) {
        if (!live) return
        u = (u + dt * 0.09) % 1
        const p = line.getPointAtLength(u * len)
        dot.setAttribute('cx', f1(p.x))
        dot.setAttribute('cy', f1(p.y))
      },
      toggle(on) {
        if (pulse) pulse.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
        if (pulse) pulse.kill()
      },
    }
  })
  const my = f1(priceY(MARK_X))
  return (
    <div ref={root} className="mcpx-chart" role="img" aria-label="A price line with one point marked and two report references">
      <div className="live-zoom mcpx-chart__frame">
        <svg viewBox={`0 0 ${CW} ${CHH}`} focusable="false" aria-hidden="true">
          <line className="mcpx-ln mcpx-ln--faint" x1="10" x2="350" y1="176" y2="176" />
          <path className="mcpx-price" d={PRICE} pathLength="1" />
          <circle className="mcpx-travel" cx="10" cy={f1(priceY(10))} r="3.2" />
          <g className="mcpx-th-late">
            <line className="mcpx-ln mcpx-ln--dash" x1={MARK_X} x2={MARK_X} y1={Number(my) + 7} y2="176" />
            <circle className="mcpx-ring" cx={MARK_X} cy={my} r="6" />
            <circle className="mcpx-mark" cx={MARK_X} cy={my} r="3.4" />
          </g>
          <path className="mcpx-th-link" d={`M${MARK_X + 4} ${Number(my) - 6}C${MARK_X + 30} 50 ${MARK_X + 40} 40 ${MARK_X + 62} 30`} pathLength="1" />
          <path className="mcpx-th-link" d={`M${MARK_X + 4} ${Number(my) - 6}C${MARK_X + 40} 72 ${MARK_X + 80} 56 ${MARK_X + 116} 32`} pathLength="1" />
          {[MARK_X + 62, MARK_X + 116].map((x, i) => (
            <g key={x} className="mcpx-th-late">
              <path className="mcpx-ln" d={`M${x - 8} 6h11l5 5v15h-16zM${x + 3} 6v5h5M${x - 4} 17h8M${x - 4} 22h8`} transform={`translate(0 ${i ? 2 : -2})`} />
              <text className="mcpx-ref" x={x - 7} y={i ? 46 : 42}>
                [{i + 1}]
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

/* b) liquidation candles with one highlighted cluster band, no values */
const NC = 27
const cc = (i) => 0.5 + 0.17 * Math.sin(i * 0.43) + 0.1 * Math.sin(i * 1.07 + 1) + 0.05 * Math.sin(i * 2.3)
const CANDLES = Array.from({ length: NC }, (_, i) => {
  const o = cc(i - 1)
  const c = cc(i)
  return {
    x: f1(16 + i * 12.6),
    o: f1(160 - o * 130),
    c: f1(160 - c * 130),
    h: f1(160 - (Math.max(o, c) + 0.03 + 0.03 * Math.abs(Math.sin(i * 3.1))) * 130),
    l: f1(160 - (Math.min(o, c) - 0.03 - 0.03 * Math.abs(Math.sin(i * 1.7))) * 130),
  }
})
const BAND = [60, 80]
const CLOSE = CANDLES.map((k, i) => `${i ? 'L' : 'M'}${k.x} ${k.c}`).join('')

export function ConditionsSeq() {
  const root = useRef(null)
  useLive(root, (el, state) => {
    const cs = [...el.querySelectorAll('.mcpx-candle')]
    const band = [...el.querySelectorAll('.mcpx-band')]
    const hatch = el.querySelector('#mcpx-hatch')
    const close = el.querySelector('.mcpx-close')
    const dot = el.querySelector('.mcpx-travel')
    const len = close.getTotalLength()
    let u = 0
    let live = false
    let tl = null
    let drift = null
    gsap.set(cs, { autoAlpha: 0 })
    gsap.set(band, { autoAlpha: 0 })
    gsap.set(dot, { autoAlpha: 0 })
    return {
      start() {
        tl = gsap.timeline({ onComplete: () => ((live = true), gsap.set(dot, { autoAlpha: 1 })) })
        cs.forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, scaleY: 0.1 }, { autoAlpha: 1, scaleY: 1, duration: 0.5, ease: 'power2.out', transformOrigin: '50% 50%' }, i * 0.06))
        tl.to(band, { autoAlpha: 1, duration: 0.9, stagger: 0.1 }, 1.4)
        drift = gsap.to(hatch, { attr: { x: 7 }, duration: 1.4, repeat: -1, ease: 'none' })
      },
      frame(dt) {
        if (!live) return
        u = (u + dt * 0.1) % 1
        const p = close.getPointAtLength(u * len)
        dot.setAttribute('cx', f1(p.x))
        dot.setAttribute('cy', f1(p.y))
      },
      toggle(on) {
        if (drift) drift.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
        if (drift) drift.kill()
      },
    }
  })
  return (
    <div ref={root} className="mcpx-chart" role="img" aria-label="Liquidation candles with one cluster band highlighted">
      <div className="live-zoom mcpx-chart__frame">
        <svg viewBox={`0 0 ${CW} ${CHH}`} focusable="false" aria-hidden="true">
          <defs>
            <pattern id="mcpx-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="7" />
            </pattern>
          </defs>
          <line className="mcpx-ln mcpx-ln--faint" x1="8" x2="352" y1="178" y2="178" />
          <rect className="mcpx-band mcpx-band--fill" x="8" y={BAND[0]} width="344" height={BAND[1] - BAND[0]} fill="url(#mcpx-hatch)" />
          <line className="mcpx-band mcpx-band--edge" x1="8" x2="352" y1={BAND[0]} y2={BAND[0]} />
          <line className="mcpx-band mcpx-band--edge" x1="8" x2="352" y1={BAND[1]} y2={BAND[1]} />
          {CANDLES.map((k, i) => {
            const up = k.c <= k.o
            return (
              <g key={i} className={`mcpx-candle ${up ? 'is-up' : 'is-down'}`}>
                <line x1={k.x} x2={k.x} y1={k.h} y2={k.l} />
                <rect x={k.x - 3.4} y={Math.min(k.o, k.c)} width="6.8" height={Math.max(2, Math.abs(k.o - k.c))} />
              </g>
            )
          })}
          <path className="mcpx-close" d={CLOSE} />
          <circle className="mcpx-travel" cx={CANDLES[0].x} cy={CANDLES[0].c} r="3.2" />
        </svg>
      </div>
    </div>
  )
}

/* c) a loop around three lines that fill in: funding, open interest, liquidations */
const LOOP_C = [58, 96]
const LOOP_R = 40
const LINES = [
  ['funding', 44, 0.8],
  ['open interest', 96, 1.7],
  ['liquidations', 148, 2.9],
]
const wave = (y, k) => {
  let d = ''
  for (let x = 156; x <= 350; x += 5) d += `${x === 156 ? 'M' : 'L'}${x} ${f1(y - 12 * Math.sin((x - 156) * 0.045 + k) - 5 * Math.sin((x - 156) * 0.13 + k * 2))}`
  return d
}
const loopArc = (() => {
  const a0 = -Math.PI * 0.35
  const a1 = Math.PI * 1.62
  const p = (a) => `${f1(LOOP_C[0] + LOOP_R * Math.cos(a))} ${f1(LOOP_C[1] + LOOP_R * Math.sin(a))}`
  const e = [LOOP_C[0] + LOOP_R * Math.cos(a1), LOOP_C[1] + LOOP_R * Math.sin(a1)]
  const t = a1 + Math.PI / 2
  const ah = (s) => `${f1(e[0] - 9 * Math.cos(t - s))} ${f1(e[1] - 9 * Math.sin(t - s))}`
  return `M${p(a0)}A${LOOP_R} ${LOOP_R} 0 1 1 ${p(a1)}M${ah(0.5)}L${f1(e[0])} ${f1(e[1])}L${ah(-0.5)}`
})()

export function RecurringSeq() {
  const root = useRef(null)
  useLive(root, (el, state) => {
    const arc = el.querySelector('.mcpx-loop')
    const lines = [...el.querySelectorAll('.mcpx-rc-line')]
    const labels = [...el.querySelectorAll('.mcpx-rc-label')]
    const dot = el.querySelector('.mcpx-travel')
    const cycle = gsap.timeline({ paused: true, repeat: -1 })
    lines.forEach((l, i) => {
      cycle.fromTo(l, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, i * 0.7)
      cycle.fromTo(labels[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, i * 0.7)
    })
    cycle.to([...lines, ...labels], { autoAlpha: 0, duration: 0.7 }, 5.2)
    cycle.set(lines, { autoAlpha: 1 }, 5.95)
    let a = -Math.PI * 0.35
    let ready = false
    let tl = null
    gsap.set(arc, { strokeDashoffset: 1 })
    gsap.set(lines, { strokeDashoffset: 1 })
    gsap.set([...labels, dot], { autoAlpha: 0 })
    return {
      start() {
        tl = gsap.timeline({ onComplete: () => ((ready = true), gsap.set(dot, { autoAlpha: 1 }), cycle.time(0), cycle.paused(!state.on)) })
        tl.to(arc, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' })
      },
      frame(dt) {
        if (!ready) return
        a += dt * 1.5
        dot.setAttribute('cx', f1(LOOP_C[0] + LOOP_R * Math.cos(a)))
        dot.setAttribute('cy', f1(LOOP_C[1] + LOOP_R * Math.sin(a)))
      },
      toggle(on) {
        if (ready) cycle.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
        cycle.kill()
      },
    }
  })
  const paths = useMemo(() => LINES.map(([, y, k]) => wave(y, k)), [])
  return (
    <div ref={root} className="mcpx-chart" role="img" aria-label="A loop around three lines filling in: funding, open interest and liquidations">
      <div className="live-zoom mcpx-chart__frame">
        <svg viewBox={`0 0 ${CW} ${CHH}`} focusable="false" aria-hidden="true">
          <path className="mcpx-loop" d={loopArc} pathLength="1" />
          <circle className="mcpx-travel" cx={LOOP_C[0] + LOOP_R * Math.cos(-Math.PI * 0.35)} cy={LOOP_C[1] + LOOP_R * Math.sin(-Math.PI * 0.35)} r="3.2" />
          {LINES.map(([name, y], i) => (
            <g key={name}>
              <line className="mcpx-ln mcpx-ln--faint" x1="156" x2="350" y1={y + 18} y2={y + 18} />
              <text className="mcpx-rc-label" x="156" y={y - 22}>
                {name}
              </text>
              <path className="mcpx-rc-line" d={paths[i]} pathLength="1" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
