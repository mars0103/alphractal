import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { FACTS } from '../lib/facts.js'
import { swapSeparators } from '../lib/preview-data.js'
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
const NAV = [
  { key: 'home', icon: 'home' },
  { key: 'cryptos', icon: 'bitcoin' },
  { key: 'sentiment', icon: 'chat' },
  { key: 'macro', icon: 'globe' },
  { key: 'screeners', icon: 'list' },
  { key: 'research', icon: 'book' },
  { key: 'alerts', icon: 'bell', badge: true },
  { key: 'ai', icon: 'network', badge: true },
]
const DURATION = 5 // seconds per tab, same cadence as the live site
const START = ORDER.indexOf('ai')

/*
 * The product, in one window, right under the hero (wireframe 1a: "captura do produto").
 * Seven tabs auto-rotate every 5s with a progress hairline. Rotation pauses on hover, focus, when the
 * section is off screen or the tab is hidden, and never runs under prefers-reduced-motion.
 * Everything inside is sample data: the caption says so, and the AI line carries the legal disclaimer.
 */
export default function AppPreview() {
  const { lang, t, num } = useI18n()
  const p = t.preview
  const root = useRef(null)
  const tween = useRef(null)
  const hold = useRef(new Set(['offscreen']))
  const playIn = useRef(null)
  const seen = useRef(false)
  const [active, setActive] = useState(START)
  const current = ORDER[active]

  const loc = lang === 'pt' ? swapSeparators : (s) => s

  const sync = () => {
    const tw = tween.current
    if (!tw) return
    if (hold.current.size || document.hidden) tw.pause()
    else tw.play()
  }
  const toggle = (reason, on) => {
    on ? hold.current.add(reason) : hold.current.delete(reason)
    sync()
  }

  /* Rotation clock: one linear tween drives both the progress hairline and the auto-advance */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const bar = root.current.querySelector('.pv-bar i')
        tween.current = gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: DURATION,
            ease: 'none',
            paused: true,
            onComplete: () => setActive((a) => (a + 1) % ORDER.length),
          },
        )
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top 85%',
          end: 'bottom 15%',
          onToggle: (self) => {
            if (self.isActive && !seen.current) {
              seen.current = true
              playIn.current?.()
            }
            toggle('offscreen', !self.isActive)
          },
        })
        const onVis = () => sync()
        document.addEventListener('visibilitychange', onVis)
        return () => {
          document.removeEventListener('visibilitychange', onVis)
          st.kill()
          tween.current?.kill()
          tween.current = null
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  /* A new tab restarts the clock, keeps its pill in view on small screens and plays its entrance */
  useEffect(() => {
    tween.current?.restart()
    sync()

    const list = root.current.querySelector('.pv-tabs')
    const tab = list.children[active]
    if (list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' })
    }

    if (window.matchMedia(MQ.reduced).matches) return
    let ctx
    // The first tab waits until the section is on screen (see the ScrollTrigger above), later tabs play at once
    playIn.current = () => {
      ctx = gsap.context(() => {
        const panel = root.current.querySelector(`#pv-panel-${current}`)
        gsap.fromTo(panel.querySelectorAll('[data-in]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.05, ease: 'power2.out', delay: 0.08 })
        gsap.fromTo(panel.querySelectorAll('[data-bar]'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.out', delay: 0.3, transformOrigin: '0 50%' })
        gsap.fromTo(panel.querySelectorAll('[data-draw]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.06, ease: 'power2.inOut', delay: 0.25 })
        const gauge = panel.querySelector('[data-gauge]')
        if (gauge) {
          const v = gauge.dataset.gauge
          gsap.fromTo(gauge, { strokeDasharray: '0 100' }, { strokeDasharray: `${v} 100`, duration: 1.2, ease: 'power3.out', delay: 0.25 })
        }
      }, root)
    }
    if (seen.current) playIn.current()
    return () => ctx?.revert()
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  const onKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    let next = null
    if (step) next = (active + step + ORDER.length) % ORDER.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = ORDER.length - 1
    if (next === null) return
    e.preventDefault()
    setActive(next)
    root.current.querySelector('.pv-tabs').children[next].focus()
  }

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
  const mouseOnly = (fn) => (e) => e.pointerType === 'mouse' && fn()

  return (
    <section ref={root} className="preview" data-nav-theme="paper" id="platform-preview" aria-labelledby="pv-heading">
      <h2 id="pv-heading" className="sr-only">
        {p.label}
      </h2>
      <div className="preview__wrap">
        <div
          className="pv-tabs"
          role="tablist"
          aria-label={p.tablist}
          data-reveal="up"
          onKeyDown={onKey}
          onFocus={() => toggle('focus', true)}
          onBlur={() => toggle('focus', false)}
        >
          {ORDER.map((k, i) => (
            <button
              key={k}
              type="button"
              role="tab"
              id={`pv-tab-${k}`}
              className="pv-tab"
              aria-selected={i === active}
              aria-controls={`pv-panel-${k}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
            >
              <Icon name={ICON[k]} />
              {p.tabs[k]}
            </button>
          ))}
        </div>

        <div className="pv-stage" data-reveal="up" data-delay="0.15">
          <div className="pv-glow" aria-hidden="true" />
          <div
            className="pv-app"
            onPointerEnter={mouseOnly(() => toggle('hover', true))}
            onPointerLeave={mouseOnly(() => toggle('hover', false))}
          >
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

            <div className="pv-body">
              <aside className="pv-side" aria-hidden="true">
                <div className="pv-brand">
                  <img src="/figma/logo-mark.svg" alt="" width="22" height="20" />
                  <span>Alphractal</span>
                </div>
                <div className="pv-search">
                  <Icon name="search" />
                  {p.nav.search}
                  <kbd>⌘K</kbd>
                </div>
                <ul className="pv-nav">
                  {NAV.map((n) => (
                    <li key={n.key} data-on={n.key === current}>
                      <Icon name={n.icon} />
                      {p.nav[n.key]}
                      {n.badge && <span className="pv-new">{p.nav.new}</span>}
                    </li>
                  ))}
                </ul>
                <div className="pv-foot">
                  <span>
                    <Icon name="settings" />
                    {p.nav.settings}
                  </span>
                  <span>
                    <Icon name="chevron" />
                    {p.nav.collapse}
                  </span>
                </div>
              </aside>

              <div className="pv-main">
                {ORDER.map((k) => (
                  <div
                    key={k}
                    id={`pv-panel-${k}`}
                    role="tabpanel"
                    aria-labelledby={`pv-tab-${k}`}
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

          <div className="pv-bar" aria-hidden="true">
            <i />
          </div>
          <p className="pv-note mono">
            <span>{p.caption}</span>
            <span aria-hidden="true">·</span>
            <span>{p.disclaimer}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
