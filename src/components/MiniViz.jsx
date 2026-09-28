import Viz from './Viz.jsx'
import { series, toPath } from '../lib/chart.js'

const LIVE = toPath(series(36, 61, { drift: 0.006, vol: 0.12, start: 0.3 }), 200, 70, 8)
const AXIS = [61, 33, 12].map((seed, i) => toPath(series(30, seed, { drift: 0.004 * (i + 1), vol: 0.13, start: 0.3 + i * 0.1 }), 200, 70, 8))

/*
 * Small looping pictures for the "how it works" steps. Shapes only: no prices, no fake metrics.
 * All motion is CSS keyframes, so reduced-motion turns it off for free.
 */
export default function MiniViz({ kind }) {
  switch (kind) {
    case 'stream':
      return (
        <div className="mv mv-stream" aria-hidden="true">
          <i style={{ '--w': '92%', '--d': '0s' }} />
          <i style={{ '--w': '76%', '--d': '0.5s' }} />
          <i style={{ '--w': '54%', '--d': '1s' }} />
          <span className="pill">metric_id</span>
        </div>
      )
    case 'progress':
      return (
        <div className="mv mv-progress" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} style={{ '--d': `${i * 0.9}s` }} />
          ))}
        </div>
      )
    case 'dock':
      return (
        <div className="mv mv-dock" aria-hidden="true">
          <svg viewBox="0 0 200 70">
            <path d={LIVE} fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span className="mv-dock__box">
            <i />
            <i />
          </span>
        </div>
      )
    case 'wave':
      return (
        <div className="mv mv-wave" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => (
            <i key={i} style={{ '--d': `${(i % 7) * 0.13}s`, '--h': 0.3 + ((i * 37) % 10) / 14 }} />
          ))}
        </div>
      )
    case 'screen':
      return (
        <div className="mv mv-screen" aria-hidden="true">
          {['onchain', 'derivs', 'sentiment', 'macro'].map((k) => (
            <span key={k}>
              <Viz kind={k} />
            </span>
          ))}
        </div>
      )
    case 'axis':
      return (
        <div className="mv mv-axis" aria-hidden="true">
          <svg viewBox="0 0 200 70" preserveAspectRatio="none">
            {AXIS.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.5" opacity={1 - i * 0.28} />
            ))}
          </svg>
          <i className="mv-axis__scan" />
        </div>
      )
    case 'defs':
      return (
        <div className="mv mv-defs" aria-hidden="true">
          {['chart', 'alert', 'AI'].map((c, i) => (
            <span key={c} style={{ '--d': `${i * 0.35}s` }}>
              <em className="mono">{c}</em>
              <b className="pill">funding_rate</b>
            </span>
          ))}
        </div>
      )
    case 'url':
      return (
        <div className="mv mv-url" aria-hidden="true">
          <code>
            https://mcp.alphractal.com/mcp<i />
          </code>
        </div>
      )
    case 'ask':
      return (
        <div className="mv mv-ask" aria-hidden="true">
          <span className="mv-ask__q" />
          <div>
            {['a', 'b', 'c'].map((c, i) => (
              <i key={c} style={{ '--d': `${i * 0.5}s` }} />
            ))}
          </div>
        </div>
      )
    case 'lock':
      return (
        <div className="mv mv-lock" aria-hidden="true">
          <span className="is-on mono">read · on</span>
          <span className="is-off mono">write · off</span>
        </div>
      )
    case 'bars':
      return (
        <div className="mv mv-bars" aria-hidden="true">
          {[0.12, 0.42, 0.68, 1].map((h, i) => (
            <i key={i} style={{ '--h': h, '--d': `${i * 0.18}s` }} />
          ))}
        </div>
      )
    case 'credits':
      return (
        <div className="mv mv-credits" aria-hidden="true">
          {[0.18, 0.5, 0.82, 1].map((w, i) => (
            <i key={i} style={{ '--w': w, '--d': `${i * 0.2}s` }} />
          ))}
        </div>
      )
    case 'file':
      return (
        <div className="mv mv-file mono" aria-hidden="true">
          <span>CSV</span>
          <span>JSON</span>
          <span>webhook</span>
        </div>
      )
    case 'grid':
      return (
        <div className="mv mv-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} style={{ '--d': `${i * 0.25}s` }} />
          ))}
        </div>
      )
    case 'builder':
      return (
        <div className="mv mv-builder" aria-hidden="true">
          <span className="mono">metric</span>
          <i />
          <span className="mono">metric</span>
          <i />
          <span className="mono is-out">chart</span>
        </div>
      )
    case 'link':
      return (
        <div className="mv mv-link mono" aria-hidden="true">
          <span>…/d/[guid]</span>
          <em>public</em>
        </div>
      )
    case 'livechart':
      return (
        <div className="mv mv-live" aria-hidden="true">
          <svg viewBox="0 0 200 70">
            <path d={LIVE} fill="none" stroke="currentColor" strokeWidth="1.8" pathLength="1" />
          </svg>
          <i />
        </div>
      )
    case 'versions':
      return (
        <div className="mv mv-versions mono" aria-hidden="true">
          <span>v1</span>
          <span>v2</span>
          <span className="is-on">v3</span>
        </div>
      )
    default:
      return null
  }
}
