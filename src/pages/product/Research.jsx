import { useEffect, useRef, useState } from 'react'
import '../../styles/p-research.css'
import { useMeta } from '../../hooks/useMeta.js'
import { gsap, useGSAP, MQ } from '../../lib/gsap.js'
import PageShell from '../../components/PageShell.jsx'
import GlowButton from '../../components/GlowButton.jsx'
import HeroGrid from '../../components/HeroGrid.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { Section } from '../../components/PageBlocks.jsx'
import { ExtLink, PBlock, ProductFaq } from '../../components/ProductBlocks.jsx'
import { Draw, LibraryScene, TypoCover } from '../../components/visuals/ResearchVisuals.jsx'

/* /platform/research: opening with three layered reports, Rafael, Research, thesis to data, Academy, FAQ, CTA.
   Copy: 11 - Research e Academy.md. Everything is in the HTML; GSAP only moves it. */

const APP = 'https://app.alphractal.com'
const RESEARCH = `${APP}/research`
const ACADEMY = `${APP}/academy`
const REPORT_URL = `${RESEARCH}/structural-market-bands-an-on-chain-valuation-framework-for-bitcoin-support-resistance-and-market-cycles`
const CHART_URL = `${APP}/cryptos/chart?asset=btc&chart=Structural+Market+Bands&chartType=C024`

const STEPS = [
  {
    title: 'Read the thesis',
    text: 'Explore the Structural Market Bands framework and the reasoning behind its approach to Bitcoin valuation and market cycles.',
    cta: { label: 'Read the report', href: REPORT_URL },
  },
  {
    title: 'Understand the metrics',
    text: 'Examine Active Realized Price, Short-Term Holder Realized Price and Long-Term Holder Realized Price, and how they contribute to the model’s support and resistance bands.',
    cta: { label: 'Explore Metrics & Models', href: '/platform/metrics' },
  },
  {
    title: 'Continue your analysis',
    text: 'Open the chart in Alphractal, compare price with the model’s bands and investigate how the framework applies to the market you are studying.',
    cta: { label: 'Open the chart', href: CHART_URL },
  },
]

/* Where each step zooms to: s = scale, cx/cy = centre of the cited part (fractions of the stage), lh = layer height / stage height. */
const ZOOMS = [
  { s: 1.25, cx: 0.5, cy: 0.9, lh: 1.65 },
  { s: 1.35, cx: 0.37, cy: 0.72, lh: 1 },
  { s: 2.4, cx: 0.78, cy: 0.25, lh: 1 },
]
const SHOTS = [
  { src: '/product/research-report.webp', alt: 'Inside the Structural Market Bands report: section 3 explains the four curves, with the chart embedded in the text' },
  { src: '/product/research-realized.webp', alt: 'The Structural Market Bands report introduction naming Active, Short-Term Holder and Long-Term Holder Realized Price, with the Charts list beside it' },
  { src: '/metrics/structural-market-bands.webp', alt: 'Bitcoin Structural Market Bands chart from the Alphractal platform, with price and the four bands' },
]

