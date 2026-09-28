import { series, toPath } from '../lib/chart.js'

/*
 * Tiny abstract visuals used as the "tool windows" in the consolidation scene.
 * They are shapes, not data: no numbers, no tickers. Colour comes from currentColor.
 */
const BARS = [0.35, 0.5, 0.42, 0.64, 0.55, 0.78, 0.6, 0.86, 0.7, 0.92, 0.66, 0.8]
const LINE = toPath(series(40, 11, { drift: 0.006, vol: 0.09 }), 200, 90, 8)
const LINE2 = toPath(series(40, 29, { drift: 0.002, vol: 0.1, start: 0.5 }), 200, 90, 8)

export default function Viz({ kind }) {
  switch (kind) {
    case 'onchain':
      return (
        <svg viewBox="0 0 200 90" aria-hidden="true">
          {BARS.map((b, i) => (
            <rect key={i} x={6 + i * 16} y={84 - b * 72} width="9" height={b * 72} fill="currentColor" opacity={0.25 + b * 0.6} />
          ))}
        </svg>
      )
    case 'derivs':
      return (
        <svg viewBox="0 0 200 90" aria-hidden="true">
          {[0.9, 0.62, 0.78, 0.4, 0.55].map((w, i) => (
            <g key={i}>
              <rect x="6" y={8 + i * 16} width="188" height="8" fill="currentColor" opacity="0.12" />
              <rect x="6" y={8 + i * 16} width={188 * w} height="8" fill="currentColor" opacity={0.35 + w * 0.5} />
            </g>
          ))}
        </svg>
      )
    case 'sentiment':
      return (
        <svg viewBox="0 0 200 90" aria-hidden="true">
          <path d="M22 78 A78 78 0 0 1 178 78" stroke="currentColor" strokeWidth="10" fill="none" opacity="0.18" />
          <path d="M22 78 A78 78 0 0 1 128 14" stroke="currentColor" strokeWidth="10" fill="none" opacity="0.85" />
          <line x1="100" y1="78" x2="128" y2="34" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="78" r="4" fill="currentColor" />
        </svg>
      )
    case 'macro':
      return (
        <svg viewBox="0 0 200 90" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <rect
              key={i}
              x={6 + (i % 8) * 24}
              y={8 + Math.floor(i / 8) * 26}
              width="20"
              height="20"
              fill="currentColor"
              opacity={[0.9, 0.3, 0.55, 0.2, 0.7, 0.4, 0.85, 0.25][(i * 5) % 8]}
            />
          ))}
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 200 90" aria-hidden="true">
          <path d={LINE2} stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35" data-draw pathLength="1" />
          <path d={LINE} stroke="currentColor" strokeWidth="2" fill="none" data-draw pathLength="1" />
        </svg>
      )
  }
}

export const VIZ_KINDS = ['onchain', 'derivs', 'sentiment', 'macro', 'chart']
