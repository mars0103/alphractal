import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { LOGO_PATHS, LOGO_VIEWBOX } from '../lib/logoShapes.js'
import { whenNear } from '../lib/whenNear.js'
import '../styles/glass-stack.css'

/* A 5×5 board of glass tiles seen in isometric. The Alphractal symbol sits lit on the blue tile at the centre; the six
   tools are the glass tiles in the first ring (two are left blank), and the outer ring is decoration that fades out. */
const N = 9
const MID = 4
const FIRST_ROW = 3
/* ring-1 cells as 'col,row', and which tool lives on each (index into t.consolidation.topics, null = blank glass). */
const SLOTS = {
  '3,3': 0,
  '4,3': 1,
  '5,3': null,
  '5,4': 2,
  '5,5': 3,
  '4,5': 4,
  '3,5': 5,
  '3,4': null,
}

/* One small, distinct picture per tool, drawn in the blues of the home gradient. */
function Micro({ kind }) {
  const stroke = { stroke: 'url(#glLine)', strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (kind) {
    case 0: // on-chain: a small network
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          <g {...stroke}>
            <path d="M12 30 34 12 58 26 84 10M34 12 40 36 58 26 70 38 84 10" />
          </g>
          {[[12, 30], [34, 12], [58, 26], [84, 10], [40, 36], [70, 38]].map(([x, y]) => (
            <circle key={x + y} cx={x} cy={y} r="3" fill="#4b6bff" />
          ))}
        </svg>
      )
    case 1: // derivatives: candles
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          {[[10, 8, 26, 1], [22, 14, 30, 0], [34, 6, 22, 1], [46, 12, 34, 0], [58, 4, 20, 1], [70, 10, 28, 1], [82, 2, 18, 1], [94, 8, 24, 0]].map(([x, y, h, up]) => (
            <g key={x}>
              <path d={`M${x} ${y - 3}V${y + h + 3}`} stroke="#6f86ff" strokeWidth="1" />
              <rect x={x - 3} y={y} width="6" height={h} rx="1.2" fill={up ? '#8fa2ff' : '#2a3fd6'} />
            </g>
          ))}
        </svg>
      )
    case 2: // sentiment: a gauge
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          <path d="M14 40A36 36 0 0 1 86 40" stroke="#c4cbea" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M14 40A36 36 0 0 1 70 10" stroke="url(#glLine)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M50 40 66 16" stroke="#1b2a8c" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="40" r="3.4" fill="#1b2a8c" />
        </svg>
      )
    case 3: // macro: an area line
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          <path d="M4 34C16 30 22 12 34 16S52 36 62 24 78 8 96 12V44H4Z" fill="url(#glArea)" />
          <path d="M4 34C16 30 22 12 34 16S52 36 62 24 78 8 96 12" {...stroke} />
        </svg>
      )
    case 4: // AI: a spark with lines
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          <path d="M22 22C22 14 26 10 34 10C26 10 22 6 22 -2C22 6 18 10 10 10C18 10 22 14 22 22Z" transform="translate(4 8) scale(1.1)" fill="#3a52ff" />
          <g stroke="url(#glLine)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M46 14H92M46 24H80M46 34H68" />
          </g>
        </svg>
      )
    default: // terminal: order book + button
      return (
        <svg viewBox="0 0 100 44" aria-hidden="true">
          {[[6, 6, 52, 0], [6, 14, 38, 0], [6, 22, 60, 1], [6, 30, 44, 1]].map(([x, y, w, buy]) => (
            <rect key={y} x={x} y={y} width={w} height="5" rx="2" fill={buy ? '#4b6bff' : '#b3bdea'} />
          ))}
          <rect x="68" y="14" width="26" height="16" rx="4" fill="url(#glLine)" />
        </svg>
      )
  }
}

/* THE SOLUTION. The Alphractal symbol lit on a blue glass button, surrounded by the six tools as frosted-glass buttons that
   pick up its blue on their edges. Hovering a button lifts it. On entering the view the board builds out from the centre. */
