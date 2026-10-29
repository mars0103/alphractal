import { Fragment, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import vs from '../i18n/vs.en.js'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import GlowButton from '../components/GlowButton.jsx'
import Accordion from '../components/Accordion.jsx'
import { Section } from '../components/PageBlocks.jsx'
import FinalCta from '../sections/FinalCta.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import Soon from './Soon.jsx'

const c = vs.common

/* Hero visual: a loose line drawing, no frame. The Alphractal logo in blue, a large VS set in text, the competitor's real
   logo (public/vs) in grey, joined by a fine line that draws itself on entry (CSS, so the first render is already final
   for SSR and reduced motion simply shows it drawn). */
function VsPanel({ page }) {
  return (
    <div className="vsx" role="group" aria-label={`Alphractal vs ${page.name}`}>
      <div className="vsx__side vsx__side--us">
        <span className="vsx__mark" aria-hidden="true" />
        <b className="vsx__name">Alphractal</b>
      </div>
      <span className="vsx__vs" aria-hidden="true">
        VS
      </span>
      <div className="vsx__side vsx__side--them">
        <img className="vsx__logo" src={page.logoFile.replace(/^public/, '')} alt="" width="230" height="50" />
        <span className="sr-only">{page.name}</span>
      </div>
      <svg className="vsx__ln" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="vsx-g" gradientUnits="userSpaceOnUse" x1="0" x2="100" y1="0" y2="0">
            <stop offset="0.12" stopColor="#4b6bff" />
            <stop offset="1" stopColor="#9097a6" />
          </linearGradient>
        </defs>
        <line x1="0" y1="1" x2="100" y2="1" pathLength="1" />
      </svg>
    </div>
  )
}

/* The comparison table: header rule grows, rows write in one after the other, the Alphractal column lights up last. */
function CompareTable({ page }) {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => gsap.utils.toArray(s, root.current)
        gsap.set(q('tbody .vst__us'), { '--lit': 0 })
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 82%', once: true } })
        tl.from(q('.vst__rule'), { scaleX: 0, duration: 1.1, ease: 'power3.inOut' })
          .from(q('thead th'), { autoAlpha: 0, y: 8, duration: 0.6, stagger: 0.08 }, 0.1)
          .from(q('tbody tr'), { autoAlpha: 0, y: 14, duration: 0.7, stagger: 0.14 }, 0.45)
          .to(q('tbody .vst__us'), { '--lit': 1, duration: 0.7, stagger: 0.1, ease: 'power2.out' }, '>-0.3')
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className="vst__wrap">
      <div className="vst__scroll" role="region" aria-label={`${c.tableCaption} ${page.name}`} tabIndex={0}>
        <table className="vst">
          <caption className="sr-only">
            {c.tableCaption} {page.name}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="vst__topic">
                {c.topic}
              </th>
              <th scope="col" className="vst__us">
                <span className="vst__brand">
                  <span className="vst__mark" aria-hidden="true" />
                  <span className="vst__brandname">Alphractal</span>
                </span>
              </th>
              <th scope="col" className="vst__them">
                {page.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((r) => (
              <tr key={r.topic}>
                <th scope="row" className="vst__topic">
                  {r.topic}
                </th>
                <td className="vst__us">
                  <Cell value={r.us} />
                </td>
                <td className="vst__them">
                  <Cell value={r.them} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <i className="vst__rule" aria-hidden="true" />
    </div>
  )
}

/* The three steps hang from one line that draws as the section scrolls past; no boxes, no numerals. */
function Steps() {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => gsap.utils.toArray(s, root.current)
        const vertical = window.matchMedia('(max-width: 860px)').matches
        gsap.from(q('.vss__draw'), {
          [vertical ? 'scaleY' : 'scaleX']: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'bottom 70%', scrub: 0.4 },
        })
        q('.vss__item').forEach((li, i) => {
          gsap.from(li, {
            autoAlpha: 0,
            y: 16,
            duration: 0.8,
            scrollTrigger: { trigger: root.current, start: `top ${72 - i * 6}%`, once: true },
            delay: i * 0.18,
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <ol ref={root} className="vss">
      <span className="vss__draw" aria-hidden="true" />
      {c.steps.map((s) => (
        <li className="vss__item" key={s.title}>
          <i className="vss__dot" aria-hidden="true" />
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  )
}

function Cell({ value }) {
  if (!Array.isArray(value)) return value
  return value.map((part, i) =>
    typeof part === 'string' ? (
      <Fragment key={i}>{part}</Fragment>
    ) : (
      <Link key={i} to={part.to} className="vst__link">
        {part.label}
      </Link>
    ),
  )
}

export default function Vs() {
  const { slug } = useParams()
  const page = vs.pages[slug]

  // Title, description and the single JSON-LD graph come from lib/seo.js (keyed by the route).
  useMeta({ title: page ? page.meta.title : 'Alphractal', description: page?.meta.description })
  if (!page) return <Soon />

  const others = vs.order.filter((k) => k !== slug)

  return (
    <PageShell className="vs-page">
      <PageHero
        eyebrow={c.eyebrow}
        title={`Alphractal vs ${page.name}`}
        sub={
          <>
            <span className="vs__support">{page.support}</span>
            {page.sub}
          </>
        }
        visual={<VsPanel page={page} />}
        actions={
          <>
            <GlowButton href={LINKS.start}>{c.cta}</GlowButton>
            <a className="link-arrow phero__more" href="#comparison">
              {c.heroMore} <span aria-hidden="true">→</span>
            </a>
          </>
        }
      />

      <Section id="comparison">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {c.comparisonEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {c.comparisonTitle}
            </h2>
            <p className="vs__intro">{c.comparisonIntro}</p>
          </div>

          <CompareTable page={page} />

          <div className="vst__foot">
            <p className="vst__reviewed">{c.reviewed}</p>
            <div className="vst__sources">
              <span>{c.sourcesLabel}</span>
              <ul>
                {page.sources.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {page.contextNote && <p className="vst__note">{page.contextNote}</p>}
          </div>

          <div className="vs__guide">
            <h3>{c.guidanceLabel}</h3>
            <p>{page.guidance}</p>
          </div>
        </div>
      </Section>

      <Section id="moving-over">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {c.stepsEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {c.stepsTitle}
            </h2>
          </div>
          <Steps />
        </div>
      </Section>

      <Section id="before-you-switch">
        <div className="container faq__grid">
          <div className="section__head faq__head">
            <p className="eyebrow" data-reveal="fade">
              {c.switchEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {c.switchTitle}
            </h2>
            <p className="vs__intro">{c.switchIntro}</p>
          </div>
          <Accordion items={page.faq} idPrefix="vsfaq" />
        </div>
      </Section>

      <Section id="others">
        <div className="container">
          <p className="eyebrow" data-reveal="fade">
            {c.othersLabel}
          </p>
          <ul className="vso">
            {others.map((k) => (
              <li key={k}>
                <Link to={`/vs/${k}`} className="vso__link">
                  <span>
                    Alphractal vs <b>{vs.pages[k].name}</b>
                  </span>
                  <span className="vso__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta title={c.ctaTitle} sub={c.ctaSub} primary={c.cta} secondary={c.ctaSecondary} secondaryTo={LINKS.plans} />
    </PageShell>
  )
}
