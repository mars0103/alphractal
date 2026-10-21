import { useRef, useState } from 'react'
import '../../styles/p-api.css'
import { useMeta } from '../../hooks/useMeta.js'
import { gsap, useGSAP, MQ } from '../../lib/gsap.js'
import PageShell from '../../components/PageShell.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { ExtLink, PBlock, ProductFaq, ProductHero } from '../../components/ProductBlocks.jsx'

/* /platform/api — hero + flow diagram, data coverage, first integration, operational details, plans, API vs MCP, FAQ, closing CTA.
   Copy: Textos/API.md. No captures are needed on this page; the hero diagram is HTML/CSS (selectable text). */

const DOCS = 'https://docs.alphractal.com/'
const DASH = 'https://app.alphractal.com/api-dashboard'
const PLANS = 'https://app.alphractal.com/plans'
const ENDPOINT_DOC = 'https://docs.alphractal.com/api-reference/market/priceusd'

const DESTINATIONS = ['Research pipeline', 'Analytics dashboard', 'Automated workflow']

const ICONS = {
  market: <path d="M3 17l5-6 4 4 8-9M3 21h18" />,
  chain: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  deriv: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
  liq: <path d="M3 5h18M3 10h12M3 15h16M3 20h8" />,
  flows: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  cycle: <path d="M3 12c3-8 6-8 9 0s6 8 9 0" />,
  macro: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-5-5" />
    </>
  ),
}

const FAMILIES = [
  { icon: 'market', title: 'Market data', text: 'Price, market capitalization, returns and volatility for asset analysis and monitoring.', ex: 'Price USD · Market Cap · OHLCV' },
  { icon: 'chain', title: 'On-chain & valuation', text: 'Network activity, supply distribution, holder behavior and cost-basis measures.', ex: 'Active Addresses · SOPR · Realized Price · MVRV' },
  { icon: 'deriv', title: 'Derivatives & positioning', text: 'Leverage conditions and trader positioning across supported derivatives markets.', ex: 'Funding Rate · Open Interest · Whale vs Retail Delta' },
  { icon: 'liq', title: 'Liquidation levels', text: 'Query liquidation heatmaps, snapshots and price zones for supported markets.', ex: 'Heatmap · Snapshot · Zones' },
  { icon: 'flows', title: 'Exchange flows', text: 'On-chain inflows, outflows and reserves associated with tracked exchange entities.', ex: 'Exchange Netflow · Inflows · Outflows · Exchange Reserves' },
  { icon: 'cycle', title: 'Cycle indicators & Alphractal models', text: 'Access documented cycle indicators and model series for deeper market analysis.', ex: 'ADCI · TBBI · CVDD Model 2' },
  { icon: 'macro', title: 'Sentiment & macro', text: 'Add market sentiment, economic series and liquidity context to your workflow.', ex: 'Fear and Greed · Interest rates · Dollar indices · Money supply' },
  { icon: 'search', title: 'Discovery & screening', text: 'Find supported assets, inspect endpoint parameters and retrieve cross-asset screening views.', ex: 'Asset catalog · Endpoint metadata · Screener' },
]

const EXCHANGES = [
  ['Price & volume', 'Binance · Bybit · OKX · Coinbase · Kraken'],
  ['Derivatives & positioning', 'Binance · Bybit · OKX · Bitget · Deribit'],
  ['Liquidation levels', 'Binance · Bybit · OKX · Bitget · Kraken'],
  ['On-chain flows', 'Binance · Bybit · OKX · Bitfinex · Bitstamp'],
]

const STEPS = [
  { title: 'Get your key', text: 'Sign in to Alphractal and manage your API key from the API dashboard. Your key determines the endpoints and usage limits available to you.', href: DASH, label: 'Open API dashboard' },
  { title: 'Choose an endpoint', text: 'Find the metric, asset and supported parameters in the API reference. Use the documented date range and resolution for your request.', href: ENDPOINT_DOC, label: 'Browse the API reference' },
  { title: 'Read the response', text: 'Authenticate the request and process the JSON response in your application. Check the returned timestamps, credit balance and status code.', href: 'https://docs.alphractal.com/endpoints', label: 'Read the integration guide' },
]

const CURL = `curl --request GET \\
  --url 'https://api.alphractal.com/btc/market/PriceUSD' \\
  --header "X-Api-Key: \${ALPHRACTAL_API_KEY}"`

