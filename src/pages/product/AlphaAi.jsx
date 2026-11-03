import { useRef } from 'react'
import '../../styles/p-alpha-ai.css'
import { useMeta } from '../../hooks/useMeta.js'
import { LINKS } from '../../lib/facts.js'
import { gsap } from '../../lib/gsap.js'
import { useLive } from '../../lib/live.js'
import PageShell from '../../components/PageShell.jsx'
import PageHero from '../../components/PageHero.jsx'
import GlowButton from '../../components/GlowButton.jsx'
import AlphaSphere from '../../components/AlphaSphere.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import Aurora from '../../components/Aurora.jsx'
import { ExtLink, PBlock, Rows } from '../../components/ProductBlocks.jsx'

/* /platform/alpha-ai — centred hero over a particle sphere, the problem, four ways to ask, related, closing CTA.
   Copy: Guia completo para IA.md (Alpha AI) and Textos/08 - Alpha AI.md. Nothing here is a real AI answer: the
   conversations are drawn on the page with structural text and named [placeholders] where a figure would go, until the
   real recordings exist. Every scene is a loose drawing on paper: it types / streams in when first seen, keeps moving
   while on screen, and the charts zoom under a mouse. Final state is the server markup (also the reduced-motion state). */

const SUGGESTED = [
  'What does Bitcoin’s liquidation activity say about leverage risk?',
  'Is on-chain activity confirming the derivatives positioning?',
  'How do current conditions compare with previous market cycles?',
  'Which metrics should I examine to test this thesis?',
]

const SOURCES = ['On-chain', 'Derivatives', 'Sentiment', 'Macro']

const PROMPT = {
  quick: 'Is Bitcoin’s current leverage positioning vulnerable to a long squeeze?',
  deep: 'Build an investment thesis for HYPE. Assess Hyperliquid’s adoption, competitive positioning, token utility, unlock schedule and valuation. What supports the thesis, what could invalidate it, and what are the key risks?',
  chart: 'What does this chart show, and what should I compare it with before drawing a conclusion?',
  voice: 'What changed in Bitcoin’s leverage conditions?',
}

const REPORT = [
  'Investment thesis',
  'Adoption & market traction',
  'Tokenomics & unlock risks',
  'Competition & valuation',
  'Bull case, bear case & thesis invalidation',
]

const RELATED = [
  { title: 'Metrics & Models', text: 'Explore the metrics and models behind your analysis.', href: '/platform/metrics', linkLabel: 'Open Metrics & Models' },
  { title: 'MCP', text: 'Bring Alphractal data into your AI assistant or agent.', href: '/platform/mcp', linkLabel: 'Open MCP' },
  { title: 'Research & Academy', text: 'Explore the research and learn how to interpret the data.', href: '/platform/research', linkLabel: 'Open Research & Academy' },
]

/* ---------------------------------------------------------------- helpers */
const f1 = (n) => n.toFixed(1)

// Types `full` into `el` over `dur` seconds, at position `at` of the timeline `tl`; the caret shows while it types.
function typeTo(tl, el, full, dur, at) {
  const o = { p: 0 }
  tl.fromTo(
    o,
    { p: 0 },
    {
      p: 1,
      duration: dur,
      ease: 'none',
      onStart: () => el.parentNode.setAttribute('data-typing', ''),
      onUpdate: () => {
        el.textContent = full.slice(0, Math.round(o.p * full.length))
      },
      onComplete: () => el.parentNode.removeAttribute('data-typing'),
    },
    at,
  )
}

// A quote, set as type: large blue marks, no box. The text inside is what gets typed.
function Quote({ children, className = '' }) {
  return (
    <p className={`aai-quote ${className}`}>
      <span className="aai-qm" aria-hidden="true">“</span>
      <span className="aai-quote__t" data-full={children}>{children}</span>
      <span className="aai-qm" aria-hidden="true">”</span>
    </p>
  )
}

