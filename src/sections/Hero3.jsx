import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LINKS } from '../lib/facts.js'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'
import GradientWaves from '../components/GradientWaves.jsx'
import Starfield from '../components/Starfield.jsx'
import TextShimmer from '../components/TextShimmer.jsx'
import TerminalBlock from './TerminalBlock.jsx'

const W = 1600
const H = 800
const PIN_QUERY = `${MQ.motion} and (min-height: 560px)`

/* Four-point Alpha star, unit size (tips at ±1) */
const STAR = 'M0 -1C.17 -.5 .5 -.17 1 0C.5 .17 .17 .5 0 1C-.17 .5 -.5 .17 -1 0C-.5 -.17 -.17 -.5 0 -1Z'

/* Deterministic series so the server render and the client agree. Illustrative shape, not market data. */
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function buildChart() {
  const r = rng(7)
  const N = 170
  const x0 = 330
  const x1 = 1290
  const price = []
  let wob = 0
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    wob = wob * 0.82 + (r() - 0.5) * 38
    const trend = 640 - 550 * (t ** 0.92) // rises from low-left to high-right
    const sway = Math.sin(t * 17) * 22 * (0.4 + t)
    price.push([x0 + (x1 - x0) * t, trend + wob + sway])
  }
  const d = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')
  const tip = price[N - 1]
  // make the last point of every series land exactly on the white tip
  const pin = (pts) => ((pts[pts.length - 1] = tip), pts)

  // companion metrics: smooth, rounded curves that start apart and close in on the white line until they meet at its tip
  const trend = (t) => 640 - 550 * (t ** 0.92) + Math.sin(t * 17) * 22 * (0.4 + t) * 0.5
  const mk = (side, amp, phase) =>
    price.map(([x], i) => {
      const t = i / (N - 1)
      const k = Math.min(1, Math.max(0, (t - 0.5) / 0.5))
      const close = 1 - k * k * (3 - 2 * k) // 1 → 0 across the last half
      const off = side * (70 + amp * Math.sin(t * 7 + phase)) * close
      return [x, trend(t) + off]
    })
  const funding = mk(-1, 34, 0.6)
  const oi = mk(1, 40, 2.4)

  // Whale vs Retail delta: thin green/red bars hanging off a zero line across the whole chart (behind the price)
  const bars = []
  const zero = 300
  const rb = rng(21)
  for (let i = 0; i < 150; i++) {
    const x = x0 + ((x1 - x0) * i) / 149
    const v = (rb() - 0.45) * 2
    bars.push({ x, y: v >= 0 ? zero - v * 100 : zero, h: Math.abs(v) * 100, up: v >= 0 })
  }

  return { price: d(price), funding: d(pin(funding)), oi: d(pin(oi)), bars, zero, tip, N }
}

