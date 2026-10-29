import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { AI_LOGOS } from '../lib/ai-logos.js'
import FlowLines from '../components/FlowLines.jsx'
import DashScenes from '../components/DashScenes.jsx'
import GlobeMacro from '../components/GlobeMacro.jsx'
import WaveTerrain from '../components/WaveTerrain.jsx'
import WhiteWipe from '../components/home/WhiteWipe.jsx'
import '../styles/home.css'

/* ALPHA STUDIO. Seven modules on a 12-column grid: Metrics wide; Alpha AI and MCP side by side; API, Dashboards and Macro
   smaller; Research wide. Every visual is either a real capture shown whole (never cropped) or a quiet CSS/SVG motion: a field of fine blue lines (Alpha AI), the round logo badges (MCP), gradient flow lines (API), three glass moments (Dashboards), a real globe (Macro). */

/* MCP: round white badges, Claude -> GPT -> Grok -> +, each lit in turn (the old avatar look, no "+6" and no small logo lists). */
const MCP_CLIENTS = ['claude', 'openai', 'grok'].map((slug) => AI_LOGOS.find((l) => l.slug === slug))
function McpViz() {
  return (
    <ul className="ava st-ava" aria-hidden="true">
      {MCP_CLIENTS.map((l, i) => (
        <li className="ava__item" style={{ '--k': i }} key={l.slug}>
          <svg className="ava__logo" viewBox={l.viewBox} fill={l.color} dangerouslySetInnerHTML={{ __html: l.markup }} />
        </li>
      ))}
      <li className="ava__item ava__more" style={{ '--k': 3 }}>
        +
      </li>
    </ul>
  )
}

function Visual({ c }) {
  switch (c.key) {
    case 'metrics':
      return (
        <div className="st-metrics">
          <img src="/metrics/cvdd-channel.webp" width="1200" height="469" alt={c.alt} loading="lazy" draggable="false" />
        </div>
      )
    case 'ai':
      return <WaveTerrain />
    case 'mcp':
      return <McpViz />
    case 'api':
      return (
        <>
          <FlowLines />
          <p className="st-stat">
            <b className="num">{c.stat}</b>
            <span>{c.statLabel}</span>
          </p>
        </>
      )
    case 'dash':
      return <DashScenes />
    case 'macro':
      return <GlobeMacro />
    default:
      return (
        <div className="st-reports" aria-hidden="true">
          <img className="st-reports__a" src="/product/research-realized.webp" width="1234" height="650" alt="" loading="lazy" draggable="false" />
          <img className="st-reports__b" src="/product/research-report.webp" width="794" height="819" alt="" loading="lazy" draggable="false" />
        </div>
      )
  }
}

export default function Inside() {
  const { t } = useI18n()
  const s = t.inside

  return (
    <>
      <WhiteWipe />
      <section className="st" data-nav-theme="paper" id="inside" aria-labelledby="st-title">
        <div className="container">
          <div className="st__head">
            <p className="hf-kicker" data-reveal="fade">
              {s.eyebrow}
            </p>
            <h2 id="st-title" className="h2" data-reveal="lines">
              {s.title}
            </h2>
          </div>

          <div className="st__grid" data-stagger>
            {s.cards.map((c) => (
              <Link to={c.to} className={`st-card st-card--${c.key}`} data-item key={c.key}>
                <div className="st-card__body">
                  {c.key === 'research' && (
                    <span className="st-person">
                      <img src={c.photo} width="72" height="72" alt={c.person} loading="lazy" />
                      <span>
                        <strong>{c.person}</strong>
                        <em>{c.role}</em>
                      </span>
                    </span>
                  )}
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <span className="st-card__go">
                    {s.cta} <span aria-hidden="true">→</span>
                  </span>
                </div>
                <div className="st-card__viz">
                  <Visual c={c} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
