import { useRef, useState } from 'react'
import '../../styles/p-api.css'
import { useMeta } from '../../hooks/useMeta.js'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../../lib/gsap.js'
import { useLive } from '../../lib/live.js'
import PageShell from '../../components/PageShell.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import PageHero from '../../components/PageHero.jsx'
import GlowButton from '../../components/GlowButton.jsx'
import { ExtLink, PBlock, ProductFaq } from '../../components/ProductBlocks.jsx'
import { HeroFlow, FamilyDraw } from '../../components/visuals/ApiVisuals.jsx'

/* /platform/api — hero + request/response flow, data coverage, first integration, operational details, plans, API vs MCP, FAQ, closing CTA.
   Copy: Textos/07 - API.md. The page has no captures: the visuals are loose line drawings (components/visuals/ApiVisuals.jsx) and the
   code is real text. Numbers: 100K+ (hero) comes from the doc, not from lib/facts.js; the 30/200/500 limits and 10 credits are doc facts too. */

const DOCS = 'https://docs.alphractal.com/'
const DASH = 'https://app.alphractal.com/api-dashboard'
const PLANS = 'https://app.alphractal.com/plans'
const ENDPOINT_DOC = 'https://docs.alphractal.com/api-reference/market/priceusd'

const FAMILIES = [
  { kind: 'market', title: 'Market data', text: 'Price, market capitalization, returns and volatility for asset analysis and monitoring.', ex: 'Price USD · Market Cap · OHLCV' },
  { kind: 'chain', title: 'On-chain & valuation', text: 'Network activity, supply distribution, holder behavior and cost-basis measures.', ex: 'Active Addresses · SOPR · Realized Price · MVRV' },
  { kind: 'deriv', title: 'Derivatives & positioning', text: 'Leverage conditions and trader positioning across supported derivatives markets.', ex: 'Funding Rate · Open Interest · Whale vs Retail Delta' },
  { kind: 'liq', title: 'Liquidation levels', text: 'Query liquidation heatmaps, snapshots and price zones for supported markets.', ex: 'Heatmap · Snapshot · Zones' },
  { kind: 'flows', title: 'Exchange flows', text: 'On-chain inflows, outflows and reserves associated with tracked exchange entities.', ex: 'Exchange Netflow · Inflows · Outflows · Exchange Reserves' },
  { kind: 'cycle', title: 'Cycle indicators & Alphractal models', text: 'Access documented cycle indicators and model series for deeper market analysis.', ex: 'ADCI · TBBI · CVDD Model 2' },
  { kind: 'macro', title: 'Sentiment & macro', text: 'Add market sentiment, economic series and liquidity context to your workflow.', ex: 'Fear and Greed · Interest rates · Dollar indices · Money supply' },
  { kind: 'search', title: 'Discovery & screening', text: 'Find supported assets, inspect endpoint parameters and retrieve cross-asset screening views.', ex: 'Asset catalog · Endpoint metadata · Screener' },
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
  { id: 'curl', label: 'cURL', code: CURL, lang: 'bash' },
  { id: 'python', label: 'Python', code: PYTHON, lang: 'python' },
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

/* ---------------------------------------------------------------- syntax highlighting
   A tiny tokenizer per language: it only colours, the text is untouched (so the HTML carries the full example). */
const RX = {
  bash: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(--[\w-]+)|(\bcurl\b)/g,
  python: /("(?:[^"\\]|\\.)*")|(\b(?:import|from|with|as)\b)|(\b\d+\b)|(\b(?:print|open)\b|\b[A-Za-z_]\w*(?=\())/g,
  json: /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\b\d+(?:\.\d+)?\b)|([[\]{},])/g,
}
const GROUPS = { bash: ['str', 'flag', 'cmd'], python: ['str', 'kw', 'num', 'fn'], json: ['str', 'colon', 'num', 'punct'] }

function tokens(line, lang) {
  const out = []
  const re = new RegExp(RX[lang].source, 'g')
  let last = 0
  let m
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(['', line.slice(last, m.index)])
    if (lang === 'json' && m[1]) {
      out.push([m[2] ? 'key' : 'str', m[1]])
      if (m[2]) out.push(['punct', m[2]])
    } else {
      const g = GROUPS[lang].findIndex((_, i) => m[i + 1] !== undefined)
      out.push([GROUPS[lang][g], m[0]])
    }
    last = m.index + m[0].length
  }
  if (last < line.length) out.push(['', line.slice(last)])
  return out
}

function Code({ code, lang }) {
  return (
    <code>
      {code.split('\n').map((ln, i) => (
        <span className="api-ln" key={i}>
          {tokens(ln, lang).map(([c, t], k) =>
            c === 'str' && t.includes('${') ? (
              <span className="tk-str" key={k}>
                {t.split(/(\$\{[^}]+\})/).map((p, j) => (p.startsWith('${') ? <span className="tk-var" key={j}>{p}</span> : p))}
              </span>
            ) : c ? (
              <span className={`tk-${c}`} key={k}>
                {t}
              </span>
            ) : (
              t
            ),
          )}
        </span>
      ))}
    </code>
  )
}

/* Typed, not pasted: on first view the request types itself, then the response streams in. The full text is always in the HTML,
   the reveal is a clip, so no-JS and reduced motion get the finished example. */
const clipStart = 'inset(0 100% 0 0)'
const clipEnd = 'inset(0 0% 0 0)'
const typeLines = (tl, lines, at, per = 0.011) => {
  let t = at
  lines.forEach((l) => {
    const n = Math.max(3, l.textContent.length)
    const d = Math.max(0.08, n * per)
    tl.to(l, { clipPath: clipEnd, duration: d, ease: `steps(${n})` }, t)
    t += d
  })
  return t
}

