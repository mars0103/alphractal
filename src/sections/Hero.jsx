import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LINKS } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import GradientWaves from '../components/GradientWaves.jsx'
import HeroGrid from '../components/HeroGrid.jsx'
import GlowButton from '../components/GlowButton.jsx'

export default function Hero() {
  const { t } = useI18n()
  const h = t.hero
  const root = useRef(null)
  const tlRef = useRef(null)

  /* Entrance + the looping AI demo */
  useGSAP(
    () => {
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        const typedEl = q('.ask__typed')
        const sendBtn = q('.ask__send')
        const block = q('.ai')
        const steps = qa('.ai__step')
        const timer = q('.ai__time')
        const chips = qa('.chip')
        const star = q('.ai__star')

        const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
        intro
          .from(qa('.hero__title .mask__in'), { yPercent: 118, duration: 1.3, stagger: 0.13 }, 0.35)
          .from(q('.hero__sub'), { autoAlpha: 0, y: 18, duration: 1 }, 0.85)
          .from(q('.ask'), { autoAlpha: 0, y: 26, scale: 0.97, duration: 1.1 }, 1.05)
          .from(chips, { autoAlpha: 0, y: 12, duration: 0.8, stagger: 0.07 }, 1.5)
          .from(qa('.hero__cta > *'), { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 }, 1.7)

        gsap.to(star, { rotate: 360, duration: 9, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
        gsap.to(star, { scale: 1.14, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })

        // Scroll: the stack lifts and softens as the gradient takes over
        gsap.to(q('.hero__stack'), {
          yPercent: -10,
          autoAlpha: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: '70% top', scrub: true },
        })

        const setChip = (i) => chips.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)))

        const play = (i) => {
          tlRef.current?.kill()
          setChip(i)
          const text = h.questions[i]
          const typed = { n: 0 }
          const clock = { v: 0 }
          const run = steps.length * 1.15

          const tl = gsap.timeline({ onComplete: () => play((i + 1) % h.questions.length) })
          tlRef.current = tl

          tl.set(steps, { autoAlpha: 0, y: 6 })
          tl.call(() => steps.forEach((s) => s.classList.remove('is-done', 'is-current')))
          tl.set(block, { autoAlpha: 0 })
          tl.call(() => (timer.textContent = '0.0s'))
          tl.call(() => (typedEl.textContent = ''))
          tl.to(
            typed,
            {
              n: text.length,
              duration: Math.max(1.1, text.length * 0.034),
              ease: 'none',
              onUpdate: () => (typedEl.textContent = text.slice(0, Math.round(typed.n))),
            },
            0.2,
          )
          tl.to(sendBtn, { scale: 0.82, duration: 0.13, yoyo: true, repeat: 1, ease: 'power2.inOut' }, '+=0.3')
          tl.addLabel('think', '>')
          tl.to(block, { autoAlpha: 1, duration: 0.5 }, 'think')
          tl.to(
            clock,
            { v: run, duration: run, ease: 'none', onUpdate: () => (timer.textContent = `${clock.v.toFixed(1)}s`) },
            'think',
          )

          steps.forEach((step, k) => {
            const at = `think+=${0.25 + k * 1.15}`
            tl.call(
              () => {
                if (steps[k - 1]) {
                  steps[k - 1].classList.remove('is-current')
                  steps[k - 1].classList.add('is-done')
                }
                step.classList.add('is-current')
              },
              null,
              at,
            )
            tl.to(step, { autoAlpha: 1, y: 0, duration: 0.55 }, at)
          })
          tl.call(
            () => {
              steps.at(-1).classList.remove('is-current')
              steps.at(-1).classList.add('is-done')
            },
            null,
            `think+=${run + 0.1}`,
          )
          tl.to({}, { duration: 2.6 })
          tl.to(block, { autoAlpha: 0, duration: 0.5 })
          tl.to(typedEl, { autoAlpha: 0, duration: 0.3 }, '<')
          tl.set(typedEl, { autoAlpha: 1 })
        }

        gsap.set(block, { autoAlpha: 0 })
        const start = gsap.delayedCall(1.9, () => play(0))
        root.current.__play = play

        return () => {
          start.kill()
          tlRef.current?.kill()
          intro.kill()
        }
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [h] },
  )

  const pick = (i) => root.current?.__play?.(i)

  return (
    <section ref={root} className="hero" data-nav-theme="dark" id="top">
      <HeroGrid />
      <GradientWaves scrollTrigger={root} />
      <div className="hero__grain" aria-hidden="true" />

      <div className="container hero__frame">
        <div className="hero__stack">
          <h1 className="display hero__title">
            {h.title.map((line) => (
              <span className="mask" key={line}>
                <span className="mask__in">{line}</span>
              </span>
            ))}
          </h1>
          <p className="hero__sub">{h.sub}</p>

          {/* Static end-state (also the reduced-motion state) matches the Figma frame */}
          <div className="ai" aria-hidden="true">
            <div className="ai__head">
              <img className="ai__star" src="/figma/spark.svg" alt="" width="30" height="30" />
              <span className="ai__title">{h.thinkingTitle}</span>
              <span className="ai__time mono">11.7s</span>
            </div>
            <ul className="ai__list">
              {h.steps.map((s, i) => (
                <li
                  key={`${s}-${i}`}
                  className={`ai__step ${i === h.steps.length - 1 ? 'is-current' : 'is-done'}`}
                >
                  <img src="/figma/check.svg" alt="" width="11" height="9" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ask" aria-hidden="true">
            <span className="ring ring--ask" aria-hidden="true" />
            <span className="ask__glow" aria-hidden="true" />
            <span className="ask__text">
              <span className="ask__typed">{h.questions[0]}</span>
              <i className="ask__caret" aria-hidden="true" />
            </span>
            <img className="ask__mic" src="/figma/mic.svg" alt="" width="17" height="27" />
            <span className="ask__send">
              <img src="/figma/send.svg" alt="" width="20" height="20" />
            </span>
          </div>

          <div className="chips" role="group" aria-label={h.ask}>
            {h.questions.map((qn, i) => (
              <button
                key={qn}
                type="button"
                className="chip"
                aria-pressed={i === 0}
                title={qn}
                onClick={() => pick(i)}
              >
                {h.chips[i]}
              </button>
            ))}
          </div>
          <p className="hero__legal">
            <span>{h.illustrative}</span>
            <span aria-hidden="true">·</span>
            <span>{h.disclaimer}</span>
          </p>

          <div className="hero__cta">
            <GlowButton href={LINKS.start} className="btn--lg">
              {h.ctaPrimary}
            </GlowButton>
            <span className="hero__note">{h.ctaNote}</span>
            <Link to="/platform" className="link-arrow hero__more">
              {h.ctaSecondary} <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
