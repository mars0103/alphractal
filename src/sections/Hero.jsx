import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LINKS } from '../lib/facts.js'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'
import { createScreen, createState, tileRect } from '../lib/heroScreen.js'
import GradientWaves from '../components/GradientWaves.jsx'
import Starfield from '../components/Starfield.jsx'
import ImacScreen from '../components/ImacScreen.jsx'

// Real routes already in the project — see App.jsx. No invented destinations.
const STEP_HREF = [LINKS.login, '/platform/alpha-ai', '/terminal']
const PIN_QUERY = `${MQ.motion} and ${MQ.desktop} and (min-height: 681px)`
// Phones pin too: the hero locks and the three scenes advance as the visitor scrolls, like on desktop.
const PIN_MOBILE_QUERY = `${MQ.motion} and ${MQ.mobile} and (min-height: 700px)`

/*
 * A black iMac photo (components/ImacScreen.jsx) carries the app. Its screen is a 2D canvas drawn by lib/heroScreen.js and
 * warped behind the photo's transparent screen area; this timeline animates that canvas' state while the hero stays pinned:
 *   1 · twelve real metrics, a cursor picks Liquidation Levels and its block grows to the window size
 *   2 · Alpha AI, with a question about the decision that chart informs
 *   3 · Alpha Terminal, where the machine stays still and the scroll is released
 * The machine rises from below on entry, its base hidden behind the blue gradient. Text and screen swap together.
 */
