import { useState } from 'react'
import '../../styles/p-research.css'
import { useMeta } from '../../hooks/useMeta.js'
import PageShell from '../../components/PageShell.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { ExtLink, PBlock, ProductFaq, ProductHero, Shot } from '../../components/ProductBlocks.jsx'

/* /platform/research — five sections: opening, from argument to evidence, report → metrics → chart demo,
   Academy in five categories, FAQ + closing CTA. Copy: Textos/Research e Academy.md. The proof section is removed on purpose. */

const APP = 'https://app.alphractal.com'
const RESEARCH = `${APP}/research`
const ACADEMY = `${APP}/academy`
const REPORT_TITLE = 'Structural Market Bands: An On-chain Valuation Framework for Bitcoin Support, Resistance, and Market Cycles'
const REPORT_URL = `${RESEARCH}/structural-market-bands-an-on-chain-valuation-framework-for-bitcoin-support-resistance-and-market-cycles`
const CHART_URL = `${APP}/cryptos/chart?asset=btc&chart=Structural+Market+Bands&chartType=C024`

const HERO = {
  eyebrow: 'RESEARCH & ACADEMY',
  title: 'Research built from the data you can explore.',
  sub: 'Read on-chain, derivatives and macro research from the Alphractal team. Learn how the metrics work in Academy, then continue the analysis inside the platform.',
  line: 'Research explains the analysis. Academy explains the metrics and workflows behind it.',
}

const VALUE = {
  title: 'Understand the thesis. Inspect the evidence.',
  intro:
    'A research report gives you a structured argument. Alphractal connects that argument with the metrics and charts behind it, so you can study the methodology and continue exploring the market yourself.',
  cols: [
    {
      title: 'Research with context',
      text: 'Follow the reasoning across on-chain behavior, derivatives positioning and macro conditions. Read the analysis with its publication date, author and supporting references.',
    },
    {
      title: 'Metrics you can examine',
      text: 'See which indicators support the argument and open the corresponding charts where linked. Use Academy to understand the definitions and interpretation of key metrics.',
    },
    {
      title: 'A workflow beyond reading',
      text: 'Move from the report to the platform to examine the underlying data. Where narration is available, listen by chapter as another way to follow the analysis.',
    },
  ],
}

const STEPS = [
  {
    title: 'Read the framework',
    text: 'Start with the Structural Market Bands report. Learn how on-chain valuation anchors are used to study Bitcoin support, resistance and market-cycle structure.',
    caption: 'A framework for reading Bitcoin support and resistance through on-chain valuation.',
    cta: { label: 'Read the report', href: REPORT_URL },
  },
  {
    title: 'Inspect the metrics',
    text: 'Follow the report’s valuation references: Active Realized Price, Short-Term Holder Realized Price and Long-Term Holder Realized Price. See how the framework connects them to structural support and resistance bands.',
    labels: ['Active Realized Price', 'STH Realized Price', 'LTH Realized Price'],
    cta: { label: 'Explore Metrics & Models', href: '/platform/metrics' },
  },
  {
    title: 'Continue the analysis',
    text: 'Open the Bitcoin Structural Market Bands chart in Alphractal. Compare price with the model’s support and resistance zones, then continue exploring the data in the platform.',
    cta: { label: 'Open the chart', href: CHART_URL },
  },
]

const CATEGORIES = [
  {
    label: 'Get Started',
    text: 'Learn how to navigate Alphractal, understand the data and begin your first analysis.',
    example: { kind: 'Example', name: 'Our data — how it works', href: `${ACADEMY}/lesson/foundations/03-our-data` },
    cta: { label: 'Start learning', href: `${ACADEMY}/learn` },
  },
  {
    label: 'Metrics',
    text: 'Understand what an indicator measures, how to interpret it and which limitations matter when using it.',
    example: { kind: 'Example', name: 'Spent Output Profit Ratio (SOPR)', href: `${ACADEMY}/metric/on-chain/sopr` },
    cta: { label: 'Explore metric guides', href: `${ACADEMY}/metrics` },
  },
  {
    label: 'Playbooks',
    text: 'Study practical frameworks that bring several metrics together around an analytical question.',
    example: { kind: 'Example', name: 'A value-investing framework for Bitcoin', href: `${ACADEMY}/playbook/value-investing-bitcoin` },
    cta: { label: 'Explore playbooks', href: `${ACADEMY}/playbooks` },
  },
  {
    label: 'Concepts',
    text: 'Build the background knowledge behind on-chain and market analysis with focused explanations of individual concepts.',
    topics: { kind: 'Example topics', items: ['UTXO', 'Basis', 'Finalization'] },
    cta: { label: 'Explore concepts', href: `${ACADEMY}/concepts` },
  },
  {
    label: 'Features',
    text: 'Learn how to use the platform through tutorials for analytics, dashboards, alerts and Alpha AI.',
    topics: { kind: 'Topics', items: ['Analytics', 'Dashboards', 'Alerts', 'Alpha AI'] },
    cta: { label: 'Explore platform tutorials', href: `${ACADEMY}/features` },
  },
]