function CodePanel() {
  const root = useRef(null)
  const played = useRef(false)
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

  // first view: type the request, then stream the response
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const all = gsap.utils.toArray('.api-ln', root.current)
        gsap.set(all, { clipPath: clipStart })
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top 72%',
          once: true,
          onEnter: () => {
            const req = gsap.utils.toArray('.api-panel:not([hidden]) .api-ln', root.current)
            const res = gsap.utils.toArray('.api-pane--res .api-ln', root.current)
            const tl = gsap.timeline({ onComplete: () => (played.current = true) })
            const t = typeLines(tl, req, 0.2)
            // the response arrives faster than it was typed: it is a stream
            res.forEach((l, i) => tl.to(l, { clipPath: clipEnd, duration: 0.5, ease: 'power2.out' }, t + 0.35 + i * 0.16))
            tl.to('.api-demo__after', { autoAlpha: 1, duration: 0.5 }, '>-0.2')
          },
        })
        gsap.set('.api-demo__after', { autoAlpha: 0 })
        return () => st.kill()
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // switching tabs: the new example types in quickly
  useGSAP(
    () => {
      if (!played.current) return undefined
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const lines = gsap.utils.toArray('.api-panel:not([hidden]) .api-ln', root.current)
        gsap.fromTo('.api-panel:not([hidden])', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' })
        gsap.fromTo(lines, { clipPath: clipStart }, { clipPath: clipEnd, duration: 0.45, ease: 'power2.out', stagger: 0.05 })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [tab], revertOnUpdate: false },
  )

  return (
    <div className="api-demo" data-reveal="up" ref={root}>
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
            <div key={t.id} className="api-panel" role="tabpanel" id={`api-panel-${t.id}`} aria-labelledby={`api-tab-${t.id}`} hidden={tab !== t.id}>
              <pre className="api-code" tabIndex={0}>
                <Code code={t.code} lang={t.lang} />
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
            <Code code={RESPONSE} lang="json" />
          </pre>
          <p className="api-pane__note">Illustrative values from the endpoint documentation. This is not a live market quote.</p>
        </div>
      </div>
      <div className="api-demo__after">
        <p className="api-demo__explain">
          <code className="api-inl">time</code> identifies the data point in UTC. <code className="api-inl">priceUSD</code> is the USD price field. Other endpoints return their own documented fields and response shapes.
        </p>
        <ExtLink className="btn btn--ink" href={ENDPOINT_DOC}>
          View this endpoint
        </ExtLink>
      </div>
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
      <PageHero
        eyebrow="ALPHRACTAL API"
        title="Crypto market intelligence for your applications."
        sub="Build trading models, research pipelines and automated workflows with Alphractal’s market, on-chain, derivatives, liquidation, sentiment and macro data."
        actions={
          <>
            <GlowButton href={DOCS}>Read the docs</GlowButton>
            <ExtLink className="link-arrow phero__more" href={DASH}>
              Get an API key <span>→</span>
            </ExtLink>
          </>
        }
        visual={<HeroFlow />}
      />

      <PBlock
        id="coverage"
        title="Choose the data your workflow needs."
        intro="Discover asset-level time series, cross-asset views and metadata. Availability varies by endpoint, asset and exchange."
      >
        <ul className="api-fam" data-stagger>
          {FAMILIES.map((f) => (
            <li className="api-fam__item" data-item key={f.title}>
              <FamilyDraw kind={f.kind} />
              <div className="api-fam__txt">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <p className="api-fam__ex">
                  <b>Examples</b> {f.ex}
                </p>
              </div>
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

      <PBlock id="integrate" title="From API key to structured data.">
        <ol className="api-steps" data-stagger>
          {STEPS.map((s) => (
            <li className="api-step" data-item key={s.title}>
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

      <PBlock id="behavior" title="Know how the API behaves.">
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

        <div className="api-err">
          <div>
            <h3 className="api-h3">Handle access and usage limits explicitly.</h3>
            <p className="api-clarify">Use the documented status and error details when handling a failed request. A plan restriction, an exhausted credit balance and a rate limit require different handling.</p>
          </div>
          <ol className="api-status" data-stagger aria-label="Status codes">
            {STATUS.map(([code, text]) => (
              <li data-item key={code}>
                <b className="api-status__code">{code}</b>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </PBlock>

      <PBlock id="institutional-api">
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

      <PBlock id="api-or-mcp" title="Build with the API. Connect through MCP." className="api-last">
        <div className="api-ch" data-stagger>
          <article className="api-ch__col" data-item>
            <p className="api-ch__tag">API</p>
            <p>Use HTTP requests when your application controls the integration, scheduling and response handling.</p>
            <pre className="api-ch__code" aria-hidden="true">
              <code>
                <span className="tk-cmd">GET</span> /btc/market/PriceUSD{'\n'}
                <span className="tk-key">X-Api-Key</span>: ••••••••••••
              </code>
            </pre>
            <ExtLink className="link-arrow" href={DOCS}>
              Read API documentation <span>→</span>
            </ExtLink>
          </article>
          <article className="api-ch__col" data-item>
            <p className="api-ch__tag">MCP</p>
            <p>Connect compatible AI clients and agents to Alphractal tools through the Model Context Protocol.</p>
            <pre className="api-ch__code" aria-hidden="true">
              <code>
                <span className="tk-cmd">tools/call</span>{'\n'}
                {'  '}name: <span className="tk-str">get_metric_data</span>
              </code>
            </pre>
            <ExtLink className="link-arrow" href="/platform/mcp">
              Explore MCP <span>→</span>
            </ExtLink>
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
