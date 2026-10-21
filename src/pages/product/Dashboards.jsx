import { useRef } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/p-dashboards.css'
import { useMeta } from '../../hooks/useMeta.js'
import { LINKS } from '../../lib/facts.js'
import { gsap, useGSAP, MQ } from '../../lib/gsap.js'
import PageShell from '../../components/PageShell.jsx'
import BorderGlow from '../../components/BorderGlow.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { Section } from '../../components/PageBlocks.jsx'
import { Cards, ExtLink, PBlock, ProductHero, Shot } from '../../components/ProductBlocks.jsx'

/* /platform/dashboards: hero, problem, how it works, alerts, screeners, what you get, related, closing CTA.
   Copy: Textos/Dashboards Alerts e Screeners.md. No real dashboard capture exists yet: named placeholders stand in. */

const PLANS = 'https://app.alphractal.com/plans'

const PROBLEM = [
  'Start from a template or build your own view. Bring the charts and metrics you follow into a layout that fits your analysis.',
  'Save the workspace you return to, and share the view when you want to explain your thinking to someone else.',
]

const STEPS = [
  {
    title: 'Start from a template',
    text: 'Choose a starting layout or begin with an empty workspace.',
    caption: 'Start with the view you need.',
    shot: { name: 'Dashboard template library', src: '/product/dashboard-templates.webp', alt: 'The Alphractal dashboard Marketplace with a featured template and community dashboards' },
  },
  {
    title: 'Compose your own chart',
    text: 'Bring the metrics you follow into the workspace, then arrange the panels around your analysis.',
    caption: 'Compare valuation and leverage side by side.',
    shot: { name: 'Panel being dragged and resized', src: '/product/dashboard-resize.webp', alt: 'A dashboard panel being resized next to STH Realized Price Bands and MVRV panels' },
  },
  {
    title: 'Share your view',
    text: 'Save your layout and use the sharing options to bring the analysis to your team or audience.',
    caption: 'Keep the context when you share.',
    shot: { name: 'Sharing menu', src: '/product/dashboard-share.webp', alt: 'The Share Dashboard dialog with Private Link and Marketplace options' },
  },
]

const ALERT_PARAS = [
  'Set conditions for supported metrics and choose the delivery options available to your account. Build a rule around the data you want to monitor, then review the asset, thresholds and notification settings before activating it.',
  'Keep your monitoring connected to your process: a condition should tell you what changed and which metric to inspect next.',
]

const SCREENER_FLOW = ['Select Funding Rate', 'Sort high to low, or low to high', 'Open the asset you want to study']

const GET = [
  { title: 'Your dashboards', text: 'Save workspaces built around the charts you follow.' },
  { title: 'A starting point that fits', text: 'Use a template or arrange your own layout.' },
  { title: 'Connected monitoring', text: 'Follow supported metrics with configurable alert conditions.' },
  { title: 'Views you can return to', text: 'Save screener views and use the available sharing options to keep your research organized.' },
]

const RELATED = [
  { to: '/platform/metrics', title: 'Metrics & Models', text: 'Explore the metrics behind your workspace.' },
  { to: '/platform/research', title: 'Research & Academy', text: 'Build context for the charts you follow.' },
  { to: '/platform/alpha-ai', title: 'Alpha AI', text: 'Ask questions about the data you are exploring.' },
]

function Siren() {
  return (
    <svg className="dash-siren" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 18v-6a5 5 0 0 1 10 0v6" />
      <path d="M5 21h14" />
      <path d="M12 3v1.5M4.5 6.5l1.2 1M19.5 6.5l-1.2 1" />
    </svg>
  )
}

