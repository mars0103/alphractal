import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import GlowButton from '../components/GlowButton.jsx'
import Accordion from '../components/Accordion.jsx'
import { Section, Steps } from '../components/PageBlocks.jsx'
import FinalCta from '../sections/FinalCta.jsx'
import Soon from './Soon.jsx'

/* Two names and a line that draws between them: the page is a comparison, so the hero says so. */
function VsViz({ name }) {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const line = root.current.querySelector('.vsv__line i')
        gsap.set(line, { scaleY: 0, transformOrigin: '50% 0' })
        gsap
          .timeline({ delay: 0.7 })
          .to(line, { scaleY: 1, duration: 1.4, ease: 'power3.inOut' })
          .from(root.current.querySelectorAll('.vsv__node'), { autoAlpha: 0, y: 20, stagger: 0.25, duration: 0.9 }, 0)
      })
      return () => mm.revert()
    },
    { scope: root },
  )
  return (
    <div ref={root} className="vpanel vsv">
      <span className="ring ring--dark" aria-hidden="true" />
      <div className="vsv__node vsv__node--us">
        <img src="/figma/logo-mark.svg" alt="" width="34" height="31" />
        <b>Alphractal</b>
      </div>
      <div className="vsv__line">
        <i />
        <span className="mono">vs</span>
      </div>
      <div className="vsv__node">
        <b>{name}</b>
      </div>
    </div>
  )
}

const WHO = { us: 'Alphractal', tie: null }

export default function Vs() {
  const { slug } = useParams()
  const { t } = useI18n()
  const v = t.pages.vs
  const page = v.pages[slug]
  useMeta({ title: page ? `${v.titleFn(page.name)} · Alphractal` : 'Alphractal', description: page?.sub })
  if (!page) return <Soon />
  const c = t.pages.common

  const faq = page.faq.map(([q, a]) => ({ q, a }))
  const others = Object.entries(v.pages).filter(([k]) => k !== slug)

  return (
    <PageShell>
      <PageHero
        eyebrow={v.heroEyebrow}
        title={v.titleFn(page.name)}
        sub={page.sub}
        visual={<VsViz name={page.name} />}
        actions={
          <>
            <GlowButton href={LINKS.start}>{v.cta}</GlowButton>
            <a className="link-arrow phero__more" href="#matrix">
              {v.matrixTitle} <span>→</span>
            </a>
          </>
        }
        note={c.noCard}
      />

      <Section id="matrix">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {v.matrixEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {v.matrixTitle}
            </h2>
          </div>
          <ul className="vsm" data-stagger>
            {page.rows.map((r) => {
              const who = r.winner === 'us' ? WHO.us : r.winner === 'them' ? page.name : null
              return (
                <li className={`vsm__row vsm__row--${r.winner}`} data-item key={r.topic}>
                  <h3>{r.topic}</h3>
                  <span className="vsm__win mono">
                    <i className={r.winner === 'them' ? 'is-hollow' : ''} aria-hidden="true" />
                    {who ? `${who} · ${v.winner}` : v.tie}
                  </span>
                  <p>{r.note}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </Section>

      <Steps eyebrow={v.migrationEyebrow} title={v.migrationTitle} steps={v.migration} kinds={['grid', 'builder', 'stream']} />

      <Section id="vsfaq">
        <div className="container faq__grid">
          <div className="section__head faq__head">
            <p className="eyebrow" data-reveal="fade">
              {v.faqEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {v.faqTitle}
            </h2>
            <p className="vs__price mono" data-reveal="fade">
              {v.priceNote}
            </p>
          </div>
          <Accordion items={faq} idPrefix="vsfaq" />
        </div>
      </Section>

      <Section id="others">
        <div className="container">
          <p className="eyebrow" data-reveal="fade">
            {v.all}
          </p>
          <ul className="vsothers" data-stagger>
            {others.map(([k, o]) => (
              <li data-item key={k}>
                <Link to={`/vs/${k}`} className="vsothers__link">
                  <span className="mono">vs</span>
                  <b>{o.name}</b>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta title={v.ctaTitle} sub={c.ctaSub} primary={v.cta} secondary={c.seePlatform} />
    </PageShell>
  )
}
