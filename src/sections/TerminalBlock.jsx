import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import ImacScreen from '../components/ImacScreen.jsx'
import { createScreen } from '../lib/heroScreen.js'
import { gsap, MQ, useGSAP } from '../lib/gsap.js'
import WhiteWipe from '../components/home/WhiteWipe.jsx'
import '../styles/home.css'

/* The Terminal block that used to live inside the hero, now on white right after it: copy on the left, the monitor on the
   right showing the Terminal scene. Until the real capture arrives the screen carries a named placeholder (drawn by
   lib/heroScreen.js from t.hero.terminalShot / terminalShotNote). The route /terminal is untouched. */
export default function TerminalBlock() {
  const { t } = useI18n()
  const c = t.terminal
  const [screen, setScreen] = useState(null)
  const root = useRef(null)

  // entrance: when the visitor reaches the section the monitor rises from below, out of the bottom rule (the section clips it)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.hf-term__screen', {
          yPercent: 105,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 62%', toggleActions: 'play none none reverse' },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  useEffect(() => {
    const sc = createScreen({ ...t.hero, tiles: [] })
    Object.assign(sc.state, { s1: 0, s2: 0, s3: 1, s3x: 0, curA: 0, bigA: 0, askA: 0, aiA: 0, resultA: 0 })
    setScreen(sc)
  }, [t])

  return (
    <>
      <WhiteWipe tone="#fff" />
      <section ref={root} className="hf-term" data-nav-theme="paper" id="terminal-block" aria-labelledby="hf-term-title">
        <div className="container hf-term__grid">
          <div className="hf-term__copy">
            <p className="hf-kicker" data-reveal="fade">
              {c.kicker}
            </p>
            <h2 id="hf-term-title" className="h2 hf-term__title" data-reveal="lines">
              {c.title}
            </h2>
            <p className="lede hf-term__body" data-reveal="up" data-delay="0.1">
              {c.body}
            </p>
            <div data-reveal="up" data-delay="0.2">
              <Link to="/terminal" className="btn btn--glow btn--lg">
                <span className="ring" aria-hidden="true" />
                <span>{c.cta}</span>
              </Link>
            </div>
          </div>
          <div className="hf-term__screen" role="img" aria-label={c.label}>
            <ImacScreen screen={screen} />
          </div>
        </div>
      </section>
    </>
  )
}
