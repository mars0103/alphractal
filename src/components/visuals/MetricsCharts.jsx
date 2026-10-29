import { useEffect, useId, useMemo, useRef } from 'react'
import { gsap } from '../../lib/gsap.js'
import { useLive, useZoom } from '../../lib/live.js'
import { CHARTS } from './metricsChart.js'

/* Drawn metric charts for /platform/metrics. Loose line drawings straight on the paper: no frame, no card, no shadow.
   On arrival each one is drawn in left to right, then keeps a slow live tape while it is on screen; on a mouse the part
   under the pointer is magnified, with a crosshair. Shapes only (labelled illustrative), never market data.
   The first render is deterministic (no Math.random), so server and client markup match; with reduced motion the drawing
   simply stays in its final state. */

const R0 = 120 // where the tape starts: enough history behind it

export function MetricChart({ kind, W = 960, H = 330, dur = 2.8, zoom = 2.2, label }) {
  const root = useRef(null)
  const uid = useId().replace(/:/g, '')
  const chart = useMemo(() => CHARTS[kind](W, H), [kind, W, H])
  const first = useMemo(() => ({ layers: chart.layers(R0), head: chart.head(R0) }), [chart])

  useZoom(root, zoom, '.mxc__frame')
  useLive(root, (el) => {
    const paths = [...el.querySelectorAll('.mxc__l')]
    const heads = [...el.querySelectorAll('.mxc__head')]
    const rv = el.querySelector('.mxc__rv')
    const extras = el.querySelectorAll('.mxc__head, .mxc__tag')
    const lite = window.matchMedia('(max-width: 991px)').matches
    let tape = R0
    let live = false
    let skip = false
    let tl = null

    const paint = (o) => {
      const ls = chart.layers(o)
      for (let k = 0; k < paths.length; k++) {
        paths[k].setAttribute('d', ls[k].d)
        if (ls[k].t) paths[k].setAttribute('transform', ls[k].t)
      }
      const hs = chart.head(o)
      for (let k = 0; k < heads.length; k++) {
        const c = heads[k].children
        c[0].setAttribute('cx', hs[k][0].toFixed(1))
        c[0].setAttribute('cy', hs[k][1].toFixed(1))
        c[1].setAttribute('cx', hs[k][0].toFixed(1))
        c[1].setAttribute('cy', hs[k][1].toFixed(1))
      }
    }

    gsap.set(rv, { attr: { width: 0 } })
    gsap.set(extras, { autoAlpha: 0 })
    return {
      start() {
        const p = { w: 0 }
        tl = gsap.timeline({ onComplete: () => (live = true) })
        tl.to(p, { w: W + 8, duration: dur, ease: 'power2.inOut', onUpdate: () => rv.setAttribute('width', p.w.toFixed(1)) })
        tl.to(extras, { autoAlpha: 1, duration: 0.6 }, `-=${Math.min(0.7, dur * 0.3)}`)
      },
      frame(dt) {
        if (!live) return
        tape += dt * chart.rate
        if (lite) {
          skip = !skip
          if (skip) return
        }
        paint(tape)
      },
      kill() {
        if (tl) tl.kill()
      },
    }
  })

  // crosshair under the mouse (the magnifier itself is useZoom)
  useEffect(() => {
    const fr = root.current?.querySelector('.mxc__frame')
    if (!fr || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined
    const move = (e) => {
      const b = fr.getBoundingClientRect()
      fr.style.setProperty('--cx', `${(e.clientX - b.left).toFixed(0)}px`)
      fr.style.setProperty('--cy', `${(e.clientY - b.top).toFixed(0)}px`)
    }
    const leave = () => {
      fr.style.removeProperty('--cx')
      fr.style.removeProperty('--cy')
    }
    fr.addEventListener('pointermove', move)
    fr.addEventListener('pointerleave', leave)
    return () => {
      fr.removeEventListener('pointermove', move)
      fr.removeEventListener('pointerleave', leave)
    }
  }, [])

  const clip = (c) => (c ? `url(#${uid}-${c})` : undefined)

  return (
    <figure ref={root} className={`mxc mxc--${kind}`} role="img" aria-label={label || 'Illustrative chart'}>
      <ul className="mxc__legend" aria-hidden="true">
        {chart.legend.map(([c, t]) => (
          <li key={t} className={`mxc__key mxc__key--${c}`}>
            {t}
          </li>
        ))}
        <li className="mxc__ill">Illustrative</li>
      </ul>
      <div className="mxc__frame live-zoom">
        <svg viewBox={`0 0 ${W} ${H}`} className="mxc__svg" focusable="false" aria-hidden="true">
          <defs>
            <clipPath id={`${uid}-rv`}>
              <rect className="mxc__rv" x="-4" y="-10" width={W + 8} height={H + 20} />
            </clipPath>
            {Object.entries(chart.clips || {}).map(([k, [x, y, w, h]]) => (
              <clipPath id={`${uid}-${k}`} key={k}>
                <rect x={x} y={y} width={w} height={h} />
              </clipPath>
            ))}
          </defs>
          {chart.rules.map((r, i) => (
            <line key={i} className={`mxc__r mxc__r--${r.c}`} x1="0" x2={W} y1={r.y} y2={r.y} />
          ))}
          <g clipPath={`url(#${uid}-rv)`}>
            {(chart.statics || []).map((s, i) => (
              <path key={`s${i}`} className={`mxc__s ${s.c}`} d={s.d} />
            ))}
            {first.layers.map((L, i) => (
              <g key={i} clipPath={clip(L.clip)}>
                <path className={`mxc__l ${L.c}`} d={L.d} transform={L.t} />
              </g>
            ))}
          </g>
          {first.head.map((h, i) => (
            <g key={`h${i}`} className={`mxc__head mxc__head--${h[2]}`}>
              <circle cx={h[0]} cy={h[1]} r="9" className="mxc__halo" />
              <circle cx={h[0]} cy={h[1]} r="4" className="mxc__dot" />
            </g>
          ))}
          {(chart.tags || []).map((t) => (
            <text key={t.t} className="mxc__tag" x={t.x} y={t.y} textAnchor={t.a || 'start'}>
              {t.t}
            </text>
          ))}
        </svg>
        <span className="mxc__cross" aria-hidden="true" />
      </div>
    </figure>
  )
}
