import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap.js'
import { useLive, useZoom } from '../../lib/live.js'

/* Institutional visuals. Shapes and labels only: no market data, no real figures.
   - Skyline: the opening's night-time city (dark, almost transparent buildings, a few yellow lights).
   - Scenes: the three solutions as loose line drawings (price, candles, waves): they grow in on scroll, keep moving, and
     zoom under the mouse. No cards or shadows. */

/* ---------------------------------------------------------------- Skyline */
function rng(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const SKY_W = 1600
const SKY_H = 720

/* A layered silhouette of a big city: tall art-deco towers with stepped crowns and spires, pencil towers, gothic lanterns,
   slanted and notched roofs, in four layers from far (lighter, bluer) to near (darker, fading to the page's black at the
   foot). Every tower is one closed path, a layer is one <path>; the small yellow lights are clipped to it. */
const f = (n) => +n.toFixed(1)

// Each builder returns the outline of one tower standing on the ground line, as a closed sub-path.
const TOWERS = {
  // stepped art-deco tower: three setbacks, then a spire tapering to a needle
  deco: (x, w, h) => {
    const cx = x + w / 2
    const steps = [[0, 0.56], [0.13, 0.76], [0.25, 0.9]]
    const spire = h * 0.34
    const left = [[x, SKY_H]]
    steps.forEach(([inset, k]) => {
      left.push([x + w * inset, SKY_H - h * k * 0.94 - (inset ? 0 : 0)])
    })
    const pts = [[x, SKY_H]]
    let prev = 0
    steps.forEach(([inset, k], i) => {
      const y = SKY_H - h * k
      pts.push([x + w * prev, y], [x + w * inset, y])
      prev = inset
    })
    pts.push([x + w * 0.39, SKY_H - h * 0.92], [cx - 1.2, SKY_H - h * 0.98 - spire * 0.4], [cx, SKY_H - h - spire])
    pts.push([cx + 1.2, SKY_H - h * 0.98 - spire * 0.4], [x + w * 0.61, SKY_H - h * 0.92])
    for (let i = steps.length - 1; i >= 0; i--) {
      const [inset, k] = steps[i]
      const y = SKY_H - h * k
      pts.push([x + w * (1 - inset), y], [x + w * (1 - (i ? steps[i - 1][0] : 0)), y])
    }
    pts.push([x + w, SKY_H])
    return 'M' + pts.map(([px, py]) => `${f(px)} ${f(py)}`).join('L') + 'Z'
  },
  // slim pencil tower with a bevelled top and an antenna
  pencil: (x, w, h) => {
    const cx = x + w / 2
    const ant = 26 + h * 0.18
    const pts = [[x, SKY_H], [x, SKY_H - h + w * 0.55], [cx - 1.4, SKY_H - h], [cx - 1, SKY_H - h - ant], [cx + 1, SKY_H - h - ant], [cx + 1.4, SKY_H - h], [x + w, SKY_H - h + w * 0.55], [x + w, SKY_H]]
    return 'M' + pts.map(([px, py]) => `${f(px)} ${f(py)}`).join('L') + 'Z'
  },
  // gothic crown: a shoulder, a lantern and a pointed roof
  crown: (x, w, h) => {
    const cx = x + w / 2
    const i1 = w * 0.16
    const i2 = w * 0.3
    const pts = [
      [x, SKY_H], [x, SKY_H - h * 0.8], [x + i1, SKY_H - h * 0.8], [x + i1, SKY_H - h * 0.9], [x + i2, SKY_H - h * 0.9],
      [cx, SKY_H - h * 1.1], [x + w - i2, SKY_H - h * 0.9], [x + w - i1, SKY_H - h * 0.9], [x + w - i1, SKY_H - h * 0.8], [x + w, SKY_H - h * 0.8], [x + w, SKY_H],
    ]
    return 'M' + pts.map(([px, py]) => `${f(px)} ${f(py)}`).join('L') + 'Z'
  },
  // a roof that slopes
  slant: (x, w, h) => {
    const drop = 0.1 + 0.08 * ((x * 7) % 3)
    const pts = [[x, SKY_H], [x, SKY_H - h], [x + w, SKY_H - h * (1 - drop)], [x + w, SKY_H]]
    return 'M' + pts.map(([px, py]) => `${f(px)} ${f(py)}`).join('L') + 'Z'
  },
  // flat roof with a notch cut out of the middle
  notch: (x, w, h) => {
    const nw = w * 0.3
    const pts = [[x, SKY_H], [x, SKY_H - h], [x + (w - nw) / 2, SKY_H - h], [x + (w - nw) / 2, SKY_H - h + h * 0.07], [x + (w + nw) / 2, SKY_H - h + h * 0.07], [x + (w + nw) / 2, SKY_H - h], [x + w, SKY_H - h], [x + w, SKY_H]]
    return 'M' + pts.map(([px, py]) => `${f(px)} ${f(py)}`).join('L') + 'Z'
  },
  // a block with a smaller box on the roof
  block: (x, w, h) => {
    const bw = w * 0.4
    const bx = x + w * 0.2
    const pts = [[x, SKY_H], [x, SKY_H - h], [bx, SKY_H - h], [bx, SKY_H - h - 10], [bx + bw, SKY_H - h - 10], [bx + bw, SKY_H - h], [x + w, SKY_H - h], [x + w, SKY_H]]
    return 'M' + pts.map(([px, py]) => `${f(px)} ${f(py)}`).join('L') + 'Z'
  },
}

// Fillers: runs of towers of random kind and size, laid side by side (they overlap a little).
function run(seed, { hMin, hMax, wMin, wMax, kinds, overlap, from = -40, to = SKY_W + 40 }) {
  const r = rng(seed)
  let d = ''
  let x = from
  while (x < to) {
    const w = wMin + r() * (wMax - wMin)
    const h = hMin + Math.pow(r(), 1.4) * (hMax - hMin)
    const kind = kinds[Math.floor(r() * kinds.length)]
    d += TOWERS[kind](x, w, h)
    x += w * (1 - overlap * r())
  }
  return d
}

/* Dark and almost see-through: each layer is a deep navy at low opacity, so the blue behind shows through and the towers
   read as silhouettes. `win` is the window grid (size, step, share of windows lit) and `lo` the brightness of its lights. */
const LAYERS = [
  {
    id: 'far',
    stops: ['#232b66', '#0a0d1f'],
    op: 0.45,
    lo: 0.4,
    win: { seed: 101, w: 2.4, h: 3.2, sx: 8, sy: 11, p: 0.045 },
    d: () =>
      run(11, { hMin: 120, hMax: 330, wMin: 26, wMax: 58, kinds: ['block', 'slant', 'notch', 'pencil'], overlap: 0.35 }) +
      TOWERS.pencil(560, 30, 540) + TOWERS.deco(1180, 70, 430) + TOWERS.pencil(1500, 28, 500),
  },
  {
    id: 'mid',
    stops: ['#1a2155', '#080b1b'],
    op: 0.5,
    lo: 0.55,
    win: { seed: 202, w: 2.8, h: 3.8, sx: 9.5, sy: 13, p: 0.05 },
    d: () =>
      run(23, { hMin: 150, hMax: 360, wMin: 40, wMax: 84, kinds: ['block', 'slant', 'notch', 'crown'], overlap: 0.3 }) +
      TOWERS.deco(120, 78, 450) + TOWERS.deco(760, 66, 495) + TOWERS.crown(980, 46, 400) + TOWERS.pencil(1330, 34, 470),
  },
  {
    id: 'near',
    stops: ['#131a48', '#070918'],
    op: 0.58,
    lo: 0.75,
    win: { seed: 303, w: 3.2, h: 4.4, sx: 11, sy: 15, p: 0.055 },
    d: () =>
      run(37, { hMin: 110, hMax: 300, wMin: 44, wMax: 104, kinds: ['block', 'slant', 'notch', 'block', 'crown'], overlap: 0.22 }) +
      TOWERS.crown(300, 52, 360) + TOWERS.deco(1050, 74, 420) + TOWERS.slant(1440, 90, 380),
  },
  {
    id: 'front',
    stops: ['#0e1236', '#06070f'],
    op: 0.7,
    lo: 0.95,
    win: { seed: 404, w: 3.6, h: 4.8, sx: 12, sy: 16, p: 0.06 },
    d: () => run(51, { hMin: 50, hMax: 190, wMin: 30, wMax: 80, kinds: ['block', 'slant', 'notch'], overlap: 0.1 }),
  },
]

// Lit windows on a regular grid. They are clipped to the layer's silhouette, so a light only ever sits inside a building.
// Three groups: steady, and two that twinkle out of step with each other.
function windows(layer) {
  const { seed, w, h, sx, sy, p } = layer.win
  const r = rng(seed)
  const out = { steady: '', a: '', b: '' }
  for (let x = 4; x < SKY_W; x += sx) {
    for (let y = 150; y < SKY_H - 6; y += sy) {
      if (r() > p) continue
      const k = r()
      const g = k < 0.16 ? 'a' : k < 0.3 ? 'b' : 'steady'
      out[g] += `M${f(x)} ${f(y)}h${w}v${h}h-${w}Z`
    }
  }
  return out
}

export function Skyline() {
  const layers = useMemo(() => LAYERS.map((l) => ({ ...l, path: l.d(), lit: windows(l) })), [])
  return (
    <div className="inst-sky" aria-hidden="true">
      <svg viewBox={`0 0 ${SKY_W} ${SKY_H}`} preserveAspectRatio="xMaxYMax slice" focusable="false">
        <defs>
          {layers.map((l) => (
            <g key={l.id}>
              <linearGradient id={`inst-sky-${l.id}`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="120" y2={SKY_H}>
                <stop offset="0" stopColor={l.stops[0]} />
                <stop offset="1" stopColor={l.stops[1]} />
              </linearGradient>
              <clipPath id={`inst-clip-${l.id}`}>
                <path d={l.path} />
              </clipPath>
            </g>
          ))}
        </defs>
        {layers.map((l) => (
          <g key={l.id}>
            <path d={l.path} fill={`url(#inst-sky-${l.id})`} fillOpacity={l.op} />
            <g clipPath={`url(#inst-clip-${l.id})`} fill="#ffc94d" fillOpacity={l.lo}>
              <path d={l.lit.steady} />
              <path d={l.lit.a} className="inst-sky__tw" />
              <path d={l.lit.b} className="inst-sky__tw" style={{ animationDelay: '-2.7s' }} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ---------------------------------------------------------------- Scenes
   Three loose line drawings on the section's white, alive like the home's chart: on arrival each one grows in, then keeps
   moving (a scrolling tape, new candles, drifting waves) while it is on screen. On a mouse the chart zooms into the spot
   under the pointer. Shapes are illustrative, never market data.
   Everything is deterministic (no Math.random in the first render), so the server and client markup match. */

const Btc = ({ size = 18 }) => <img className="ist__btc" src="/coins/btc.svg" alt="" width={size} height={size} />

/* ---------------------------------------------------------------- 1 · Alpha Intelligence */
// An endless price tape: a pure function of the index, so any window of it can be drawn and it can scroll forever.
const RW = 640
const RH = 330
const RTOP = 44
const NP = 110 // points on screen
const POOL = 30 // most regime runs drawn at once
const rv = (i) =>
  0.5 + 0.2 * Math.sin(i * 0.05) + 0.1 * Math.sin(i * 0.13 + 1) + 0.03 * Math.sin(i * 0.9) + 0.02 * Math.sin(i * 2.3 + 1) + 0.011 * Math.sin(i * 5.1 + 2) + 0.006 * Math.sin(i * 11.7)
const rvCache = new Map()
const val = (i) => {
  let v = rvCache.get(i)
  if (v === undefined) {
    v = rv(i)
    if (rvCache.size > 6000) rvCache.clear()
    rvCache.set(i, v)
  }
  return v
}
// The "model": fast average above the slow one is Long, below is Short, close together is Out.
const kindAt = (i) => {
  let a = 0
  let b = 0
  for (let k = 0; k < 22; k++) {
    const v = val(i - k)
    b += v
    if (k < 6) a += v
  }
  const d = a / 6 - b / 22
  return d > 0.02 ? 'long' : d < -0.02 ? 'short' : 'out'
}
const ry = (v) => RTOP + (1 - v) * (RH - RTOP - 26)

function regimeFrame(t) {
  const head = Math.floor(t)
  const frac = t - head
  const step = RW / (NP - 1)
  const pts = []
  for (let j = 0; j <= NP; j++) {
    const idx = head - NP + 1 + j
    pts.push({ x: (j - frac) * step, y: ry(val(idx)), k: kindAt(idx) })
  }
  for (let j = 1; j < pts.length; j++) {
    let e = j
    while (e < pts.length && pts[e].k === pts[j].k) e++
    if (e - j < 5 && j > 0 && e < pts.length) for (let m = j; m < e; m++) pts[m].k = pts[j - 1].k
    j = e - 1
  }
  const runs = []
  let cur = null
  pts.forEach((p) => {
    if (!cur || cur.kind !== p.k) {
      cur = { kind: p.k, pts: cur ? [cur.pts[cur.pts.length - 1], p] : [p] }
      runs.push(cur)
    } else cur.pts.push(p)
  })
  const out = runs.slice(-POOL).map((r) => {
    const d = r.pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('')
    const a = r.pts[0].x
    const b = r.pts[r.pts.length - 1].x
    const vis = r.pts.filter((p) => p.x >= 0 && p.x <= RW)
    const lo = Math.max(a, 0)
    const hi = Math.min(b, RW)
    return {
      kind: r.kind,
      line: d,
      area: `${d}L${b.toFixed(1)} ${RH}L${a.toFixed(1)} ${RH}Z`,
      show: vis.length > 14,
      lx: Math.min(RW - 34, Math.max(34, (lo + hi) / 2)),
      ly: Math.min(...vis.map((p) => p.y), RH) - 16,
    }
  })
  // the live dot rides the line a little inside the right edge
  const u = (RW - 10) / step + frac
  const i0 = Math.min(NP - 1, Math.floor(u))
  const dot = { x: RW - 10, y: pts[i0].y + (pts[i0 + 1].y - pts[i0].y) * (u - i0), kind: pts[i0].k }
  return { runs: out, dot }
}

const R0 = 90 // where the tape starts: enough history behind it

export function RegimeScene({ t }) {
  const root = useRef(null)
  const first = useMemo(() => regimeFrame(R0), [])

  useZoom(root, 2.3)
  useLive(root, (el) => {
    const areas = [...el.querySelectorAll('.ist__area')]
    const lines = [...el.querySelectorAll('.ist__line')]
    const labels = [...el.querySelectorAll('.ist__zonelabel')]
    const clip = el.querySelector('.ist__clip rect')
    const dotG = el.querySelector('.ist__live')
    const dot = el.querySelectorAll('.ist__live circle')
    const pill = el.querySelector('.ist__state-label')
    const pillBox = el.querySelector('.ist__state')
    let tape = R0
    let live = false
    let tl = null

    const paint = (f) => {
      for (let k = 0; k < POOL; k++) {
        const run = f.runs[k]
        if (!run) {
          areas[k].setAttribute('d', '')
          lines[k].setAttribute('d', '')
          labels[k].textContent = ''
          continue
        }
        areas[k].setAttribute('d', run.area)
        areas[k].setAttribute('fill', `url(#ist-z-${run.kind})`)
        lines[k].setAttribute('d', run.line)
        lines[k].setAttribute('class', `ist__line ist__line--${run.kind}`)
        labels[k].setAttribute('class', `ist__zonelabel ist__zonelabel--${run.kind}`)
        labels[k].setAttribute('x', run.lx.toFixed(1))
        labels[k].setAttribute('y', run.ly.toFixed(1))
        labels[k].textContent = run.show ? t[run.kind] : ''
      }
      dot.forEach((c) => {
        c.setAttribute('cx', f.dot.x.toFixed(1))
        c.setAttribute('cy', f.dot.y.toFixed(1))
      })
      el.style.setProperty('--zc', `var(--z-${f.dot.kind})`)
      pill.textContent = t[f.dot.kind]
    }

    gsap.set(clip, { attr: { width: 0 } })
    gsap.set([dotG, pillBox], { autoAlpha: 0 })
    return {
      start() {
        const p = { w: 0 }
        tl = gsap.timeline({ onComplete: () => (live = true) })
        tl.to(p, { w: RW, duration: 3.4, ease: 'power1.inOut', onUpdate: () => clip.setAttribute('width', p.w.toFixed(1)) })
        tl.to([dotG, pillBox], { autoAlpha: 1, duration: 0.5 }, '-=0.5')
      },
      frame(dt) {
        if (!live) return
        tape += dt * 9
        paint(regimeFrame(tape))
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })

  return (
    <div ref={root} className="ist ist--regime" aria-hidden="true">
      <div className="ist__head">
        <Btc size={22} />
        <b>BTC</b>
        <span className="ist__state">
          <i className="ist__pulse" />
          <span className="ist__state-label">{t[first.dot.kind]}</span>
        </span>
      </div>
      <div className="ist__zoom">
        <div className="ist__zoom-in">
        <svg viewBox={`0 0 ${RW} ${RH}`} className="ist__svg" focusable="false">
          <defs>
            {['long', 'out', 'short'].map((k) => (
              <linearGradient id={`ist-z-${k}`} x1="0" x2="0" y1="0" y2="1" key={k}>
                <stop offset="0" stopColor={`var(--z-${k})`} stopOpacity="0.2" />
                <stop offset="0.85" stopColor={`var(--z-${k})`} stopOpacity="0" />
              </linearGradient>
            ))}
            <clipPath id="ist-clip-r" className="ist__clip">
              <rect x="0" y="-20" width={RW} height={RH + 40} />
            </clipPath>
          </defs>
          {[0.25, 0.5, 0.75].map((k) => (
            <line key={k} className="ist__grid" x1="0" x2={RW} y1={RTOP + k * (RH - RTOP - 26)} y2={RTOP + k * (RH - RTOP - 26)} />
          ))}
          <g clipPath="url(#ist-clip-r)">
            {Array.from({ length: POOL }, (_, k) => {
              const r = first.runs[k]
              return <path key={`a${k}`} className="ist__area" d={r ? r.area : ''} fill={r ? `url(#ist-z-${r.kind})` : 'none'} />
            })}
            {Array.from({ length: POOL }, (_, k) => {
              const r = first.runs[k]
              return <path key={`l${k}`} className={`ist__line${r ? ` ist__line--${r.kind}` : ''}`} d={r ? r.line : ''} />
            })}
            {Array.from({ length: POOL }, (_, k) => {
              const r = first.runs[k]
              return (
                <text key={`t${k}`} className={`ist__zonelabel${r ? ` ist__zonelabel--${r.kind}` : ''}`} x={r ? r.lx.toFixed(1) : 0} y={r ? r.ly.toFixed(1) : 0} textAnchor="middle">
                  {r && r.show ? t[r.kind] : ''}
                </text>
              )
            })}
            <g className="ist__live">
              <circle cx={first.dot.x} cy={first.dot.y} r="9" className="ist__halo" />
              <circle cx={first.dot.x} cy={first.dot.y} r="4.5" className="ist__dot" />
            </g>
          </g>
        </svg>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- 2 · Terminals */
const TW = 640
const TH = 330
const CH = 266 // height of the price area, the volume sits under it
const PAD = 12
const RIGHT = 84 // room for the level labels
const TN = 58 // candles on screen
const GAP = (TW - RIGHT) / TN
const BW = GAP * 0.68
const ty = (v) => PAD + (1 - v) * (CH - PAD * 2)
const cBase = (i) =>
  0.5 + 0.2 * Math.sin(i * 0.07) + 0.1 * Math.sin(i * 0.19 + 1) + 0.05 * Math.sin(i * 0.9) + 0.03 * Math.sin(i * 2.7) + 0.02 * Math.sin(i * 5.3 + 1)
function barAt(i) {
  const o = cBase(i - 1)
  const c = cBase(i)
  return {
    i,
    o,
    c,
    h: Math.max(o, c) + 0.01 + 0.022 * Math.abs(Math.sin(i * 7.1)),
    l: Math.min(o, c) - 0.01 - 0.022 * Math.abs(Math.sin(i * 3.7 + 2)),
    v: 0.12 + Math.abs(c - o) * 4 + 0.25 * Math.abs(Math.sin(i * 1.9)),
  }
}
const T0 = 80 // first head candle
const TICK = 1.6 // seconds per new candle

export function TerminalScene({ t }) {
  const root = useRef(null)
  const slide = useRef(null)
  const live = useRef(false)
  const [head, setHead] = useState(T0)
  const [br, setBr] = useState(0)

  const bars = useMemo(() => Array.from({ length: TN + 1 }, (_, k) => barAt(head - TN + k)), [head])
  const shown = bars.map((b, k) => {
    if (k !== TN) return b
    // the newest candle breathes while the "market" is open
    const c = b.c + br * 0.022
    return { ...b, c, h: Math.max(b.h, c), l: Math.min(b.l, c) }
  })
  // entry is a fixed candle for ~12 ticks, then the next one: the levels follow it as the tape moves
  const eIdx = Math.floor((head - 8) / 12) * 12
  const ev = cBase(eIdx)
  const eX = (eIdx - (head - TN) - 1) * GAP + GAP / 2
  const lv = { target: Math.min(0.97, ev + 0.2), entry: ev, stop: Math.max(0.05, ev - 0.13) }
  const labels = { target: t.target, entry: t.entry, stop: t.stop }

  // every tick the whole tape moved one candle left: pull it back and let it slide, so the motion is continuous
  useLayoutEffect(() => {
    if (!live.current) return
    gsap.fromTo(slide.current, { x: GAP }, { x: 0, duration: TICK, ease: 'none', overwrite: true })
  }, [head])

  useZoom(root, 2.5)
  useLive(root, (el, state) => {
    const cs = [...el.querySelectorAll('.ist__c')]
    const vs = [...el.querySelectorAll('.ist__v')]
    const rest = [...el.querySelectorAll('.ist__lvlg, .ist__lvltext, .ist__live')]
    const lite = window.matchMedia('(max-width: 991px)').matches
    let tl = null
    let tick = null
    let breath = null

    gsap.set(cs, { autoAlpha: 0, scaleY: 0 })
    gsap.set(vs, { autoAlpha: 0, scaleY: 0 })
    gsap.set(rest, { autoAlpha: 0 })
    return {
      start() {
        tl = gsap.timeline({
          onComplete: () => {
            live.current = true
            tick = setInterval(() => state.on && setHead((h) => h + 1), (lite ? TICK * 2 : TICK) * 1000)
            if (!lite) breath = setInterval(() => state.on && setBr(Math.random() * 2 - 1), 520)
          },
        })
        tl.to(cs, { autoAlpha: 1, scaleY: 1, duration: 0.5, stagger: 0.035, ease: 'power2.out', clearProps: 'transform,opacity,visibility' })
        tl.to(vs, { autoAlpha: 1, scaleY: 1, duration: 0.5, stagger: 0.035, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }, 0.1)
        tl.to(rest, { autoAlpha: 1, duration: 0.7, stagger: 0.12, clearProps: 'opacity,visibility' }, '-=0.6')
      },
      kill() {
        if (tl) tl.kill()
        clearInterval(tick)
        clearInterval(breath)
      },
    }
  })

  const candle = (b, k) => {
    const x = (k - 1) * GAP
    const up = b.c >= b.o
    const top = ty(Math.max(b.o, b.c))
    const bot = ty(Math.min(b.o, b.c))
    return (
      <g key={b.i} className={up ? 'ist__c is-up' : 'ist__c is-down'}>
        <line x1={x + BW / 2 + (GAP - BW) / 2} x2={x + BW / 2 + (GAP - BW) / 2} y1={ty(b.h)} y2={ty(b.l)} />
        <rect x={x + (GAP - BW) / 2} y={top} width={BW} height={Math.max(2.5, bot - top)} />
      </g>
    )
  }

  return (
    <div ref={root} className="ist ist--terminal" aria-hidden="true">
      <div className="ist__bar">
        <span className="ist__yourlogo">{t.yourLogo}</span>
        <span className="ist__yourterm">{t.yourTerminal}</span>
        <span className="ist__powered">
          <img src="/brand/logo-icon.svg" alt="" width="16" height="14" />
          {t.powered}
        </span>
      </div>
      <div className="ist__zoom">
        <div className="ist__zoom-in">
        <svg viewBox={`0 0 ${TW} ${TH}`} className="ist__svg" focusable="false">
          <defs>
            <clipPath id="ist-clip-t">
              <rect x="0" y="0" width={TW - RIGHT + 10} height={TH + 10} />
            </clipPath>
          </defs>
          {[0.2, 0.4, 0.6, 0.8].map((k) => (
            <line key={k} className="ist__grid" x1="0" x2={TW} y1={PAD + k * (CH - PAD * 2)} y2={PAD + k * (CH - PAD * 2)} />
          ))}
          <g clipPath="url(#ist-clip-t)">
            <g ref={slide}>
              {shown.map(candle)}
              {shown.map((b, k) => (
                <rect key={`v${b.i}`} className={`ist__v ${b.c >= b.o ? 'is-up' : 'is-down'}`} x={(k - 1) * GAP + (GAP - BW) / 2} y={TH - b.v * 90} width={BW} height={b.v * 90} />
              ))}
              {['target', 'entry', 'stop'].map((k) => (
                <g key={k} className="ist__lvlg" style={{ transform: `translateY(${ty(lv[k]).toFixed(1)}px)` }}>
                  <line className={`ist__lvl ist__lvl--${k}`} x1={eX} x2={TW} y1="0" y2="0" />
                </g>
              ))}
              <g className="ist__live">
                <g style={{ transform: `translateY(${ty(lv.entry).toFixed(1)}px)` }} className="ist__lvlg">
                  <circle cx={eX} cy="0" r="9" className="ist__halo" />
                  <circle cx={eX} cy="0" r="4" className="ist__dot" />
                </g>
              </g>
            </g>
          </g>
          {['target', 'entry', 'stop'].map((k) => (
            <text key={k} className={`ist__lvltext ist__lvltext--${k}`} x={TW - RIGHT + 18} y="4" style={{ transform: `translateY(${ty(lv[k]).toFixed(1)}px)` }}>
              {labels[k]}
            </text>
          ))}
        </svg>
        </div>
      </div>
      <p className="ist__foot">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
          <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
        </svg>
        {t.size} · {t.check}
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- 3 · Reports */
// A ribbon is a sum of two sines whose frequencies are whole numbers per tile, so the drawing repeats every WAVE_W and the
// CSS can slide it by exactly one tile for a seamless loop.
const WAVE_W = 640
const WAVE_H = 230
const RIBBONS = [
  { base: 0.62, a: [26, 1, 0.2], b: [10, 3, 1.4], dur: 44, rev: false, o: 0.95, w: 2.2 },
  { base: 0.56, a: [30, 1, 0.9], b: [12, 2, 2.6], dur: 52, rev: true, o: 0.85, w: 1.7 },
  { base: 0.5, a: [34, 1, 1.7], b: [9, 4, 0.4], dur: 60, rev: false, o: 0.72, w: 1.5 },
  { base: 0.44, a: [30, 1, 2.5], b: [13, 3, 3.1], dur: 70, rev: true, o: 0.6, w: 1.3 },
  { base: 0.38, a: [26, 2, 0.6], b: [8, 5, 2.0], dur: 80, rev: false, o: 0.5, w: 1.2 },
  { base: 0.32, a: [22, 1, 3.4], b: [10, 3, 0.8], dur: 92, rev: true, o: 0.4, w: 1.1 },
]

function ribbon({ base, a, b }) {
  let d = ''
  for (let x = 0; x <= WAVE_W * 2; x += 8) {
    const u = (x / WAVE_W) * Math.PI * 2
    const y = base * WAVE_H + 1.4 * (a[0] * Math.sin(u * a[1] + a[2]) + b[0] * Math.sin(u * b[1] + b[2]))
    d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`
  }
  return d
}

export function ReportScene({ t }) {
  const root = useRef(null)
  const ribbons = useMemo(() => RIBBONS.map((r) => ({ ...r, d: ribbon(r) })), [])

  useZoom(root, 2)
  useLive(root, (el) => {
    const svg = el.querySelector('.ist__waves')
    const rs = [...el.querySelectorAll('.ist__ribbon')]
    const copy = [...el.querySelectorAll('.ist__rep-top > *, .ist__periods li')]
    let tl = null
    gsap.set(svg, { autoAlpha: 0 })
    gsap.set(copy, { autoAlpha: 0 })
    return {
      start() {
        gsap.set(svg, { autoAlpha: 1 })
        tl = gsap.timeline()
        // the waves rise out of a flat line, one after another, then keep breathing
        tl.from(rs, { opacity: 0, scaleY: 0.04, svgOrigin: `${WAVE_W / 2} ${WAVE_H * 0.55}`, duration: 2.6, stagger: 0.2, ease: 'power3.out' })
        tl.to(copy, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, 0.2)
        tl.to(rs, { scaleY: 1.14, svgOrigin: `${WAVE_W / 2} ${WAVE_H * 0.55}`, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: { each: 0.45, from: 'edges' } }, '>-0.6')
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
    <div ref={root} className="ist ist--report" aria-hidden="true">
      <div className="ist__rep-top">
        <span className="ist__yourlogo">{t.brand}</span>
        <p className="ist__rep-title">{t.title}</p>
        <p className="ist__rep-sub">{t.sub}</p>
      </div>
      <div className="ist__zoom">
        <div className="ist__zoom-in">
        <svg viewBox={`0 0 ${WAVE_W} ${WAVE_H}`} className="ist__svg ist__waves" preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id="ist-rib" gradientUnits="userSpaceOnUse" x1="0" x2={WAVE_W * 2} y1="0" y2="0">
              <stop offset="0" stopColor="#4b6bff" />
              <stop offset="0.35" stopColor="#9a8bff" />
              <stop offset="0.5" stopColor="#4b6bff" />
              <stop offset="0.85" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#4b6bff" />
            </linearGradient>
            <linearGradient id="ist-rib-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#4b6bff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#4b6bff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ist-fade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.12" stopColor="#fff" />
              <stop offset="0.88" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="ist-rib-mask">
              <rect width={WAVE_W} height={WAVE_H} fill="url(#ist-fade)" />
            </mask>
          </defs>
          <g mask="url(#ist-rib-mask)">
            {ribbons.map((r, i) => (
              <g key={i} className="ist__ribbon" style={{ opacity: r.o }}>
                <g className={`ist__slide${r.rev ? ' is-rev' : ''}`} style={{ animationDuration: `${r.dur}s` }}>
                  {i === 0 && <path d={`${r.d}L${WAVE_W * 2} ${WAVE_H}L0 ${WAVE_H}Z`} fill="url(#ist-rib-fill)" />}
                  <path d={r.d} className="ist__curve" stroke="url(#ist-rib)" strokeWidth={r.w} vectorEffect="non-scaling-stroke" />
                </g>
              </g>
            ))}
          </g>
        </svg>
        </div>
      </div>
      <ul className="ist__periods">
        {t.periods.map((p, i) => (
          <li key={p} className={i === t.periods.length - 1 ? 'is-on' : undefined}>
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}
