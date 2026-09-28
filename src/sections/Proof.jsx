import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { AUDIENCE, LINKS } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'

/* Proof in layers (brief §5.1 sec. 7): verifiable numbers, a real subscriber quote, real posts. No invented testimonials. */
export default function Proof() {
  const { t, num } = useI18n()
  const p = t.proof
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.utils.toArray('.abar', root.current).forEach((bar, i) => {
          const v = Number(bar.dataset.v)
          const fill = bar.querySelector('.abar__fill')
          const label = bar.querySelector('.abar__v')
          const state = { n: 0 }
          gsap.set(fill, { scaleX: 0 })
          gsap
            .timeline({ scrollTrigger: { trigger: bar, start: 'top 90%', once: true }, delay: i * 0.08 })
            .to(fill, { scaleX: v / 100, duration: 1.6, ease: 'power3.out' }, 0)
            .to(
              state,
              { n: v, duration: 1.6, ease: 'power3.out', onUpdate: () => (label.textContent = `${Math.round(state.n)}%`) },
              0,
            )
        })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [p] },
  )

  return (
    <section ref={root} className="section proof" data-nav-theme="paper" id="proof">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {p.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {p.title}
          </h2>
        </div>

        <div className="proof__grid">
          <figure className="quote" data-reveal="up">
            <span className="quote__mark" aria-hidden="true" />
            <blockquote lang="en">{p.quote}</blockquote>
            <figcaption className="mono">{p.quoteBy}</figcaption>
          </figure>

          <div className="aud" data-reveal="up" data-delay="0.12">
            <span className="ring ring--soft" aria-hidden="true" />
            <div className="aud__top">
              <h3>{p.audienceTitle}</h3>
              <span className="mono">{p.audienceNote.replace('1,845', num(AUDIENCE.n)).replace('1.845', num(AUDIENCE.n))}</span>
            </div>
            <ul>
              {AUDIENCE.rows.map((r) => (
                <li className="abar" data-v={r.value} key={r.key}>
                  <span className="abar__v num">{r.value}%</span>
                  <span className="abar__t">{p.rows[r.key]}</span>
                  <i className="abar__fill" style={{ '--v': r.value / 100 }} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="xcard" data-reveal="up">
          <div>
            <h3>{p.xTitle}</h3>
            <p>{p.xText}</p>
          </div>
          <a className="btn btn--ink btn--sm" href={LINKS.x} rel="noopener noreferrer">
            {p.xCta} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
