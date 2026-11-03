import { useRef } from 'react'
import '../../styles/p-mcp.css'
import { useMeta } from '../../hooks/useMeta.js'
import { LINKS } from '../../lib/facts.js'
import { gsap, useGSAP, MQ } from '../../lib/gsap.js'
import PageShell from '../../components/PageShell.jsx'
import PageHero from '../../components/PageHero.jsx'
import GlowButton from '../../components/GlowButton.jsx'
import McpLogos from '../../components/McpLogos.jsx'
import McpCatalog from '../../components/McpCatalog.jsx'
import { ConditionsSeq, ConnectDraw, GroundedChat, ProblemChat, RecurringSeq, ThesisSeq } from '../../components/McpVisuals.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import Aurora from '../../components/Aurora.jsx'
import { ExtLink, PBlock, ProductFaq, Shot } from '../../components/ProductBlocks.jsx'

/* /platform/mcp — hero with the AI-client marks, problem (a conversation drawn on paper), how it works (three steps, one
   image each: a drawn connection screen, the real capture, a drawn grounded answer), What you get (three line
   sequences that zoom), the connected-tools strip, FAQ, related, closing CTA. Drawings live in McpVisuals.jsx.
   Copy: Guia completo para IA.md (MCP) and Textos/09 - MCP.md. The page sells no tool count; the carousel is a curated
   selection of real tools, not the full catalog. Protocol and endpoint details live in the FAQ and the docs. */

const ENDPOINT = 'https://mcp.alphractal.com/mcp'
const DOCS = 'https://docs.alphractal.com/mcp'
const CONNECT = LINKS.start // TODO(links review): point to the app's MCP connection page once the final URL is confirmed

const STEPS = [
  {
    n: '01',
    title: 'Open the MCP connection page',
    text: 'Sign in to Alphractal and open the MCP setup page. Choose the connection instructions for your AI client.',
    visual: <ConnectDraw />,
  },
  {
    n: '02',
    title: 'Connect and review access',
    text: 'Use account sign-in in an OAuth-compatible client, or an API key in a client that supports custom headers. Review the tools you expose and the access supported by your plan.',
    wide: true,
    visual: (
      <Shot
        src="/product/mcp-connect.webp"
        ratio="1280 / 494"
        alt="The MCP tab of the Alphractal app: pick a client, open Settings, Connectors, add a custom connector and paste the server URL"
        name="MCP connection instructions in the Alphractal app"
      />
    ),
  },
  {
    n: '03',
    title: 'Ask with Alphractal context',
    text: 'Ask a market question and let your assistant find relevant metrics, charts or research. Review the sources, dates and limitations before using the answer.',
    visual: <GroundedChat />,
  },
]

const EXAMPLES = [
  {
    Seq: ThesisSeq,
    title: 'Research a market thesis',
    text: 'Find relevant metrics and research, then ask your assistant to compare the evidence behind your idea.',
    prompt: 'Find Alphractal research on Bitcoin valuation and explain which metrics I can inspect to test the thesis.',
  },
  {
    Seq: ConditionsSeq,
    title: 'Check market conditions',
    text: 'Bring positioning, liquidations and market context into the same conversation.',
    prompt: 'Summarize Bitcoin’s recent liquidation activity and distinguish the observed data from a directional forecast.',
  },
  {
    Seq: RecurringSeq,
    title: 'Build repeatable analysis',
    text: 'Use Alphractal tools inside your own reports and agent workflows, with the schedule and review process you define.',
    prompt: 'Prepare a daily review template covering funding, open interest and liquidation activity, with sources and missing-data notes.',
  },
]

