import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, ScrollTrigger, MQ } from '../lib/gsap.js'

/*
 * Alternative hero (page /home-b): copy centred at the top, a Three.js scene underneath. The waves rise
 * into being while the camera approaches; charts float free of any frame (Pi Cycle in front).
 * three is imported on demand so it never lands in the main bundle.
 */
const CAPS = [
  '',
  'Pi Cycle Top: when the 111-day average crosses above 2× the 350-day, the cycle may be peaking.',
  'Zoom out: on-chain, derivatives, sentiment and macro in one place.',
  'Dive in: 1,500+ metrics under the surface.',
  'Back to the chart.',
  '',
]

export default function Hero2() {
  const { t } = useI18n()
  const s = t.hero.steps[0]
  const root = useRef(null)
  const canvas = useRef(null)
  const state = useRef({ intro: 0, scroll: 0 })
  const sceneRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [pick, setPick] = useState(0)
  const [cap, setCap] = useState(0)

  useEffect(() => {
    let scene
    let io
    let dead = false
    const reduced = window.matchMedia(MQ.reduced).matches
    ;(async () => {
      const { createHeroScene } = await import('../components/hero2/heroScene.js')
      if (dead || !canvas.current) return
      const small = window.matchMedia(MQ.mobile).matches
      scene = createHeroScene(canvas.current, state.current, { small })
      sceneRef.current = scene
      if (reduced) {
        state.current.intro = 1
        setReady(true)
        scene.renderOnce()
        return
      }
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()), { threshold: 0 })
      io.observe(canvas.current)
      gsap.to(state.current, { intro: 1, duration: 4.6, ease: 'power2.inOut', delay: 0.25 })
    })()
    return () => {
      dead = true
      io?.disconnect()
      scene?.dispose()
    }
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from('.hero2__eyebrow', { autoAlpha: 0, y: 12, duration: 0.8 }, 0.2)
          .from('.hero2__title .mask__in', { yPercent: 118, duration: 1.3 }, 0.3)
          .from('.hero2__sub', { autoAlpha: 0, y: 18, duration: 1 }, 0.8)
          .from('.hero2__cta', { autoAlpha: 0, y: 16, duration: 0.9 }, 1.0)
        // the hero is pinned and the scroll drives the camera: zoom in on the signal, out to the whole market,
        // down into the waves, back out, then close on the chart tip where the visitor makes the call
        const copy = root.current.querySelector('.hero2__copy')
        let stage = 0
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: '+=620%',
          pin: true,
          anticipatePin: 1,
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress
            state.current.scroll = p
            gsap.set(copy, { autoAlpha: Math.max(0, 1 - p / 0.07), y: -p * 160 })
            const next = p < 0.09 ? 0 : p < 0.3 ? 1 : p < 0.5 ? 2 : p < 0.68 ? 3 : p < 0.84 ? 4 : 5
            if (next !== stage) {
              stage = next
              setCap(next)
              setReady(next === 5)
            }
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="hero2" data-nav-theme="dark" id="top">
      <canvas ref={canvas} className="hero2__canvas" aria-hidden="true" />
      <div className="hero2__live is-live" role="status">
        <i aria-hidden="true" />
        <b>LIVE</b>
        <span>Simulated data</span>
      </div>
      <p className="hero2__cap" key={cap} aria-live="polite">
        {CAPS[cap]}
      </p>
      <div className={`hero2__call${ready ? ' is-on' : ''}`}>
        <p>{pick ? `Your read: ${pick > 0 ? 'Long' : 'Short'}` : 'What is your read on this cycle?'}</p>
        <div className="hero2__call-btns" role="group" aria-label="Choose a direction">
          {[
            [1, 'Long'],
            [-1, 'Short'],
          ].map(([d, name]) => (
            <button
              key={name}
              type="button"
              className={`hero2__dir hero2__dir--${name.toLowerCase()}${pick === d ? ' is-picked' : ''}`}
              aria-pressed={pick === d}
              onClick={() => {
                setPick(d)
                sceneRef.current?.pick(d)
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <small>Simulation for illustration. No order is placed.</small>
      </div>
      <div className="container hero2__copy">
        <p className="eyebrow hero2__eyebrow">{s.eyebrow}</p>
        <h1 className="display hero2__title">
          {s.title.map((line) => (
            <span className="mask" key={line}>
              <span className="mask__in">{line}</span>
            </span>
          ))}
        </h1>
        <p className="hero2__sub">{s.sub}</p>
        <div className="hero2__cta">
          <Link to="/platform/metrics" className="btn btn--glow btn--lg">
            <span className="ring" aria-hidden="true" />
            <span>{s.cta}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