export default function Hero3() {
  const { t } = useI18n()
  const h = t.hero.steps[0]
  const c = t.hero3
  const root = useRef(null)
  const chart = useMemo(buildChart, [])

  useGSAP(
    () => {
      const q = (s) => root.current.querySelector(s)
      const mm = gsap.matchMedia()

      mm.add(PIN_QUERY, () => {
        // the second section is rendered inside this pin (see .h3__next); the standalone copy on the page steps aside
        const hero = root.current
        hero.classList.add('is-pinned')
        const priceEl = q('.h3__price')
        const cam = q('.h3__cam')
        const dot = q('.h3__dot')
        const ring = q('.h3__ring')
        const live = q('.h3__live')
        const pulses = [...live.querySelectorAll('.h3__pulse')]
        const stage = q('.h3__stage')
        const anchor = q('.h3__cards')
        const ai = q('.h3__ai')
        const aiText = q('.h3__aitext')
        const user = q('.h3__user')
        const star = q('.h3__fly')
        const icon = q('.h3__icon')
        const flash = q('.h3__flash')
        const total = priceEl.getTotalLength()
        const clip = q('.h3__clip')
        const nameEl = q('.h3__ainame')
        const next = q('.h3__next')
        const nextIn = q('.h3__next-in')

        const aiStar = q('.h3__aistar')
        const starPos = { x: 0, y: 0, size: 44 }
        const S = { ic: 0, iz: 0, p: 0.03, z: 1, f: 0, ax: 640, ay: 360, drop: 0, q: 0, bars: 0 }
        const mobile = window.matchMedia(MQ.mobile).matches

        const render = () => {
          const pt = priceEl.getPointAtLength(total * S.p)
          const z = S.z
          const tx = (1 - S.f) * 0 + S.f * (S.ax - z * pt.x)
          const ty = (1 - S.f) * 0 + S.f * (S.ay - z * pt.y) + S.drop
          cam.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${z.toFixed(4)})`)
          priceEl.style.strokeDashoffset = String(1 - S.p)
          clip.setAttribute('width', (pt.x + 600).toFixed(1)) // the indicators are revealed up to the white tip, so all three rise together
          cam.style.setProperty('--sw', String(1 / z))
          dot.setAttribute('cx', pt.x)
          dot.setAttribute('cy', pt.y)
          dot.setAttribute('r', 9 / z)
          ring.setAttribute('cx', pt.x)
          ring.setAttribute('cy', pt.y)
          ring.setAttribute('r', (9 / z) * (1 + 1.6 * S.q))
          ring.style.strokeWidth = String(2.2 / z)
          pulses.forEach((el) => {
            el.setAttribute('cx', pt.x)
            el.setAttribute('cy', pt.y)
            el.setAttribute('r', 9 / z)
            el.style.strokeWidth = String(2.4 / z)
          })
          if (!mobile) {
            const a = dot.getBoundingClientRect()
            const s = stage.getBoundingClientRect()
            anchor.style.setProperty('--ax', `${a.left + a.width / 2 - s.left}px`)
            anchor.style.setProperty('--ay', `${a.top + a.height / 2 - s.top}px`)
          }
          // remember where the chat star sits (relative to the stage centre) so the closing icon can grow out of it
          if (S.drop === 0) {
            const b = aiStar.getBoundingClientRect()
            const s = stage.getBoundingClientRect()
            starPos.x = b.left + b.width / 2 - (s.left + s.width / 2)
            starPos.y = b.top + b.height / 2 - (s.top + s.height / 2)
            starPos.size = b.width
          }
        }

        // start state: title big in the middle, chart barely peeking over the gradient
        gsap.set('.h3__chart-sec', { autoAlpha: 0 })
        const barEls = [...q('.h3__chart-sec').querySelectorAll('.h3__bar')]
        const renderBars = () => {
          barEls.forEach((el, i) => {
            const b = chart.bars[i]
            const k = gsap.utils.clamp(0, 1, S.bars * 3 - (i / barEls.length) * 2)
            el.setAttribute('height', (b.h * k).toFixed(2))
            el.setAttribute('y', (b.up ? chart.zero - b.h * k : chart.zero).toFixed(2))
          })
        }
        renderBars()
        gsap.set(live, { autoAlpha: 0 })
        gsap.set([ai, nameEl, user, star, icon, flash, next], { autoAlpha: 0 })
        gsap.set(aiText, { autoAlpha: 0 })
        gsap.set('.h3__legend li', { autoAlpha: 0, y: 8 })
        render()

        // load-in of the copy (once)
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from('.h3__title', { yPercent: 30, autoAlpha: 0, duration: 1.3 }, 0.3)
          .from('.h3__cta-in', { autoAlpha: 0, y: 16, duration: 0.9 }, 0.9)

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=720%',
            pin: q('.h3__pin'),
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 10,
          },
        })
        const R = { onUpdate: render }

        // ---- 1 · the title steps back, the chart (and its two indicators) start to climb ----
        tl.to('.h3__copy', { scale: 0.58, yPercent: -26, duration: 1.0, transformOrigin: '50% 0%' }, 0)
        tl.to('.h3__cta', { autoAlpha: 0, y: 10, duration: 0.5 }, 0)
        tl.to(S, { p: 0.55, f: 0.7, z: 1.4, duration: 1.5, ease: 'none', ...R }, 0.1)

        // ---- 2 · it reaches the top, where the lines meet, and the camera pushes in close ----
        tl.to('.h3__copy', { autoAlpha: 0, duration: 0.5 }, 1.3)
        tl.to(S, { p: 1, f: 1, z: 2.6, ax: mobile ? 800 : 700, ay: mobile ? 330 : 400, duration: 1.6, ...R }, 1.5)
        tl.to(live, { autoAlpha: 1, duration: 0.3 }, 2.8)
        tl.to(S, { q: 1, duration: 0.6, ease: 'sine.out', ...R }, 2.9)

        // ---- 3 · the blue Alpha tile (star in the middle) enters from the right edge of the screen and glides in beside the point ----
        // It is the same tile the answer pill opens from, so the hand-off at step 4 is seamless.
        tl.set(star, { autoAlpha: 1 }, 3.3)
        tl.fromTo(star, { x: () => stage.getBoundingClientRect().width, y: 70 }, { x: 0, duration: 1.0, ease: 'power3.out', immediateRender: false }, 3.3)
        tl.fromTo(star, { y: 70 }, { y: 0, duration: 1.0, ease: 'sine.inOut', immediateRender: false }, 3.3)

        // ---- 4 · it opens into the answer, the point goes red, the trader replies and the camera leans in a touch more ----
        tl.set(ai, { autoAlpha: 1 }, 4.4)
        tl.set(star, { autoAlpha: 0 }, 4.4)
        tl.to(nameEl, { autoAlpha: 1, duration: 0.4 }, 4.4)
        tl.fromTo(ai, { '--w': 0 }, { '--w': 1, duration: 0.9, immediateRender: false }, 4.4)
        tl.to(aiText, { autoAlpha: 1, duration: 0.5 }, 5.0)
        tl.to(ai, { '--hot': 1, duration: 0.7 }, 5.2)
        tl.to(live, { color: '#ff2d3a', duration: 0.6 }, 5.2)
        tl.fromTo(user, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, immediateRender: false }, 5.9)
        tl.to(S, { z: 2.9, duration: 0.9, ease: 'sine.inOut', ...R }, 5.9)

        // ---- 5 · the full chart: more metrics, support and resistance ----
        tl.to('.h3__chart-sec', { autoAlpha: 1, duration: 0.6 }, 7.0)
        tl.to(S, { z: 0.95, ax: mobile ? 760 : 700, ay: 235, duration: 1.8, ...R }, 7.0)
        tl.to(S, { bars: 1, duration: 1.6, ease: 'none', onUpdate: renderBars }, 7.2)
        tl.to('.h3__legend li', { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, 8.0)
        tl.to({}, { duration: 0.8 })

        // ---- 6 · Alpha AI closes back into its star, the trader's card leaves and the chart slides away ----
        // The icon is resized with real width/height (never a transform scale), so the SVG is re-rasterised at every size and stays sharp.
        // The chat star itself becomes the big icon: it grows out of its own spot (G.g 0→1, tile fades in via --tile),
        // glides to the centre of the stage, then the zoom (S.iz) carries it into the white.
        const size0 = icon.offsetWidth || 320
        const G = { g: 0 }
        const place = () => {
          const sr = stage.getBoundingClientRect()
          const base = starPos.size + (size0 - starPos.size) * G.g
          const size = base + (Math.max(sr.width, sr.height) * 6.5 - base) * S.iz
          const k = 1 - G.g
          gsap.set(icon, {
            width: size,
            height: size,
            left: sr.width / 2 + starPos.x * k,
            top: sr.height / 2 + starPos.y * k,
            marginLeft: -size / 2,
            marginTop: -size / 2,
          })
          // the second section lives inside the star: same star, same centre, scaled with the icon
          const w = size * 0.62
          const cx = sr.width / 2 + starPos.x * k
          const cy = sr.height / 2 + starPos.y * k
          next.style.setProperty('--ms', `${w.toFixed(1)}px`)
          next.style.setProperty('--mx', `${(cx - w / 2).toFixed(1)}px`)
          next.style.setProperty('--my', `${(cy - w / 2).toFixed(1)}px`)
          hero.dataset.navTheme = S.iz > 0.75 ? 'paper' : 'dark'
        }
        const t6 = 10.0
        tl.to(aiText, { autoAlpha: 0, duration: 0.35 }, t6)
        tl.to(nameEl, { autoAlpha: 0, duration: 0.35 }, t6)
        tl.to(ai, { '--w': 0, duration: 0.9, ease: 'power3.inOut' }, t6 + 0.2)
        tl.to(ai, { '--hot': 0, duration: 0.7 }, t6 + 0.2)
        tl.to(live, { color: '#2f66ff', duration: 0.6 }, t6 + 0.2)
        tl.to('.h3__legend', { autoAlpha: 0, duration: 0.6 }, t6 + 0.2)
        tl.to(user, { autoAlpha: 0, x: 40, duration: 0.8, ease: 'power2.in' }, t6 + 0.5)
        // the pill has folded back to the star: hand it over to the big icon at the very same spot, then let the chart slide away
        const tg = t6 + 1.1
        tl.call(place, null, tg)
        tl.set(icon, { autoAlpha: 1 }, tg)
        tl.set(ai, { autoAlpha: 0 }, tg)
        tl.to(S, { drop: 760, duration: 1.4, ease: 'power3.in', ...R }, tg)
        tl.to('.h3__chartwrap', { autoAlpha: 0, duration: 0.6 }, tg + 0.8)
        tl.fromTo(icon, { '--tile': 0 }, { '--tile': 1, duration: 1.3, ease: 'power2.inOut', immediateRender: false }, tg + 0.2)
        tl.fromTo(G, { g: 0 }, { g: 1, duration: 1.5, ease: 'power3.inOut', onUpdate: place, immediateRender: false }, tg + 0.2)
        tl.to({}, { duration: 0.4 })

        // ---- 7 · zoom into the star: the second section is already showing inside it, and fills the screen as it opens ----
        const t7 = tl.duration()
        tl.set(next, { autoAlpha: 1 }, t7)
        tl.fromTo(nextIn, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: 'power3.in', immediateRender: false }, t7)
        tl.to(S, { iz: 1, duration: 2.2, ease: 'power3.in', onUpdate: place }, t7)

        return () => {
          gsap.set(
            ['.h3__copy', '.h3__cta', '.h3__cta-in', '.h3__title', '.h3__chart-sec', '.h3__legend li', live, ai, nameEl, aiText, user, star, icon, flash, next, nextIn],
            { clearProps: 'all' },
          )
          hero.classList.remove('is-pinned')
          hero.dataset.navTheme = 'dark'
          next.style.cssText = ''
          cam.removeAttribute('transform')
          priceEl.style.strokeDashoffset = ''
        }
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [chart] },
  )

  const ctaProps = { className: 'btn btn--glow btn--lg' }
  const cta = (
    <>
      <span className="ring" aria-hidden="true" />
      <span>{h.cta}</span>
    </>
  )

  return (
    <section ref={root} className="hero hero--journey hero3" data-nav-theme="dark" id="top">
      <div className="h3__pin">
        <Starfield className="hero__stars" />

        <div className="h3__stage">
          <div className="h3__chartwrap" role="img" aria-label={c.chartLabel}>
            <svg className="h3__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <clipPath id="h3clip">
                  <rect className="h3__clip" x="-600" y="-1500" width="600" height="3000" />
                </clipPath>
                <linearGradient id="h3fade" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset=".18" stopColor="#fff" stopOpacity="1" />
                </linearGradient>
              </defs>
              <g className="h3__cam">
                <g className="h3__chart-sec">
                  <line className="h3__res" x1="-200" x2="1400" y1="190" y2="190" />
                  <line className="h3__sup" x1="-200" x2="1400" y1="330" y2="330" />
                  {chart.bars.map((b) => (
                    <rect key={b.x} className="h3__bar" x={b.x} y={b.y} width="3.4" height={b.h} fill={b.up ? '#34d37a' : '#ff4d4d'} />
                  ))}
                </g>
                <g clipPath="url(#h3clip)">
                  <path className="h3__aux h3__aux--a" d={chart.funding} />
                  <path className="h3__aux h3__aux--b" d={chart.oi} />
                </g>
                <path className="h3__price" d={chart.price} pathLength="1" />
                <g className="h3__live">
                  <circle className="h3__pulse" cx="0" cy="0" r="9" />
                  <circle className="h3__pulse h3__pulse--b" cx="0" cy="0" r="9" />
                  <circle className="h3__ring" cx="0" cy="0" r="12" />
                  <circle className="h3__dot" cx="0" cy="0" r="9" />
                </g>
              </g>
            </svg>
          </div>
        </div>

        <GradientWaves scrollTrigger={root} />

        <div className="h3__copy container">
          <div className="h3__title">
            <TextShimmer as="h1" className="display h3__h1" text={c.title} duration={3.2} baseColor="#8a90a3" shimmerColor="#ffffff" spread={26} />
          </div>
          <div className="h3__cta">
            <div className="h3__cta-in">
            {/^https?:/.test(LINKS.login) ? (
              <a href={LINKS.login} {...ctaProps}>
                {cta}
              </a>
            ) : (
              <Link to={LINKS.login} {...ctaProps}>
                {cta}
              </Link>
            )}
            </div>
          </div>
        </div>

        <ul className="h3__legend" aria-hidden="true">
          {c.legend.map((l, i) => (
            <li key={l} data-i={i}>
              <i />
              {l}
            </li>
          ))}
        </ul>

        <div className="h3__cards" aria-live="polite">
          <div className="h3__fly" aria-hidden="true">
            <svg viewBox="-1.3 -1.3 2.6 2.6">
              <path d={STAR} fill="#fff" stroke="#6f86ff" strokeWidth=".16" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="h3__ainame" aria-hidden="true">
            {c.aiName}
          </span>
          <div className="h3__ai">
            <svg className="h3__aistar" viewBox="-1.3 -1.3 2.6 2.6" aria-hidden="true">
              <path d={STAR} fill="#fff" stroke="#6f86ff" strokeWidth=".16" strokeLinejoin="round" />
            </svg>
            <p className="h3__aitext">{c.alert}</p>
          </div>
          <div className="h3__user">
            <span className="h3__avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b4152" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="9" r="3.4" />
                <path d="M5.5 19c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
              </svg>
            </span>
            <p>{c.reply}</p>
          </div>
        </div>

        <div className="h3__icon" aria-hidden="true">
          <svg viewBox="-1.3 -1.3 2.6 2.6">
            <path d={STAR} fill="#fff" stroke="url(#h3iconstroke)" strokeWidth=".16" strokeLinejoin="round" />
            <defs>
              <linearGradient id="h3iconstroke" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#aab6ff" />
                <stop offset="1" stopColor="#1f4dff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="h3__next">
          <div className="h3__next-in">
            <div className="col-lines" aria-hidden="true">
              <i />
              <i />
            </div>
            <TerminalBlock embedded />
          </div>
        </div>
        <div className="h3__flash" aria-hidden="true" />
      </div>
    </section>
  )
}