const PYTHON = `import json
import os
from urllib.request import Request, urlopen

request = Request(
    "https://api.alphractal.com/btc/market/PriceUSD",
    headers={"X-Api-Key": os.environ["ALPHRACTAL_API_KEY"]},
)

with urlopen(request, timeout=30) as response:
    data = json.load(response)
    credits_remaining = response.headers.get("X-Credits-Remaining")

print(data)`

const RESPONSE = `[
  {
    "time": "2023-11-07T05:31:56Z",
    "priceUSD": 123
  }
]`

const TABS = [
  { id: 'curl', label: 'cURL', code: CURL },
  { id: 'python', label: 'Python', code: PYTHON },
]

const OPS = [
  ['Protocol & format', 'REST endpoints over HTTPS, with JSON responses.'],
  ['Authentication', <>Send your API key in the <code className="api-inl">X-Api-Key</code> header. The documentation also supports bearer-key authentication.</>],
  ['Date ranges', <>Use <code className="api-inl">startDate</code> and <code className="api-inl">endDate</code> where supported to select a historical window. Available history depends on the metric and your plan.</>],
  ['Resolution', 'Intraday and daily buckets are available for supported market and derivatives series. On-chain, macro and sentiment availability follows the endpoint definition.'],
  ['Timestamps', 'API timestamps use UTC and ISO 8601. A series’ resolution and its source publication schedule are different things.'],
  ['Response shape', 'Most asset-level metric endpoints return an array of time-stamped data points. Discovery, screening and liquidation endpoints may use different structures.'],
  ['Credits', 'Each authenticated API request costs 10 credits under the documented standard model. Non-2xx responses are refunded.'],
  ['Rate limits', 'Requests per minute are limited separately from your credit balance. Your API key carries the applicable limit.'],
]

const OPS_LINKS = [
  ['Authentication', 'https://docs.alphractal.com/authentication'],
  ['Date ranges & endpoint structure', 'https://docs.alphractal.com/endpoints'],
  ['Timeframes & resolutions', 'https://docs.alphractal.com/data/timeframes'],
  ['Credits', 'https://docs.alphractal.com/credits'],
  ['Rate limits', 'https://docs.alphractal.com/rate-limits'],
]

const STATUS = [
  ['403', 'The key does not have access to the requested endpoint.'],
  ['402', 'The available credit allocation has been exhausted.'],
  ['429', 'The request rate exceeded the key’s limit.'],
  ['503', 'The API may reject the request when credit accounting is temporarily unavailable.'],
]

const PLAN_ROWS = [
  ['Starter (Free)', '30', 'Up to 7 days, where available', 'Supported endpoints and plan limits apply'],
  ['Pro', '200', 'Up to 12 months, where available', '1 hour and above, where supported'],
  ['Max', '500', 'Full available history for the metric', 'All supported resolutions for the metric'],
  ['Institutional', 'Custom', 'Contract-specific', 'Contract-specific'],
]

const FAQ = [
  { q: 'How do I get an API key?', a: <>Sign in to your Alphractal account and open the <ExtLink className="faq__link" href={DASH}>API dashboard</ExtLink>. Your key determines access to endpoints and the usage limits that apply.</> },
  { q: 'Can I use the API on the free plan?', a: 'API access is available on the Starter plan, subject to endpoint permissions, credit availability and plan limits. Check the dashboard before making a request.' },
  { q: 'Does buying credits unlock every metric?', a: <>Credits cover usage. Endpoint access, historical depth and resolution also depend on your <ExtLink className="faq__link" href={PLANS}>plan</ExtLink> and API key.</> },
  { q: 'Are all assets and exchanges available for every metric?', a: 'No. Coverage varies by endpoint and asset. Use the documented asset, venue and symbol metadata for the data you need.' },
  { q: 'How much historical data can I request?', a: 'The available window depends on both the metric’s history and your plan. Use startDate and endDate where supported, and check the endpoint definition for available resolutions.' },
  { q: 'How are credits different from rate limits?', a: 'Credits control how much API usage you can consume. Rate limits control how quickly you can send requests. The documented standard cost is 10 credits per authenticated request.' },
  { q: 'Where do I find request examples and response fields?', a: <>The <ExtLink className="faq__link" href={ENDPOINT_DOC}>API reference</ExtLink> documents endpoint parameters, supported inputs and response fields. The landing-page example demonstrates the request structure; use the reference when implementing an integration.</> },
  { q: 'Should an AI agent use the API or MCP?', a: <>Use the API for direct HTTP integration. Use <ExtLink className="faq__link" href="/platform/mcp">MCP</ExtLink> when a compatible client or agent connects through Alphractal’s tool interface. Review the documentation for the interface you choose.</> },
]

