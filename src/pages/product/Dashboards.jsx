import '../../styles/p-dashboards.css'
import { useMeta } from '../../hooks/useMeta.js'
import { LINKS } from '../../lib/facts.js'
import PageShell from '../../components/PageShell.jsx'
import GlowButton from '../../components/GlowButton.jsx'
import HeroGrid from '../../components/HeroGrid.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { Section } from '../../components/PageBlocks.jsx'
import { ExtLink } from '../../components/ProductBlocks.jsx'
import { Workspace, Builder } from '../../components/visuals/DashWorkspace.jsx'
import { AlertScene, ScreenerScene } from '../../components/visuals/DashScenes.jsx'

/* /platform/dashboards: dark opening, scroll-built workspace, Alerts, Screeners, Dashboard Builder, CTA.
   Copy: Textos/10 and Guia completo para IA.md. Everything below the opening is paper; the visuals are loose line drawings
   (visuals/Dash*.jsx) that grow in on scroll, keep moving and zoom under the mouse. The workspace is built by scroll
   (pinned); its finished composition is the HTML default, so SSG, reduced motion and mobile all read the finished workspace. */

const PLANS = 'https://app.alphractal.com/plans'

export default function Dashboards() {
  useMeta({
    title: 'Crypto Dashboards, Alerts & Screeners | Alphractal',
    description: 'Build crypto research dashboards, monitor supported metrics with alerts and compare assets through Alphractal screeners. Create a view that fits your analysis.',
  })

  return (
    <PageShell>
      <section className="dx" data-nav-theme="dark">
        <HeroGrid />
        <div className="container dx__open">
          <h1 className="display dx__title" data-reveal="lines" data-delay="0.15">
            Your market. Your signals. Your workspace.
          </h1>
          <p className="dx__sub">Monitor the conditions that matter, find assets worth investigating and build a dashboard around your strategy.</p>
          <div className="dx__actions">
            <GlowButton href={LINKS.start}>Start free</GlowButton>
            <ExtLink className="link-arrow" href="#alerts">
              Explore the tools <span>→</span>
            </ExtLink>
          </div>
        </div>
      </section>

      <Workspace />

      <Section id="alerts" theme="paper">
        <div className="container">
          <div className="split split--even split--top dash-head">
            <h2 className="h2" data-reveal="lines">
              Know when the market meets your conditions.
            </h2>
            <div>
              <p className="lede" data-reveal="up">
                Set alerts for the metrics and price levels you follow. Monitor changes in positioning, leverage and market conditions, with notifications delivered through Email or Telegram.
              </p>
              <p className="dash-line" data-reveal="up">
                Define the condition. Get notified. Investigate the move.
              </p>
            </div>
          </div>
          <AlertScene />
        </div>
      </Section>

      <Section id="screeners" theme="paper">
        <div className="container">
          <div className="split split--even split--top dash-head">
            <h2 className="h2" data-reveal="lines">
              Find what deserves a closer look.
            </h2>
            <div>
              <p className="lede" data-reveal="up">
                Compare assets across funding, open interest, liquidations and market performance. Choose your columns, sort the market and save the views that support your research.
              </p>
              <p className="dash-line" data-reveal="up">
                From a market-wide view to the asset you want to investigate.
              </p>
            </div>
          </div>
          <ScreenerScene />
        </div>
      </Section>

      <Section id="builder" theme="paper">
        <div className="container">
          <div className="split split--even split--top dash-head">
            <h2 className="h2" data-reveal="lines">
              Bring it all into your market workspace.
            </h2>
            <p className="lede" data-reveal="up">
              Start from a template or build your own layout. Bring charts and metrics together, arrange and resize your panels, then save and share the view that supports your strategy.
            </p>
          </div>
          <Builder />
          <p className="dash-line dash-line--close" data-reveal="up">
            Use screeners to find what to investigate, alerts to know when conditions change, and your dashboard to keep the analysis connected.
          </p>
        </div>
      </Section>

      <FinalCta
        title={['Build the view your strategy needs.']}
        sub="Find what matters. Monitor what changes. Keep your analysis connected."
        primary="Start free"
        primaryHref={LINKS.start}
        secondary="View plans"
        secondaryTo={PLANS}
      />
    </PageShell>
  )
}
