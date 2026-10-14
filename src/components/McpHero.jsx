import { useEffect, useRef } from 'react'
import GradientWaves from './GradientWaves.jsx'
import HeroGrid from './HeroGrid.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { AI_LOGOS } from '../lib/ai-logos.js'

/*
 * MCP page hero: everything centred. Copy on top, then a fan of glass cards floating in
 * perspective made of the AI clients that can connect (Claude, Cursor, Gemini…).
 */
// Nine clients keep the ring readable: more and the cards pile onto each other
const RING = ['claude', 'cursor', 'googlegemini', 'githubcopilot', 'perplexity', 'mistralai', 'windsurf', 'n8n', 'zapier']
  .map((slug) => AI_LOGOS.find((l) => l.slug === slug))
  .filter(Boolean)

export default function McpHero({ eyebrow, title, sub, actions, note, rail, stage }) {
  const root = useRef(null)
  const fan = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => gsap.utils.toArray(s, root.current)
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from(q('.mcph__eyebrow'), { autoAlpha: 0, y: 14, duration: 0.8 }, 0.3)
          .from(q('.mcph__title'), { autoAlpha: 0, y: 26, duration: 1.1 }, 0.4)
          .from(q('.mcph__sub, .mcph__actions > *, .mcph__note'), { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.09 }, 0.8)
          .from(q('.mcph__fan'), { autoAlpha: 0, y: 60, scale: 0.94, duration: 1.3 }, 0.9)
          .from(q('.mcph__works'), { autoAlpha: 0, y: 12, duration: 0.8 }, 1.7)

      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // The "tilt" carousel: cards travel right to left along one wide arc — high and small in the
  // middle, dropping and growing toward both edges — and wrap around forever. They always face
  // forward. It eases to a stop under the pointer and sleeps off screen or under reduced motion.
  useEffect(() => {
    const el = fan.current
    if (!el) return undefined
    const items = [...el.children]
    const n = items.length
    const reduced = window.matchMedia(MQ.reduced).matches
    let offset = 0
    let speed = 26 // px per second
    let target = 26
    let visible = true

    const place = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const sp = w < 700 ? w / 3.1 : w / 6.4
      const total = n * sp
      items.forEach((card, i) => {
        const x = ((((i * sp - offset) % total) + total) % total) - total / 2
        const tn = x / (w / 2)
        const dy = h * (-0.2 + 0.46 * tn * tn) + tn * h * 0.07
        const sc = 0.88 + 0.3 * Math.min(tn * tn, 1.6)
        card.style.transform = `translate3d(${x.toFixed(1)}px, ${dy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${sc.toFixed(3)})`
        card.style.opacity = Math.abs(tn) > 1.15 ? '0' : '1'
        card.style.zIndex = String(Math.round(100 - Math.abs(tn) * 10))
      })
    }
    place()
    if (reduced) return undefined

    const tick = () => {
      if (!visible) return
      const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.1)
      speed += (target - speed) * Math.min(1, dt * 4)
      offset += speed * dt
      place()
    }
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    const stop = () => (target = 0)
    const go = () => (target = 26)
    el.addEventListener('pointerenter', stop)
    el.addEventListener('pointerleave', go)
    window.addEventListener('resize', place)
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
      el.removeEventListener('pointerenter', stop)
      el.removeEventListener('pointerleave', go)
      window.removeEventListener('resize', place)
    }
  }, [])

  return (
    <section ref={root} className="phero mcph" data-nav-theme="dark">
      <HeroGrid />
      <GradientWaves scrollTrigger={root} className="phero__waves" />
      <div className="hero__grain" aria-hidden="true" />

      <div className="container mcph__inner">
        <div className="mcph__copy">
          <p className="eyebrow mcph__eyebrow">{eyebrow}</p>
          <h1 className="display mcph__title">{title}</h1>
          <p className="mcph__sub">{sub}</p>
          <div className="mcph__actions">{actions}</div>
          {note && <p className="mcph__note mono">{note}</p>}
        </div>

        <ul className="mcph__fan" ref={fan} aria-label={stage.works}>
          {RING.map((l) => (
            <li className="mcph__card" key={l.slug} style={{ '--brand': l.color }}>
              <span className="mcph__mark">
                <svg viewBox={l.viewBox} width="40" height="40" fill="currentColor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: l.markup }} />
              </span>
              <span className="mcph__name">{l.label}</span>
            </li>
          ))}
        </ul>
        <p className="mcph__works mono">{stage.works}</p>

        {rail}

      </div>
    </section>
  )
}
