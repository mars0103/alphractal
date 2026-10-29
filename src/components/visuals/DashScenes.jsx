import { useRef } from 'react'
import { gsap, Flip } from '../../lib/gsap.js'
import { useLive } from '../../lib/live.js'
import { Cursor, Siren } from './DashCharts.jsx'

/* Alerts and Screeners as loose scenes drawn straight on the paper: no frames, no cards, no shadows.
   Shapes and orderings only: no market values. Each one grows in when it first comes into view, then keeps looping
   while it is on screen, and zooms under the mouse. The default markup is the finished state (SSR, reduced motion). */

/* ---------------------------------------------------------------- Alerts */
const AW = 640
const AH = 170
const LEVEL = 0.56 // the dashed 0.05% level, as a share of the chart height
const NP = 100
const fv = (u) => 0.1 + 0.68 * Math.pow(u, 1.45) + 0.026 * Math.sin(u * 15) + 0.012 * Math.sin(u * 39 + 1)
const FP = Array.from({ length: NP + 1 }, (_, i) => [(i / NP) * AW, (1 - fv(i / NP)) * (AH - 20) + 10])
const LY = (1 - LEVEL) * (AH - 20) + 10
const CROSS = FP.findIndex((p) => p[1] <= LY) // first point above the level
const CX = (FP[CROSS - 1][0] + FP[CROSS][0]) / 2
const CROSS_AT = CROSS / NP
const pathTo = (p) => {
  const n = Math.min(NP, p * NP)
  const i = Math.floor(n)
  const pts = FP.slice(0, i + 1)
  if (i < NP) {
    const a = FP[i]
    const b = FP[i + 1]
    pts.push([a[0] + (b[0] - a[0]) * (n - i), a[1] + (b[1] - a[1]) * (n - i)])
  }
  return pts.map((q, k) => `${k ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('')
}
const FULL = pathTo(1)
const TIP = FP[NP]

const RULE = ['Bitcoin', 'Funding Rate', 'Greater than', '0.05%', 'Telegram']

export function AlertScene() {
  const root = useRef(null)

  useLive(root, (el, state) => {
    const q = (s) => el.querySelector(s)
    const toks = [...el.querySelectorAll('.al-tok')]
    const arrows = [...el.querySelectorAll('.al-arrow')]
    const line = q('.al-line')
    const dot = q('.al-dot')
    const siren = q('.al-siren')
    const ring = q('.al-ring')
    const note = q('.al-note')
    const level = q('.al-level')
    const lvlText = q('.al-lvltext')
    let intro = null
    let loop = null
    let ready = false

    const paint = (p) => {
      line.setAttribute('d', p ? pathTo(p) : 'M0 0')
      const n = Math.min(NP, p * NP)
      const i = Math.min(NP - 1, Math.floor(n))
      dot.setAttribute('cx', (FP[i][0] + (FP[i + 1][0] - FP[i][0]) * (n - i)).toFixed(1))
      dot.setAttribute('cy', (FP[i][1] + (FP[i + 1][1] - FP[i][1]) * (n - i)).toFixed(1))
    }

    gsap.set(toks, { clipPath: 'inset(0 100% 0 0)' })
    gsap.set(arrows, { autoAlpha: 0 })
    gsap.set([level, lvlText], { autoAlpha: 0 })
    gsap.set([siren, ring, note, dot], { autoAlpha: 0 })
    gsap.set(note, { x: 36 })
    toks.forEach((t) => t.parentElement.classList.add('is-empty'))
    paint(0)

    const P = { p: 0 }
    loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.5 })
    loop
      .call(
        () => {
          P.p = 0
          paint(0)
          gsap.set(line, { autoAlpha: 1 })
          gsap.set([siren, ring, dot], { autoAlpha: 0 })
          gsap.set(note, { autoAlpha: 0, x: 36 })
        },
        null,
        0,
      )
      .set(dot, { autoAlpha: 1 }, 0.3)
      .to(P, { p: 1, duration: 5.4, ease: 'none', onUpdate: () => paint(P.p) }, 0.3)
      // at the crossing: the siren pulses once and the Telegram notification slides in
      .fromTo(siren, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.3 + 5.4 * CROSS_AT)
      .fromTo(ring, { autoAlpha: 0.5, attr: { r: 8 } }, { autoAlpha: 0, attr: { r: 44 }, duration: 1.3, ease: 'power2.out' }, 0.3 + 5.4 * CROSS_AT)
      .to(note, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0.3 + 5.4 * CROSS_AT + 0.35)
      .to([line, dot, siren, note], { autoAlpha: 0, duration: 0.7 }, 8.8)
      .to({}, { duration: 0.2 }, 9.5)

    return {
      start() {
        intro = gsap.timeline({
          onComplete: () => {
            ready = true
            loop.paused(!state.on)
          },
        })
        intro.to([level, lvlText], { autoAlpha: 1, duration: 0.8 }, 0)
        toks.forEach((t, i) => {
          intro.to(t, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'steps(8)', onComplete: () => t.parentElement.classList.remove('is-empty') }, 0.4 + i * 0.7)
          if (arrows[i]) intro.to(arrows[i], { autoAlpha: 1, duration: 0.3 }, 0.4 + i * 0.7 + 0.35)
        })
      },
      toggle(on) {
        if (ready) loop.paused(!on)
      },
      kill() {
        if (intro) intro.kill()
        loop.kill()
        paint(1)
        toks.forEach((t) => t.parentElement.classList.remove('is-empty'))
        gsap.set([...toks, ...arrows, line, dot, siren, ring, note, level, lvlText], { clearProps: 'all' })
      },
    }
  })

  return (
    <div className="al" ref={root}>
      <ol className="al-rule" aria-label="Alert rule">
        {RULE.map((t, i) => (
          <li key={t}>
            <span className="al-field">
              <span className="al-tok">{t}</span>
            </span>
            {i < RULE.length - 1 && (
              <span className="al-arrow" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="al-chart live-zoom" aria-hidden="true">
        <svg viewBox={`0 0 ${AW} ${AH}`} focusable="false">
          {[0.2, 0.4, 0.6, 0.8].map((k) => (
            <line key={k} className="al-grid" x1="0" x2={AW} y1={k * AH} y2={k * AH} />
          ))}
          <line className="al-level" x1="0" x2={AW - 54} y1={LY} y2={LY} />
          <text className="al-lvltext" x={AW - 48} y={LY + 4}>
            0.05%
          </text>
          <path className="al-line" d={FULL} />
          <circle className="al-ring" cx={CX} cy={LY} r="44" opacity="0" />
          <g className="al-siren" style={{ color: '#0b0d14' }}>
            <g transform={`translate(${CX - 11} ${LY - 40}) scale(0.92)`}>
              <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
              <path d="M5 21h14" />
              <path d="M12 3v1.5M4.5 6.5l1.2 1M19.5 6.5l-1.2 1" />
            </g>
          </g>
          <circle className="al-dot" cx={TIP[0]} cy={TIP[1]} r="4" />
        </svg>
      </div>
      <div className="al-note" role="group" aria-label="Notification">
        <p className="al-note__head">
          <Siren /> Bitcoin alert
        </p>
        <p>Funding Rate crossed above 0.05%.</p>
        <p className="al-note__next">Review positioning and leverage in Alphractal.</p>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Screeners */
// proportional bars only (fr = funding rate, oi = open interest, lq = liquidations, pf = performance); `i` is the market order
const COINS = [
  { c: 'BTC', fr: 0.42, oi: 0.96, lq: 0.5, pf: 0.58, i: 0 },
  { c: 'ETH', fr: 0.3, oi: 0.74, lq: 0.42, pf: 0.46, i: 1 },
  { c: 'SOL', fr: 0.74, oi: 0.52, lq: 0.36, pf: 0.7, i: 2 },
  { c: 'XRP', fr: 0.18, oi: 0.4, lq: 0.22, pf: 0.34, i: 3 },
  { c: 'DOGE', fr: 0.9, oi: 0.3, lq: 0.6, pf: 0.82, i: 4 },
  { c: 'ADA', fr: 0.64, oi: 0.24, lq: 0.18, pf: 0.4, i: 5 },
  { c: 'AVAX', fr: 0.56, oi: 0.2, lq: 0.26, pf: 0.52, i: 6 },
  { c: 'LINK', fr: 0.12, oi: 0.16, lq: 0.1, pf: 0.28, i: 7 },
]
const COLS = [
  ['fr', 'Funding Rate'],
  ['oi', 'Open Interest'],
  ['lq', 'Liquidations'],
  ['pf', 'Performance'],
]
const ICON = { BTC: 'btc', ETH: 'eth', SOL: 'sol', XRP: 'xrp', DOGE: 'doge', ADA: 'ada', AVAX: 'avax', LINK: 'link' }
const DESC = [...COINS].sort((a, b) => b.fr - a.fr)

// Bitcoin's funding line: wanders around its zero line
const SW = 400
const SH = 200
const fl = (u) => 0.5 + 0.2 * Math.sin(u * 9 + 0.4) + 0.12 * Math.sin(u * 23 + 1) + 0.05 * Math.sin(u * 61) + 0.1 * (u - 0.5)
const FLINE = Array.from({ length: 121 }, (_, i) => `${i ? 'L' : 'M'}${((i / 120) * SW).toFixed(1)} ${((1 - fl(i / 120)) * (SH - 30) + 15).toFixed(1)}`).join('')

export function ScreenerScene() {
  const root = useRef(null)

  useLive(root, (el, state) => {
    const q = (s) => el.querySelector(s)
    const body = q('.sc-body')
    const rows = [...el.querySelectorAll('.sc-row[data-c]')]
    const by = Object.fromEntries(rows.map((r) => [r.dataset.c, r]))
    const head = q('.sc-sort')
    const caret = q('.sc-sort i')
    const bars = [...el.querySelectorAll('.sc-bar i')]
    const cursor = q('.dx-cursor')
    const panel = q('.sc-panel')
    const trace = q('.sc-trace')
    const btc = by.BTC
    const place = (list) => list.forEach((c) => body.appendChild(by[c.c]))
    const where = (node, fx = 0.5, fy = 0.5) => {
      const a = el.getBoundingClientRect()
      const b = node.getBoundingClientRect()
      return { x: b.left - a.left + b.width * fx, y: b.top - a.top + b.height * fy }
    }
    // reorder the rows and let every one glide to its new place
    const sort = (list, dur = 0.9) => {
      const st = Flip.getState(rows)
      place(list)
      Flip.from(st, { duration: dur, ease: 'power2.inOut', stagger: 0.03 })
    }
    const click = () => gsap.fromTo(cursor, { scale: 1 }, { scale: 0.78, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: '3px 3px' })
    let ready = false
    const market = [...COINS]
    const asc = [...DESC].reverse()
    const setCaret = (dir) => {
      head.classList.toggle('is-on', !!dir)
      caret.textContent = dir === 'asc' ? '↑' : dir === 'desc' ? '↓' : ''
    }

    const reset = () => {
      gsap.killTweensOf(rows)
      gsap.set(rows, { clearProps: 'transform' })
      place(market)
      setCaret(null)
      btc.classList.remove('is-hit')
      gsap.set(panel, { autoAlpha: 0 })
      gsap.set(trace, { strokeDashoffset: 1 })
      gsap.set(cursor, { autoAlpha: 0, ...where(q('.sc-body'), 1.02, 0.05) })
    }
    reset()
    gsap.set(bars, { scaleX: 0 })

    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 })
    tl.call(reset, null, 0)
      // 1. the cursor goes to the Funding Rate header and clicks
      .to(cursor, { autoAlpha: 1, duration: 0.4 }, 0.5)
      .call(() => gsap.to(cursor, { ...where(head, 0.55, 0.6), duration: 1.1, ease: 'power2.inOut' }), null, 0.7)
      .call(() => (click(), setCaret('desc')), null, 2.1)
      // 2. highest to lowest, with the rows changing position
      .call(() => sort(DESC), null, 2.25)
      // 3. and again: lowest to highest
      .call(() => (click(), setCaret('asc')), null, 3.9)
      .call(() => sort(asc), null, 4.05)
      // 4. the cursor opens the Bitcoin row and its funding is traced
      .call(() => gsap.to(cursor, { ...where(btc, 0.12, 0.5), duration: 1, ease: 'power2.inOut' }), null, 5.4)
      .call(() => (click(), btc.classList.add('is-hit')), null, 6.5)
      .to(panel, { autoAlpha: 1, duration: 0.6 }, 6.6)
      .to(trace, { strokeDashoffset: 0, duration: 2.6, ease: 'power1.inOut' }, 6.8)
      .to(cursor, { autoAlpha: 0, duration: 0.4 }, 7.3)
      .to([panel], { autoAlpha: 0, duration: 0.7 }, 11.2)
      .to({}, { duration: 0.3 }, 12)

    return {
      start() {
        gsap.to(bars, {
          scaleX: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.012,
          onComplete: () => {
            ready = true
            tl.paused(!state.on)
          },
        })
      },
      toggle(on) {
        if (ready) tl.paused(!on)
      },
      kill() {
        tl.kill()
        gsap.killTweensOf([...rows, ...bars, cursor, panel, trace])
        place(DESC)
        setCaret('desc')
        btc.classList.remove('is-hit')
        gsap.set([...rows, ...bars, cursor, panel, trace], { clearProps: 'transform,opacity,visibility,strokeDashoffset' })
      },
    }
  })

  return (
    <div className="sc" ref={root} aria-hidden="true">
      <div className="sc-table">
        <div className="sc-row sc-row--head">
          <span>Coin</span>
          {COLS.map(([k, t]) => (
            <span key={k} className={k === 'fr' ? 'sc-sort is-on' : ''}>
              {t}
              {k === 'fr' && <i>↓</i>}
            </span>
          ))}
        </div>
        <div className="sc-body">
          {DESC.map((r) => (
            <div className="sc-row" data-c={r.c} key={r.c}>
              <b>
                <img src={`/coins/${ICON[r.c]}.svg`} alt="" width="16" height="16" />
                {r.c}
              </b>
              {COLS.map(([k]) => (
                <span className="sc-bar" key={k}>
                  <i style={{ width: `${r[k] * 100}%` }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="sc-panel">
        <p className="sc-panel__t">
          <img src="/coins/btc.svg" alt="" width="18" height="18" />
          <b>Bitcoin</b> Funding Rate
        </p>
        <div className="sc-chart live-zoom">
          <svg viewBox={`0 0 ${SW} ${SH}`} focusable="false">
            <line className="al-grid" x1="0" x2={SW} y1={SH / 2} y2={SH / 2} />
            <path className="sc-trace" d={FLINE} pathLength="1" />
          </svg>
        </div>
      </div>
      <Cursor />
    </div>
  )
}