const CATALOG = [
  {
    title: 'Explore assets & market data',
    text: 'Find an asset, understand its market profile and examine its price history.',
    tools: [
      ['Find an asset', 'search_assets', 'Locate a cryptocurrency by name or identifier.'],
      ['Inspect its market profile', 'get_summary_info', 'Read the asset’s available market summary and supporting indicators.'],
      ['Explore price history', 'get_asset_price_history', 'Retrieve historical prices for the asset you are investigating.'],
    ],
  },
  {
    title: 'Investigate metrics',
    text: 'Find the data behind a thesis and understand what each metric measures.',
    tools: [
      ['Discover relevant metrics', 'search_metrics', 'Search the metric library by name or market concept.'],
      ['Understand a metric', 'get_metric_info', 'Read its definition and interpretation notes.'],
      ['Read the data', 'get_metric_data', 'Retrieve the available time series for a metric and asset.'],
    ],
  },
  {
    title: 'Explore charts',
    text: 'Find relevant charts and inspect the metrics behind each view.',
    tools: [
      ['Find a chart', 'suggest_charts', 'Discover charts by name, description or metric.'],
      ['Inspect the chart', 'get_chart_details', 'Read its description, category and supporting context.'],
      ['Identify its metrics', 'get_chart_metrics', 'See which metrics are used in the chart.'],
    ],
  },
  {
    title: 'Analyze leverage & liquidations',
    text: 'Investigate derivatives positioning and the liquidation levels around an asset.',
    tools: [
      ['Read the market pulse', 'get_screener_overview', 'Review aggregate derivatives conditions and market rankings.'],
      ['Inspect an asset’s positioning', 'get_screener_data', 'Retrieve available funding, open interest and liquidation data.'],
      ['Map liquidation clusters', 'get_liquidation_clusters', 'Inspect cluster price levels, size, side and distance from the current price.'],
    ],
  },
  {
    title: 'Compare & test a thesis',
    text: 'Compare evidence across assets and metrics, then investigate historical relationships.',
    tools: [
      ['Compare metrics', 'compare_metrics', 'Examine multiple metrics side by side.'],
      ['Rank assets', 'rank_assets_by_metric', 'Find the highest and lowest values across supported assets and metrics.'],
      ['Backtest a metric', 'backtest_metric', 'Explore threshold behavior and relationships with price over supported historical windows of up to 90 days.'],
    ],
  },
  {
    title: 'Bring research into the conversation',
    text: 'Find Alphractal research and connect its conclusions to your own investigation.',
    tools: [
      ['Search research', 'search_reports', 'Find reports by topic, thesis or keyword.'],
      ['Explore asset research', 'get_reports_by_asset', 'Retrieve reports related to a specific asset.'],
      ['Read key findings', 'get_report_key_insights', 'Inspect the available conclusions and insights from a report.'],
    ],
  },
  {
    title: 'Monitor what matters',
    text: 'Review existing alerts and prepare new monitoring conditions for confirmation.',
    tools: [
      ['Review your alerts', 'get_user_alerts', 'Inspect the alerts already configured in your account.'],
      ['Prepare an alert', 'prepare_alert', 'Validate and stage a monitoring condition for review.'],
      ['Confirm creation', 'confirm_alert_creation', 'Create the prepared alert after the user reviews and confirms its configuration.'],
    ],
  },
  {
    title: 'Organize your workspace',
    text: 'Bring your watchlist and saved screening views into your connected workflow.',
    tools: [
      ['Read your watchlist', 'get_user_favorites', 'Retrieve your saved assets and charts.'],
      ['Review saved screeners', 'list_screener_views', 'Find the screener views saved in your account.'],
      ['Save a screener view', 'create_screener_view', 'Save a named selection of screener columns for future use.'],
    ],
  },
]

const FAQ = [
  { q: 'What is MCP?', a: 'MCP is a standard that lets an AI client connect to external tools and data. Alphractal uses it to make supported platform data and actions available inside compatible assistants and agents.' },
  { q: 'Is this the same as Alpha AI?', a: 'Alpha AI is the assistant inside Alphractal. MCP lets a compatible external assistant use Alphractal tools and data. The model, interface and available features depend on that client.' },
  { q: 'Can I use it on my phone?', a: 'You can use the connection on mobile when your AI client supports it. Setup and availability vary by client and plan; follow the instructions for the client you use.' },
  { q: 'What data can my assistant access?', a: 'Supported tools expose market data, metric definitions, charts, screening views and research. Coverage varies by asset, data source and your account’s access.' },
  { q: 'Can the assistant change my account?', a: 'Some tools can modify supported account features, including favorites, saved screener views and alerts. Review the tools you expose and your client’s approval settings. Alert creation uses a preparation and confirmation flow.' },
  { q: 'Does connecting unlock every metric?', a: 'No. Your plan still controls data access. MCP uses the same account and credit balance as the API; a tool can trigger more than one data request. Rate limits also apply. Check your plan and usage before starting a larger workflow.' },
  {
    q: 'How do I connect?',
    a: (
      <>
        The server uses Streamable HTTP at {ENDPOINT}. OAuth-compatible clients can discover the sign-in flow from that URL. Headless clients can send an Alphractal API key using X-Alphractal-Key or Authorization: Bearer. Follow the{' '}
        <ExtLink className="faq__link" href={`${DOCS}/connecting`}>
          setup guide
        </ExtLink>{' '}
        for your client and keep credentials private. Scheduling is handled by your connected client or orchestrator. Alphractal MCP supplies the tools and data for that workflow.
      </>
    ),
  },
]