const L = (href, text) => (
  <ExtLink className="faq__link" href={href}>
    {text}
  </ExtLink>
)

const FAQ = [
  {
    q: 'What is the difference between Research and Academy?',
    a: 'Research develops a market or methodology argument using supporting data. Academy explains metrics, concepts and platform workflows so you can understand and apply the tools behind the analysis.',
  },
  {
    q: 'Can I open the charts used in a report?',
    a: 'Where a report includes chart links, you can open the corresponding view in Alphractal. The Structural Market Bands example on this page shows that workflow. Access to a chart depends on your plan.',
  },
  {
    q: 'Do reports change automatically when market data changes?',
    a: 'A report reflects the analysis and publication context of its author. Opening a chart lets you inspect the available data separately. Check the report’s publication information rather than assuming the written analysis updates automatically.',
  },
  {
    q: 'Can I listen to the research?',
    a: 'Reports with narration offer an audio player and chapter navigation. Narration availability depends on the report.',
  },
  {
    q: 'Where should I begin in Academy?',
    a: (
      <>
        Start with the {L(`${ACADEMY}/learn`, 'foundational lessons')} if you are new to the platform. For a specific question, explore {L(`${ACADEMY}/metrics`, 'metric guides')},{' '}
        {L(`${ACADEMY}/concepts`, 'concepts')}, {L(`${ACADEMY}/playbooks`, 'playbooks')} or {L(`${ACADEMY}/features`, 'feature tutorials')}.
      </>
    ),
  },
  {
    q: 'Is all Research and Academy content free?',
    a: <>Access varies by report, lesson and plan. Check the access information on the content page and the current {L(`${APP}/plans`, 'plans')} before assuming a resource is included.</>,
  },
]

/* Hero visual: the real Research page capture, cropped to the featured report; title and author as live text. */
function ReportCard() {
  return (
    <article className="res-report">
      <ul className="res-report__chips" aria-label="Report topics">
        <li>Research report</li>
        <li>Bitcoin</li>
        <li>On-chain valuation</li>
      </ul>
      <div className="res-crop">
        <img src="/product/research.webp" alt="Cover of the Alphractal research report on on-chain support and resistance" loading="eager" draggable="false" />
      </div>
      <div className="res-report__body">
        <h2 className="res-report__title">Structural Market Bands</h2>
        <p className="res-report__full">{REPORT_TITLE}</p>
        <p className="res-report__by">
          By <b>Rafael Teles</b>
        </p>
        <ExtLink className="link-arrow res-report__link" href={REPORT_URL}>
          Read the report <span>→</span>
        </ExtLink>
      </div>
    </article>
  )
}

