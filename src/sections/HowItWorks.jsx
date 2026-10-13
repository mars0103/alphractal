import { useMemo, useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'
import { series, toPath, points } from '../lib/chart.js'
import BorderGlow from '../components/BorderGlow.jsx'

// Ticker → real brand color (public/coins/<ticker>.svg is the matching badge).
const ASSET_COLORS = {
  btc: '#f7931a',
  eth: '#627eea',
  sol: '#14f195',
  bnb: '#f3ba2f',
  xrp: '#23292f',
  ada: '#0033ad',
  avax: '#e84142',
  link: '#2a5ada',
  dot: '#e6007a',
  doge: '#c2a633',
  atom: '#2e3148',
  matic: '#8247e5',
}
// Two sets of 7, arranged 2–3–2 like an integrations wall. Only 12 coin badges exist in
// public/coins, so the sets share two tickers — the point is the swap, not 14 unique logos.
// BTC sits at index 3 of GROUP_B, the centre of the middle row, and is the one that gets picked.
const GROUP_A = ['eth', 'sol', 'bnb', 'xrp', 'ada', 'dot', 'link']
const GROUP_B = ['avax', 'doge', 'matic', 'btc', 'atom', 'eth', 'sol']
const ROWS = (group) => [group.slice(0, 2), group.slice(2, 5), group.slice(5, 7)]

function CoinCard({ coin, big }) {
  return (
    <span className={`inc-card${big ? ' inc-card--lg' : ''}`} style={{ '--coin': ASSET_COLORS[coin] }}>
      <img src={`/coins/${coin}.svg`} alt="" width={big ? 32 : 24} height={big ? 32 : 24} loading="lazy" />
    </span>
  )
}

function CoinWall({ group, pickTicker }) {
  return ROWS(group).map((row, ri) => (
    <div className={`inc-row${ri === 1 ? ' inc-row--mid' : ''}`} key={ri}>
      {row.map((c, ci) => (
        <CoinCard coin={c} big={ri === 1 && ci === 1 && c === pickTicker} key={`${c}-${ri}-${ci}`} />
      ))}
    </div>
  ))
}

const W = 640
const H = 280
const HEAT_ROWS = 40

/* Liquidation-style heatmap: each horizontal band is a price level, its intensity an
   illustrative "how much leverage sits here" value — not a real 2D grid, but reads the same
   way and is far cheaper to draw. The price line is the usual deterministic series.
   Colors follow magma (matplotlib's public-domain colormap: black → purple/red → pale
   yellow) — the same family real liquidation heatmaps use, instead of an arbitrary gradient. */
const MAGMA = [
  [0, 0, 4], [27, 12, 65], [74, 12, 107], [120, 28, 109], [165, 44, 96],
  [207, 68, 70], [237, 105, 37], [251, 155, 6], [252, 204, 55], [252, 253, 191],
]
function magma(t) {
  const x = Math.min(1, Math.max(0, t)) * (MAGMA.length - 1)
  const i = Math.min(MAGMA.length - 2, Math.floor(x))
  const f = x - i
  const [r0, g0, b0] = MAGMA[i]
  const [r1, g1, b1] = MAGMA[i + 1]
  const r = Math.round(r0 + (r1 - r0) * f)
  const g = Math.round(g0 + (g1 - g0) * f)
  const b = Math.round(b0 + (b1 - b0) * f)
  return `rgb(${r} ${g} ${b})`
}
const MAGMA_CSS = `linear-gradient(0deg, ${MAGMA.map((c, i) => `rgb(${c.join(' ')}) ${(i / (MAGMA.length - 1)) * 100}%`).join(', ')})`

/* Shapes the raw random walk into two leverage "walls" (support/resistance clusters) plus a
   cleared corridor around the price line — reads like a real liquidation map instead of
   noise from top to bottom. */
function buildBands(rows, seed) {
  const raw = series(rows, seed, { drift: 0, vol: 0.3, start: 0.5 })
  const lo = Math.min(...raw)
  const hi = Math.max(...raw)
  const corridor = rows * 0.47
  const corridorW = rows * 0.085
  const wallA = rows * 0.2
  const wallB = rows * 0.76
  return raw.map((v, i) => {
    const base = (v - lo) / (hi - lo || 1)
    const nearCorridor = Math.exp(-((i - corridor) ** 2) / (2 * corridorW ** 2))
    const nearWallA = Math.exp(-((i - wallA) ** 2) / (2 * (rows * 0.05) ** 2))
    const nearWallB = Math.exp(-((i - wallB) ** 2) / (2 * (rows * 0.045) ** 2))
    let shaped = base * 0.5 + Math.max(nearWallA, nearWallB) * 0.85
    shaped *= 1 - nearCorridor * 0.85
    return Math.min(1, Math.max(0, shaped))
  })
}
// Same corridor center/width as buildBands, as plain 0..1 fractions of the chart height —
// draws the two dashed lines that frame the cleared band the price line rides in.
const CORRIDOR_TOP = 0.47 - 0.085 * 1.2
const CORRIDOR_BOTTOM = 0.47 + 0.085 * 1.2

export default function HowItWorks() {
  const { t } = useI18n()
  const h = t.how
  const root = useRef(null)

  const scene = useMemo(() => {
    const priceValues = series(56, 5, { drift: 0.0085, vol: 0.07, start: 0.26 })
    const bands = buildBands(HEAT_ROWS, 51)
    // Illustrative price axis — a round, made-up level, not today's actual BTC price — so the
    // heatmap reads as a real liquidation-levels chart (priced bands) instead of a plain gradient.
    const levels = bands.map((_, i) => 100000 * (0.88 + (1 - i / (HEAT_ROWS - 1)) * 0.24))
    const pricePts = points(priceValues, W, H, 22)
    const MINI_ROWS = 110
    const miniBands = Array.from({ length: MINI_ROWS }, (_, i) => {
      const x = (i / (MINI_ROWS - 1)) * (bands.length - 1)
      const a = Math.floor(x)
      const b = Math.min(bands.length - 1, a + 1)
      const f = x - a
      const smooth = f * f * (3 - 2 * f)
      return bands[a] + (bands[b] - bands[a]) * smooth
    })
    return { price: toPath(priceValues, W, H, 22), pricePts, bands, miniBands, levels }
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)

      const build = (scrollTrigger, timed = false) => {
        const groupA = q('.inc-group--a')
        const groupB = q('.inc-group--b')
        const cardsA = qa('.inc-group--a .inc-card')
        const cardsB = qa('.inc-group--b .inc-card')
        const btcCard = q('.inc-group--b .inc-card--lg')
        const otherCardsB = cardsB.filter((el) => el !== btcCard)
        const scene1 = q('.scene--assets')
        const scene2 = q('.scene--chart')
        const scene3 = q('.scene--ask')
        const steps = qa('.how__step')
        const fill = q('.how__fill')
        const priceDraw = qa('.heat [data-draw]')
        const bandRects = qa('.heat__band')
        const suggestions = qa('.liq-chat__suggestions li')
        let current = -1

        gsap.set(groupB, { autoAlpha: 0 })
        // Group A starts fully visible — at progress 0 the scrubbed timeline hasn't played
        // any tween yet, so an entrance tween here would leave the panel blank right at the
        // top of the pin (the one moment a visitor is guaranteed to pass through).
        gsap.set(cardsA, { autoAlpha: 1, y: 0 })
        gsap.set(cardsB, { autoAlpha: 0, y: 10 })
        gsap.set(otherCardsB, { filter: 'grayscale(0) brightness(1)', opacity: 1 })
        gsap.set(q('.assets__pick'), { autoAlpha: 0, y: 8 })
        gsap.set([scene2, scene3], { autoAlpha: 0 })
        gsap.set(scene1, { autoAlpha: 1 })
        gsap.set(priceDraw, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(bandRects, { opacity: 0 })
        gsap.set(q('.heat__headline'), { autoAlpha: 0, y: 10 })
        gsap.set(q('.liq-chat__prompt'), { autoAlpha: 0, y: 12 })
        gsap.set(suggestions, { autoAlpha: 0, y: 8 })
        gsap.set(q('.liq-chat__a'), { autoAlpha: 0, y: 8 })
        gsap.set(qa('.scene--ask .pill'), { autoAlpha: 0, scale: 0.85 })

        const sync = (progress) => {
          gsap.set(fill, { scaleY: progress })
          const idx = progress < 0.38 ? 0 : progress < 0.7 ? 1 : 2
          if (idx !== current) {
            current = idx
            steps.forEach((s, i) => s.classList.toggle('is-active', i === idx))
          }
        }
        // Desktop scrubs the timeline with the pinned scroll. On phones the panel sits below the
        // copy, so a scroll-scrubbed run would already be over by the time it is on screen:
        // there it plays on its own, once, when the panel comes into view.
        const tl = timed
          ? gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onUpdate: () => sync(tl.progress()) })
          : gsap.timeline({
              defaults: { ease: 'power2.inOut' },
              scrollTrigger: { ...scrollTrigger, scrub: 1, onUpdate: (self) => sync(self.progress) },
            })

        // 01: the coin wall sits for a read, then swaps for a second set with BTC centred and picked
        tl.to({}, { duration: 0.6 })
        tl.to(groupA, { autoAlpha: 0, y: -12, duration: 0.4 }, '+=0')
        tl.to(groupB, { autoAlpha: 1, duration: 0.01 }, '<')
        tl.to(cardsB, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.03 }, '<')
        tl.to(btcCard, { scale: 1.08, duration: 0.3, ease: 'back.out(2)' }, '+=0.15')
        // GSAP's className special property (even via .to()) replaced the whole attribute
        // with the literal string "+=is-picked" here instead of adding a class, wiping out
        // inc-card/inc-card--lg — classList.add via a plain callback is what actually works.
        tl.call(() => btcCard.classList.add('is-picked'), null, '<')
        tl.to(otherCardsB, { filter: 'grayscale(1) brightness(0.6)', opacity: 0.5, duration: 0.4 }, '<')
        tl.to(q('.assets__pick'), { autoAlpha: 1, y: 0, duration: 0.3 }, '<')
        tl.to({}, { duration: 0.25 })

        // 02: the liquidation heatmap draws itself, band by band
        tl.to(scene1, { autoAlpha: 0, y: -24, duration: 0.35 })
        tl.to(scene2, { autoAlpha: 1, duration: 0.3 }, '<')
        tl.to(bandRects, { opacity: 1, duration: 0.5, stagger: 0.02, ease: 'none' }, '<')
        tl.to(priceDraw, { strokeDashoffset: 0, duration: 0.25, stagger: 0.012, ease: 'none' }, '<0.1')
        tl.to(q('.heat__headline'), { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2')
        tl.to({}, { duration: 0.3 })

        // 03: the AI answers from the same chart, and cites what it used
        // (fully hidden, not just faded — scene2 is full-width and would otherwise show
        // through past the edge of scene3's narrower mini chart column)
        tl.to(scene2, { autoAlpha: 0, y: -16, duration: 0.5 })
        tl.to(scene3, { autoAlpha: 1, duration: 0.3 }, '<')
        tl.to(q('.liq-chat__prompt'), { autoAlpha: 1, y: 0, duration: 0.35 }, '<0.1')
        tl.to(suggestions, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08 }, '-=0.1')
        tl.to(q('.liq-chat__a'), { autoAlpha: 1, y: 0, duration: 0.4 }, '+=0.15')
        tl.to(qa('.scene--ask .pill'), { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.12 }, '-=0.15')
        tl.to({}, { duration: 0.3 })

        if (timed) {
          ScrollTrigger.create({
            trigger: q('.how__panel'),
            start: 'top 78%',
            once: true,
            onEnter: () => tl.timeScale(1.5).play(),
          })
        }
      }

      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        build({
          trigger: q('.how__pin'),
          start: 'top top',
          end: '+=320%',
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      })
      mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
        build({}, true)
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [h] },
  )

  return (
    <section ref={root} className="section how section--dark" data-nav-theme="dark" id="how">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="how__pin">
        <div className="container how__grid">
          <div className="how__copy">
            <p className="eyebrow" data-reveal="fade">
              {h.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {h.title}
            </h2>
            <ol className="how__steps">
              <span className="how__track" aria-hidden="true">
                <i className="how__fill" />
              </span>
              {h.steps.map((s, i) => (
                <li className={`how__step ${i === 0 ? 'is-active' : ''}`} key={s.n}>
                  <span className="how__n mono">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <BorderGlow className="how__panel" aria-hidden="true">
            <div className="scene scene--assets">
              <p className="scene__label mono">{h.pick}</p>
              <div className="inc-stack">
                <div className="inc-group inc-group--a">
                  <CoinWall group={GROUP_A} />
                </div>
                <div className="inc-group inc-group--b">
                  <CoinWall group={GROUP_B} pickTicker="btc" />
                </div>
              </div>
              <p className="assets__pick mono">BTC · 1,000+</p>
            </div>

            <div className="scene scene--chart">
              <div className="chart__head">
                <span className="mono">{h.chartLabel.toLowerCase().replace(/\s+/g, '_')}</span>
                <span>{h.chartSub}</span>
              </div>
              <p className="heat__headline">{h.chartHeadline}</p>
              <div className="heat__wrap">
                <span className="heat__legend" style={{ background: MAGMA_CSS }} aria-hidden="true">
                  <i>$1.4B</i>
                  <i>$0</i>
                </span>
                <svg viewBox={`0 0 ${W} ${H}`} className="chart heat" preserveAspectRatio="none">
                  <defs>
                    <filter id="heatTurb" x="-5%" y="-5%" width="110%" height="110%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="2" seed="4" result="n" />
                      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="disp" />
                      <feGaussianBlur in="disp" stdDeviation="1.4" />
                    </filter>
                  </defs>
                  <g filter="url(#heatTurb)">
                    {scene.bands.map((v, i) => (
                      <rect
                        key={i}
                        className="heat__band"
                        x="0"
                        y={(i / HEAT_ROWS) * H}
                        width={W}
                        height={H / HEAT_ROWS + 1}
                        fill={magma(v)}
                      />
                    ))}
                  </g>
                  <line x1="0" x2={W} y1={CORRIDOR_TOP * H} y2={CORRIDOR_TOP * H} className="heat__corridor" />
                  <line x1="0" x2={W} y1={CORRIDOR_BOTTOM * H} y2={CORRIDOR_BOTTOM * H} className="heat__corridor" />
                  {scene.pricePts.slice(1).map((p, i) => {
                    const prev = scene.pricePts[i]
                    const up = p[1] <= prev[1]
                    return (
                      <line
                        key={i}
                        className={`heat__price ${up ? 'is-up' : 'is-down'}`}
                        data-draw
                        pathLength="1"
                        x1={prev[0]}
                        y1={prev[1]}
                        x2={p[0]}
                        y2={p[1]}
                      />
                    )
                  })}
                </svg>
                <ul className="heat__axis mono" aria-hidden="true">
                  {scene.levels.map((p, i) =>
                    i % 5 === 2 ? (
                      <li key={i} style={{ top: `${(i / HEAT_ROWS) * 100}%` }}>
                        ${(p / 1000).toFixed(1)}K
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
              <p className="chart__note mono">{h.chartLabel}</p>
            </div>

            <div className="scene scene--ask">
              <div className="liq-split">
                <div className="liq-split__chart">
                  <svg viewBox={`0 0 ${W} ${H}`} className="chart heat heat--mini" preserveAspectRatio="none">
                    <defs>
                      <filter id="heatTurbMini" x="-5%" y="-5%" width="110%" height="110%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="2" seed="4" result="n" />
                        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="disp" />
                        <feGaussianBlur in="disp" stdDeviation="2.2" />
                      </filter>
                    </defs>
                    <g filter="url(#heatTurbMini)">
                      {scene.miniBands.map((v, i) => (
                        <rect key={i} x="0" y={(i / scene.miniBands.length) * H} width={W} height={H / scene.miniBands.length + 1.2} fill={magma(v)} />
                      ))}
                    </g>
                    {scene.pricePts.slice(1).map((p, i) => {
                      const prev = scene.pricePts[i]
                      const up = p[1] <= prev[1]
                      return (
                        <line
                          key={i}
                          className={`heat__price ${up ? 'is-up' : 'is-down'}`}
                          x1={prev[0]}
                          y1={prev[1]}
                          x2={p[0]}
                          y2={p[1]}
                        />
                      )
                    })}
                  </svg>
                </div>
                <div className="liq-split__chat">
                  <div className="ai__head">
                    <img className="ai__star" src="/figma/spark.svg" alt="" width="22" height="22" />
                    <span className="ai__title">{h.askLabel}</span>
                  </div>
                  <p className="liq-chat__prompt">{h.askPrompt}</p>
                  <ul className="liq-chat__suggestions">
                    {h.askSuggestions.map((s) => (
                      <li key={s}>
                        <button type="button">{s}</button>
                      </li>
                    ))}
                  </ul>
                  <div className="liq-chat__answer">
                    <p className="liq-chat__a">{h.askAnswer}</p>
                    <div className="ask__cites">
                      <span className="mono">{h.cited}</span>
                      <span className="pill">liquidation_levels</span>
                      <span className="pill">whale_retail_delta</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BorderGlow>
        </div>
      </div>
    </section>
  )
}
