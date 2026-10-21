import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { series, toPath } from '../lib/chart.js'
import { FACTS } from '../lib/facts.js'
import { MetricsPreview } from '../components/visuals/BentoVisuals.jsx'
import ImacScreen from '../components/ImacScreen.jsx'
import { createScreen } from '../lib/heroScreen.js'
import AvatarGroup from '../components/AvatarGroup.jsx'
import { AI_LOGOS } from '../lib/ai-logos.js'

// The animated aurora (React Bits) loads on its own so the home bundle stays light.
const Aurora = lazy(() => import('../components/Aurora.jsx'))
const SoftAurora = lazy(() => import('../components/SoftAurora.jsx'))

/* The shader effects need WebGL2. `children` mounts only when the browser can start it; if it can't (or the shader fails), a quiet
   blue gradient in CSS takes its place, so a card never shows a blank block. While the check runs nothing extra is drawn. */
function GlBox({ className, children }) {
  const [state, setState] = useState('idle')
  const ref = useRef(null)

  useEffect(() => {
    let gl2 = false
    try {
      gl2 = !!document.createElement('canvas').getContext('webgl2')
    } catch {
      gl2 = false
    }
    if (!gl2) {
      setState('fail')
      return undefined
    }
    setState('ok')
    const el = ref.current
    const fail = () => setState('fail')
    el?.addEventListener('webglcontextcreationerror', fail, true)
    return () => el?.removeEventListener('webglcontextcreationerror', fail, true)
  }, [])

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {state === 'fail' && <span className="viz-fallback" />}
      {state === 'ok' && <Suspense fallback={null}>{children}</Suspense>}
    </div>
  )
}

/* Card 02: the iMac photo with the Alpha AI screen (the same canvas drawn for the hero, frozen on its answer scene). */
function AlphaImac() {
  const { t } = useI18n()
  const [screen, setScreen] = useState(null)

  useEffect(() => {
    const h = t.hero
    const sc = createScreen({ ...h, tiles: [] })
    Object.assign(sc.state, {
      s1: 0,
      s2: 1,
      s2x: 0,
      askA: 1,
      typed: h.question.length,
      aiA: 1,
      aiSteps: h.domains.length,
      resultA: 1,
      curA: 0,
    })
    setScreen(sc)
  }, [t])

  return (
    <div className="viz-imac">
      <ImacScreen screen={screen} />
    </div>
  )
}

function AiAurora() {
  return (
    <GlBox className="card__aurora">
      <Aurora
        colorStops={['#1f31ff', '#4b6bff', '#2a3dff']}
        amplitude={1}
        blend={0.5}
        height={0.5}
        speed={1}
        glow={0.6}
        scale={1}
        brightness={1}
        layers={1}
        direction="top"
        opacity={1}
        mouseInteraction
        intro
        lightMode={false}
      />
    </GlBox>
  )
}

function TopoViz() {
  return (
    <GlBox className="viz-topo">
      <Aurora
        colorStops={['#1f31ff', '#4b6bff', '#2a3dff']}
        amplitude={1}
        blend={0.5}
        height={0.5}
        speed={1}
        glow={0.6}
        scale={1}
        brightness={1}
        layers={1}
        direction="bottom"
        opacity={1}
        mouseInteraction
        intro
        lightMode={false}
      />
    </GlBox>
  )
}

/* Research & Academy: the soft aurora in the blues of the home gradient (spectrum 0 keeps it to the two blues, no rainbow). */
function SoftViz() {
  return (
    <div className="viz-soft-wrap">
    <GlBox className="viz-soft">
      <SoftAurora
        speed={0.6}
        scale={1.5}
        brightness={1}
        color1="#8fa0ff"
        color2="#2a3dff"
        bandHeight={0.5}
        bandSpread={1}
        enableMouseInteraction
        mouseInfluence={0.25}
        spectrum={0}
        colorSpeed={1}
        noiseFrequency={2.5}
        noiseAmplitude={1}
        tilt={0}
        octaveDecay={0.1}
        layerOffset={0}
        clickPulse
        intro
        lightMode={false}
      />
    </GlBox>
      <span className="viz-mic" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" />
        </svg>
      </span>
    </div>
  )
}