/* Hero diagram: application -> request -> API -> JSON response -> back to the application and its three destinations.
   Everything is real text; the travelling dots are decoration and sit still when motion is reduced. */
function FlowDiagram() {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => root.current.querySelector(s)
        const qa = (s) => gsap.utils.toArray(s, root.current)
        const lit = [q('.api-flow__lane--req'), q('.api-flow__lane--res'), q('.api-flow__node--api'), ...qa('.api-flow__dest li')]
        const tl = gsap.timeline({ repeat: -1, delay: 1.6, defaults: { ease: 'power2.inOut' } })
        tl.set('.api-flow__dot--req', { top: '0%', autoAlpha: 0 })
          .set('.api-flow__dot--res', { top: '100%', autoAlpha: 0 })
          .to('.api-flow__dot--req', { autoAlpha: 1, duration: 0.25 })
          .to('.api-flow__dot--req', { top: '100%', duration: 1.3 }, '<')
          .to(q('.api-flow__lane--req'), { '--lit': 1, duration: 0.4 }, '<')
          .to('.api-flow__dot--req', { autoAlpha: 0, duration: 0.2 })
          .to(q('.api-flow__node--api'), { '--lit': 1, duration: 0.4 }, '<')
          .to('.api-flow__dot--res', { autoAlpha: 1, duration: 0.25 }, '+=0.15')
          .to('.api-flow__dot--res', { top: '0%', duration: 1.3 }, '<')
          .to(q('.api-flow__lane--res'), { '--lit': 1, duration: 0.4 }, '<')
          .to('.api-flow__dot--res', { autoAlpha: 0, duration: 0.2 })
          .to(qa('.api-flow__dest li'), { '--lit': 1, duration: 0.4, stagger: 0.15 }, '<')
          .to(lit, { '--lit': 0, duration: 0.8 }, '+=0.8')
      }, root)
      return () => mm.revert()
    },
    { scope: root },
  )
  return (
    <div className="api-flow" ref={root} role="group" aria-label="Request and response flow: your application sends a GET request to the Alphractal API and receives a JSON response">
      <div className="api-flow__node api-flow__node--app">
        <p className="api-flow__label">YOUR APPLICATION</p>
        <ul className="api-flow__dest" aria-label="Typical destinations">
          {DESTINATIONS.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
      <div className="api-flow__lanes">
        <div className="api-flow__lane api-flow__lane--req">
          <i className="api-flow__line" aria-hidden="true" />
          <i className="api-flow__dot api-flow__dot--req" aria-hidden="true" />
          <code className="api-flow__req">GET /btc/market/PriceUSD</code>
        </div>
        <div className="api-flow__lane api-flow__lane--res">
          <i className="api-flow__line" aria-hidden="true" />
          <i className="api-flow__dot api-flow__dot--res" aria-hidden="true" />
          <span className="api-flow__res">JSON RESPONSE</span>
        </div>
      </div>
      <div className="api-flow__node api-flow__node--api">
        <p className="api-flow__label">ALPHRACTAL API</p>
      </div>
    </div>
  )
}