export default function Consolidation() {
  const { t } = useI18n()
  const c = t.consolidation
  const root = useRef(null)
  const host = useRef(null)
  // 'pending' until the client has decided: the 3D board (three.js, loaded on demand) or, if WebGL is missing or fails, the
  // CSS board below. Nothing is drawn before that, so there is no flash of the wrong one.
  const [mode, setMode] = useState('pending')

  useEffect(() => {
    let alive = true
    let board3d = null
    const near = whenNear(root.current)
    ;(async () => {
      try {
        await near.promise // three.js is only downloaded when the section is about to be reached
        if (!alive) return
        const { createGlassBoard } = await import('../lib/glassBoard.js')
        if (!alive) return
        board3d = createGlassBoard({
          host: host.current,
          n: N,
          mid: MID,
          firstRow: FIRST_ROW,
          slots: SLOTS,
          topics: c.topics,
          logo: { paths: LOGO_PATHS.map((s) => s.d), viewBox: LOGO_VIEWBOX.split(' ').slice(2).map(Number) },
          reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        })
        setMode('3d')
      } catch {
        if (alive) setMode('css')
      }
    })()
    return () => {
      alive = false
      near.stop()
      board3d?.dispose()
    }
  }, [c])

  useGSAP(
    () => {
      if (mode !== 'css') return undefined
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const cells = gsap.utils.toArray('.gl__cell', root.current)
        gsap.from(cells, {
          z: -260,
          autoAlpha: 0,
          duration: 1.3,
          ease: 'power3.out',
          stagger: { each: 0.06, from: 'center', grid: [N, N] },
          scrollTrigger: { trigger: root.current.querySelector('.gl'), start: 'top 72%', toggleActions: 'play none none reverse' },
        })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [mode] },
  )

  const board = useRef(null)
  const hot = useRef(null)
  // Hover lives on a flat layer of invisible targets (.gl__hits) laid over the board with the same geometry, not inside the
  // 3D scene: in there the label and the lifted tile sit above any target and the browser's 3D hit test lost it, so a tile
  // dropped as soon as it rose. The targets never move; they switch the matching tile on and off.
  const setHot = (key) => {
    if (hot.current?.key === key) return
    hot.current?.el.classList.remove('is-hot')
    hot.current = null
    if (key == null) return
    const el = board.current?.querySelector(`[data-i="${key}"] .gl__tile`)
    if (el) {
      el.classList.add('is-hot')
      hot.current = { key, el }
    }
  }

  const cells = []
  const hits = []
  // Rows 0-2 are the bands that would sit up-left of the centre, behind the copy: they are left out on purpose.
  for (let row = FIRST_ROW; row < N; row++) {
    for (let col = 0; col < N; col++) {
      const dx = col - MID
      const dy = row - MID
      const ring = Math.max(Math.abs(dx), Math.abs(dy))
      const core = ring === 0
      const slot = SLOTS[`${col},${row}`]
      const topic = slot == null ? null : c.topics[slot]
      // where the centre is, seen from this tile: the blue is picked up on that side
      const gx = dx < 0 ? '100%' : dx > 0 ? '0%' : '50%'
      const gy = dy < 0 ? '100%' : dy > 0 ? '0%' : '50%'
      const glow = ring === 1 ? 1 : ring === 2 ? 0.28 : ring === 3 ? 0.08 : 0
      cells.push(
        <div
          className="gl__cell"
          key={`${col}-${row}`}
          data-i={`${col},${row}`}
          style={{ '--c': col, '--r': row, '--gx': gx, '--gy': gy, '--glow': glow }}
          aria-hidden="true"
        >
          <div className={`gl__tile${core ? ' gl__tile--core' : ''}${topic ? ' gl__tile--tool' : ''}${ring > 2 ? ' gl__tile--far' : ''}`}>
            <span className="gl__slab" />
            <span className="gl__face" />
            {core && (
              <svg className="gl__logo" viewBox={LOGO_VIEWBOX}>
                {LOGO_PATHS.map((s, i) => (
                  <path key={i} d={s.d} fill="#fff" />
                ))}
              </svg>
            )}
            {topic && (
              <span className="gl__label">
                <span className="gl__name">{topic}</span>
                <span className="gl__micro">
                  <Micro kind={slot} />
                </span>
              </span>
            )}
          </div>
        </div>,
      )
      hits.push(<span className="gl__hit" key={`${col}-${row}`} data-i={`${col},${row}`} style={{ '--c': col, '--r': row }} />)
    }
  }

  return (
    <section ref={root} className="section cons" data-nav-theme="paper" id="solution">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="cons__pin">
        <div className="container cons__grid">
          <div className="cons__copy">
            <p className="eyebrow" data-reveal="fade">
              {c.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {c.title}
            </h2>
            <div className="cons__body" data-reveal="up" data-delay="0.15">
              {c.body.map((p) => (
                <p className="lede" key={p}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="gl" role="img" aria-label={`${c.topics.join(', ')} → ${c.unified}`}>
            <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="glLine" x1="0" x2="1">
                  <stop offset="0" stopColor="#2a46f0" />
                  <stop offset="1" stopColor="#7d93ff" />
                </linearGradient>
                <linearGradient id="glArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#4b6bff" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#4b6bff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="gl__3d" ref={host} aria-hidden="true" />
            {mode === 'css' && (
              <>
                <div className="gl__board" ref={board}>
                  {cells}
                </div>
                <div className="gl__hits" aria-hidden="true" onPointerOver={(e) => setHot(e.target.dataset?.i ?? null)} onPointerLeave={() => setHot(null)}>
                  {hits}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
