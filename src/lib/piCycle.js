/*
 * Illustrative Pi Cycle series for the hero. NOT market data: a deterministic, seeded price path with
 * four-year-cycle drift, so the page draws the same chart on every load. The two averages and their
 * crossovers are computed from that path with the real Pi Cycle rule (111-day MA vs 350-day MA x 2).
 * The hero captions it as illustrative.
 */
function mulberry(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sma(values, n) {
  const out = new Array(values.length).fill(null)
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= n) sum -= values[i - n]
    if (i >= n - 1) out[i] = sum / n
  }
  return out
}

export function buildPiCycle({ days = 3300, seed = 7, prices = null } = {}) {
  const rnd = mulberry(seed)
  const price = prices ? prices.slice() : []
  if (prices) days = price.length
  let lp = Math.log(300)
  const cycle = 1460
  for (let i = 0; !prices && i < days; i++) {
    const phase = (i % cycle) / cycle
    // slow build-up, blow-off into ~phase .7, then a long drawdown
    const drift = phase < 0.7 ? 0.0062 * Math.sin((phase / 0.7) * Math.PI * 0.5 + 0.2) : -0.0100 * Math.sin(((phase - 0.7) / 0.3) * Math.PI)
    const shock = (rnd() + rnd() + rnd() - 1.5) * 0.045
    lp += drift + shock
    price.push(Math.exp(lp))
  }
  const ma111 = sma(price, 111)
  const ma350x2 = sma(price, 350).map((v) => (v == null ? null : v * 2))

  const crosses = []
  for (let i = 1; i < days; i++) {
    if (ma111[i] == null || ma350x2[i] == null || ma111[i - 1] == null || ma350x2[i - 1] == null) continue
    if (ma111[i - 1] <= ma350x2[i - 1] && ma111[i] > ma350x2[i]) crosses.push(i)
  }
  return { price, ma111, ma350x2, crosses, days, live: !!prices }
}