const CATEGORIES = [
  {
    label: 'Get Started',
    kind: 'start',
    text: 'Find your way around Alphractal, understand the data and build your first analysis.',
    example: { name: 'Our data: how it works', href: `${ACADEMY}/lesson/foundations/03-our-data` },
    cta: { label: 'Start learning', href: `${ACADEMY}/learn` },
  },
  {
    label: 'Metrics',
    kind: 'metrics',
    text: 'Learn what each metric measures, the reasoning behind it and how to interpret it in context.',
    example: { name: 'Spent Output Profit Ratio (SOPR)', href: `${ACADEMY}/metric/on-chain/sopr` },
    cta: { label: 'Explore metric guides', href: `${ACADEMY}/metrics` },
  },
  {
    label: 'Playbooks',
    kind: 'playbooks',
    text: 'Follow analytical frameworks that combine metrics around a market question or investment thesis.',
    example: { name: 'A value-investing framework for Bitcoin', href: `${ACADEMY}/playbook/value-investing-bitcoin` },
    cta: { label: 'Explore playbooks', href: `${ACADEMY}/playbooks` },
  },
  {
    label: 'Concepts',
    kind: 'concepts',
    text: 'Understand the building blocks of on-chain analysis, derivatives and market structure.',
    plain: 'UTXO · Basis · Finalization',
    cta: { label: 'Explore concepts', href: `${ACADEMY}/concepts` },
  },
  {
    label: 'Features',
    kind: 'features',
    text: 'Put the knowledge into practice with tutorials for charts, dashboards, alerts and Alpha AI.',
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

/* Real cover from the existing Research capture (featured report), cropped to the cover art only. */
function Cover() {
  return (
    <div className="rs-cover" style={{ aspectRatio: '552 / 309' }}>
      <img src="/product/research.webp" alt="Cover of Structural Market Bands: On-Chain Support and Resistance" loading="eager" draggable="false" style={{ width: '202.5%', left: '-5.07%', top: '-70.5%' }} />
    </div>
  )
}

/* Three reports in layers on the dark gradient. The side covers arrive from the sides and the centre one rises when the stage
   comes into view (played once, not tied to the scroll), then all three drift gently. The CSS is already the final composition,
   so with reduced motion nothing is set and nothing waits for the scroll. */
function Opening() {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => root.current.querySelector(s)
        const left = q('.rs-slot--l .rs-slot__in')
        const right = q('.rs-slot--r .rs-slot__in')
        const mid = q('.rs-slot--c .rs-slot__in')
        const cards = [...root.current.querySelectorAll('.rs-card')]
        gsap.set(left, { xPercent: -70, rotate: -8, autoAlpha: 0 })
        gsap.set(right, { xPercent: 70, rotate: 8, autoAlpha: 0 })
        gsap.set(mid, { y: 60, autoAlpha: 0 })
        const drift = []
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: q('.rs-stage'), start: 'top 92%', once: true },
          onComplete: () =>
            cards.forEach((c, i) => drift.push(gsap.to(c, { y: i === 2 ? -6 : 6, duration: 3.4 + i * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }))),
        })
        tl.to(mid, { y: 0, autoAlpha: 1, duration: 1.1 }, 0)
          .to([left, right], { xPercent: 0, rotate: 0, autoAlpha: 1, duration: 1.6 }, 0.25)
        return () => {
          drift.forEach((d) => d.kill())
          gsap.set([left, right, mid, ...cards], { clearProps: 'all' })
          tl.scrollTrigger && tl.scrollTrigger.kill()
          tl.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section className="rs-open" data-nav-theme="dark" ref={root}>
      <HeroGrid />
      <div className="container rs-open__copy">
        <h1 className="display rs-open__title" data-reveal="lines" data-delay="0.15">
          Understand the market. Learn from the people building the models.
        </h1>
        <p className="rs-open__sub">
          Original research reports and practical learning from Alphractal’s in-house research team. Explore market theses, understand the models behind them and learn how to use the data in your own analysis.
        </p>
        <div className="rs-open__actions">
          <GlowButton href={RESEARCH}>Explore research</GlowButton>
          <ExtLink className="link-arrow" href={ACADEMY}>
            Explore Academy <span>→</span>
          </ExtLink>
        </div>
      </div>
      <div className="rs-stage" aria-label="Featured research reports">
        <div className="rs-slot rs-slot--l">
          <article className="rs-slot__in rs-card">
            <h2 className="rs-vh">The Compliance Paradigm: How MiCA Restructures Global Capital</h2>
            <TypoCover variant="a" title="The Compliance Paradigm" sub="How MiCA Restructures Global Capital" />
          </article>
        </div>
        <div className="rs-slot rs-slot--r">
          <article className="rs-slot__in rs-card">
            <h2 className="rs-vh">Structural Analysis of Bitcoin: Transitioning from Redistribution to Fundamental Accumulation</h2>
            <TypoCover variant="b" title="Structural Analysis of Bitcoin" sub="From Redistribution to Fundamental Accumulation" />
          </article>
        </div>
        <div className="rs-slot rs-slot--c">
          <article className="rs-slot__in rs-card">
            <h2 className="rs-vh">Structural Market Bands, by Rafael Teles</h2>
            <Cover />
          </article>
        </div>
      </div>
    </section>
  )
}

