/* Small shared helpers for the Metrics page drawings: deterministic series, SVG path builders, and the liquidation-cell
   function used by both the opening canvas and the heatmap chart. Shapes only: no market data, no real figures. */

const S = Math.sin

export const f1 = (n) => Math.round(n * 10) / 10

// Integer hash -> [0,1). Deterministic, so the server and client markup agree and a cell never changes between frames.
export function hash(a, b) {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/* One liquidation-level cell. Rows are price levels, columns time. A row carries a strength; along a row, clusters are
   segments of random length that switch on or off and fade toward their ends. Returns 0 (empty) or `hue * 2 + v`, with
   hue 0 purple / 1 yellow / 2 red and v the intensity in (0,1]. */
export function liq(col, row, seed = 0, dense = 0) {
  const rs = hash(row >> 1, seed + 3)
  if (rs < 0.46 - dense * 0.12) return 0
  const len = 7 + Math.floor(hash(row, seed + 5) * 28)
  const c = col + Math.floor(hash(row, seed + 9) * 100)
  const seg = Math.floor(c / len)
  if (hash(row, seg * 31 + seed + 11) < 0.52 - dense * 0.1) return 0
  const u = (c - seg * len + 0.5) / len
  const edge = Math.min(1, S(Math.PI * u) * 1.7)
  const v = (0.3 + 0.7 * hash(row, seg + seed + 17)) * (0.45 + 0.55 * rs) * (0.5 + 0.5 * edge)
  const hue = Math.floor(hash(row >> 1, seg + seed + 23) * 3)
  return hue * 2 + Math.max(0.04, Math.min(0.999, v))
}

/* ---------------------------------------------------------------- paths */
export const P = (pts) => 'M' + pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L')
export const areaTo = (pts, yb) => `${P(pts)}L${f1(pts[pts.length - 1][0])} ${f1(yb)}L${f1(pts[0][0])} ${f1(yb)}Z`
export const between = (a, b) =>
  `${P(a)}L${b
    .slice()
    .reverse()
    .map((p) => `${f1(p[0])} ${f1(p[1])}`)
    .join('L')}Z`

/* An endless tape: fn(index) in [0,1] is a pure function of the index, so any window of it can be drawn and it can scroll
   forever. `o` is the position of the tape head (fractional); points sit one `step` apart and slide left as o grows. */
export function trace(fn, o, n, x0, w, yTop, yBot) {
  const head = Math.floor(o)
  const fr = o - head
  const step = w / (n - 1)
  const pts = []
  for (let k = 0; k <= n + 1; k++) pts.push([x0 + (k - 1 - fr) * step, yTop + (1 - fn(head - n + 1 + k)) * (yBot - yTop)])
  return pts
}

// The point of a tape a little inside its right edge, for the live dot.
export function headDot(o, fn, n, x0, w, yTop, yBot, c) {
  const step = w / (n - 1)
  return [x0 + w - 10, yTop + (1 - fn(o + 1 - 10 / step)) * (yBot - yTop), c]
}

// Vertical bars standing on `zero`; `above` picks the bars that rise above it (else the ones that hang below).
export function bars(pts, zero, bw, above) {
  let d = ''
  for (const [x, y] of pts) {
    if (y < zero !== above) continue
    d += `M${f1(x - bw / 2)} ${f1(zero)}V${f1(y)}h${f1(bw)}V${f1(zero)}Z`
  }
  return d || 'M0 0'
}

/* ---------------------------------------------------------------- series */
export const price = (i) => 0.5 + 0.2 * S(i * 0.05) + 0.1 * S(i * 0.13 + 1) + 0.03 * S(i * 0.9) + 0.02 * S(i * 2.3 + 1) + 0.011 * S(i * 5.1 + 2)

/* ---------------------------------------------------------------- charts
   Each builder returns { n, rate, rules, tags, legend, statics, clips, layers(o), head(o) }.
   layers(o) always returns the same number of layers, so the page can repaint them by index. */
const base = (W, H) => {
  const n = Math.round(W / 6)
  const T = 24
  const B = H - 26
  return { n, T, B, tr: (fn, o) => trace(fn, o, n, 0, W, T, B), grid: [0.25, 0.5, 0.75].map((k) => ({ y: T + k * (B - T), c: 'g' })) }
}

export const CHARTS = {
  /* Active Addresses: a line over faint price. */
  active(W, H) {
    const { n, T, B, tr, grid } = base(W, H)
    const act = (i) => 0.46 + 0.17 * S(i * 0.045 + 2) + 0.05 * S(i * 0.27) + 0.018 * S(i * 1.3 + 1)
    return {
      n, rate: 4, rules: grid, legend: [['blue', 'Active addresses'], ['mute', 'Price']],
      layers: (o) => {
        const a = tr(act, o)
        return [{ c: 'ln mute', d: P(tr(price, o)) }, { c: 'ar blue', d: areaTo(a, B) }, { c: 'ln blue', d: P(a) }]
      },
      head: (o) => [headDot(o, act, n, 0, W, T, B, 'blue')],
    }
  },

  /* MVRV: price against the realized-price line, the gap between them tinted. */
  mvrv(W, H) {
    const { n, T, B, tr, grid } = base(W, H)
    const real = (i) => 0.4 + 0.13 * S((i - 16) * 0.05) + 0.06 * S((i - 16) * 0.13 + 1)
    return {
      n, rate: 4, rules: grid, legend: [['ink', 'Price'], ['blue', 'Realized price']],
      layers: (o) => {
        const p = tr(price, o)
        const r = tr(real, o)
        return [{ c: 'ar blue', d: between(p, r) }, { c: 'ln ink', d: P(p) }, { c: 'ln blue', d: P(r) }]
      },
      head: (o) => [headDot(o, price, n, 0, W, T, B, 'ink'), headDot(o, real, n, 0, W, T, B, 'blue')],
    }
  },

  /* Supply in Profit / Loss: two stacked areas split by the share line. */
  supply(W, H) {
    const { n, T, B, tr, grid } = base(W, H)
    const share = (i) => 0.55 + 0.24 * S(i * 0.04 + 1) + 0.08 * S(i * 0.21) + 0.02 * S(i * 0.9)
    return {
      n, rate: 4, rules: grid, legend: [['blue', 'Supply in profit'], ['warm', 'Supply in loss']],
      layers: (o) => {
        const s = tr(share, o)
        return [{ c: 'ar blue', d: areaTo(s, B) }, { c: 'ar warm', d: between(s.map((p) => [p[0], T]), s) }, { c: 'ln blue', d: P(s) }]
      },
      head: (o) => [headDot(o, share, n, 0, W, T, B, 'blue')],
    }
  },

  /* SOPR: oscillates around the parity line at 1, profit above it, loss below. */
  sopr(W, H) {
    const { n, T, B, tr } = base(W, H)
    const mid = (T + B) / 2
    const sopr = (i) => 0.5 + 0.17 * S(i * 0.11) + 0.09 * S(i * 0.37 + 1) + 0.05 * S(i * 1.1) + 0.02 * S(i * 2.9)
    return {
      n, rate: 4, rules: [{ y: mid, c: 'dash' }], legend: [['blue', 'Above 1: realized profit'], ['warm', 'Below 1: realized loss']],
      tags: [{ x: W - 6, y: mid - 7, t: 'parity · 1', a: 'end' }],
      clips: { up: [0, 0, W, mid], dn: [0, mid, W, H - mid] },
      layers: (o) => {
        const s = tr(sopr, o)
        const d = `${P(s)}L${f1(s[s.length - 1][0])} ${f1(mid)}L${f1(s[0][0])} ${f1(mid)}Z`
        return [{ c: 'ar blue', d, clip: 'up' }, { c: 'ar warm', d, clip: 'dn' }, { c: 'ln ink', d: P(s) }]
      },
      head: (o) => [headDot(o, sopr, n, 0, W, T, B, 'ink')],
    }
  },

  /* Exchange Netflow: bars above zero are net deposits, below are net withdrawals. */
  netflow(W, H) {
    const T = 24
    const B = H - 26
    const nb = Math.round(W / 10)
    const bw = (W / (nb - 1)) * 0.62
    const mid = (T + B) / 2
    const nf = (i) => 0.5 + 0.36 * S(i * 0.19) * (0.6 + 0.4 * S(i * 0.043)) + 0.09 * S(i * 0.9 + 1)
    return {
      n: nb, rate: 3, rules: [{ y: mid, c: 'axis' }], legend: [['warm', 'Net deposits'], ['blue', 'Net withdrawals'], ['mute', 'Price']],
      layers: (o) => {
        const b = trace(nf, o, nb, 0, W, T, B)
        return [{ c: 'ln mute', d: P(trace(price, o, nb, 0, W, T, B)) }, { c: 'fl warm', d: bars(b, mid, bw, true) }, { c: 'fl blue', d: bars(b, mid, bw, false) }]
      },
      head: () => [],
    }
  },

  /* Open Interest with price above, Funding Rate in a second panel. */
  deriv(W, H) {
    const { n, T, B } = base(W, H)
    const split = T + (B - T) * 0.62
    const t1 = split - 14
    const f0 = split + 22
    const midF = (f0 + B) / 2
    const oi = (i) => 0.45 + 0.2 * S(i * 0.05 + 1) + 0.12 * S(i * 0.17) + 0.03 * S(i * 0.9)
    const fund = (i) => 0.5 + 0.3 * S(i * 0.12 + 2) * (0.7 + 0.3 * S(i * 0.05)) + 0.12 * S(i * 0.55)
    return {
      n, rate: 4, rules: [{ y: split, c: 'g' }, { y: midF, c: 'dash' }], legend: [['blue', 'Open interest'], ['mute', 'Price'], ['warm', 'Funding rate']],
      layers: (o) => {
        const a = trace(oi, o, n, 0, W, T, t1)
        const f = trace(fund, o, n, 0, W, f0, B)
        return [
          { c: 'ar blue', d: areaTo(a, t1) },
          { c: 'ln blue', d: P(a) },
          { c: 'ln mute', d: P(trace(price, o, n, 0, W, T, t1)) },
          { c: 'fl warm', d: bars(f, midF, 3.4, true) },
          { c: 'fl blue', d: bars(f, midF, 3.4, false) },
        ]
      },
      head: (o) => [headDot(o, oi, n, 0, W, T, t1, 'blue')],
    }
  },

  /* Liquidation heatmap: price levels by time, with the price walking through the clusters. */
  heat(W, H) {
    const T = 22
    const B = H - 24
    const nc = W > 700 ? 64 : 44
    const cw = W / nc
    const rh = W > 700 ? 11 : 10
    const rows = Math.floor((B - T) / rh)
    let cached = { head: null, d: [] }
    const cells = (head) => {
      if (cached.head === head) return cached.d
      const d = ['', '', '', '', '', '']
      for (let k = 0; k < nc + 3; k++) {
        const col = head - nc - 2 + k
        for (let r = 0; r < rows; r++) {
          const code = liq(col, r, 0, 1)
          if (!code) continue
          const hue = code >= 4 ? 2 : code >= 2 ? 1 : 0
          const v = code - hue * 2
          d[hue * 2 + (v > 0.55 ? 1 : 0)] += `M${f1((k - 1) * cw)} ${T + r * rh}h${f1(cw - 1)}v${rh - 1}h${f1(1 - cw)}Z`
        }
      }
      cached = { head, d }
      return d
    }
    const px = (i) => 0.2 + 0.6 * price(i)
    const classes = ['hp1', 'hp2', 'hy1', 'hy2', 'hr1', 'hr2']
    return {
      n: nc + 1, rate: 3, rules: [], legend: [['ink', 'Price'], ['purple', 'Liquidation levels']],
      layers: (o) => {
        const head = Math.floor(o)
        const t = `translate(${f1(-(o - head) * cw)} 0)`
        const d = cells(head)
        return [...classes.map((c, i) => ({ c: `fl ${c}`, d: d[i] || 'M0 0', t })), { c: 'ln ink', d: P(trace(px, o, nc + 1, 0, W, T, B)) }]
      },
      head: (o) => [headDot(o, px, nc + 1, 0, W, T, B, 'ink')],
    }
  },

  /* ADCI (slow, area) and TBBI (faster) on a 0-100 scale. */
  osc(W, H) {
    const { n, T, B, tr } = base(W, H)
    const adci = (i) => 0.5 + 0.34 * S(i * 0.03 + 1) + 0.06 * S(i * 0.17)
    const tbbi = (i) => 0.5 + 0.3 * S(i * 0.06 + 2) + 0.14 * S(i * 0.21) + 0.05 * S(i * 0.7)
    return {
      n, rate: 4, rules: [{ y: T, c: 'g' }, { y: (T + B) / 2, c: 'dash' }, { y: B, c: 'g' }], legend: [['blue', 'ADCI'], ['ink', 'TBBI']],
      tags: [{ x: W - 4, y: T - 6, t: '100', a: 'end' }, { x: W - 4, y: B + 15, t: '0', a: 'end' }],
      layers: (o) => {
        const a = tr(adci, o)
        return [{ c: 'ar blue', d: areaTo(a, B) }, { c: 'ln blue', d: P(a) }, { c: 'ln ink thin', d: P(tr(tbbi, o)) }]
      },
      head: (o) => [headDot(o, adci, n, 0, W, T, B, 'blue'), headDot(o, tbbi, n, 0, W, T, B, 'ink')],
    }
  },

  /* Crypto Fear and Greed: a thin gauge with a needle, and its history as a small tape. */
  gauge(W, H) {
    const { T, B } = base(W, H)
    const cx = W * 0.25
    const cy = H - 46
    const r = Math.min(W * 0.2, H * 0.6)
    const pt = (a, rr = r) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]
    const arc = (a0, a1, rr = r) => {
      const [x0, y0] = pt(a0, rr)
      const [x1, y1] = pt(a1, rr)
      return `M${f1(x0)} ${f1(y0)}A${f1(rr)} ${f1(rr)} 0 0 1 ${f1(x1)} ${f1(y1)}`
    }
    let ticks = ''
    for (let k = 0; k <= 20; k++) {
      const a = Math.PI + (k / 20) * Math.PI
      const [x0, y0] = pt(a, r + 8)
      const [x1, y1] = pt(a, r + (k % 5 === 0 ? 20 : 14))
      ticks += `M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}`
    }
    const fg = (i) => 0.5 + 0.26 * S(i * 0.02) + 0.12 * S(i * 0.083 + 1) + 0.03 * S(i * 0.4)
    const x0 = W * 0.54
    const w = W * 0.44
    const ns = Math.round(w / 6)
    return {
      n: ns, rate: 4, rules: [], legend: [['blue', 'Fear and Greed'], ['mute', 'History']],
      tags: [{ x: cx - r, y: cy + 24, t: 'Fear', a: 'middle' }, { x: cx + r, y: cy + 24, t: 'Greed', a: 'middle' }],
      statics: [{ c: 'ln mute thin', d: arc(Math.PI, Math.PI * 2) }, { c: 'ln mute thin', d: ticks }, { c: 'ln mute thin', d: `M${f1(x0)} ${f1(B)}H${f1(x0 + w)}` }],
      layers: (o) => {
        const a = Math.PI + fg(o) * Math.PI
        const [tx, ty] = pt(a, r - 14)
        const s = trace(fg, o, ns, x0, w, T + 30, B)
        return [
          { c: 'ln blue thick', d: arc(Math.PI, a) },
          { c: 'ln ink', d: `M${f1(cx)} ${f1(cy)}L${f1(tx)} ${f1(ty)}` },
          { c: 'ar blue', d: areaTo(s, B) },
          { c: 'ln blue', d: P(s) },
        ]
      },
      head: (o) => {
        const [tx, ty] = pt(Math.PI + fg(o) * Math.PI, r)
        return [[tx, ty, 'blue'], headDot(o, fg, ns, x0, w, T + 30, B, 'blue')]
      },
    }
  },

  /* U.S. Dollar Index and 10-Year Treasury Yield, over faint price. */
  macro(W, H) {
    const { n, T, B, tr, grid } = base(W, H)
    const dxy = (i) => 0.5 + 0.2 * S(i * 0.06 + 0.5) + 0.08 * S(i * 0.2) + 0.02 * S(i * 1.1)
    const ust = (i) => 0.5 - 0.16 * S(i * 0.06 + 0.3) + 0.12 * S(i * 0.09 + 2) + 0.03 * S(i * 0.8)
    return {
      n, rate: 4, rules: grid, legend: [['ink', 'U.S. Dollar Index'], ['blue', '10-Year Treasury Yield'], ['mute', 'Bitcoin price']],
      layers: (o) => [{ c: 'ln mute', d: P(tr(price, o)) }, { c: 'ln ink', d: P(tr(dxy, o)) }, { c: 'ln blue', d: P(tr(ust, o)) }],
      head: (o) => [headDot(o, dxy, n, 0, W, T, B, 'ink'), headDot(o, ust, n, 0, W, T, B, 'blue')],
    }
  },

  /* CVDD Channel: price, the original CVDD and Alphractal's Model 2 with the channel between them. */
  cvdd(W, H) {
    const { n, T, B, tr, grid } = base(W, H)
    const cv = (i) => 0.26 + 0.1 * S(i * 0.03) + 0.03 * S(i * 0.08)
    const m2 = (i) => cv(i) + 0.14 + 0.04 * S(i * 0.04)
    const px = (i) => cv(i) + 0.24 + 0.2 * S(i * 0.05) + 0.07 * S(i * 0.13 + 1) + 0.02 * S(i * 0.9)
    return {
      n, rate: 4, rules: grid, legend: [['ink', 'Price USD'], ['mute', 'CVDD'], ['blue', 'CVDD Model 2']],
      layers: (o) => {
        const a = tr(cv, o)
        const b = tr(m2, o)
        return [{ c: 'ar blue', d: between(b, a) }, { c: 'ln mute dashed', d: P(a) }, { c: 'ln blue', d: P(b) }, { c: 'ln ink', d: P(tr(px, o)) }]
      },
      head: (o) => [headDot(o, px, n, 0, W, T, B, 'ink')],
    }
  },

  /* Repetition Fractal Cycle: earlier cycles as ghosts aligned by phase under the current one. Shape only. */
  fractal(W, H) {
    const { n, T, B, tr } = base(W, H)
    const Pn = Math.round(n * 0.72)
    const shape = (u) => 0.16 + 0.62 * Math.exp(-(((u - 0.66) / 0.2) ** 2)) + 0.14 * u + 0.03 * S(u * 38)
    const cyc = (a, w) => (i) => {
      const u = (((i % Pn) + Pn) % Pn) / Pn
      return 0.12 + (shape(Math.min(1, Math.max(0, u + w))) - 0.12) * a
    }
    const g1 = cyc(0.74, 0.03)
    const g2 = cyc(0.9, -0.04)
    const g3 = cyc(0.58, 0.05)
    const cur = cyc(1, 0)
    return {
      n, rate: 4, rules: [], legend: [['blue', 'Current cycle'], ['mute', 'Earlier cycles']],
      layers: (o) => {
        const head = Math.floor(o)
        const step = W / (n - 1)
        let ticks = ''
        for (let j = head - n; j <= head + 1; j++) {
          if (((j % Pn) + Pn) % Pn === 0) ticks += `M${f1((j - (head - n + 1) - (o - head)) * step)} ${T}V${B}`
        }
        return [
          { c: 'ln mute dashed thin', d: ticks || 'M0 0' },
          { c: 'ln mute thin', d: P(tr(g1, o)) },
          { c: 'ln mute thin', d: P(tr(g2, o)) },
          { c: 'ln mute thin', d: P(tr(g3, o)) },
          { c: 'ln blue thick', d: P(tr(cur, o)) },
        ]
      },
      head: (o) => [headDot(o, cur, n, 0, W, T, B, 'blue')],
    }
  },

  /* TBBI in two lookback windows. */
  tbbi(W, H) {
    const { n, T, B, tr } = base(W, H)
    const t90 = (i) => 0.5 + 0.3 * S(i * 0.06 + 2) + 0.14 * S(i * 0.21) + 0.06 * S(i * 0.7)
    const t116 = (i) => 0.5 + 0.28 * S(i * 0.06 + 1.8) + 0.08 * S(i * 0.19) + 0.02 * S(i * 0.5)
    return {
      n, rate: 4, rules: [{ y: T, c: 'g' }, { y: (T + B) / 2, c: 'dash' }, { y: B, c: 'g' }], legend: [['ink', '90-day lookback'], ['blue', '116-day lookback']],
      tags: [{ x: W - 4, y: T - 6, t: '100', a: 'end' }, { x: W - 4, y: B + 15, t: '0', a: 'end' }],
      layers: (o) => [{ c: 'ln ink thin', d: P(tr(t90, o)) }, { c: 'ln blue', d: P(tr(t116, o)) }],
      head: (o) => [headDot(o, t90, n, 0, W, T, B, 'ink'), headDot(o, t116, n, 0, W, T, B, 'blue')],
    }
  },

  /* ADCI on its own: a single line on 0-100. */
  adci(W, H) {
    const { n, T, B, tr } = base(W, H)
    const adci = (i) => 0.5 + 0.34 * S(i * 0.03 + 1) + 0.06 * S(i * 0.17)
    return {
      n, rate: 4, rules: [{ y: T, c: 'g' }, { y: (T + B) / 2, c: 'dash' }, { y: B, c: 'g' }], legend: [['blue', 'ADCI'], ['mute', 'Price']],
      tags: [{ x: W - 4, y: T - 6, t: '100', a: 'end' }, { x: W - 4, y: B + 15, t: '0', a: 'end' }],
      layers: (o) => {
        const a = tr(adci, o)
        return [{ c: 'ln mute', d: P(tr(price, o)) }, { c: 'ar blue', d: areaTo(a, B) }, { c: 'ln blue thick', d: P(a) }]
      },
      head: (o) => [headDot(o, adci, n, 0, W, T, B, 'blue')],
    }
  },

  /* Structural Market Bands: four bands breathing around a centre, the price walking between them. */
  bands(W, H) {
    const { n, T, B, tr } = base(W, H)
    const ctr = (i) => 0.5 + 0.08 * S(i * 0.02)
    const wd = (i) => 0.4 + 0.1 * S(i * 0.035 + 1)
    const edge = (k) => (i) => ctr(i) + wd(i) * k
    const px = (i) => ctr(i) + wd(i) * (0.5 * S(i * 0.09) + 0.18 * S(i * 0.4 + 1) + 0.04 * S(i * 1.3))
    return {
      n, rate: 4, rules: [], legend: [['warm', 'Resistance bands'], ['blue', 'Support bands'], ['ink', 'Price']],
      layers: (o) => {
        const e = [0.8, 0.62, 0.5, 0.34, -0.34, -0.5, -0.62, -0.8].map((k) => tr(edge(k), o))
        return [
          { c: 'ar warm2', d: between(e[0], e[1]) },
          { c: 'ar warm', d: between(e[2], e[3]) },
          { c: 'ar blue', d: between(e[4], e[5]) },
          { c: 'ar blue2', d: between(e[6], e[7]) },
          { c: 'ln ink', d: P(tr(px, o)) },
        ]
      },
      head: (o) => [headDot(o, px, n, 0, W, T, B, 'ink')],
    }
  },
}
