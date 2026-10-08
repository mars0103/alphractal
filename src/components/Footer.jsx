import { useRef, useEffect, useLayoutEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LINKS } from '../lib/facts.js'

/* A dark closing section: a diagonal beam of light drifts across the footer and leans toward the
   pointer, lighting a giant bottom-cropped "Alphractal" wordmark as it passes through the letters
   (same coordinate trick as a background-position window: every letter reads the same beam/glow
   gradient as the backdrop, offset by its own position). Letters near the pointer also pick up an
   accent outline — a lighter, CSS-only cousin of a dashed canvas reveal, chosen so a one-off hover
   accent doesn't turn the brand mark into a draggable toy on every page. Pure math lifted out so it
   stays easy to read; everything else is refs and CSS custom properties, no re-renders per frame. */

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

const fitSize = (measuredAt100, target, cap) => {
  if (!(measuredAt100 > 0) || !(target > 0)) return 0
  const size = (100 * target) / measuredAt100
  return cap > 0 ? Math.min(size, cap) : size
}

const beamTarget = (u, lo = 30, hi = 82) => lo + (hi - lo) * clamp(Number.isFinite(u) ? u : 0.5, 0, 1)

const drift = (t, centre = 58, amp = 9) => centre + amp * (0.7 * Math.sin(t * 0.21) + 0.3 * Math.sin(t * 0.077 + 1.3))

const approach = (from, to, k, dt) => to + (from - to) * Math.pow(1 - clamp(k, 0, 1), clamp(dt, 0, 0.1) * 60)

const baselineAt = (ascent, descent) => {
  if (!(ascent > 0) || !(descent >= 0)) return 0.8
  return clamp(((100 - ascent - descent) / 2 + ascent) / 100, 0.5, 1.2)
}

const wordHeight = (fontSize, baseline, cut) => Math.max(0, fontSize * (baseline + clamp(cut, -0.4, 0.4)))

const WORD = 'Alphractal'
const CUT = 0.16
const REACH = 190