/* Report → metrics → chart: three selectable steps over one stage. Every step stays readable; selecting only swaps the frame. */
function Demo() {
  const [on, setOn] = useState(0)
  return (
    <div className="res-demo">
      <ol className="res-steps">
        {STEPS.map((s, i) => (
          <li className={`res-step ${on === i ? 'is-on' : ''}`} key={s.title} data-reveal="up">
            <button type="button" className="res-step__btn" aria-pressed={on === i} aria-controls={`res-frame-${i}`} onClick={() => setOn(i)}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <h3>{s.title}</h3>
            </button>
            <p>{s.text}</p>
            <ExtLink className="link-arrow res-step__cta" href={s.cta.href}>
              {s.cta.label} <span>→</span>
            </ExtLink>
          </li>
        ))}
      </ol>
      <div className="res-stage" aria-live="polite">
        <div className={`res-frame ${on === 0 ? 'is-on' : ''}`} id="res-frame-0" aria-hidden={on !== 0}>
          <Shot
            dark
            ratio="794 / 819"
            src="/product/research-report.webp"
            alt="Inside the Structural Market Bands report: section 3 explains the four curves, with the chart embedded in the text"
            name="Structural Market Bands report"
          />
          <p className="res-frame__cap">{STEPS[0].caption}</p>
        </div>
        <div className={`res-frame ${on === 1 ? 'is-on' : ''}`} id="res-frame-1" aria-hidden={on !== 1}>
          <Shot
            dark
            ratio="1234 / 650"
            src="/product/research-realized.webp"
            alt="The Structural Market Bands report introduction naming Active, Short-Term Holder and Long-Term Holder Realized Price, with the Charts list beside it"
            name="Report section: valuation references + chart link"
          />
          <ul className="res-frame__tags" aria-label="Valuation references">
            {STEPS[1].labels.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        <div className={`res-frame ${on === 2 ? 'is-on' : ''}`} id="res-frame-2" aria-hidden={on !== 2}>
          <Shot
            dark
            ratio="16 / 8"
            src="/metrics/structural-market-bands.webp"
            alt="Bitcoin Structural Market Bands chart from the Alphractal platform, with price and the four bands"
            name="Bitcoin · Structural Market Bands chart"
          />
          <p className="res-frame__cap">Bitcoin and the Structural Market Bands in the Alphractal chart view.</p>
        </div>
      </div>
    </div>
  )
}

export default function Research() {
  useMeta({
    title: 'Crypto Research & Academy: On-Chain, Derivatives & Macro | Alphractal',
    description: 'Explore Alphractal research and Academy. Learn metric definitions, follow practical workflows and continue your analysis with the charts behind the reports.',
  })

  return (
    <PageShell>
      <ProductHero
        current="research"
        eyebrow={HERO.eyebrow}
        title={HERO.title}
        sub={HERO.sub}
        line={HERO.line}
        primary={{ label: 'Explore research', href: RESEARCH }}
        secondary={{ label: 'Explore Academy', href: ACADEMY }}
        visual={<ReportCard />}
      />

      <PBlock id="evidence" title={VALUE.title} intro={VALUE.intro} className="res-value">
        <div className="res-cols" data-stagger>
          {VALUE.cols.map((c, i) => (
            <div className="res-col" data-item key={c.title}>
              <b className="res-col__n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </b>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </PBlock>

      <PBlock id="how-it-works" eyebrow="HOW IT WORKS" title="From the report to the chart behind it." intro="See how a research idea becomes an analysis you can continue inside Alphractal." dark>
        <Demo />
      </PBlock>

      <PBlock
        id="academy"
        eyebrow="ALPHRACTAL ACADEMY"
        title="Learn the metrics. Learn the workflow."
        intro="Explore guided lessons, metric references, practical playbooks, concepts and product tutorials. Start with the foundations or go straight to the question you want to understand."
      >
        <div className="res-acad" data-stagger>
          {CATEGORIES.map((c) => {
            const extra = c.example || c.topics
            return (
              <article className="res-card" data-item key={c.label}>
                <p className="ptag">Academy</p>
                <h3>{c.label}</h3>
                <p className="res-card__text">{c.text}</p>
                <div className="res-card__ex">
                  <span>{extra.kind}</span>
                  {c.example ? (
                    <ExtLink className="res-card__exlink" href={c.example.href}>
                      {c.example.name}
                    </ExtLink>
                  ) : (
                    <ul>
                      {c.topics.items.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <ExtLink className="btn btn--ink res-card__btn" href={c.cta.href}>
                  {c.cta.label}
                </ExtLink>
              </article>
            )
          })}
        </div>
        <p className="res-note">Available content and access requirements vary by lesson and plan.</p>
      </PBlock>

      <ProductFaq title="Research and learning, explained." items={FAQ} />
      <div className="res-next">
        <div className="container">
          <ExtLink className="link-arrow" href="/platform/alpha-ai">
            Explore Alpha AI <span>→</span>
          </ExtLink>
          <ExtLink className="link-arrow" href="/platform/dashboards">
            Explore dashboards <span>→</span>
          </ExtLink>
        </div>
      </div>

      <FinalCta
        title={['Read the research.', 'Build your understanding.']}
        sub="Explore the analysis, learn the methodology and continue investigating with the platform’s metrics and charts."
        primary="Explore research"
        primaryHref={RESEARCH}
        secondary="Explore Academy"
        secondaryTo={ACADEMY}
      />
    </PageShell>
  )
}