/* Report → metrics → chart: three selectable steps over one stage. The selected step zooms into the part it cites and the
   three steps advance on their own while the demo is on screen, until the visitor picks one. */
function Demo() {
  const [on, setOn] = useState(0)
  const [seen, setSeen] = useState(false)
  const root = useRef(null)
  const stage = useRef(null)
  const lay = useRef([])
  const touched = useRef(false)
  const vis = useRef(false)

  useEffect(() => {
    const el = root.current
    const mq = window.matchMedia(MQ.motion)
    const io = new IntersectionObserver(([e]) => {
      vis.current = e.isIntersecting
      if (e.isIntersecting) setSeen(true)
    }, { threshold: 0.4 })
    io.observe(el)
    const id = setInterval(() => {
      if (vis.current && !touched.current && mq.matches && !document.hidden) setOn((i) => (i + 1) % STEPS.length)
    }, 7000)
    return () => {
      io.disconnect()
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (!seen || !window.matchMedia(MQ.motion).matches) return undefined
    const W = stage.current.offsetWidth
    const H = stage.current.offsetHeight
    const z = ZOOMS[on]
    const cur = lay.current[on]
    const others = lay.current.filter((_, i) => i !== on)
    gsap.killTweensOf(lay.current)
    // the layers that just left settle back once they have faded out
    const reset = gsap.delayedCall(0.7, () => gsap.set(others, { scale: 1, x: 0, y: 0 }))
    const x = Math.min(0, Math.max(W * (1 - z.s), W / 2 - z.cx * z.s * W))
    const y = Math.min(0, Math.max(H - z.s * z.lh * H, H / 2 - z.cy * z.s * H))
    gsap.set(cur, { transformOrigin: '0 0', scale: 1, x: 0, y: 0 })
    const tw = gsap.to(cur, { scale: z.s, x, y, duration: 3.2, delay: 0.5, ease: 'power2.inOut' })
    return () => {
      reset.kill()
      tw.kill()
    }
  }, [on, seen])

  const pick = (i) => {
    touched.current = true
    setOn(i)
  }

  return (
    <div className="res-demo" ref={root}>
      <ol className="res-steps" style={{ '--prog': seen ? (on + 1) / STEPS.length : 0 }}>
        <li className="res-steps__line" aria-hidden="true" />
        {STEPS.map((s, i) => (
          <li className={`res-step ${on === i ? 'is-on' : ''}`} key={s.title} data-reveal="up">
            <button type="button" className="res-step__btn" aria-pressed={on === i} aria-controls={`res-frame-${i}`} onClick={() => pick(i)}>
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
        <div className="res-zoom" ref={stage}>
          {SHOTS.map((s, i) => (
            <div className={`res-layer res-layer--${i} ${on === i ? 'is-on' : ''}`} id={`res-frame-${i}`} aria-hidden={on !== i} key={s.src} ref={(n) => (lay.current[i] = n)}>
              <img src={s.src} alt={s.alt} loading="lazy" draggable="false" />
            </div>
          ))}
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
      <Opening />

      <Section id="rafael" theme="paper" className="rs-raf">
        <div className="container rs-raf__grid">
          <figure className="rs-raf__photo" data-reveal="up">
            <img src="/team/rafael.jpg" alt="Rafael Teles, Chief Research Officer at Alphractal" loading="lazy" width="720" height="720" />
          </figure>
          <div className="rs-raf__bio">
            <h2 className="h2" data-reveal="lines">
              Built by researchers. Explained by the people behind the models.
            </h2>
            <p className="rs-raf__name" data-reveal="up">
              Rafael Teles
            </p>
            <p className="rs-raf__role" data-reveal="up">
              Chief Research Officer · PhD in Physics · 12+ years of market experience
            </p>
            <div data-stagger>
              <p data-item>
                Rafael holds a PhD in Physics, with research in quantum systems, Bose–Einstein condensates and collective behavior. At Alphractal, he brings that scientific background and more than 12 years of market experience to the development of original metrics, valuation models and market-cycle research.
              </p>
              <p data-item>He leads Alphractal’s research team, turning complex market data into analytical frameworks and evidence-backed research.</p>
              <p data-item>He also built Alphractal Academy, where the team explains the metrics they develop and how to use them in market analysis.</p>
            </div>
          </div>
        </div>
      </Section>

      <PBlock
        id="research"
        title="Original reports. Deep market research."
        intro="Read research reports on on-chain valuation, derivatives, macro conditions and market cycles, written by Rafael Teles and the Alphractal research team. Explore the thesis, examine the supporting charts and continue your own analysis."
      >
        <p className="res-lead" data-reveal="up">
          Read or listen to narrated reports, and get email notifications when new research is published.
        </p>
        <div className="res-feat">
          <article className="res-feat__card" data-reveal="up">
            <Cover />
            <div className="res-feat__body">
              <h3>Structural Market Bands</h3>
              <p className="res-feat__by">By Rafael Teles.</p>
              <p>An on-chain valuation framework for studying Bitcoin support, resistance and market cycles.</p>
              <ExtLink className="link-arrow" href={REPORT_URL}>
                Read the report <span>→</span>
              </ExtLink>
            </div>
          </article>
          <div className="res-feat__rec" data-reveal="up">
            <LibraryScene />
          </div>
        </div>
        <div className="res-bens" data-stagger>
          <div data-item>
            <h3>Read it. Or listen.</h3>
            <p>Follow the research in writing or listen to the narrated report, with chapter navigation.</p>
          </div>
          <div data-item>
            <h3>New research, delivered to your inbox.</h3>
            <p>Get email notifications when new reports are published, so you can keep up with the team’s latest work.</p>
          </div>
        </div>
      </PBlock>

      <PBlock id="thesis" title="Follow the thesis into the data." className="res-thesis">
        <Demo />
      </PBlock>

      <PBlock
        id="academy"
        title="Learn the models from the people who build them."
        intro="Built by Rafael and the Alphractal research team, Academy explains the metrics, models and methods behind the platform. Understand the reasoning behind an indicator, learn how to interpret it and explore how several metrics can work together in an analysis."
      >
        <p className="res-lead" data-reveal="up">
          From your first chart to a deeper market thesis, build the knowledge to use the platform with purpose.
        </p>
        <ul className="res-acad" data-stagger>
          {CATEGORIES.map((c) => (
            <li className="res-row" data-item key={c.label}>
              <div className="res-row__main">
                <h3>{c.label}</h3>
                <p className="res-row__text">{c.text}</p>
                {c.example && (
                  <p className="res-row__ex">
                    <ExtLink className="res-row__exlink" href={c.example.href}>
                      {c.example.name}
                    </ExtLink>
                  </p>
                )}
                {c.plain && <p className="rs-vh">{c.plain}</p>}
                <ExtLink className="link-arrow res-row__btn" href={c.cta.href}>
                  {c.cta.label} <span>→</span>
                </ExtLink>
              </div>
              <Draw kind={c.kind} />
            </li>
          ))}
        </ul>
      </PBlock>

      <div className="res-tail">
        <ProductFaq title="Research and learning, explained." items={FAQ} eyebrow="" />
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
      </div>

      <FinalCta
        title={['Understand the thesis.', 'Make the analysis your own.']}
        sub="Explore original research, learn from the team behind the models and bring that understanding into your next analysis."
        primary="Explore research"
        primaryHref={RESEARCH}
        secondary="Explore Academy"
        secondaryTo={ACADEMY}
      />
    </PageShell>
  )
}
