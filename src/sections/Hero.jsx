import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import GradientWaves from '../components/GradientWaves.jsx'
import HeroGrid from '../components/HeroGrid.jsx'
import BorderGlow from '../components/BorderGlow.jsx'
import Viz from '../components/Viz.jsx'
import { LiveCandles, OrderLadder } from '../components/visuals/HeroLive.jsx'

// Real routes already in the project — see App.jsx. No invented destinations.
const STEP_HREF = ['/platform', '/platform/alpha-ai', '/terminal']
// Where scroll progress (0..1) lands when a stepper button is clicked — comfortably inside
// each step's "settled" window, not right on a transition boundary.
const STEP_TARGET = [0.04, 0.5, 0.92]
const PIN_QUERY = `${MQ.motion} and ${MQ.desktop} and (min-height: 681px)`
// Phones pin too: the hero locks and the three steps advance as the visitor scrolls, like on
// desktop, and the page does not move on until the journey is done. Only very short phones (or
// reduced motion) fall back to the stacked layout.
const PIN_MOBILE_QUERY = `${MQ.motion} and ${MQ.mobile} and (min-height: 700px)`
const PANEL_BG = '#03050d' // the app's own surface, a step darker than the page

function PanelBar({ url }) {
  return (
    <div className="hpanel__bar" aria-hidden="true">
      <span className="hpanel__dots">
        <i />
        <i />
        <i />
      </span>
      <span className="hpanel__url mono">{url}</span>
      <span className="hpanel__live mono">
        <i />
      </span>
    </div>
  )
}

/*
 * Three-step scroll journey: Analyze → Ask Alpha AI → Trade. Desktop pins the hero and scrubs
 * one GSAP timeline across the three stages (same pin+scrub+progress-bucket technique as
 * sections/HowItWorks.jsx and sections/AppPreview.jsx). Mobile, short viewports and
 * prefers-reduced-motion get the plain stacked layout from hero.css instead — no pin, no
 * scroll-jacking, just native scroll with a light reveal per step.
 *
 * Each panel is a window of the real app (same surface and chrome as the interface previews
 * further down). On top of the scroll timeline everything keeps a small loop of its own:
 * the candles print and breathe, depth bars flicker, the gauge needle sways.
 */
