import { Children, cloneElement, useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap.js'
import { useLive } from '../lib/live.js'

/* The connected-tools catalog: eight ruled cards (a hairline above and below, no boxes) in a sideways strip with arrows,
   mouse drag, touch and keyboard scrolling. All content is in the HTML. Where motion is allowed the strip drifts slowly
   (back and forth); the drift stops while the pointer is over it, while anything inside has focus, and for a few seconds
   after the reader scrolls, drags or presses an arrow, so it never moves under someone who is reading. */

/* One small line icon per card; every shape carries pathLength so it can be drawn on entry. */
const ICONS = [
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14.5l3-3 2 2 3.5-4.5" />
  </>,
  <>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </>,
  <>
    <path d="M4 4v16h16" />
    <path d="M8 15l4-4 3 3 5-6" />
  </>,
  <>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </>,
  <>
    <circle cx="9" cy="12" r="6" />
    <circle cx="15" cy="12" r="6" />
  </>,
  <>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5M10 13h6M10 17h6" />
  </>,
  <>
    <path d="M6 16v-5a6 6 0 0112 0v5l2 2H4z" />
    <path d="M10 21h4" />
  </>,
  <>
    <path d="M3 7h6l2 2h10v11H3z" />
    <path d="M3 12h18" />
  </>,
]

const REST_MS = 5000
const SPEED = 22 // px per second

export default function McpCatalog({ items }) {
  const root = useRef(null)
  const track = useRef(null)
  const drag = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  useEffect(() => {
    const el = track.current
    if (!el) return undefined
    const upd = () => {
      const start = el.scrollLeft < 4
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      setEdge((e) => (e.start === start && e.end === end ? e : { start, end }))
    }
    upd()
    el.addEventListener('scroll', upd, { passive: true })
    window.addEventListener('resize', upd)
    return () => {
      el.removeEventListener('scroll', upd)
      window.removeEventListener('resize', upd)
    }
  }, [])

  useLive(root, (el) => {
    const strip = track.current
    const paths = [...el.querySelectorAll('.mcpx-tc__icon :is(path, circle)')]
    const wrap = el
    let pos = strip.scrollLeft
    let dir = 1
    let rest = 0
    let hovered = false
    let focused = false
    let tl = null
    const now = () => performance.now()
    const hold = () => (rest = now() + REST_MS)
    const enter = (e) => e.pointerType === 'mouse' && (hovered = true)
    const leave = (e) => e.pointerType === 'mouse' && (hovered = false)
    const fin = (e) => (focused = e.target.matches(':focus-visible'))
    const fout = () => (focused = false)
    wrap.addEventListener('pointerenter', enter)
    wrap.addEventListener('pointerleave', leave)
    wrap.addEventListener('pointerdown', hold)
    wrap.addEventListener('wheel', hold, { passive: true })
    wrap.addEventListener('focusin', fin)
    wrap.addEventListener('focusout', fout)
    gsap.set(paths, { strokeDashoffset: 1 })
    return {
      start() {
        tl = gsap.timeline()
        tl.to(paths, { strokeDashoffset: 0, duration: 1, ease: 'power2.out', stagger: 0.04 })
      },
      frame(dt) {
        // someone else moved the strip (touch, wheel, arrows, drag): take over its position and wait
        if (Math.abs(strip.scrollLeft - pos) > 3) {
          pos = strip.scrollLeft
          hold()
        }
        if (hovered || focused || drag.current || now() < rest) return
        const max = strip.scrollWidth - strip.clientWidth
        pos += dir * SPEED * dt
        if (pos >= max) {
          pos = max
          dir = -1
          rest = now() + 2500
        } else if (pos <= 0) {
          pos = 0
          dir = 1
          rest = now() + 2500
        }
        strip.scrollLeft = pos
      },
      kill() {
        if (tl) tl.kill()
        wrap.removeEventListener('pointerenter', enter)
        wrap.removeEventListener('pointerleave', leave)
        wrap.removeEventListener('pointerdown', hold)
        wrap.removeEventListener('wheel', hold)
        wrap.removeEventListener('focusin', fin)
        wrap.removeEventListener('focusout', fout)
      },
    }
  })

  const step = (dir) => {
    const el = track.current
    const card = el.querySelector('.mcpx-tc')
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * ((card?.offsetWidth || 360) + gap), behavior: reduced ? 'auto' : 'smooth' })
  }
  const down = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: track.current.scrollLeft }
    track.current.classList.add('is-drag')
    track.current.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    if (!drag.current) return
    track.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
  }
  const up = (e) => {
    if (!drag.current) return
    drag.current = null
    track.current.classList.remove('is-drag')
    track.current.releasePointerCapture?.(e.pointerId)
  }

  return (
    <div ref={root} className="mcpx-cat">
      <div className="mcpx-cat__nav">
        <button type="button" className="mcpx-cat__btn" onClick={() => step(-1)} disabled={edge.start} aria-label="Previous tools">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button type="button" className="mcpx-cat__btn" onClick={() => step(1)} disabled={edge.end} aria-label="Next tools">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <ul
        ref={track}
        className="mcpx-track"
        tabIndex={0}
        aria-label="Connected tools. Scroll sideways to see more."
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {items.map((c, i) => (
          <li className="mcpx-tc" key={c.title}>
            <svg className="mcpx-tc__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              {Children.toArray(ICONS[i].props.children).map((n) => cloneElement(n, { pathLength: 1 }))}
            </svg>
            <h3>{c.title}</h3>
            <p className="mcpx-tc__text">{c.text}</p>
            <ul className="mcpx-tc__tools">
              {c.tools.map(([label, id, desc]) => (
                <li key={id}>
                  <strong>{label}</strong>
                  <code>{id}</code>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