export default function Footer() {
  const { t } = useI18n()
  const f = t.footer

  const rootRef = useRef(null)
  const wordBoxRef = useRef(null)
  const innerRef = useRef(null)
  const [size, setSize] = useState(0)
  const [base, setBase] = useState(0.8)
  const [seen, setSeen] = useState(false)
  const ptr = useRef({ u: 0.5, x: 0, y: 0, inside: false })

  const letters = useMemo(() => Array.from(WORD), [])

  // Fit the wordmark to the column width, then record where every letter sits inside the
  // footer so its slice of the beam/glow lines up with the backdrop behind it.
  useLayoutEffect(() => {
    const root = rootRef.current
    const box = wordBoxRef.current
    const inner = innerRef.current
    if (!root || !box || !inner) return
    let frame = 0

    const place = () => {
      const r = root.getBoundingClientRect()
      root.style.setProperty('--ftr-rw', r.width + 'px')
      root.style.setProperty('--ftr-rh', r.height + 'px')
      const spans = inner.querySelectorAll('.ftr-l')
      let top = 0
      spans.forEach((s, i) => {
        let x = 0
        let y = 0
        let el = s
        while (el && el !== root) {
          x += el.offsetLeft
          y += el.offsetTop
          el = el.offsetParent
        }
        s.style.setProperty('--ftr-x', x + 'px')
        s.style.setProperty('--ftr-y', y + 'px')
        if (i === 0) top = y
      })
      root.style.setProperty('--ftr-top', top + 'px')
      root.style.setProperty('--ftr-bot', top + (parseFloat(inner.style.fontSize) || 0) * 0.92 + 'px')
    }

    const fit = () => {
      const target = box.clientWidth
      inner.style.fontSize = '100px'
      const measured = inner.offsetWidth
      let baseline = 0.8
      try {
        const ctx = document.createElement('canvas').getContext('2d')
        if (ctx) {
          ctx.font = '300 100px ' + getComputedStyle(inner).fontFamily
          const m = ctx.measureText(WORD)
          baseline = baselineAt(m.fontBoundingBoxAscent, m.fontBoundingBoxDescent)
        }
      } catch {
        /* canvas unavailable: keep the 0.8 fallback */
      }
      setBase(baseline)
      const next = fitSize(measured, target, target * 0.34)
      inner.style.fontSize = next + 'px'
      setSize(next)
      place()
    }

    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fit)
    }

    fit()
    const ro = new ResizeObserver(schedule)
    ro.observe(root)
    let alive = true
    document.fonts?.ready.then(() => alive && schedule())
    return () => {
      alive = false
      cancelAnimationFrame(frame)
      ro.disconnect()
    }
  }, [])

  // Reveal once, the first time the footer comes on screen.
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.1 })
    io.observe(root)
    return () => io.disconnect()
  }, [])

  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReduced(mq.matches)
    onMq()
    mq.addEventListener('change', onMq)
    return () => mq.removeEventListener('change', onMq)
  }, [])

  // The beam drifts on its own and leans toward the pointer; the same pass also lights up
  // whichever letters the (smoothed) glow position is currently near.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const set = (b, px, py, g) => {
      root.style.setProperty('--ftr-b', b.toFixed(2) + '%')
      root.style.setProperty('--ftr-px', px.toFixed(1) + 'px')
      root.style.setProperty('--ftr-py', py.toFixed(1) + 'px')
      root.style.setProperty('--ftr-g', g.toFixed(3))
    }
    const near = (px, py, g) => {
      root.querySelectorAll('.ftr-l').forEach((s) => {
        const x = parseFloat(s.style.getPropertyValue('--ftr-x')) || 0
        const y = parseFloat(s.style.getPropertyValue('--ftr-y')) || 0
        const d = Math.hypot(px - (x + s.offsetWidth / 2), py - (y + s.offsetHeight / 2))
        s.style.setProperty('--near', (g * clamp(1 - d / REACH, 0, 1)).toFixed(3))
      })
    }

    if (reduced) {
      const onMove = () => {
        const p = ptr.current
        set(58, p.x, p.y, p.inside ? 1 : 0)
        near(p.x, p.y, p.inside ? 1 : 0)
      }
      onMove()
      root.addEventListener('pointermove', onMove)
      root.addEventListener('pointerleave', onMove)
      return () => {
        root.removeEventListener('pointermove', onMove)
        root.removeEventListener('pointerleave', onMove)
      }
    }

    if (!seen) return undefined
    let raf = 0
    let last = performance.now()
    let t = last / 1000
    let b = 58
    let px = ptr.current.x
    let py = ptr.current.y
    let g = 0
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      t += dt
      const p = ptr.current
      const idle = drift(t)
      const target = p.inside ? beamTarget(p.u) * 0.75 + idle * 0.25 : idle
      b = approach(b, target, 0.035, dt)
      px = approach(px, p.x, 0.16, dt)
      py = approach(py, p.y, 0.16, dt)
      g = approach(g, p.inside ? 1 : 0, 0.06, dt)
      set(b, px, py, g)
      near(px, py, g)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, seen])

  const onPointer = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const p = ptr.current
    p.x = e.clientX - r.left
    p.y = e.clientY - r.top
    p.u = r.width ? p.x / r.width : 0.5
    p.inside = e.type !== 'pointerleave'
  }

  const hop = (e) => {
    if (reduced) return
    const el = e.currentTarget
    el.classList.remove('is-hop')
    void el.offsetWidth
    el.classList.add('is-hop')
  }

  let d = 0
  const delay = () => ({ '--d': (d += 60) + 'ms' })

  return (
    <footer
      ref={rootRef}
      className="footer"
      data-nav-theme="dark"
      data-in={seen || reduced ? 'true' : 'false'}
      onPointerMove={onPointer}
      onPointerEnter={onPointer}
      onPointerLeave={onPointer}
    >
      <div className="footer__rule" aria-hidden="true" />
      <div className="footer__sky" aria-hidden="true">
        <div className="footer__wash" />
        <div className="footer__beam" />
        <div className="footer__glow" />
      </div>

      <div className="container footer__inner">
        <div className="footer__col footer__col--brand footer__fade" style={delay()}>
          <img className="footer__mark" src="/figma/logo-mark.svg" alt="Alphractal" width="20" height="18" />
          <p className="footer__tagline">{f.tagline}</p>
          <div className="footer__social">
            <a href={LINKS.x} target="_blank" rel="noopener noreferrer">
              X
            </a>
            <a href={LINKS.telegram} target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        {f.cols.map((col) => (
          <nav key={col.title} className="footer__col" aria-label={col.title}>
            <p className="footer__label footer__fade" style={delay()}>
              {col.title}
            </p>
            <ul className="footer__links">
              {col.links.map((l) => (
                <li key={l.to} className="footer__fade" style={delay()}>
                  <Link className="footer__link" to={l.to}>
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container footer__base">
        <span>{f.rights}</span>
        <span className="footer__legal">
          {f.legal.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </span>
        <span>{f.disclaimer}</span>
      </div>

      <div
        ref={wordBoxRef}
        className="footer__word"
        style={{ height: size ? wordHeight(size, base, CUT) : 'clamp(72px, 16vw, 200px)' }}
      >
        <p className="sr-only">{WORD}</p>
        <div className="container footer__word-box">
          <div ref={innerRef} className="footer__word-in" aria-hidden="true">
            {letters.map((ch, i) => (
              <span
                key={i}
                className="ftr-l"
                onClick={hop}
                onAnimationEnd={(e) => e.currentTarget.classList.remove('is-hop')}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
        <div className="footer__word-foot" aria-hidden="true" />
      </div>
    </footer>
  )
}
