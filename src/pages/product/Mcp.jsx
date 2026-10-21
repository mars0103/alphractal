import { useRef, useState } from 'react'
import '../../styles/p-mcp.css'
import { useMeta } from '../../hooks/useMeta.js'
import { LINKS } from '../../lib/facts.js'
import { gsap, useGSAP, MQ } from '../../lib/gsap.js'
import PageShell from '../../components/PageShell.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { ExtLink, PBlock, ProductFaq, ProductHero, Shot } from '../../components/ProductBlocks.jsx'

/* /platform/mcp — hero, problem, how it works, What you get (three examples), catalog, FAQ, related, closing CTA.
   Copy: Textos/MCP.md. The page sells no tool count; the catalog is described by group. */

const ENDPOINT = 'https://mcp.alphractal.com/mcp'
const DOCS = 'https://docs.alphractal.com/mcp'
const CONNECT = LINKS.start // TODO(links review): point to the app's MCP connection page once the final URL is confirmed

const STEPS = [
  { n: '01', title: 'Open the MCP connection page', text: 'Sign in to Alphractal and open the MCP setup page. Choose the connection instructions for your AI client.' },
  { n: '02', title: 'Connect and review access', text: 'Use account sign-in in an OAuth-compatible client, or an API key in a client that supports custom headers. Review the tools you expose and the access supported by your plan.' },
  { n: '03', title: 'Ask with Alphractal context', text: 'Ask a market question and let your assistant find relevant metrics, charts or research. Review the sources, dates and limitations before using the answer.' },
]

const EXAMPLES = [
  {
    title: 'Research a market thesis',
    text: 'Find relevant metrics and research, then ask your assistant to compare the evidence behind your idea.',
    prompt: 'Find Alphractal research on Bitcoin valuation and explain which metrics I can inspect to test the thesis.',
    tools: ['search_reports', 'get_report_key_insights', 'search_metrics', 'get_metric_info'],
  },
  {
    title: 'Check market conditions',
    text: 'Bring positioning, liquidations and market context into the same conversation.',
    prompt: 'Summarize Bitcoin’s recent liquidation activity and distinguish the observed data from a directional forecast.',
    tools: ['get_screener_data'],
    toolNote: 'Asset: BTC · category: liquidations',
  },
  {
    title: 'Build repeatable analysis',
    text: 'Use Alphractal tools inside your own reports and agent workflows, with the schedule and review process you define.',
    prompt: 'Prepare a daily review template covering funding, open interest and liquidation activity, with sources and missing-data notes.',
    tools: [],
    note: 'Scheduling depends on your client or orchestrator. MCP provides the tools; on its own it is not a service that sends reports automatically.',
  },
]

const GROUPS = [
  { title: 'Assets & market data', text: 'Asset discovery, summaries, price history and spot candles.' },
  { title: 'Metrics & charts', text: 'Metric definitions, supported parameters, time series and chart discovery.' },
  { title: 'Derivatives & screeners', text: 'Positioning, liquidation clusters and cross-asset screening views.' },
  { title: 'Research', text: 'Find reports and inspect available key insights, subject to access.' },
  { title: 'Account & monitoring', text: 'Usage, plan limits, favorites and alert tools where authorized.', note: 'Alert tools prepare a configuration for your confirmation. Usage and limits tools only read.' },
]

const RELATED = [
  { title: 'API', text: 'Build a direct integration with Alphractal’s REST API.', href: '/platform/api', label: 'Explore the API' },
  { title: 'Alpha AI', text: 'Explore the assistant inside the platform.', href: '/platform/alpha-ai', label: 'Explore Alpha AI' },
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
        for your client and keep credentials private.
      </>
    ),
  },
]