// An answer line as words (so it can stream); { r: 1 } is a numbered reference.
function Words({ tokens }) {
  return (
    <p>
      {tokens.map((t, i) =>
        typeof t === 'string' ? (
          <span className="aai-w" key={i}>{t} </span>
        ) : (
          <span className="aai-w aai-ref" key={i}>[{t.r}] </span>
        ),
      )}
    </p>
  )
}

// A thin line chart path from a function of u in 0..1, drawn in a w x h box.
function curve(n, w, h, fn) {
  let d = ''
  for (let i = 0; i <= n; i++) d += `${i ? 'L' : 'M'}${f1((i / n) * w)} ${f1(h * fn(i / n))}`
  return d
}

/* ---------------------------------------------------------------- hero */
function HeroVisual() {
  return (
    <div className="aai-hero">
      <AlphaSphere />
      <ul className="aai-suggest">
        {SUGGESTED.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------- problem: one line, question -> sources -> answer */
const PW = 300
const PH = 170
const pf = (u) => 0.55 - 0.2 * Math.sin(u * 5.2 + 0.4) - 0.1 * Math.sin(u * 11.7) - 0.18 * u
const PCURVE = curve(60, PW, PH, pf)

function Trace() {
  const root = useRef(null)
  useLive(root, (el) => {
    const line = el.querySelector('.aai-trace__line')
    const cols = [...el.querySelectorAll('.aai-trace__col')]
    const src = [...el.querySelectorAll('.aai-trace__src li')]
    const q = el.querySelector('.aai-quote__t')
    const full = q.dataset.full
    const words = [...el.querySelectorAll('.aai-w')]
    const path = el.querySelector('.aai-pc__line')
    const marks = [...el.querySelectorAll('.aai-pc__mark')]
    const runner = el.querySelector('.aai-trace__run')
    const len = path.getTotalLength()
    let tl = null
    const hidden = [...cols, ...src, ...words, ...marks]
    // everything back to its empty state, ready for the next pass
    const reset = () => {
      q.textContent = ''
      q.parentNode.removeAttribute('data-typing')
      gsap.set(line, { '--p': 0 })
      gsap.set(hidden, { autoAlpha: 0 })
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      gsap.set(runner, { '--x': 0, autoAlpha: 0 })
    }
    reset()
    return {
      start() {
        // The dot travels the line top to bottom and each part appears as it reaches it; at the end it resets and loops.
        const T = 7.5
        const H = el.offsetHeight || 1
        const at = (i) => Math.min(0.85, (cols[i].offsetTop + 6) / H) * T
        const tq = 0
        const ts = at(1)
        const ta = at(2)
        tl = gsap.timeline({ repeat: -1, onRepeat: reset })
        tl.to(runner, { '--x': 1, duration: T, ease: 'none' }, 0)
        tl.to(runner, { autoAlpha: 1, duration: 0.2 }, 0)
        tl.to(line, { '--p': 1, duration: T, ease: 'none' }, 0)
        tl.to(cols[0], { autoAlpha: 1, duration: 0.3 }, tq)
        typeTo(tl, q, full, 1.6, tq + 0.2)
        tl.to(cols[1], { autoAlpha: 1, duration: 0.2 }, ts)
        tl.to(src, { autoAlpha: 1, duration: 0.4, stagger: 0.35 }, ts)
        tl.to(cols[2], { autoAlpha: 1, duration: 0.2 }, ta)
        tl.to(words, { autoAlpha: 1, duration: 0.3, stagger: 0.07 }, ta + 0.1)
        tl.to(path, { strokeDashoffset: 0, duration: 1.8, ease: 'power1.inOut' }, ta + 0.3)
        tl.to(marks, { autoAlpha: 1, duration: 0.4, stagger: 0.5 }, ta + 1.0)
        // hold the finished answer, then fade out before the loop starts over
        tl.to([...cols, runner], { autoAlpha: 0, duration: 0.6 }, T + 1.8)
        tl.to({}, { duration: 0.3 }, T + 2.4)
      },
      toggle(on) {
        if (tl) tl.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })

  return (
    <div ref={root} className="aai-trace" aria-label="From question, through the data sources, to an answer">
      <span className="aai-trace__line" aria-hidden="true" />
      <span className="aai-trace__run" aria-hidden="true" />
      <div className="aai-trace__col aai-trace__q">
        <Quote>{SUGGESTED[0]}</Quote>
      </div>
      <div className="aai-trace__col aai-trace__s">
        <ul className="aai-trace__src">
          {SOURCES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="aai-trace__col aai-trace__a">
        <div className="aai-ans">
          <Words tokens={['Positioning read from derivatives data', { r: 1 }, 'and checked against on-chain behavior', { r: 2 }]} />
        </div>
        <div className="aai-zoom live-zoom">
          <svg viewBox={`0 0 ${PW} ${PH}`} className="aai-pc" focusable="false" aria-hidden="true">
            <line className="aai-pc__grid" x1="0" x2={PW} y1={PH * 0.33} y2={PH * 0.33} />
            <line className="aai-pc__grid" x1="0" x2={PW} y1={PH * 0.66} y2={PH * 0.66} />
            <path className="aai-pc__line" d={PCURVE} />
            {[[0.3, 1], [0.72, 2]].map(([u, n]) => (
              <g className="aai-pc__mark" key={n} transform={`translate(${f1(u * PW)} ${f1(PH * pf(u))})`}>
                <line x1="0" x2="0" y1="0" y2="-26" />
                <circle r="3" />
                <text y="-32" textAnchor="middle">{n}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

function Problem() {
  return (
    <PBlock id="problem">
      <div className="aai-problem">
        <div className="aai-problem__l">
          <p className="eyebrow" data-reveal="fade">THE PROBLEM</p>
          <h2 className="h2" data-reveal="lines">A market answer needs market data.</h2>
          <p className="lede" data-reveal="up">
            A convincing explanation is only useful when you can understand what supports it. Without the right data, a market summary can miss the positioning, context and risks behind a move.
          </p>
          <div className="aai-problem__r" data-reveal="up">
            <p>
              Alpha AI connects your questions to Alphractal’s analytics. Explore on-chain behavior, derivatives, sentiment and macro context, then follow the available data and chart references to examine the analysis yourself.
            </p>
            <p>Test theses, cross evidence and observe next steps.</p>
          </div>
        </div>
        <Trace />
      </div>
    </PBlock>
  )
}

/* ---------------------------------------------------------------- modes */
// Quick Ask and Deep Research are the two modes of one selector: the underline shows which one is on.
function Selector({ on }) {
  return (
    <p className="aai-sel" aria-hidden="true">
      <span className={on === 0 ? 'is-on' : undefined}>Quick Ask</span>
      <span className={on === 1 ? 'is-on' : undefined}>Deep Research</span>
    </p>
  )
}

function ModeText({ n, title, text, className = '' }) {
  return (
    <div className={`aai-mode-text ${className}`}>
      <span className="aai-mode-n" aria-hidden="true">{n}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

/* Quick Ask: the question, a consulting line, the answer streaming block by block with numbered references that point
   to a thin chart on the right; it ends still. */
const QW = 280
const QH = 230
const qf = (u) => 0.62 - 0.22 * Math.sin(u * 4.6 + 0.3) - 0.08 * Math.sin(u * 13) - 0.22 * u
const QCURVE = curve(70, QW, QH, qf)
const QANS = [
  ['Leverage positioning, read from derivatives data', { r: 1 }],
  ['Whether on-chain activity confirms it', { r: 2 }],
  ['Next steps to observe: [metric] and [metric], before drawing a conclusion.'],
]

function QuickScene() {
  const root = useRef(null)
  useLive(root, (el) => {
    const q = el.querySelector('.aai-quote__t')
    const full = q.dataset.full
    const consult = el.querySelector('.aai-consult')
    const src = [...el.querySelectorAll('.aai-consult__s span')]
    const blocks = [...el.querySelectorAll('.aai-ans p')]
    const path = el.querySelector('.aai-qc__line')
    const marks = [...el.querySelectorAll('.aai-qc__mark')]
    const dot = el.querySelector('.aai-qc__dot')
    const len = path.getTotalLength()
    let tl = null
    q.textContent = ''
    gsap.set(consult, { autoAlpha: 0 })
    gsap.set(src, { opacity: 0.25 })
    gsap.set(blocks.flatMap((b) => [...b.children]), { autoAlpha: 0 })
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
    gsap.set([...marks, dot], { autoAlpha: 0 })
    return {
      start() {
        tl = gsap.timeline()
        typeTo(tl, q, full, 1.8, 0.2)
        tl.to(consult, { autoAlpha: 1, duration: 0.4 }, 2.1)
        tl.to(src, { opacity: 1, duration: 0.3, stagger: 0.45 }, 2.4)
        tl.to(consult, { opacity: 0.55, duration: 0.6 }, 4.6)
        blocks.forEach((b, i) => tl.to([...b.children], { autoAlpha: 1, duration: 0.25, stagger: 0.06 }, 4.8 + i * 1.5))
        tl.to(path, { strokeDashoffset: 0, duration: 3.6, ease: 'power1.inOut' }, 4.8)
        tl.to(marks[0], { autoAlpha: 1, duration: 0.4 }, 5.4)
        tl.to(marks[1], { autoAlpha: 1, duration: 0.4 }, 6.9)
        tl.to(dot, { autoAlpha: 1, duration: 0.4 }, 8.2) // the pulse itself is a CSS animation on the dot (see .aai-qc__dot)
      },
      toggle(on) {
        if (tl) tl.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })

  return (
    <div ref={root} className="aai-quick" aria-hidden="true">
      <Selector on={0} />
      <Quote>{PROMPT.quick}</Quote>
      <div className="aai-quick__grid">
        <div className="aai-quick__chat">
          <p className="aai-consult">
            <i className="aai-consult__dots"><b /><b /><b /></i>
            <span className="aai-consult__s">
              {SOURCES.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </span>
          </p>
          <div className="aai-ans">
            {QANS.map((t, i) => (
              <Words key={i} tokens={t} />
            ))}
          </div>
        </div>
        <div className="aai-zoom live-zoom">
          <svg viewBox={`0 0 ${QW} ${QH}`} className="aai-qc" focusable="false">
            {[0.25, 0.5, 0.75].map((k) => (
              <line key={k} className="aai-pc__grid" x1="0" x2={QW} y1={QH * k} y2={QH * k} />
            ))}
            <path className="aai-qc__line" d={QCURVE} />
            {[[0.28, 1], [0.66, 2]].map(([u, n]) => (
              <g className="aai-qc__mark" key={n} transform={`translate(${f1(u * QW)} ${f1(QH * qf(u))})`}>
                <line x1="0" x2="0" y1="0" y2="-30" />
                <circle r="3" />
                <text y="-36" textAnchor="middle">{n}</text>
              </g>
            ))}
            <circle className="aai-qc__dot" cx={QW} cy={f1(QH * qf(1))} r="3.5" data-o={`${QW} ${f1(QH * qf(1))}`} />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* Deep Research: the report sections light up line by line along a fine progress line, and the sources fill in. */
function DeepScene() {
  const root = useRef(null)
  useLive(root, (el) => {
    const q = el.querySelector('.aai-quote__t')
    const full = q.dataset.full
    const rows = [...el.querySelectorAll('.aai-sections li')]
    const bar = el.querySelector('.aai-sections__bar')
    const srcT = el.querySelector('.aai-deep__srct')
    const srcFull = srcT.dataset.full
    const srcBar = el.querySelector('.aai-deep__srcbar')
    let tl = null
    q.textContent = ''
    srcT.textContent = ''
    gsap.set(rows, { opacity: 0.22 })
    gsap.set([bar, srcBar], { '--p': 0 })
    return {
      start() {
        tl = gsap.timeline({ repeat: -1, repeatDelay: 3.2 })
        tl.call(() => {
          q.textContent = ''
          srcT.textContent = ''
        }, null, 0)
        typeTo(tl, q, full, 2.4, 0.2)
        tl.fromTo(bar, { '--p': 0 }, { '--p': 1, duration: rows.length * 1.1, ease: 'none' }, 2.8)
        tl.fromTo(srcBar, { '--p': 0 }, { '--p': 1, duration: rows.length * 1.1, ease: 'none' }, 2.8)
        tl.fromTo(rows, { opacity: 0.22 }, { opacity: 1, duration: 0.5, stagger: 1.1 }, 2.9)
        typeTo(tl, srcT, srcFull, rows.length * 1.1, 2.8)
      },
      toggle(on) {
        if (tl) tl.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })

  return (
    <div ref={root} className="aai-deep" aria-hidden="true">
      <Selector on={1} />
      <Quote className="aai-quote--lg">{PROMPT.deep}</Quote>
      <div className="aai-deep__body">
        <ol className="aai-sections">
          <span className="aai-sections__bar" />
          {REPORT.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="aai-deep__src">
          <p>
            Sources consulted
          </p>
          <p className="aai-deep__srct" data-full={SOURCES.join(' · ')}>{SOURCES.join(' · ')}</p>
          <span className="aai-deep__srcbar" />
        </div>
      </div>
    </div>
  )
}

/* Chart copilot: a large line chart that keeps flowing, the Alpha AI panel sliding open beside it. The hover zoom only
   magnifies the chart; the panel and the full chart stay on the page. */
const CW = 900
const CH = 380
const CN_WIDE = 150
const CN_LITE = 70
const cser = (u, t) => {
  const x = u * 7 + t * 0.35
  return 0.42 - 0.16 * Math.sin(x * 0.9) - 0.09 * Math.sin(x * 2.3 + 1) - 0.035 * Math.sin(x * 6.1 + 2)
}
const cser2 = (u, t) => {
  const x = u * 5.4 + t * 0.28
  return 0.8 - 0.07 * Math.sin(x * 1.1 + 2) - 0.05 * Math.sin(x * 3.2) - 0.018 * Math.sin(x * 8)
}
function chartFrame(n, t) {
  const price = []
  const metric = []
  for (let i = 0; i <= n; i++) {
    price.push([(i / n) * CW, CH * cser(i / n, t)])
    metric.push([(i / n) * CW, CH * cser2(i / n, t)])
  }
  const d = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('')
  const a = Math.round(n * 0.58)
  const b = Math.round(n * 0.78)
  const k = Math.round(n * 0.68)
  return { price: d(price), metric: d(metric), hl: d(price.slice(a, b + 1)), mx: price[k][0], my: price[k][1] }
}
const C0 = chartFrame(CN_WIDE, 0)

function ChartScene() {
  const root = useRef(null)
  useLive(root, (el) => {
    const clip = el.querySelector('.aai-cc__clip rect')
    const panel = el.querySelector('.aai-cpanel')
    const inner = [...el.querySelectorAll('.aai-cpanel__in > *')]
    const q = el.querySelector('.aai-quote__t')
    const full = q.dataset.full
    const words = [...el.querySelectorAll('.aai-cpanel .aai-w')]
    const price = el.querySelector('.aai-cc__price')
    const metric = el.querySelector('.aai-cc__metric')
    const hl = el.querySelector('.aai-cc__hl')
    const mark = el.querySelector('.aai-cc__mark')
    const vline = el.querySelector('.aai-cc__v')
    const wide = window.matchMedia('(min-width: 901px)').matches
    const lite = window.matchMedia('(max-width: 991px)').matches
    const n = lite ? CN_LITE : CN_WIDE
    let t = 0
    let tl = null
    q.textContent = ''
    gsap.set(clip, { attr: { width: 0 } })
    gsap.set(inner, { autoAlpha: 0, y: 10 })
    gsap.set(words, { autoAlpha: 0 })
    if (wide) gsap.set(panel, { width: 0 })
    else gsap.set(panel, { autoAlpha: 0 })
    return {
      start() {
        const p = { w: 0 }
        tl = gsap.timeline()
        tl.to(p, { w: CW, duration: 2.6, ease: 'power1.inOut', onUpdate: () => clip.setAttribute('width', f1(p.w)) }, 0)
        if (wide) tl.to(panel, { width: '34%', duration: 1, ease: 'power3.inOut' }, 2.8)
        else tl.to(panel, { autoAlpha: 1, duration: 0.6 }, 2.8)
        tl.to(inner, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.25 }, 3.5)
        typeTo(tl, q, full, 2.2, 4.4)
        tl.to(words, { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, 6.8)
      },
      frame(dt) {
        t += dt
        const c = chartFrame(n, t)
        price.setAttribute('d', c.price)
        metric.setAttribute('d', c.metric)
        hl.setAttribute('d', c.hl)
        mark.setAttribute('cx', f1(c.mx))
        mark.setAttribute('cy', f1(c.my))
        vline.setAttribute('x1', f1(c.mx))
        vline.setAttribute('x2', f1(c.mx))
        vline.setAttribute('y1', f1(c.my))
      },
      toggle(on) {
        if (tl) tl.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })

  return (
    <div ref={root} className="aai-chart" aria-hidden="true">
      <div className="aai-zoom live-zoom">
        <svg viewBox={`0 0 ${CW} ${CH}`} className="aai-cc" focusable="false">
          <defs>
            <clipPath id="aai-cc-clip" className="aai-cc__clip">
              <rect x="0" y="-10" width={CW} height={CH + 20} />
            </clipPath>
          </defs>
          <g clipPath="url(#aai-cc-clip)">
            {[0.2, 0.4, 0.6, 0.8].map((k) => (
              <line key={k} className="aai-pc__grid" x1="0" x2={CW} y1={CH * k} y2={CH * k} />
            ))}
            <line className="aai-cc__v" x1={f1(C0.mx)} x2={f1(C0.mx)} y1={f1(C0.my)} y2={CH} />
            <path className="aai-cc__metric" d={C0.metric} />
            <path className="aai-cc__price" d={C0.price} />
            <path className="aai-cc__hl" d={C0.hl} />
            <circle className="aai-cc__mark" cx={f1(C0.mx)} cy={f1(C0.my)} r="4.5" />
          </g>
        </svg>
      </div>
      <div className="aai-cpanel">
        <div className="aai-cpanel__in">
          <p className="aai-cpanel__h">
            <b>BTC</b> <span>[chart name]</span>
          </p>
          <Quote>{PROMPT.chart}</Quote>
          <div className="aai-ans">
            <Words tokens={['This chart shows [metric] for [asset].']} />
            <Words tokens={['Compare it with [second metric] before drawing a conclusion.']} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* Voice: microphone, a waveform while it listens, then the transcribed question typed on the page. Loops about every 8s.
   It never asks for the visitor's microphone: it is a drawing. */
const VBARS = 26
const vh = (i) => 6 + 24 * Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.45))

function VoiceScene() {
  const root = useRef(null)
  useLive(root, (el) => {
    const mic = el.querySelector('.aai-mic')
    const bars = [...el.querySelectorAll('.aai-wave i')]
    const q = el.querySelector('.aai-quote__t')
    const full = q.dataset.full
    const quote = el.querySelector('.aai-quote')
    let listening = false
    let t = 0
    let tl = null
    q.textContent = ''
    gsap.set(bars, { scaleY: 0.12 })
    gsap.set(mic, { autoAlpha: 0 })
    return {
      start() {
        tl = gsap.timeline({ repeat: -1 })
        tl.call(() => {
          q.textContent = ''
        }, null, 0)
        tl.fromTo(mic, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.1)
        tl.call(() => {
          listening = true
          mic.classList.add('is-live')
        }, null, 0.5)
        tl.call(() => {
          listening = false
          mic.classList.remove('is-live')
          gsap.to(bars, { scaleY: 0.12, duration: 0.5, overwrite: true })
        }, null, 3.4)
        tl.fromTo(quote, { autoAlpha: 0.0 }, { autoAlpha: 1, duration: 0.3 }, 3.9)
        typeTo(tl, q, full, 2.6, 4)
        tl.to(quote, { autoAlpha: 0, duration: 0.5 }, 7.5)
        tl.to({}, { duration: 0.1 }, 8)
      },
      frame(dt) {
        t += dt
        if (!listening) return
        for (let i = 0; i < bars.length; i++) {
          const e = Math.sin(i * 0.5 + t * 7) * Math.sin(i * 0.17 + t * 2.1)
          gsap.set(bars[i], { scaleY: 0.18 + 0.82 * Math.abs(e) })
        }
      },
      toggle(on) {
        if (tl) tl.paused(!on)
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })

  return (
    <div ref={root} className="aai-voice" aria-hidden="true">
      <div className="aai-voice__row">
        <span className="aai-mic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </span>
        <span className="aai-wave">
          {Array.from({ length: VBARS }, (_, i) => (
            <i key={i} style={{ height: `${vh(i).toFixed(1)}px` }} />
          ))}
        </span>
      </div>
      <Quote>{PROMPT.voice}</Quote>
    </div>
  )
}

function Modes() {
  return (
    <div id="how">
      <header className="aai-how">
        <Aurora colorStops={['#0a1470', '#1a35d0', '#0a1470']} amplitude={1.2} blend={1} height={0.22} speed={0.7} glow={0.45} brightness={0.85} opacity={0.9} layers={2} direction="top" className="aai-how__aurora" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div className="container aai-how__head">
          <p className="eyebrow" data-reveal="fade">HOW IT WORKS</p>
          <h2 className="h2" data-reveal="lines">Four ways to ask.</h2>
          <p className="lede" data-reveal="up">Start with a question, investigate a thesis or explore the chart in front of you.</p>
        </div>
      </header>
      <PBlock rule={false} className="aai-how-body">
      <div className="aai-modes">
        <article className="aai-mode aai-mode--quick" data-reveal="up">
          <ModeText n={1} title="Quick Ask" text="Ask a focused question about an asset, metric or market condition. Get a direct explanation and follow up as your analysis develops." />
          <QuickScene />
        </article>
        <article className="aai-mode aai-mode--deep" data-reveal="up">
          <ModeText n={2} title="Deep Research" text="Take a market thesis further with multi-step analysis across relevant data sources. Bring the findings together in a structured report you can review in detail." />
          <DeepScene />
        </article>
        <article className="aai-mode aai-mode--chart" data-reveal="up">
          <ModeText n={3} title="Chart copilot" text="Ask about the chart in front of you. Keep the asset and metric in context while you explore what the data means for your thesis." />
          <ChartScene />
        </article>
        <article className="aai-mode aai-mode--voice" data-reveal="up">
          <ModeText n={4} title="Voice" text="Speak your question and turn it into text, then continue the conversation with Alpha AI." />
          <VoiceScene />
        </article>
      </div>
    </PBlock>
    </div>
  )
}

export default function AlphaAi() {
  useMeta({
    title: 'Alpha AI: Ask Crypto Market Questions With Data | Alphractal',
    description: 'Ask Alpha AI about an asset or setup and bring on-chain, derivatives, sentiment and macro data into the conversation. Ask in your language and explore the data behind the answer.',
  })

  return (
    <PageShell>
      <PageHero
        centered
        eyebrow="ALPHA AI"
        title="An AI that turns the data into your next move."
        sub="Ask about an asset or setup. Alpha AI brings on-chain, derivatives, sentiment and macro data into the conversation, helping you understand market conditions, assess risk and explore what matters for your strategy."
        actions={
          <>
            <GlowButton href={LINKS.start}>Start free</GlowButton>
            <ExtLink className="link-arrow phero__more" href="#how">
              See the four modes <span>→</span>
            </ExtLink>
          </>
        }
        note="Ask in your language. Explore the data behind the answer."
        visual={<HeroVisual />}
      />

      <Problem />
      <Modes />

      <PBlock id="related" eyebrow="KEEP GOING" title="Continue your analysis.">
        <Rows items={RELATED} />
      </PBlock>

      <FinalCta
        title={['Bring your next', 'market question.']}
        sub="Explore the data, challenge your thesis and build a clearer view with Alpha AI."
        primary="Start free"
        primaryHref={LINKS.start}
        secondary="View plans"
        secondaryTo="https://app.alphractal.com/plans"
      />
    </PageShell>
  )
}