function Problem() {
  return (
    <div className="mcpx-problem">
      <div className="mcpx-problem__text">
        <p data-reveal="up">An assistant can explain a market idea without having the metrics needed to test it. That leaves you copying charts, searching for numbers and rebuilding the context by hand.</p>
        <p data-reveal="up">Alphractal MCP connects that conversation to the platform’s data and research. Ask your assistant to investigate a thesis, compare metrics or check market conditions using Alphractal sources, without moving every question back into the platform.</p>
      </div>
      <ProblemChat />
    </div>
  )
}

function Example({ e }) {
  const Seq = e.Seq
  return (
    <article className="mcpx-exc" data-item>
      <Seq />
      <h3>{e.title}</h3>
      <p className="mcpx-exc__text">{e.text}</p>
      <blockquote className="mcpx-prompt">{e.prompt}</blockquote>
    </article>
  )
}

export default function Mcp() {
  useMeta({
    title: 'Alphractal MCP | Crypto Data for AI Assistants & Agents',
    description: 'Connect compatible AI assistants and agents to Alphractal metrics, charts, screening data and research through MCP. Explore tools, setup and access.',
  })
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.utils.toArray('.mcpx-step', root.current).forEach((st) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: st, start: 'top 82%', once: true }, defaults: { ease: 'power3.out' } })
          tl.from(st.querySelector('.mcpx-step__text'), { autoAlpha: 0, y: 24, duration: 0.8 })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <PageShell>
      <div ref={root}>
        <PageHero
          centered
          eyebrow="MODEL CONTEXT PROTOCOL"
          title="The crypto data layer your AI can actually read."
          sub="Bring Alphractal’s market intelligence into your AI assistant. Research assets, analyze positioning and build workflows with connected metrics, charts and research."
          actions={
            <>
              <GlowButton href={CONNECT}>Connect your client</GlowButton>
              <ExtLink className="link-arrow phero__more" href="#tools">
                Explore the tools <span>→</span>
              </ExtLink>
            </>
          }
          visual={<McpLogos />}
        />

        <PBlock id="problem" eyebrow="THE PROBLEM" title="Your AI needs the data behind the answer." className="mcpx-sec">
          <Problem />
        </PBlock>

        <div id="how">
        <header className="mcpx-dark">
          <Aurora colorStops={['#0a1470', '#1a35d0', '#0a1470']} amplitude={1.2} blend={1} height={0.22} speed={0.7} glow={0.45} brightness={0.85} opacity={0.9} layers={2} direction="top" className="mcpx-dark__aurora" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div className="container mcpx-dark__head">
            <p className="eyebrow" data-reveal="fade">HOW IT WORKS</p>
            <h2 className="h2" data-reveal="lines">Connect your assistant in three steps.</h2>
          </div>
        </header>
        <PBlock className="mcpx-sec mcpx-how" rule={false}>
          <ol className="mcpx-steps">
            {STEPS.map((s) => (
              <li className={`mcpx-step${s.wide ? ' mcpx-step--wide' : ''}`} key={s.n}>
                <div className="mcpx-step__text">
                  <b>{s.n}</b>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                <div className="mcpx-step__media">{s.visual}</div>
              </li>
            ))}
          </ol>
          <p className="mcpx-how__more">
            <ExtLink className="link-arrow" href={`${DOCS}/connecting`}>
              Read the setup guide <span>→</span>
            </ExtLink>
          </p>
        </PBlock>
        </div>

        <PBlock id="get" eyebrow="WHAT YOU GET" title="Put Alphractal data to work in your workflow." className="mcpx-sec">
          <div className="mcpx-ex" data-stagger>
            {EXAMPLES.map((e) => (
              <Example e={e} key={e.title} />
            ))}
          </div>
        </PBlock>

        <PBlock
          id="tools"
          eyebrow="TOOL CATALOG"
          title="Explore the connected tools."
          intro="Give your AI the tools to investigate assets, read market conditions and turn questions into deeper analysis."
          className="mcpx-sec mcpx-tools"
        >
          <McpCatalog items={CATALOG} />
          <p className="mcpx-tools__more">
            <ExtLink className="link-arrow" href={`${DOCS}/tools`}>
              See the full tool catalog <span>→</span>
            </ExtLink>
          </p>
        </PBlock>

        <ProductFaq title="MCP questions, answered." items={FAQ} />

      </div>

      <FinalCta
        title={['Bring Alphractal into', 'your next conversation.']}
        sub="Connect your assistant and start exploring the data behind your market questions."
        primary="Connect your client"
        primaryHref={CONNECT}
        solo
      />
    </PageShell>
  )
}
