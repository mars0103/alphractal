import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { AUDIENCE } from '../lib/facts.js'
import PostsCarousel from '../components/PostsCarousel.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'

/* Proof in layers: the survey headline, a signed subscriber quote, the survey bars, then the ten approved posts
   on a moving, reflected 9:16 row. The posts are never links. */
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
            {p.title.replace('59%', `${AUDIENCE.rows.find((r) => r.key === 'goal').value}%`)}
          </h2>
        </div>

        <div className="proof__grid">
          <figure className="quote" data-reveal="up">
            <span className="quote__mark" aria-hidden="true" />
            <blockquote lang="en">{p.quote}</blockquote>
            <figcaption className="quote__by">
              <img src="/people/rafaela-romano.webp" alt="" width="56" height="56" loading="lazy" />
              <span>
                <strong>{p.quoteBy}</strong>
                <em>{p.quoteLine}</em>
              </span>
            </figcaption>
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

      </div>

      <PostsCarousel label={p.postsLabel} />
    </section>
  )
}
