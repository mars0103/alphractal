import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PROOF_POSTS } from '../lib/facts.js'
import { gsap, MQ } from '../lib/gsap.js'
import Starfield from './Starfield.jsx'
import '../styles/posts-stack.css'

/*
 * The ten approved posts as cards, each the whole print (never cropped), riding an ellipse (a "halo reel"). Shared by the Home (proof band, with the approved
 * sentence) and the About page (no sentence).
 *
 * Card i sits at θ = i·step + rotation on an ellipse of radii (rx, ry):  x = rx·cos θ,  y = ry·sin θ,  scale = min + (1−min)·(cos θ + 1)/2.
 * cos θ places the card, sizes it and stacks it, so a card that looks nearer is nearer. One rotation value drives the whole ring and
 * every frame writes the transforms straight to the DOM (no React render per frame). The ring turns by itself one card at a time,
 * pauses while the pointer rests on it, can be dragged (it settles on the nearest card) and answers to the arrow keys.
 * On desktop with a sentence, the ring is pinned to the left edge (far half clipped) and the sentence sits in the space it leaves;
 * elsewhere the ring is centred under the sentence. Before the client measures the stage (server render, no JS) the cards are a
 * plain swipeable row. The cards are never links: the posts are production references, not destinations.
 *
 * props: phrase (optional sentence), label (aria-label of the carousel), posts (defaults to the ten approved ones), className.
 */
