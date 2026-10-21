import { Fragment } from 'react'
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
import Soon from './Soon.jsx'

const ORIGIN = 'https://alphractal.com'
const c = vs.common

/* Hero visual: a refined rectangle with the two products on either side of a readable VS. Alphractal in the
   blue gradient, the competitor in grey. The competitor logo is the real file in public/vs, shown in a flat grey. */
function VsPanel({ page }) {
  return (
    <div className="vsx" role="group" aria-label={`Alphractal vs ${page.name}`}>
      <span className="vsx__tick vsx__tick--tl" aria-hidden="true" />
      <span className="vsx__tick vsx__tick--tr" aria-hidden="true" />
      <span className="vsx__tick vsx__tick--bl" aria-hidden="true" />
      <span className="vsx__tick vsx__tick--br" aria-hidden="true" />
      <div className="vsx__side vsx__side--us">
        <span className="vsx__mark" aria-hidden="true" />
        <b className="vsx__name">Alphractal</b>
      </div>
      <div className="vsx__vs" aria-hidden="true">
        <i />
        <span>VS</span>
        <i />
      </div>
      <div className="vsx__side vsx__side--them">
        <img className="vsx__logo" src={page.logoFile.replace(/^public/, '')} alt="" width="230" height="50" />
        <span className="vsx__name vsx__name--grey sr-only">{page.name}</span>
      </div>
    </div>
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
  const url = `${ORIGIN}/vs/${slug}`

  useMeta({
    title: page ? page.meta.title : 'Alphractal',
    description: page?.meta.description,
    jsonLd: page && {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.meta.title, description: page.meta.description, inLanguage: 'en' },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: c.breadcrumbHome, item: `${ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: `Alphractal vs ${page.name}`, item: url },
          ],
        },
      ],
    },
  })
  if (!page) return <Soon />

  const others = vs.order.filter((k) => k !== slug)

  return (
    <PageShell>
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
          <ol className="vss">
            {c.steps.map((s, i) => (
              <li className="vss__item" key={s.title}>
                <span className="vss__n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
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
                  <span>Alphractal vs</span>
                  <b>{vs.pages[k].name}</b>
                  <span aria-hidden="true">→</span>
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