export default function Hero() {
  const { t } = useI18n()
  const h = t.hero
  const root = useRef(null)
  const wrapRef = useRef(null)
  const stateRef = useRef(null)
  if (!stateRef.current) stateRef.current = createState()
  const screenRef = useRef(null)
  const [screen, setScreen] = useState(null)
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(false)

  // The display texture exists only in the browser (it needs a canvas); the page reads fine without it.
  useEffect(() => {
    const s = createScreen(h, stateRef.current)
    screenRef.current = s
    setScreen(s)
    return () => {
      screenRef.current = null
    }
  }, [h])

  // Entrance: the machine rises from below (its base stays hidden behind the blue gradient), then the metric blocks cascade in.
  useGSAP(
    () => {
      const S = stateRef.current
      if (window.matchMedia(MQ.reduced).matches) {
        S.tiles = 2
        return undefined
      }
      const wrap = wrapRef.current
      if (!wrap) return undefined
      gsap.fromTo(wrap, { yPercent: 62, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 2.4, ease: 'power3.out', delay: 0.2 })
      gsap.to(S, { tiles: 1.7, duration: 1.8, ease: 'none', delay: 1.9 })
      return undefined
    },
    { scope: root },
  )

  useGSAP(
    () => {
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)
      const mm = gsap.matchMedia()
      const S = stateRef.current

      mm.add(MQ.motion, () => {
        // Entrance of the copy: plays once on load.
        const first = qa('.hero__step')[0]
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from(first.querySelectorAll('.mask__in'), { yPercent: 118, duration: 1.3, stagger: 0.13 }, 0.35)
          .from(first.querySelector('.eyebrow'), { autoAlpha: 0, y: 12, duration: 0.8 }, 0.3)
          .from(first.querySelector('.jstep__sub'), { autoAlpha: 0, y: 18, duration: 1 }, 0.85)
          .from(first.querySelector('.jstep__cta'), { autoAlpha: 0, y: 16, duration: 0.9 }, 1.1)

        const build = (scrollTrigger) => {
          const steps = qa('.hero__step')
          const question = h.question
          const pick = tileRect(Math.max(0, h.tiles.findIndex((x) => x.pick)))

          gsap.set(steps.slice(1), { autoAlpha: 0, y: 18 })

          let idx = 0
          const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: {
              ...scrollTrigger,
              scrub: 1,
              refreshPriority: 10,
              onUpdate: (self) => {
                const next = self.progress < 0.3 ? 0 : self.progress < 0.62 ? 1 : 2
                if (next !== idx) {
                  idx = next
                  setActive(next)
                }
              },
            },
          })

          // ---- Scene 1: a read pause, then the cursor picks Liquidation Levels and its block grows to the window ----
          // the cursor is already on screen (it floats until the visitor scrolls); on the first scroll it glides, slowly, to the block
          tl.to({}, { duration: 0.4 })
          tl.to(S, { curX: pick.x + pick.w * 0.55, curY: pick.y + pick.h * 0.55, duration: 2.1, ease: 'sine.inOut' }, 0.4)
          tl.to(S, { pickS: 0.95, ripple: 0.001, duration: 0.15 }, 2.55)
          tl.to(S, { pickS: 1, ripple: 1, duration: 0.55, ease: 'power1.out' }, 2.7)
          tl.to(S, { bigA: 1, duration: 0.01 }, 2.7)
          tl.to(S, { curA: 0, duration: 0.4 }, 3.0)
          tl.to(S, { bigT: 1, duration: 1.1, ease: 'power3.inOut' }, 2.8)
          tl.to({}, { duration: 0.9 })

          // ---- Turn 1 → 2: the scene slides, the copy swaps (the machine never moves) ----
          const t1 = 5.2
          tl.to(steps[0], { autoAlpha: 0, y: -18, duration: 0.5 }, t1)
          tl.to(S, { s1: 0, s1x: -70, duration: 0.8 }, t1 + 0.2)
          tl.to(S, { s2: 1, s2x: 0, duration: 0.9 }, t1 + 0.45)
          tl.to(steps[1], { autoAlpha: 1, y: 0, duration: 0.55 }, t1 + 0.55)

          // ---- Scene 2: the question types in, then the answer organizes itself by category ----
          tl.to(S, { askA: 1, duration: 0.3 }, t1 + 1.3)
          tl.to(S, { typed: question.length, duration: 1.1, ease: 'none' }, t1 + 1.4)
          tl.to(S, { aiA: 1, duration: 0.3 }, t1 + 2.6)
          tl.to(S, { aiSteps: h.domains.length, duration: 0.9, ease: 'none' }, t1 + 2.75)
          tl.to(S, { resultA: 1, duration: 0.4 }, t1 + 2.75 + h.domains.length * 0.22 + 0.2)
          tl.to({}, { duration: 1 })

          // ---- Turn 2 → 3 ----
          const t2 = t1 + 5.2
          tl.to(steps[1], { autoAlpha: 0, y: -18, duration: 0.5 }, t2)
          tl.to(S, { s2: 0, s2x: -70, duration: 0.8 }, t2 + 0.2)
          tl.to(S, { s3: 1, s3x: 0, duration: 0.9 }, t2 + 0.45)
          tl.to(steps[2], { autoAlpha: 1, y: 0, duration: 0.55 }, t2 + 0.55)
          tl.to({}, { duration: 1.6 })

          // ---- End: the machine simply stays on the Terminal scene and the page scroll is released (no zoom, no melt) ----
        }

        const dmm = gsap.matchMedia()
        dmm.add(PIN_QUERY, () => {
          setPinned(true)
          build({ trigger: q('.hero__pin'), start: 'top top', end: '+=520%', pin: true, anticipatePin: 1, invalidateOnRefresh: true })
          return () => setPinned(false)
        })
        dmm.add(PIN_MOBILE_QUERY, () => {
          setPinned(true)
          build({ trigger: q('.hero__pin'), start: 'top top', end: '+=480%', pin: true, anticipatePin: 1, invalidateOnRefresh: true })
          return () => setPinned(false)
        })
        return () => dmm.revert()
      })

      // The sections below measured their scroll positions with or without this pin's spacer, depending on mount order
      // (hot reload and late fonts/images both reorder it). Re-measure everything once this pin exists and once the page has settled.
      const settle = () => ScrollTrigger.refresh()
      const t1 = setTimeout(settle, 250)
      const t2 = setTimeout(settle, 1500)
      document.fonts?.ready.then(settle)
      window.addEventListener('load', settle)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        window.removeEventListener('load', settle)
        mm.revert()
      }
    },
    { scope: root, dependencies: [h] },
  )

  return (
    <section ref={root} className="hero hero--journey" data-nav-theme="dark" id="top">
      <div className="hero__pin">
        {/* Layer order: stars < the machine < the blue gradient (it hides the stand) < the copy. */}
        <Starfield className="hero__stars" />
        <ImacScreen screen={screen} wrapRef={wrapRef} />
        <GradientWaves scrollTrigger={root} />

        <div className="container hero__grid">
          {h.steps.map((s, i) => (
            <div className="hero__step-group" key={s.eyebrow}>
              <div className="hero__step" inert={pinned && active !== i ? true : undefined}>
                <p className="eyebrow">{s.eyebrow}</p>
                <h1 className="display jstep__title">
                  {s.title.map((line) => (
                    <span className="mask" key={line}>
                      <span className="mask__in">{line}</span>
                    </span>
                  ))}
                </h1>
                <p className="jstep__sub">{s.sub}</p>
                <div className="jstep__cta">
                  {/^https?:/.test(STEP_HREF[i]) ? (
                    <a href={STEP_HREF[i]} className="btn btn--glow btn--lg">
                      <span className="ring" aria-hidden="true" />
                      <span>{s.cta}</span>
                    </a>
                  ) : (
                    <Link to={STEP_HREF[i]} className="btn btn--glow btn--lg">
                      <span className="ring" aria-hidden="true" />
                      <span>{s.cta}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
