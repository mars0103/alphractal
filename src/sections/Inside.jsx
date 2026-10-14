import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { series, toPath } from '../lib/chart.js'
import { FACTS } from '../lib/facts.js'
import { MetricsPreview, AlphaAiReplica, DashMix } from '../components/visuals/BentoVisuals.jsx'
import AvatarGroup from '../components/AvatarGroup.jsx'
import { AI_LOGOS } from '../lib/ai-logos.js'

const MACRO = ['Liquidity', 'Rates', 'Risk regime'].map((l, i) => ({
  l,
  d: toPath(series(30, 70 + i * 13, { drift: 0.004 * (i + 1), vol: 0.12, start: 0.35 }), 100, 44, 4),
}))
const WAVE = Array.from({ length: 34 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.63) * Math.cos(i * 0.21)))

const DARK_CARDS = new Set(['metrics', 'ai', 'dash', 'research'])

/* Small looping visual per card. Shapes only, never data. */
function CardViz({ kind }) {
  switch (kind) {
    case 'metrics':
      return <MetricsPreview />
    case 'ai':
      return <AlphaAiReplica />
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
      return <DashMix />
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
      return (
        <div className="viz-wave" aria-hidden="true">
          {WAVE.map((v, i) => (
            <i key={i} style={{ '--h': v }} />
          ))}
        </div>
      )
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

          const wave = card.querySelectorAll('.viz-wave i')
          // one ScrollTrigger + one forever-tween per bar is a lot for a phone: desktop only
          if (wave.length && window.matchMedia(MQ.desktop).matches) {
            wave.forEach((el, i) =>
              gsap.fromTo(
                el,
                { scaleY: 0.2 },
                {
                  scaleY: () => Number(el.style.getPropertyValue('--h')),
                  duration: 0.9 + (i % 5) * 0.12,
                  ease: 'sine.inOut',
                  yoyo: true,
                  repeat: -1,
                  delay: i * 0.03,
                  scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play pause resume pause' },
                },
              ),
            )
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
