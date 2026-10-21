import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { FACTS } from '../lib/facts.js'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'
import Icon from '../components/preview/Icon.jsx'
import {
  AiPanel,
  AlertsPanel,
  CryptosPanel,
  MacroPanel,
  ResearchPanel,
  ScreenersPanel,
  SentimentPanel,
} from '../components/preview/Panels.jsx'

const ORDER = ['cryptos', 'ai', 'screeners', 'alerts', 'research', 'macro', 'sentiment']
const ICON = { cryptos: 'bitcoin', ai: 'network', screeners: 'list', alerts: 'bell', research: 'book', macro: 'globe', sentiment: 'chat' }

/*
 * The product, in one window, right under the hero. A big icon + title stack on the left
 * (wireframe 1a: "captura do produto") drives which of the seven platform areas shows in the
 * window on the right — scroll-driven: pinned on desktop, scrubbed over natural scroll on mobile.
 * Everything inside the window is sample data, always captioned as such.
 */
export default function AppPreview() {
  const { t, num } = useI18n()
  const p = t.preview
  const root = useRef(null)
  const seen = useRef(false)
  const playIn = useRef(null)
  const [active, setActive] = useState(0)
  const picked = useRef(false)
  const tabs = useRef(null)
  const current = ORDER[active]

  const loc = (s) => s

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const q = (s) => root.current.querySelector(s)

      const build = (scrollTrigger) => {
        const fill = q('.fscroll__fill')
        let idx = 0

        gsap.timeline({
          scrollTrigger: {
            ...scrollTrigger,
            scrub: 1,
            onToggle: (self) => {
              if (self.isActive && !seen.current) {
                seen.current = true
                playIn.current?.()
              }
            },
            onUpdate: (self) => {
              if (fill) gsap.set(fill, { scaleY: self.progress })
              const next = Math.min(ORDER.length - 1, Math.floor(self.progress * ORDER.length))
              if (next === idx) return
              idx = next
              setActive(next)
            },
          },
        })
      }

      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        build({
          trigger: q('.fscroll__pin'),
          start: 'top top',
          end: `+=${ORDER.length * 90}%`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      })
      // Phones: the tabs sit above the window, so scrolling cannot drive the selection (it would
      // be finished before the window is on screen). The tabs are tappable and, until someone
      // taps one, the selection advances on its own while the window is in view.
      mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
        let timer = null
        const stop = () => {
          clearInterval(timer)
          timer = null
        }
        const st = ScrollTrigger.create({
          trigger: q('.fscroll__screen'),
          start: 'top 85%',
          end: 'bottom 15%',
          onToggle: (self) => {
            stop()
            if (!self.isActive) return
            if (!seen.current) {
              seen.current = true
              playIn.current?.()
            }
            timer = setInterval(() => {
              if (!picked.current) setActive((a) => (a + 1) % ORDER.length)
            }, 4600)
          },
        })
        return () => {
          stop()
          st.kill()
        }
      })
      // Reduced motion / no pin context: reveal the first panel once the section is in view
      mm.add(MQ.reduced, () => {
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top 85%',
          onToggle: (self) => {
            if (self.isActive && !seen.current) {
              seen.current = true
              playIn.current?.()
            }
          },
        })
        return () => st.kill()
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [p] },
  )

  // keep the active chip centred inside the swipeable tab row
  useEffect(() => {
    const list = tabs.current
    const el = list?.children[active + 1]
    if (!list || !el || list.scrollWidth <= list.clientWidth) return
    list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
  }, [active])

  /* Each new active panel plays its own entrance once the section has first come into view */
  useEffect(() => {
    if (window.matchMedia(MQ.reduced).matches) return
    let ctx
    playIn.current = () => {
      ctx = gsap.context(() => {
        const panel = root.current.querySelector(`#pv-panel-${current}`)
        if (!panel) return
        gsap.fromTo(panel.querySelectorAll('[data-in]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.05, ease: 'power2.out', delay: 0.08 })
        gsap.fromTo(panel.querySelectorAll('[data-draw]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.06, ease: 'power2.inOut', delay: 0.25 })
      }, root)
    }
    if (seen.current) playIn.current()
    return () => ctx?.revert()
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  const panels = {
    cryptos: <CryptosPanel p={p} loc={loc} />,
    ai: <AiPanel p={p} />,
    screeners: <ScreenersPanel p={p} loc={loc} num={num} />,
    alerts: <AlertsPanel p={p} />,
    research: <ResearchPanel p={p} />,
    macro: <MacroPanel p={p} loc={loc} num={num} />,
    sentiment: <SentimentPanel p={p} loc={loc} />,
  }

  const host = new URL(FACTS.appUrl).host

  return (
    <section ref={root} className="preview fscroll" data-nav-theme="paper" id="platform-preview" aria-labelledby="pv-heading">
      <h2 id="pv-heading" className="sr-only">
        {p.label}
      </h2>
      <div className="fscroll__pin">
        <div className="container fscroll__grid">
            <div className="fscroll__copy" data-reveal="up">
              <ul ref={tabs} className="fscroll__list" role="list">
                <span className="fscroll__track" aria-hidden="true">
                  <i className="fscroll__fill" />
                </span>
                {ORDER.map((k, i) => (
                  <li key={k} className={`fscroll__item${i === active ? ' is-active' : ''}`}>
                    <button
                      type="button"
                      className="fscroll__btn"
                      aria-pressed={i === active}
                      onClick={() => {
                        picked.current = true
                        setActive(i)
                      }}
                    >
                      <Icon name={ICON[k]} className="fscroll__icon" />
                      <span className="fscroll__title">{p.tabs[k]}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="fscroll__descwrap">
                {ORDER.map((k, i) => (
                  <p key={k} className={`fscroll__desc${i === active ? ' is-active' : ''}`}>
                    {p.pitch[k]}
                  </p>
                ))}
              </div>
            </div>

            <div className="pv-stage fscroll__screen" data-reveal="up" data-delay="0.15">
              <div className="pv-glow" aria-hidden="true" />
              <div className="pv-app">
                <span className="ring ring--soft" aria-hidden="true" />
                <div className="pv-chrome" aria-hidden="true">
                  <span className="pv-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="pv-url">
                    <Icon name="search" />
                    {host}
                  </span>
                  <span />
                </div>

                <div className="pv-body pv-body--full">
                  <div className="pv-main">
                    {ORDER.map((k) => (
                      <div
                        key={k}
                        id={`pv-panel-${k}`}
                        className={`pv-panel${k === 'ai' ? ' pv-panel--ai' : ''}`}
                        data-active={k === current}
                        aria-hidden={k !== current}
                        inert={k !== current}
                      >
                        {panels[k]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <p className="pv-note mono container">
        <span>{p.caption}</span>
      </p>
    </section>
  )
}