/* Plain-typography client names: no brand marks, no claim of approval or partnership. */
function Flow() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ENDPOINT)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked: the text stays selectable */
    }
  }
  return (
    <div className="mcpx-flow">
      <ol className="mcpx-flow__row" aria-label="Alphractal to MCP to your AI assistant">
        <li className="mcpx-node">
          <span className="mcpx-node__tag">Source</span>
          <strong>Alphractal</strong>
          <span className="mcpx-node__sub">Metrics · charts · screeners · research</span>
        </li>
        <li className="mcpx-link" aria-hidden="true">
          <i />
        </li>
        <li className="mcpx-node mcpx-node--core">
          <span className="mcpx-node__tag">Protocol</span>
          <strong>MCP</strong>
          <span className="mcpx-node__sub">Streamable HTTP</span>
        </li>
        <li className="mcpx-link" aria-hidden="true">
          <i />
        </li>
        <li className="mcpx-node">
          <span className="mcpx-node__tag">Client</span>
          <strong>Your AI assistant</strong>
          <span className="mcpx-node__sub">
            Examples: Claude, ChatGPT
            <br />
            Category: Agents
          </span>
        </li>
      </ol>
      <div className="mcpx-endpoint">
        <span className="mcpx-endpoint__label" id="mcpx-ep-label">
          MCP endpoint
        </span>
        <code aria-labelledby="mcpx-ep-label">{ENDPOINT}</code>
        <button type="button" onClick={copy} aria-live="polite">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function Problem() {
  return (
    <div className="mcpx-problem">
      <div className="mcpx-problem__text">
        <p data-reveal="up">An assistant can explain a market idea without having the metrics needed to test it. That leaves you copying charts, searching for numbers and rebuilding the context by hand.</p>
        <p data-reveal="up">Alphractal MCP connects that conversation to the platform’s data and research. Ask your assistant to investigate a thesis, compare metrics or check market conditions using Alphractal sources, without moving every question back into the platform.</p>
      </div>
      <ol className="mcpx-chain" aria-label="Question, data query, answer with references">
        <li className="mcpx-chain__item">
          <span className="mcpx-chain__k">Question</span>
          <p>“Which metrics can I use to test this thesis?”</p>
        </li>
        <li className="mcpx-chain__item">
          <span className="mcpx-chain__k">Query to the data</span>
          <p>Your assistant calls Alphractal tools through MCP.</p>
        </li>
        <li className="mcpx-chain__item">
          <span className="mcpx-chain__k">Answer with references</span>
          <p>Sources and dates the tools actually return, for you to review.</p>
        </li>
      </ol>
    </div>
  )
}

function Examples() {
  return (
    <div className="mcpx-ex" data-stagger>
      {EXAMPLES.map((e, i) => (
        <article className="mcpx-exc" data-item key={e.title}>
          <p className="ptag">{String(i + 1).padStart(2, '0')}</p>
          <h3>{e.title}</h3>
          <p className="mcpx-exc__text">{e.text}</p>
          <figure className="mcpx-chat">
            <figcaption>Example prompt</figcaption>
            <blockquote className="mcpx-chat__q">{e.prompt}</blockquote>
            {e.tools.length > 0 && (
              <>
                <p className="mcpx-chat__lbl">Alphractal tools involved</p>
                <ul className="mcpx-chips">
                  {e.tools.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                {e.toolNote && <p className="mcpx-chat__note">{e.toolNote}</p>}
              </>
            )}
            {e.note && <p className="mcpx-chat__note">{e.note}</p>}
          </figure>
        </article>
      ))}
    </div>
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
        const q = (s) => gsap.utils.toArray(s, root.current)
        gsap
          .timeline({ scrollTrigger: { trigger: '.mcpx-chain', start: 'top 80%', once: true }, defaults: { ease: 'power3.out' } })
          .from(q('.mcpx-chain__item'), { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.22 })
        q('.mcpx-exc').forEach((card) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 75%', once: true }, defaults: { ease: 'power3.out' } })
          tl.from(card.querySelector('.mcpx-chat__q'), { autoAlpha: 0, x: -18, duration: 0.7, delay: 0.25 })
          const chips = card.querySelectorAll('.mcpx-chips li')
          if (chips.length) tl.from(chips, { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.12 }, '-=0.1')
        })
        q('.mcpx-step').forEach((s) =>
          gsap.from(s, { autoAlpha: 0, y: 28, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 85%', once: true } }),
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <PageShell>
      <div ref={root}>
        <ProductHero
          current="mcp"
          eyebrow="MODEL CONTEXT PROTOCOL"
          title="The crypto data layer your AI can actually read."
          sub="Connect once, and your AI reads, trusts and works with the data behind Alphractal. Bring market metrics, charts, screeners and research into the AI conversations you already use, on desktop or mobile where your client supports MCP."
          line="Your AI assistant. Alphractal data. One connected workflow."
          primary={{ label: 'Connect your client', href: CONNECT }}
          secondary={{ label: 'Explore the tools', href: '#tools' }}
          visual={<Flow />}
        />

        <PBlock id="problem" eyebrow="THE PROBLEM" title="Your AI needs the data behind the answer.">
          <Problem />
        </PBlock>

        <PBlock id="how" dark eyebrow="HOW IT WORKS" title="Connect your assistant in three steps." className="mcpx-how">
          <div className="mcpx-how__grid">
            <ol className="mcpx-steps">
              {STEPS.map((s) => (
                <li className="mcpx-step" key={s.n}>
                  <b>{s.n}</b>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Shot
              dark
              ratio="1280 / 494"
              src="/product/mcp-connect.webp"
              alt="The MCP tab of the Alphractal app: pick a client, open Settings, Connectors, add a custom connector and paste the server URL"
              name="MCP connection page in the Alphractal app"
            />
          </div>
          <p className="mcpx-how__more">
            <ExtLink className="link-arrow" href={`${DOCS}/connecting`}>
              Read the setup guide <span>→</span>
            </ExtLink>
          </p>
        </PBlock>

        <PBlock id="get" eyebrow="WHAT YOU GET" title="Put Alphractal data to work in your workflow.">
          <Examples />
        </PBlock>

        <PBlock
          id="tools"
          dark
          eyebrow="TOOL CATALOG"
          title="Explore the connected tools."
          intro="Discover data, inspect charts and bring research into the conversation. Available tools and access depend on the connected client, account and plan."
          className="mcpx-tools"
        >
          <ul className="mcpx-groups" data-stagger>
            {GROUPS.map((g) => (
              <li className="mcpx-group" data-item key={g.title}>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
                {g.note && <p className="mcpx-group__note">{g.note}</p>}
              </li>
            ))}
          </ul>
          <p className="mcpx-tools__more">
            <ExtLink className="link-arrow" href={`${DOCS}/tools`}>
              See the full tool catalog in the docs <span>→</span>
            </ExtLink>
          </p>
        </PBlock>

        <ProductFaq title="MCP questions, answered." items={FAQ} />

        <PBlock id="related" eyebrow="RELATED" title="Other ways to work with the data.">
          <ul className="mcpx-rel" data-stagger>
            {RELATED.map((r) => (
              <li data-item key={r.title}>
                <ExtLink className="mcpx-rel__card" href={r.href}>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                  <span className="link-arrow">
                    {r.label} <span>→</span>
                  </span>
                </ExtLink>
              </li>
            ))}
          </ul>
        </PBlock>
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