export default function Hero() {
  const { t } = useI18n()
  const h = t.hero
  const root = useRef(null)
  const stRef = useRef(null)
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(false)

  const goTo = (i) => {
    setActive(i)
    const st = stRef.current
    if (!st) return
    const y = st.start + (st.end - st.start) * STEP_TARGET[i]
    window.scrollTo({ top: y, behavior: window.matchMedia(MQ.reduced).matches ? 'auto' : 'smooth' })
  }

  useGSAP(
    () => {
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        // Entrance: plays once on load — step 1 is fully settled before any scroll happens.
        const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
        intro
          .from(qa('.hero__step')[0].querySelectorAll('.mask__in'), { yPercent: 118, duration: 1.3, stagger: 0.13 }, 0.35)
          .from(q('.hero__step .eyebrow'), { autoAlpha: 0, y: 12, duration: 0.8 }, 0.3)
          .from(qa('.hero__step')[0].querySelector('.jstep__sub'), { autoAlpha: 0, y: 18, duration: 1 }, 0.85)
          .from(qa('.hero__step')[0].querySelector('.jstep__cta'), { autoAlpha: 0, y: 16, duration: 0.9 }, 1.1)
          .from(q('.hero__scene--analyze'), { autoAlpha: 0, y: 34, scale: 0.97, duration: 1.3 }, 0.7)
          .from(qa('.hero__scene--analyze .candle'), { scaleY: 0, autoAlpha: 0 }, 0)
          .to(qa('.hero__scene--analyze .candle'), { scaleY: 1, autoAlpha: 1, duration: 0.7, stagger: 0.035, ease: 'back.out(1.6)' }, 1.2)
          .from(qa('.hero-domains__item'), { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, 1.8)
          .from(q('.hero-steps'), { autoAlpha: 0, y: 10, duration: 0.7 }, 1.9)

        const star = q('.ai__star')
        gsap.to(star, { rotate: 360, duration: 9, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
        gsap.to(star, { scale: 1.14, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })

        // The panels lean a few degrees toward the pointer (fine pointers only)
        const pointerMM = gsap.matchMedia()
        pointerMM.add('(pointer: fine)', () => {
          const el = root.current
          const onMove = (e) => {
            const r = el.getBoundingClientRect()
            el.style.setProperty('--tx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3))
            el.style.setProperty('--ty', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3))
          }
          const onLeave = () => {
            el.style.setProperty('--tx', '0')
            el.style.setProperty('--ty', '0')
          }
          el.addEventListener('pointermove', onMove)
          el.addEventListener('pointerleave', onLeave)
          return () => {
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerleave', onLeave)
          }
        })

        const build = (scrollTrigger) => {
          const steps = qa('.hero__step')
          const scenes = qa('.hero__scene')
          const aiSteps = qa('.ai__step')
          const typedEl = q('.ask__typed')
          const question = h.question

          gsap.set(steps.slice(1), { autoAlpha: 0, y: 18 })
          gsap.set(scenes.slice(1), { autoAlpha: 0, y: 14, scale: 0.97 })
          gsap.set(qa('.hero__scene--trade .candle'), { scaleY: 0, autoAlpha: 0 })
          gsap.set(aiSteps, { autoAlpha: 0, y: 6 })
          gsap.set(q('.ai__result'), { autoAlpha: 0, y: 6 })
          gsap.set(q('.ask'), { autoAlpha: 0 })
          gsap.set(q('.ai'), { autoAlpha: 0 })
          gsap.set(qa('.trade-panel__row, .trade-panel__cta, .trade-panel__tabs, .ladder'), { autoAlpha: 0, y: 8 })
          gsap.set(q('.trade-ai'), { autoAlpha: 0, y: 8 })
          if (typedEl) typedEl.textContent = ''

          let idx = 0
          const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: {
              ...scrollTrigger,
              scrub: 1,
              onUpdate: (self) => {
                const next = self.progress < 0.3 ? 0 : self.progress < 0.72 ? 1 : 2
                if (next !== idx) {
                  idx = next
                  setActive(next)
                }
              },
            },
          })
          stRef.current = tl.scrollTrigger

          // ---- Step 1 read pause (already settled by the entrance above) ----
          tl.to({}, { duration: 2.2 })

          // ---- Transition 1 → 2 ----
          tl.to(steps[0], { autoAlpha: 0, y: -18, duration: 0.5 }, 2.2)
          tl.to(scenes[0], { autoAlpha: 0, y: -14, scale: 0.97, duration: 0.45 }, 2.2)
          tl.to(steps[1], { autoAlpha: 1, y: 0, duration: 0.55 }, 2.55)
          tl.to(scenes[1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 }, 2.6)

          // ---- Step 2: ask bar fills, then the AI result organizes itself by category ----
          tl.to(q('.ask'), { autoAlpha: 1, duration: 0.3 }, 2.9)
          const typed = { n: 0 }
          tl.to(
            typed,
            {
              n: question.length,
              duration: 0.9,
              ease: 'none',
              onUpdate: () => {
                if (typedEl) typedEl.textContent = question.slice(0, Math.round(typed.n))
              },
            },
            3.0,
          )
          tl.to(q('.ai'), { autoAlpha: 1, duration: 0.3 }, 3.95)
          tl.to(aiSteps, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.22 }, 4.1)
          tl.to(q('.ai__result'), { autoAlpha: 1, y: 0, duration: 0.4 }, 4.1 + aiSteps.length * 0.22 + 0.2)
          tl.to({}, { duration: 1 })

          // ---- Transition 2 → 3 ----
          tl.to(steps[1], { autoAlpha: 0, y: -18, duration: 0.5 }, 6.4)
          tl.to(scenes[1], { autoAlpha: 0, y: -14, scale: 0.97, duration: 0.45 }, 6.4)
          tl.to(steps[2], { autoAlpha: 1, y: 0, duration: 0.55 }, 6.75)
          tl.to(scenes[2], { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 }, 6.8)

          // ---- Step 3: candles print, order panel and the AI note settle in ----
          tl.to(qa('.hero__scene--trade .candle'), { scaleY: 1, autoAlpha: 1, duration: 0.5, stagger: 0.03, ease: 'back.out(1.6)' }, 7.1)
          tl.to(q('.trade-panel__tabs'), { autoAlpha: 1, y: 0, duration: 0.35 }, 7.5)
          tl.to(qa('.trade-panel__row'), { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.12 }, 7.65)
          tl.to(q('.ladder'), { autoAlpha: 1, y: 0, duration: 0.45 }, 7.7)
          tl.to(q('.trade-panel__cta'), { autoAlpha: 1, y: 0, duration: 0.35 }, 8.0)
          tl.to(q('.trade-ai'), { autoAlpha: 1, y: 0, duration: 0.4 }, 8.2)
          tl.to({}, { duration: 1 })
        }

        const dmm = gsap.matchMedia()

        dmm.add(PIN_QUERY, () => {
          setPinned(true)
          build({
            trigger: q('.hero__pin'),
            start: 'top top',
            end: '+=420%',
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          })
          return () => setPinned(false)
        })

        dmm.add(PIN_MOBILE_QUERY, () => {
          setPinned(true)
          build({
            trigger: q('.hero__pin'),
            start: 'top top',
            end: '+=380%',
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          })
          return () => setPinned(false)
        })

        // Mobile / short viewport (still inside the MQ.motion gate above): no pin — each
        // step's text + visual get one light reveal as they scroll into view, native scroll
        // throughout. Reduced motion never reaches this far: CSS alone keeps every step
        // stacked and visible without any JS (see hero.css).
        dmm.add(`(${MQ.mobile.slice(1, -1)}) and (max-height: 699px), (${MQ.desktop.slice(1, -1)}) and (max-height: 680px)`, () => {
          const groups = qa('.hero__step-group')
          groups.forEach((group, i) => {
            if (i === 0) return // step 1 is already visible via the entrance above
            const step = group.querySelector('.hero__step')
            const scene = group.querySelector('.hero__scene')
            gsap.set([step, scene], { autoAlpha: 0, y: 22 })
            gsap.to([step, scene], {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              scrollTrigger: { trigger: group, start: 'top 80%', once: true },
            })
          })
        })

        return () => {
          dmm.revert()
          pointerMM.revert()
        }
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [h] },
  )

  // Loops only run while their step is the one on screen (or always, in the stacked layouts)
  const on = (i) => !pinned || active === i

  return (
    <section ref={root} className="hero hero--journey" data-nav-theme="dark" id="top">
      <div className="hero__pin">
        {/* The background lives inside the pinned element, not the section — the section
            itself grows tall enough to reserve the pin's scroll distance (GSAP inserts a
            pin-spacer sized to it), but .hero__pin stays ~100vh for the whole journey.
            A background sized to the section instead would get stretched to match it. */}
        <HeroGrid />
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
                  <Link to={STEP_HREF[i]} className="btn btn--glow btn--lg">
                    <span className="ring" aria-hidden="true" />
                    <span>{s.cta}</span>
                  </Link>
                </div>
              </div>

              <div className={`hero__scene hero__scene--${['analyze', 'ask', 'trade'][i]}`} aria-hidden="true">
                <BorderGlow className="hero__panel" backgroundColor={PANEL_BG}>
                  {i === 0 && (
                    <>
                      <PanelBar url="app.alphractal.com/metrics" />
                      <div className="hpanel__body">
                        <div className="hpanel__head">
                          <span className="hpanel__chip">
                            <i /> BTC
                          </span>
                          <span className="hpanel__metric mono">{h.chartLabel}</span>
                          <span className="hpanel__ranges mono">
                            <i className="is-on">1D</i>
                            <i>1W</i>
                            <i>1M</i>
                            <i>ALL</i>
                          </span>
                        </div>
                        <LiveCandles seed={11} drift={0.012} vol={0.3} name={h.chartLabel} running={on(0)} />
                        <ul className="hero-domains">
                          {h.domains.map((d) => (
                            <li className="hero-domains__item" key={d.key}>
                              <Viz kind={d.key} />
                              <span className="mono">{d.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {i === 1 && (
                    <>
                      <PanelBar url="app.alphractal.com/alpha-ai" />
                      <div className="hpanel__body hpanel__body--ask">
                        <p className="hpanel__logo">
                          <b>Alpha</b> <em>AI</em>
                        </p>
                        <div className="ask">
                          <span className="ring ring--ask" aria-hidden="true" />
                          <span className="ask__glow" aria-hidden="true" />
                          <div className="ask__field">
                            <svg className="ask__search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                              <circle cx="11" cy="11" r="7" />
                              <path d="m21 21-4.3-4.3" />
                            </svg>
                            <span className="ask__text">
                              <span className="ask__typed">{h.question}</span>
                              <i className="ask__caret" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="ask__bar">
                            <span className="ask__chip">QUICK ASK</span>
                            <span className="ask__chip ask__chip--trade">$ TRADE</span>
                            <span className="ask__credits">
                              1,000 credits · <b>49,000</b> left
                            </span>
                            <span className="ask__send">
                              <img src="/figma/send.svg" alt="" width="18" height="18" />
                            </span>
                          </div>
                        </div>
                        <div className="ai">
                          <div className="ai__head">
                            <img className="ai__star" src="/figma/spark.svg" alt="" width="30" height="30" />
                            <span className="ai__title">{h.thinking}</span>
                            <span className="ai__dots" aria-hidden="true">
                              <i />
                              <i />
                              <i />
                            </span>
                          </div>
                          <ul className="ai__list">
                            {h.domains.map((d) => (
                              <li className="ai__step is-done" key={d.key}>
                                <img src="/figma/check.svg" alt="" width="11" height="9" />
                                <span>{d.label}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="ai__result mono">{h.resultLabel}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {i === 2 && (
                    <>
                      <PanelBar url="app.alphractal.com/terminal" />
                      <div className="hpanel__body">
                        <div className="hpanel__head">
                          <span className="hpanel__chip">
                            <i /> {h.trade.pair}
                          </span>
                          <span className="hpanel__ranges mono">
                            <i>1m</i>
                            <i className="is-on">15m</i>
                            <i>1h</i>
                            <i>4h</i>
                          </span>
                        </div>
                        <LiveCandles seed={23} drift={0.004} vol={0.3} height={196} tag="LAST" name={h.trade.pair} running={on(2)} />
                        <div className="trade-grid">
                          <div className="trade-panel">
                            <div className="trade-panel__tabs mono">
                              <span className="is-active">{h.trade.buy}</span>
                              <span>{h.trade.sell}</span>
                            </div>
                            <div className="trade-panel__row">
                              <span className="mono">{h.trade.price}</span>
                              <b className="mono">—</b>
                            </div>
                            <div className="trade-panel__row">
                              <span className="mono">{h.trade.amount}</span>
                              <b className="mono">—</b>
                            </div>
                            <span className="btn btn--blue btn--sm trade-panel__cta">{h.trade.cta}</span>
                          </div>
                          <OrderLadder />
                        </div>
                        <p className="trade-ai mono">
                          <img src="/figma/spark.svg" alt="" width="16" height="16" />
                          <span>{h.trade.aiNote}</span>
                        </p>
                      </div>
                    </>
                  )}
                </BorderGlow>
              </div>
            </div>
          ))}

          <ol className={`hero-steps${pinned ? ' is-live' : ''}`} aria-label={h.indicator.join(', ')}>
            {h.indicator.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  className={`hero-steps__item${i === active ? ' is-active' : ''}`}
                  aria-current={i === active ? 'step' : undefined}
                  onClick={() => goTo(i)}
                >
                  <span className="mono hero-steps__n">{String(i + 1).padStart(2, '0')}</span>
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ol>

          <p className="jstep__legal">
            <span>{h.disclaimer}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