/* Rule on the left, notification on the right. Everything is in the HTML; GSAP only choreographs it. */
function AlertDemo() {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => root.current.querySelector(s)
        const qa = (s) => gsap.utils.toArray(s, root.current)
        const rows = qa('.dash-rule__row')
        const chips = qa('.dash-chan span')
        const sirens = qa('.dash-siren')
        gsap.set(rows, { autoAlpha: 0, y: 12 })
        gsap.set(q('.dash-notif__card'), { autoAlpha: 0, y: 16 })
        gsap.set(sirens, { autoAlpha: 0, scale: 0.6 })
        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 1.4,
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: root.current, start: 'top 80%', toggleActions: 'play pause resume pause' },
        })
        tl.to(rows, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.22 })
          .to(sirens, { autoAlpha: 0.9, scale: 1, duration: 0.7, stagger: 0.12 }, '+=0.2')
          .to(q('.dash-notif__card'), { autoAlpha: 1, y: 0, duration: 0.7 }, '<0.25')
          .to(chips, { backgroundColor: 'rgba(75,107,255,.3)', color: '#fff', duration: 0.3, stagger: 0.25 }, '>-0.1')
          .to(sirens, { autoAlpha: 0.35, duration: 1.2, ease: 'sine.inOut' }, '+=0.5')
          .to([...rows, q('.dash-notif__card'), ...sirens], { autoAlpha: 0, duration: 0.5 }, '+=1.6')
          .set(chips, { clearProps: 'backgroundColor,color' })
        return () => gsap.set([...rows, q('.dash-notif__card'), ...sirens, ...chips], { clearProps: 'all' })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <BorderGlow>
      <div className="dash-alert" ref={root}>
        <p className="dash-alert__tag">Illustrative configuration. The threshold is an example, not a recommended level.</p>
        <div className="dash-alert__grid">
          <div className="dash-rule" role="group" aria-label="Alert rule">
            <h3 className="dash-alert__label">Rule</h3>
            <dl className="dash-rule__list">
              <div className="dash-rule__row">
                <dt>Asset</dt>
                <dd>BTC</dd>
              </div>
              <div className="dash-rule__row">
                <dt>Metric</dt>
                <dd>Chosen from the metric catalog</dd>
              </div>
              <div className="dash-rule__row">
                <dt>Condition</dt>
                <dd>Rises by more than your threshold (%)</dd>
              </div>
              <div className="dash-rule__row">
                <dt>Deliver by</dt>
                <dd className="dash-chan">
                  <span>Email</span>
                  <span>Telegram</span>
                </dd>
              </div>
            </dl>
          </div>
          <div className="dash-flow" aria-hidden="true">
            <Siren />
            <i />
            <Siren />
          </div>
          <div className="dash-notif" role="group" aria-label="Notification">
            <h3 className="dash-alert__label">Notification</h3>
            <div className="dash-notif__card">
              <p className="dash-notif__head">
                <Siren /> Alphractal alert
              </p>
              <p className="dash-notif__line">
                <b>BTC</b> · selected metric
              </p>
              <p className="dash-notif__line">Condition met: rise above your threshold.</p>
              <p className="dash-notif__next">Open the chart to inspect the metric.</p>
            </div>
          </div>
        </div>
      </div>
    </BorderGlow>
  )
}

/* The three-step interaction, lit one step at a time. Static (all steps readable) without motion. */
function ScreenerFlow() {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const items = gsap.utils.toArray('li', root.current)
        let i = 0
        const set = () => items.forEach((it, k) => it.classList.toggle('is-on', k === i))
        set()
        const t = setInterval(() => {
          i = (i + 1) % items.length
          set()
        }, 2400)
        return () => {
          clearInterval(t)
          items.forEach((it) => it.classList.remove('is-on'))
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )
  return (
    <ol className="dash-flowlist" ref={root} aria-label="Example interaction">
      {SCREENER_FLOW.map((s, i) => (
        <li key={s}>
          <b>{String(i + 1).padStart(2, '0')}</b> {s}
        </li>
      ))}
    </ol>
  )
}