function CodePanel() {
  const [tab, setTab] = useState('curl')
  const [copied, setCopied] = useState(false)
  const cur = TABS.find((t) => t.id === tab)
  const pick = (id) => {
    setTab(id)
    setCopied(false)
  }
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const i = TABS.findIndex((t) => t.id === tab)
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]
    pick(next.id)
    document.getElementById(`api-tab-${next.id}`)?.focus()
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cur.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked: the code stays selectable */
    }
  }
  return (
    <div className="api-demo" data-reveal="up">
      <div className="api-demo__head">
        <h3>Request Bitcoin price data</h3>
        <p>Authenticate with your API key and read the returned time series.</p>
      </div>
      <div className="api-demo__grid">
        <div className="api-pane">
          <div className="api-pane__bar">
            <div role="tablist" aria-label="Language" onKeyDown={onKey} className="api-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`api-tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls={`api-panel-${t.id}`}
                  tabIndex={tab === t.id ? 0 : -1}
                  onClick={() => pick(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button type="button" className="api-copy" onClick={copy}>
              <span aria-live="polite">{copied ? 'Copied' : 'Copy request'}</span>
            </button>
          </div>
          {TABS.map((t) => (
            <div key={t.id} role="tabpanel" id={`api-panel-${t.id}`} aria-labelledby={`api-tab-${t.id}`} hidden={tab !== t.id}>
              <pre className="api-code" tabIndex={0}>
                <code>{t.code}</code>
              </pre>
            </div>
          ))}
          <p className="api-pane__note">Set ALPHRACTAL_API_KEY in your server environment before running this example. Keep the key out of browser code and public repositories.</p>
        </div>
        <div className="api-pane api-pane--res">
          <div className="api-pane__bar">
            <p className="api-pane__title">Example response shape</p>
          </div>
          <pre className="api-code" tabIndex={0}>
            <code>{RESPONSE}</code>
          </pre>
          <p className="api-pane__note">Illustrative values from the endpoint documentation. This is not a live market quote.</p>
        </div>
      </div>
      <p className="api-demo__explain">
        <code className="api-inl">time</code> identifies the data point in UTC. <code className="api-inl">priceUSD</code> is the USD price field. Other endpoints return their own documented fields and response shapes.
      </p>
      <ExtLink className="btn btn--ink" href={ENDPOINT_DOC}>
        View this endpoint
      </ExtLink>
    </div>
  )
}

export default function Api() {
  useMeta({
    title: 'Crypto Data API: On-Chain, Derivatives & Macro | Alphractal',
    description: 'Integrate crypto market, on-chain, derivatives, liquidation, sentiment and macro data through Alphractal’s REST API. Explore endpoints, access and documentation.',
  })

  return (
    <PageShell>
      <ProductHero
        current="api"
        eyebrow="ALPHRACTAL API"
        title="Crypto market intelligence for your applications."
        sub="Query market, on-chain, derivatives, liquidation, sentiment and macro data through a REST API. Build research pipelines, analytics tools and automated workflows with documented endpoints and JSON responses."
        primary={{ label: 'Read the docs', href: DOCS }}
        secondary={{ label: 'Get an API key', href: DASH }}
        line="API access is available across plans. Supported metrics, history and usage depend on your plan and API key."
        visual={<FlowDiagram />}
      />

      <PBlock
        id="coverage"
        eyebrow="DATA COVERAGE"
        title="Choose the data your workflow needs."
        intro="Discover asset-level time series, cross-asset views and metadata. Availability varies by endpoint, asset and exchange."
      >
        <ul className="api-fam" data-stagger>
          {FAMILIES.map((f) => (
            <li className="api-fam__card" data-item key={f.title}>
              <svg className="api-fam__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[f.icon]}
              </svg>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <p className="api-fam__ex">
                <b>Examples</b> {f.ex}
              </p>
            </li>
          ))}
        </ul>
        <p className="api-clarify">API coverage is defined by the documented endpoints. Visual charts in the application may combine or transform multiple data series.</p>

        <div className="api-cov">
          <div>
            <h3 className="api-h3">Coverage follows the metric.</h3>
            <p className="api-cov__text">
              Explore supported assets such as Bitcoin, Ethereum, Cardano, Dogecoin, Litecoin and Zcash. Exchange coverage differs between price data, derivatives and on-chain flows.
            </p>
            <div className="api-links">
              <ExtLink className="link-arrow" href="https://docs.alphractal.com/data/assets">
                View supported assets <span>→</span>
              </ExtLink>
              <ExtLink className="link-arrow" href="https://docs.alphractal.com/data/exchanges">
                View exchange coverage <span>→</span>
              </ExtLink>
              <ExtLink className="link-arrow" href="/platform/metrics">
                Explore Metrics &amp; Models <span>→</span>
              </ExtLink>
            </div>
          </div>
          <div className="ptable-wrap">
            <table className="ptable">
              <caption>Exchange examples by data family</caption>
              <thead>
                <tr>
                  <th scope="col">Data family</th>
                  <th scope="col">Exchange examples</th>
                </tr>
              </thead>
              <tbody>
                {EXCHANGES.map(([fam, ex]) => (
                  <tr key={fam}>
                    <th scope="row">{fam}</th>
                    <td>{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PBlock>

      <PBlock id="integrate" eyebrow="FIRST INTEGRATION" title="From API key to structured data.">
        <ol className="api-steps" data-stagger>
          {STEPS.map((s, i) => (
            <li className="api-step" data-item key={s.title}>
              <b className="api-step__n">{String(i + 1).padStart(2, '0')}</b>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ExtLink className="link-arrow" href={s.href}>
                {s.label} <span>→</span>
              </ExtLink>
            </li>
          ))}
        </ol>
        <CodePanel />
      </PBlock>

      <PBlock id="behavior" eyebrow="OPERATIONAL DETAILS" title="Know how the API behaves.">
        <div className="ptable-wrap api-ops">
          <table className="ptable">
            <caption className="api-sr">How the API behaves</caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {OPS.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="api-links api-links--row" aria-label="Related documentation">
          {OPS_LINKS.map(([label, href]) => (
            <li key={label}>
              <ExtLink className="link-arrow" href={href}>
                {label} <span>→</span>
              </ExtLink>
            </li>
          ))}
        </ul>

        <h3 className="api-h3 api-h3--gap">Handle access and usage limits explicitly.</h3>
        <div className="ptable-wrap api-ops api-ops--status">
          <table className="ptable">
            <caption className="api-sr">Status codes</caption>
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {STATUS.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="api-clarify">Use the documented status and error details when handling a failed request. A plan restriction, an exhausted credit balance and a rate limit require different handling.</p>
      </PBlock>

      <PBlock
        id="plans"
        eyebrow="ACCESS & PLANS"
        title="Choose access that fits your workflow."
        intro="API access is available across Alphractal plans. Your plan and API key determine the supported metrics, historical depth, resolutions and request limits. Check the plans page for current pricing, credit allocations and top-ups."
      >
        <div className="ptable-wrap api-plans">
          <table className="ptable">
            <caption className="api-sr">API limits by plan</caption>
            <thead>
              <tr>
                <th scope="col">Plan</th>
                <th scope="col">Requests per minute</th>
                <th scope="col">Historical access</th>
                <th scope="col">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_ROWS.map(([plan, rpm, hist, res]) => (
                <tr key={plan}>
                  <th scope="row">{plan}</th>
                  <td data-label="Requests per minute">{rpm}</td>
                  <td data-label="Historical access">{hist}</td>
                  <td data-label="Resolution">{res}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="api-clarify">Limits can differ for legacy plans and institutional agreements. Confirm the limits attached to your API key in the dashboard. Full history means the available history of a metric, not the same start date for every series.</p>
        <div className="api-links">
          <ExtLink className="btn btn--ink" href={PLANS}>
            View plans
          </ExtLink>
          <ExtLink className="link-arrow" href={DASH}>
            Check your API access <span>→</span>
          </ExtLink>
        </div>
        <aside className="api-inst" data-reveal="up">
          <div>
            <h3>Building for an institutional workflow?</h3>
            <p>Discuss data coverage, access requirements and usage at scale with the Alphractal team.</p>
          </div>
          <ExtLink className="btn btn--ink" href="/institutional">
            Explore institutional solutions
          </ExtLink>
        </aside>
      </PBlock>

      <PBlock id="api-or-mcp" eyebrow="API OR MCP" title="Build with the API. Connect through MCP.">
        <div className="pcards pcards--2" data-stagger>
          <article className="pcard" data-item>
            <div className="pcard__body">
              <p className="ptag">API</p>
              <p>Use HTTP requests when your application controls the integration, scheduling and response handling.</p>
              <ExtLink className="pcard__link link-arrow" href={DOCS}>
                Read API documentation <span>→</span>
              </ExtLink>
            </div>
          </article>
          <article className="pcard" data-item>
            <div className="pcard__body">
              <p className="ptag">MCP</p>
              <p>Connect compatible AI clients and agents to Alphractal tools through the Model Context Protocol.</p>
              <ExtLink className="pcard__link link-arrow" href="/platform/mcp">
                Explore MCP <span>→</span>
              </ExtLink>
            </div>
          </article>
        </div>
      </PBlock>

      <ProductFaq title="API questions, answered." items={FAQ} />

      <FinalCta
        title={['Start building with', 'Alphractal data.']}
        sub="Explore the documentation, check your API access and connect the data your workflow needs."
        primary="Read the docs"
        primaryHref={DOCS}
        secondary="Open API dashboard"
        secondaryTo={DASH}
      />
    </PageShell>
  )
}