const MACRO = ['Liquidity', 'Rates', 'Risk regime'].map((l, i) => ({
  l,
  d: toPath(series(30, 70 + i * 13, { drift: 0.004 * (i + 1), vol: 0.12, start: 0.35 }), 100, 44, 4),
}))

const DARK_CARDS = new Set(['metrics', 'ai', 'dash', 'research'])

/* Small looping visual per card. Shapes only, never data. */
function CardViz({ kind }) {
  switch (kind) {
    case 'metrics':
      return <MetricsPreview />
    case 'ai':
      return <AlphaImac />
    case 'mcp':
      return (
        <div className="viz-mcp">
          <AvatarGroup items={AI_LOGOS} maxVisible={6} size={46} />
          <code>mcp.alphractal.com/mcp</code>
          <div className="viz-mcp__grid">
            {Array.from({ length: FACTS.mcpTools }, (_, i) => (
              <i key={i} className={i < FACTS.mcpReadTools ? 'is-read' : 'is-write'} />
            ))}
          </div>
          <span className="mono">
            {FACTS.mcpReadTools} read · {FACTS.mcpWriteTools} write
          </span>
        </div>
      )
    case 'api':
      return (
        <ul className="viz-api" aria-hidden="true">
          {[
            ['Starter', 30],
            ['Pro', 200],
            ['Max', 500],
            ['Institutional', 800],
          ].map(([plan, v]) => (
            <li key={plan}>
              <span className="mono">{plan}</span>
              <i style={{ '--v': v / 800 }} />
              <b className="num">{v}/min</b>
            </li>
          ))}
        </ul>
      )
    case 'dash':
      return <TopoViz />
    case 'macro':
      return (
        <div className="viz-macro" aria-hidden="true">
          {MACRO.map((m) => (
            <div key={m.l}>
              <svg viewBox="0 0 100 44">
                <path d={m.d} pathLength="1" data-draw fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="mono">{m.l}</span>
            </div>
          ))}
        </div>
      )
    default:
      return <SoftViz />
  }
}

export default function Inside() {
  const { t } = useI18n()
  const s = t.inside
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Cursor spotlight on each card (fine pointers only)
      mm.add('(pointer: fine)', () => {
        const cleanups = gsap.utils.toArray('.card', root.current).map((card) => {
          const move = (e) => {
            const r = card.getBoundingClientRect()
            card.style.setProperty('--mx', `${e.clientX - r.left}px`)
            card.style.setProperty('--my', `${e.clientY - r.top}px`)
          }
          card.addEventListener('pointermove', move)
          return () => card.removeEventListener('pointermove', move)
        })
        return () => cleanups.forEach((fn) => fn())
      })

      mm.add(MQ.motion, () => {
        // Each card plays its own micro-animation once it is on screen, then idles
        gsap.utils.toArray('.card', root.current).forEach((card) => {
          const draws = card.querySelectorAll('[data-draw]')
          const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%', once: true } })
          if (draws.length) {
            gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 })
            tl.to(draws, { strokeDashoffset: 0, duration: 1.4, stagger: 0.12, ease: 'power2.inOut' }, 0.3)
          }

          const mcp = card.querySelectorAll('.viz-mcp__grid i')
          if (mcp.length) {
            gsap.set(mcp, { opacity: 0.12 })
            tl.to(mcp, { opacity: 1, duration: 0.25, stagger: { each: 0.03, repeat: window.matchMedia(MQ.desktop).matches ? -1 : 0, repeatDelay: 1.2, yoyo: true } }, 0.3)
          }
        })
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [s] },
  )

  return (
    <section ref={root} className="section inside" data-nav-theme="paper" id="inside">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {s.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {s.title}
          </h2>
        </div>

        <div className="cards" data-stagger>
          {s.cards.map((c, i) => (
            <Link
              to={c.to}
              className={`card card--${c.key}${DARK_CARDS.has(c.key) ? ' card--dark' : ''}`}
              data-item
              key={c.key}
            >
              <span className="card__ring ring" aria-hidden="true" />
              <span className="card__glow" aria-hidden="true" />
              {c.key === 'ai' && <AiAurora />}
              <span className="card__n mono">{String(i + 1).padStart(2, '0')}</span>
              <div className="card__body">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
              <div className="card__viz">
                <CardViz kind={c.key} />
              </div>
              <span className="card__go link-arrow">
                {s.cta} <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