export default function Dashboards() {
  useMeta({
    title: 'Crypto Dashboards, Alerts & Screeners | Alphractal',
    description: 'Build crypto research dashboards, monitor supported metrics with alerts and compare assets through Alphractal screeners. Create a view that fits your analysis.',
  })

  const visual = (
    <figure className="dash-hero">
      <Shot
        name="Bitcoin research dashboard"
        src="/product/dashboard-hero.webp"
        alt="An Alphractal dashboard with three Bitcoin panels: STH Realized Price Bands, MVRV and Open Interest"
        ratio="16 / 10"
        dark
      />
      <figcaption>Build a Bitcoin research workspace.</figcaption>
    </figure>
  )

  return (
    <PageShell>
      <ProductHero
        current="dashboards"
        eyebrow="DASHBOARDS"
        title="Your screen, not ours."
        sub="Compose the charts and metrics your process actually uses. Drag, resize, save. Share the layout with a URL."
        primary={{ label: 'Start free', href: LINKS.start }}
        secondary={{ label: 'See alerts and screeners', href: '#alerts' }}
        visual={visual}
      />

      <Section id="problem">
        <div className="container split split--even">
          <div className="section__head">
            <h2 className="h2" data-reveal="lines">
              A layout that fits how you work.
            </h2>
          </div>
          <div className="problem__text" data-stagger>
            {PROBLEM.map((p, i) => (
              <p key={p} className={i ? 'problem__p' : 'lede'} data-item>
                {p}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <PBlock id="how" title="Build it once, keep it.">
        <ol className="dash-steps" data-stagger>
          {STEPS.map((s, i) => (
            <li className="dash-step" data-item key={s.title}>
              <span className="dash-step__n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <figure>
                <Shot {...s.shot} ratio="4 / 3" />
                <figcaption>{s.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </PBlock>

      <Section id="alerts" dark>
        <div className="container split split--even split--top">
          <div className="dash-alerts__copy">
            <p className="eyebrow" data-reveal="fade">
              ALERTS
            </p>
            <h2 className="h2" data-reveal="lines">
              One rule. More context. One notification.
            </h2>
            <p className="lede" data-reveal="up">
              Combine the conditions that matter to your analysis and follow the market without watching every chart.
            </p>
            {ALERT_PARAS.map((p) => (
              <p className="dash-alerts__p" data-reveal="up" key={p}>
                {p}
              </p>
            ))}
          </div>
          <div>
            <AlertDemo />
            <p className="dash-cap">Monitor a change in Bitcoin positioning.</p>
          </div>
        </div>
      </Section>

      <Section id="screeners">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              SCREENERS
            </p>
            <h2 className="h2" data-reveal="lines">
              Rank the market, not one asset.
            </h2>
            <p className="lede" data-reveal="up">
              Compare assets across positioning, market performance and risk indicators, then save the views you use in your research.
            </p>
          </div>
          <div className="dash-scr">
            <figure className="dash-scr__fig" data-reveal="up">
              <div className="dash-scr__scroll" tabIndex={0} role="group" aria-label="Screener table capture, scrollable">
                <div className="dash-scr__crop">
                  <img src="/product/screener-funding.webp" alt="Alphractal screener on the Funding Rate view, listing BTC, ETH, SOL and other coins with price, funding rate and FR risk" loading="lazy" draggable="false" />
                </div>
              </div>
              <figcaption>Compare the market before opening a chart.</figcaption>
            </figure>
            <div className="dash-scr__side">
              <ScreenerFlow />
              <p className="dash-scr__note">Values in the capture are frozen at the moment it was taken.</p>
            </div>
          </div>
        </div>
      </Section>

      <PBlock id="get" title="What you get">
        <Cards cols={4} items={GET} />
        <div className="cov__links">
          <ExtLink className="link-arrow" href={PLANS}>
            View plans <span>→</span>
          </ExtLink>
        </div>
      </PBlock>

      <Section id="related">
        <div className="container">
          <div className="section__head">
            <h2 className="h2" data-reveal="lines">
              Related in the platform.
            </h2>
          </div>
          <ul className="dash-rel" data-stagger>
            {RELATED.map((r) => (
              <li data-item key={r.to}>
                <Link to={r.to} className="dash-rel__card">
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                  <span className="link-arrow">
                    Explore <span>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta
        title={['Build the view your strategy needs.']}
        sub="Bring your charts, monitoring and market screens into one research workflow."
        primary="Start free"
        primaryHref={LINKS.start}
        secondary="View plans"
        secondaryTo={PLANS}
      />
    </PageShell>
  )
}
