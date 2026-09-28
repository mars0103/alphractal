import { useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { series, toPath } from '../lib/chart.js'

const W = 520
const H = 150

/* The citation moment: an answer streams in, each claim is a pill, and a pill opens the chart underneath. */
export default function CitationChat({ start = 'top 72%' }) {
  const { t } = useI18n()
  const chat = t.grounded.chat
  const root = useRef(null)
  const [open, setOpen] = useState(false)
  const touched = useRef(false)

  const paths = useMemo(() => {
    const a = series(48, 91, { drift: 0.002, vol: 0.13, start: 0.55 })
    const b = series(48, 17, { drift: 0.006, vol: 0.07, start: 0.25 })
    return { a: toPath(a, W, H, 14), b: toPath(b, W, H, 14) }
  }, [])

  const togglePanel = (next) => {
    const panel = root.current?.querySelector('.chat__chart')
    if (!panel) return
    const reduce = window.matchMedia(MQ.reduced).matches
    setOpen(next)
    gsap.killTweensOf(panel)
    if (next) {
      gsap.fromTo(
        panel,
        { height: 0, autoAlpha: 0 },
        { height: 'auto', autoAlpha: 1, duration: reduce ? 0 : 0.7, ease: 'power3.out' },
      )
      const draws = panel.querySelectorAll('[data-draw]')
      gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 })
      gsap.to(draws, { strokeDashoffset: 0, duration: reduce ? 0 : 1.3, stagger: 0.15, ease: 'power2.inOut', delay: 0.2 })
    } else {
      gsap.to(panel, { height: 0, autoAlpha: 0, duration: reduce ? 0 : 0.45, ease: 'power3.inOut' })
    }
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        const q = (s) => root.current.querySelector(s)
        const words = gsap.utils.toArray('.chat__ans [data-w]', root.current)

        gsap.set(words, { autoAlpha: 0, y: 6 })
        gsap.set(q('.chat__user'), { autoAlpha: 0, y: 16 })
        gsap.set(q('.chat__hint'), { autoAlpha: 0 })
        gsap.set(q('.chat__chart'), { height: 0, autoAlpha: 0 })

        const tl = gsap.timeline({ scrollTrigger: { trigger: q('.chat__top'), start, once: true } })
        tl.to(q('.chat__user'), { autoAlpha: 1, y: 0, duration: 0.7 })
        tl.to(words, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.035, ease: 'power2.out' }, '+=0.5')
        tl.to(q('.chat__hint'), { autoAlpha: 1, duration: 0.6 }, '+=0.2')
        // Show the payoff once on its own, unless the visitor got there first
        tl.call(() => !touched.current && togglePanel(true), null, '+=0.9')

        // Idle: a soft pulse on the citation pills invites the click
        gsap.to(gsap.utils.toArray('.pill', root.current), {
          boxShadow: '0 0 0 4px rgba(75,107,255,.16)',
          duration: 1.2,
          stagger: 0.4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        })
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [chat] },
  )

  const words = (str) =>
    str.split(' ').map((w, i) => (
      <span key={`${w}-${i}`} data-w>
        {w}{' '}
      </span>
    ))

  const pill = (id) => (
    <button
      type="button"
      className={`pill pill--btn ${open ? 'is-open' : ''}`}
      aria-expanded={open}
      onClick={() => {
        touched.current = true
        togglePanel(!open)
      }}
    >
      {id}
      <span className="pill__pop" aria-hidden="true">
        <svg viewBox={`0 0 ${W} ${H}`}>
          <path d={paths.a} fill="none" stroke="#4b6bff" strokeWidth="6" />
        </svg>
        <em className="mono">{chat.hover}</em>
      </span>
    </button>
  )

  return (
    <div ref={root} className="chat">
      <span className="ring ring--dark" aria-hidden="true" />
      <div className="chat__top mono">
        <span>Alpha AI</span>
        <span>{chat.illustrative}</span>
      </div>

      <p className="chat__user">{chat.user}</p>

      <p className="chat__ans">
        {words(chat.before)} {pill(chat.pillA)} {words(chat.a)} {words(chat.mid)} {pill(chat.pillB)}{' '}
        {words(chat.b)}
        {words(chat.after)}
      </p>

      <p className="chat__hint mono">{chat.chartHint}</p>

      <div className="chat__chart" aria-hidden={!open}>
        <div className="chat__chart-in">
          <div className="chart__head">
            <span className="mono">{chat.chartTitle}</span>
            <span className="mono">{chat.illustrative}</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="chart">
            {[0.25, 0.5, 0.75].map((y) => (
              <line key={y} x1="0" x2={W} y1={y * H} y2={y * H} stroke="rgba(154,161,178,.14)" />
            ))}
            <path d={paths.b} fill="none" stroke="#9aa1b2" strokeWidth="1.5" data-draw pathLength="1" />
            <path d={paths.a} fill="none" stroke="#fbf8f8" strokeWidth="2" data-draw pathLength="1" />
          </svg>
        </div>
      </div>
    </div>
  )
}