const TAU = Math.PI * 2
const CARD_W = 250
const CARD_H = CARD_W * 1.1 // the tallest print; the ring spacing is sized for it
// height / width of each print (598px wide exports), so a card is the whole print, never a crop
const RATIO = {
  '01-coin-bureau': 522 / 598,
  '02-james-bitcoin': 562 / 598,
  '03-james-baleias': 483 / 598,
  '04-whale-factor': 422 / 598,
  '05-killa': 450 / 598,
  '06-mignolet-sentimento': 642 / 598,
  '07-mignolet-analise': 562 / 598,
  '08-rafaela': 663 / 598,
  '09-catalina': 602 / 598,
  '10-timpar': 486 / 598,
}
const MIN_SCALE = 0.4
const SPREAD = 1.2
const HOLD = 1.1 // seconds a card rests at the front
const STEP_TIME = 0.8 // seconds for one step
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export default function PostsStack({ phrase, label = 'Posts from people who use Alphractal', posts = PROOF_POSTS, className = '' }) {
  const stage = useRef(null)
  const rot = useRef({ r: 0 })
  const drag = useRef({ on: false, angle: 0, left: 0, top: 0 })
  const hover = useRef(false)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [wide, setWide] = useState(false)
  const [reduced, setReduced] = useState(false)
  const count = posts.length

  useEffect(() => {
    const mqW = window.matchMedia(MQ.desktop)
    const mqR = window.matchMedia(MQ.reduced)
    const sync = () => {
      setWide(mqW.matches)
      setReduced(mqR.matches)
    }
    sync()
    mqW.addEventListener('change', sync)
    mqR.addEventListener('change', sync)
    return () => {
      mqW.removeEventListener('change', sync)
      mqR.removeEventListener('change', sync)
    }
  }, [])

  useLayoutEffect(() => {
    const node = stage.current
    if (!node) return undefined
    const measure = () => setSize({ w: node.offsetWidth, h: node.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  // geometry: ring pinned left beside the sentence on desktop, centred otherwise
  const left = wide && !!phrase
  const cx = left ? 0 : 0.5
  const rxK = left ? 0.45 : wide ? 0.36 : 0.34
  const ryK = 0.34
  const rx = size.w * rxK
  const ry = size.h * ryK
  const ready = size.w > 0 && count > 0
  const fit = ready ? clamp(Math.min(size.w / (rx + CARD_W), size.h / (2 * ry + CARD_H)), 0.45, 1) : 1
  const cw = CARD_W * fit
  const ch = CARD_H * fit
  const slots = ready ? clamp(Math.ceil(TAU * Math.max(rx / (CARD_W * SPREAD), ry / (CARD_H * SPREAD))), count, 64) : count
  const step = TAU / slots

  const render = useCallback(() => {
    const el = stage.current
    if (!el || !ready) return
    const r = rot.current.r
    el.querySelectorAll('.ps__card').forEach((card, i) => {
      const a = i * step + r
      const c = Math.cos(a)
      const s = Math.sin(a)
      const k = MIN_SCALE + (1 - MIN_SCALE) * ((c + 1) / 2)
      card.style.transform = `translate3d(${(c * rx).toFixed(2)}px, ${(s * ry).toFixed(2)}px, 0) scale(${k.toFixed(4)})`
      card.style.zIndex = String(Math.round(k * 1000))
    })
  }, [ready, rx, ry, step])

  useLayoutEffect(render, [render, slots, cw, ch])

  const spin = useCallback(
    (to, dur) => {
      gsap.killTweensOf(rot.current)
      if (reduced) {
        rot.current.r = to
        render()
        return null
      }
      return gsap.to(rot.current, { r: to, duration: dur, ease: 'power2.inOut', onUpdate: render })
    },
    [reduced, render],
  )

  // autoplay: each step schedules the next, so a paused tick costs a re-check and nothing else
  useEffect(() => {
    if (!ready || reduced) return undefined
    let timer = 0
    const tick = () => {
      timer = window.setTimeout(() => {
        if (drag.current.on || hover.current) {
          tick()
          return
        }
        const tw = spin(rot.current.r - step, STEP_TIME)
        if (tw) tw.eventCallback('onComplete', tick)
        else tick()
      }, HOLD * 1000)
    }
    tick()
    return () => {
      window.clearTimeout(timer)
      gsap.killTweensOf(rot.current)
    }
  }, [ready, reduced, spin, step])

  // ---- drag: angles are normalised by the radii, so a drag along the flat side turns the ring as much as one along the tall side ----
  const angleOf = (e) => {
    const d = drag.current
    return Math.atan2((e.clientY - d.top - size.h / 2) / (ry || 1), (e.clientX - d.left - size.w * cx) / (rx || 1))
  }
  const down = (e) => {
    if (!ready || (e.pointerType === 'mouse' && e.button !== 0)) return
    const b = e.currentTarget.getBoundingClientRect()
    gsap.killTweensOf(rot.current)
    drag.current = { on: true, angle: 0, left: b.left, top: b.top }
    drag.current.angle = angleOf(e)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    if (!drag.current.on) return
    const a = angleOf(e)
    const delta = ((a - drag.current.angle + Math.PI * 3) % TAU) - Math.PI // wrapped so crossing the seam is one small step
    drag.current.angle = a
    rot.current.r += delta
    render()
  }
  const up = (e) => {
    if (!drag.current.on) return
    drag.current.on = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    spin(Math.round(rot.current.r / step) * step, 0.55) // settle on the nearest card
  }
  const key = (e) => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!dir || !ready) return
    e.preventDefault()
    spin(Math.round(rot.current.r / step) * step - dir * step, STEP_TIME)
  }

  return (
    <section className={`ps ${ready ? 'is-ring' : ''} ${className}`} data-nav-theme="dark" aria-label={label}>
      <Starfield className="ps__stars" />
      <div className="ps__pin">
        {phrase && !left && (
          <div className="container ps__head">
            <p className="ps__phrase" data-reveal="up">
              {phrase}
            </p>
          </div>
        )}
        <div
          ref={stage}
          className={`ps__stage${left ? ' ps__stage--left' : ''}`}
          role="region"
          aria-roledescription="carousel"
          aria-label={label}
          tabIndex={0}
          onKeyDown={key}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') hover.current = true
          }}
          onPointerLeave={() => {
            hover.current = false
          }}
        >
          {phrase && left && (
            <div className="ps__centre" style={{ left: rx + cw / 2 + 24 }}>
              <p className="ps__phrase">{phrase}</p>
            </div>
          )}
          {Array.from({ length: slots }, (_, i) => {
            const post = posts[i % count]
            const h = cw * (RATIO[post.file] ?? 1)
            const copy = i >= count // the ring repeats the posts to stay dense; a screen reader hears each one once
            return (
              <div
                key={i}
                className="ps__card"
                role={copy ? undefined : 'group'}
                aria-roledescription={copy ? undefined : 'slide'}
                aria-hidden={copy || undefined}
                style={ready ? { width: cw, height: h, left: `${cx * 100}%`, marginLeft: -cw / 2, marginTop: -h / 2 } : undefined}
              >
                <img
                  src={`/proof/${post.file}.webp`}
                  alt={copy ? '' : `Post on X by ${post.by}`}
                  loading="lazy"
                  draggable="false"
                  decoding="async"
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
