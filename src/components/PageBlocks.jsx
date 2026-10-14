import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'
import BorderGlow from './BorderGlow.jsx'
import CountUp from './CountUp.jsx'
import MiniViz from './MiniViz.jsx'

/* A ruled section opener */
export function Section({ id, dark = false, theme, children, className = '' }) {
  return (
    <section
      id={id}
      className={`section ${dark ? 'section--dark' : ''} ${className}`}
      data-nav-theme={theme || (dark ? 'dark' : 'paper')}
    >
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      {children}
    </section>
  )
}

/* Problem: two columns, the claim on the left and the plain explanation on the right */
export function Problem({ eyebrow, title, text }) {
  return (
    <Section id="problem">
      <div className="container split split--even">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <div className="problem__text" data-stagger>
          {text.map((p, i) => (
            <p key={p} className={i ? 'problem__p' : 'lede'} data-item>
              {p}
            </p>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* How it works: 3–4 ruled blocks, each with its own small looping picture */
export function Steps({ eyebrow, title, steps, kinds }) {
  return (
    <Section id="how">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <div className={`steps steps--${steps.length}`} data-stagger>
          {steps.map((s, i) => (
            <div className="step" data-item key={s.title}>
              <span className="ring ring--soft step__ring" aria-hidden="true" />
              <div className="step__viz">
                <MiniViz kind={kinds[i]} />
              </div>
              <span className="step__n mono">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}


/*
 * How it works, as a scroll story. Desktop pins the section and walks through the steps: the
 * list on the left lights one step at a time (with a progress hairline) while the window on
 * the right swaps to that step's picture. Phones and reduced motion get plain stacked cards —
 * no pin, no scrub, nothing to hold up native scrolling.
 * Classes are toggled straight on the DOM (no React state), so a step change costs two
 * classList writes, not a re-render.
 */
export function StepsStory({ eyebrow, title, steps, kinds, url = 'app.alphractal.com' }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        const el = root.current
        const items = gsap.utils.toArray('.sstory__item', el)
        const scenes = gsap.utils.toArray('.sstory__scene', el)
        const n = items.length
        let idx = -1
        const set = (i) => {
          if (i === idx) return
          idx = i
          items.forEach((it, k) => it.classList.toggle('is-active', k === i))
          scenes.forEach((sc, k) => sc.classList.toggle('is-active', k === i))
        }
        set(0)
        el.classList.add('is-pinned')

        const st = ScrollTrigger.create({
          trigger: el.querySelector('.sstory__pin'),
          start: 'top top',
          end: `+=${n * 62}%`,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            el.style.setProperty('--p', self.progress.toFixed(4))
            set(Math.min(n - 1, Math.floor(self.progress * n)))
          },
        })
        items.forEach((it, k) => {
          it.onclick = () => window.scrollTo({ top: st.start + ((k + 0.5) / n) * (st.end - st.start), behavior: 'smooth' })
        })
        return () => {
          el.classList.remove('is-pinned')
          el.style.removeProperty('--p')
          items.forEach((it) => (it.onclick = null))
          st.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="how" ref={root} className="section section--dark sstory" data-nav-theme="dark">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="sstory__pin">
        <div className="container sstory__grid">
          <div className="sstory__copy">
            <p className="eyebrow" data-reveal="fade">
              {eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {title}
            </h2>
            <ol className="sstory__list" data-stagger>
              {steps.map((s, i) => (
                <li className="sstory__item" data-item key={s.title}>
                  <span className="sstory__n mono">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <div className="sstory__inline" aria-hidden="true">
                      <MiniViz kind={kinds[i]} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="sstory__stage" aria-hidden="true" data-reveal="up">
            <BorderGlow className="sstory__win" backgroundColor="#03050d">
              <div className="hpanel__bar">
                <span className="hpanel__dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="hpanel__url mono">{url}</span>
                <span className="sstory__count mono">
                  <b className="sstory__bar" />
                </span>
              </div>
              <div className="sstory__screen">
                {steps.map((s, i) => (
                  <div className={`sstory__scene${i === 0 ? ' is-active' : ''}`} key={s.title}>
                    <div className="sstory__viz">
                      <MiniViz kind={kinds[i]} />
                    </div>
                    <p className="sstory__cap mono">
                      {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')} · {s.title}
                    </p>
                  </div>
                ))}
              </div>
            </BorderGlow>
          </div>
        </div>
      </div>
    </section>
  )
}

/* What you get: numbered, specific rows */
export function Gains({ eyebrow, title, items }) {
  return (
    <Section id="gains">
      <div className="container split split--even split--top">
        <div className="section__head gains__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <ul className="gains" data-stagger>
          {items.map((g, i) => (
            <li className="gain" data-item key={g.title}>
              <span className="gain__n mono">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

/* Proof: one number, one sentence, optionally a real quote. Dark band. */
export function ProofBand({ eyebrow, big, big2, label, text, quote, quoteBy, legal }) {
  const numeric = /^(\d+)(%?)$/.exec(big || '')
  return (
    <Section id="proof" dark>
      <div className="container proofband">
        <p className="eyebrow" data-reveal="fade">
          {eyebrow}
        </p>
        <div className="proofband__grid">
          <div>
            <p className="proofband__big display" data-reveal="up">
              {numeric ? <CountUp value={Number(numeric[1])} suffix={numeric[2]} /> : big}
              {big2 && <span>{big2}</span>}
            </p>
            {label && (
              <p className="proofband__label mono" data-reveal="fade" data-delay="0.15">
                {label}
              </p>
            )}
          </div>
          <div className="proofband__text" data-reveal="up" data-delay="0.15">
            {text && <p className="lede">{text}</p>}
            {quote && (
              <figure className="proofband__quote">
                <blockquote lang="en">{quote}</blockquote>
                <figcaption className="mono">{quoteBy}</figcaption>
              </figure>
            )}
          </div>
        </div>
        {legal && (
          <p className="proofband__legal mono" data-reveal="fade">
            {legal}
          </p>
        )}
      </div>
    </Section>
  )
}

/* Related: 2–3 neighbouring features */
export function Related({ keys, eyebrow, title }) {
  const { t } = useI18n()
  const rows = t.pages.hub.rows.filter((r) => keys.includes(r.key))
  return (
    <Section id="related">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <div className={`rel rel--${rows.length}`} data-stagger>
          {rows.map((r) => (
            <BorderGlow className="rel__glow" backgroundColor="#fafaf9" borderRadius={14} glowColor="231 90% 60%" data-item key={r.key}>
              <Link to={r.to} className="rel__card">
                <h3>{r.title}</h3>
                <p>{r.text}</p>
                <span className="link-arrow">
                  {t.pages.common.explore} <span>→</span>
                </span>
              </Link>
            </BorderGlow>
          ))}
        </div>
      </div>
    </Section>
  )
}
