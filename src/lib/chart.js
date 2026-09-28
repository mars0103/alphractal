// Deterministic, illustrative curve helpers. Nothing here is market data; every chart that uses
// these is labelled "Illustrative" on the page (brief §5.1: live data or labelled illustrative).

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random-walk with drift, returned as values 0..1 */
export function series(n, seed = 7, { drift = 0.004, vol = 0.05, start = 0.3 } = {}) {
  const rnd = mulberry32(seed)
  const out = []
  let v = start
  for (let i = 0; i < n; i++) {
    v += drift + (rnd() - 0.5) * vol
    v = Math.min(0.96, Math.max(0.04, v))
    out.push(v)
  }
  return out
}

export function movingAverage(values, win = 9) {
  return values.map((_, i) => {
    let sum = 0
    let count = 0
    for (let k = -win; k <= win; k++) {
      const v = values[i + k]
      if (v !== undefined) {
        sum += v
        count++
      }
    }
    return sum / count
  })
}

function points(values, w, h, pad) {
  return values.map((v, i) => [(i / (values.length - 1)) * w, pad + (1 - v) * (h - pad * 2)])
}

/** Catmull-Rom → cubic Bézier segments through the points, starting with `start` ('M' or 'L'). */
function curve(pts, start) {
  let d = `${start}${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

/** Smooth line path. `values` are 0..1, y is flipped. */
export function toPath(values, w, h, pad = 0) {
  return curve(points(values, w, h, pad), 'M')
}

/** Closed area between two value arrays: upper left→right, lower back right→left. */
export function bandPath(upper, lower, w, h, pad = 0) {
  const up = points(upper, w, h, pad)
  const lo = points(lower, w, h, pad).reverse()
  return `${curve(up, 'M')}${curve(lo, 'L')}Z`
}
