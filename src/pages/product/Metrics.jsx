import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../../lib/gsap.js'
import GlowButton from '../../components/GlowButton.jsx'
import '../../styles/p-metrics.css'
import { useMeta } from '../../hooks/useMeta.js'
import { LINKS } from '../../lib/facts.js'
import PageShell from '../../components/PageShell.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { ExtLink, PBlock, ProductFaq } from '../../components/ProductBlocks.jsx'
import { MetricChart } from '../../components/visuals/MetricsCharts.jsx'
import LiquidationField from '../../components/visuals/MetricsLiquidity.jsx'

/* /platform/metrics — five sections: opening, ten families, six models, coverage, FAQ + closing CTA.
   Copy: Textos/06 - Metrics e Models.md. Charts are drawn (SVG), live and zoomable: see components/visuals/MetricsCharts.jsx. */

const ACADEMY = 'https://app.alphractal.com/academy'

const FAMILIES = [
  {
    key: 'onchain',
    title: 'On-chain activity',
    lead: 'Measure activity on the blockchain rather than inferring it from price alone. Track participation and transaction throughput to compare network usage with market performance.',
    defs: [
      ['Active Addresses', 'Unique addresses that sent or received transactions during the interval.'],
      ['Transaction Count', 'The number of transactions recorded during the interval.'],
      ['Transactions per Second', 'Transaction throughput expressed as an average rate.'],
    ],
    use: 'Compare a price move with changes in network participation and transaction activity.',
    note: 'Mining on proof-of-work networks: Mean Hash Rate tracks computational work, while Puell Multiple compares daily issuance value with its 365-day average.',
    chart: ['active', 'Illustrative Active Addresses line chart'],
  },
  {
    key: 'valuation',
    title: 'Valuation',
    lead: 'Compare market pricing with on-chain cost-basis measures. Distinguish the price investors see from the prices at which supply last moved.',
    defs: [
      ['MVRV', 'Market capitalization divided by realized capitalization.'],
      ['Realized Price', 'An on-chain cost-basis reference derived from the prices at which coins last moved.'],
      ['MVRV Z-score', 'The difference between market and realized capitalization, divided by the standard deviation of market capitalization.'],
    ],
    use: 'Compare current valuation with cost basis and previous valuation regimes.',
    chart: ['mvrv', 'Illustrative MVRV chart with the realized price line'],
  },
  {
    key: 'holders',
    title: 'Holder behavior & supply',
    lead: 'Examine how supply is distributed across holder cohorts and profit or loss conditions. Separate the behavior of older supply from that of recent market entrants.',
    defs: [
      ['Long-Term Holders Supply', 'Supply held in coins that have not moved for more than 155 days.'],
      ['Supply in Profit', 'Supply whose last-moved price is below the current price.'],
      ['Supply in Loss', 'Supply whose last-moved price is above the current price.'],
    ],
    use: 'Track changes in holder composition and the amount of supply under unrealized profit or loss.',
    chart: ['supply', 'Illustrative Supply in Profit and Supply in Loss areas'],
  },
  {
    key: 'realized',
    title: 'Realized profit & loss',
    lead: 'Study spending behavior on UTXO-based chains. Realized profit and loss measures complement the picture of unrealized gains and losses.',
    defs: [
      ['SOPR', 'The ratio between a coin’s value when spent and when received, aggregated across spent outputs. Above 1 indicates aggregate realized profit; below 1 indicates aggregate realized loss.'],
      ['Short-Term Holder SOPR', 'The same spending-profit framework applied to short-term holders.'],
      ['Long-Term Holder SOPR', 'The same framework applied to long-term holders.'],
    ],
    use: 'Compare whether recent entrants and longer-term holders are realizing profits or losses during the same market move.',
    chart: ['sopr', 'Illustrative SOPR oscillating around the parity line at 1'],
  },
  {
    key: 'exchanges',
    title: 'Exchange flows',
    lead: 'Track on-chain movements into and out of identified exchange entities. Compare deposits, withdrawals and net flows in native units or USD.',
    defs: [
      ['Exchange Inflows', 'Transfers into tracked exchange entities.'],
      ['Exchange Outflows', 'Transfers out of tracked exchange entities.'],
      ['Exchange Netflow', 'Inflows minus outflows. Positive values indicate net deposits; negative values indicate net withdrawals.'],
    ],
    use: 'Compare changes in exchange-bound supply with price, holder behavior and derivatives activity.',
    chart: ['netflow', 'Illustrative Exchange Netflow bars'],
  },
  {
    key: 'derivatives',
    title: 'Derivatives & positioning',
    lead: 'Analyze the cost of leverage, outstanding contract exposure and differences in trader positioning. Keep perpetual-market activity separate from spot ownership.',
    defs: [
      ['Funding Rate', 'The periodic payment rate between long and short perpetual positions.'],
      ['Open Interest', 'Outstanding futures and perpetual exposure, available in coin units or USD depending on the series. Each contract is counted once rather than adding its long and short sides.'],
      ['Whale vs Retail Delta', 'The difference in leveraged positioning between large and small traders.'],
      ['Whale vs Retail Ratio', 'A relative positioning ratio with parity at 1, rather than 0.'],
    ],
    use: 'Compare price and open interest with funding and trader positioning to examine leverage conditions.',
    chart: ['deriv', 'Illustrative Open Interest and Funding Rate panels'],
  },
  {
    key: 'liquidations',
    title: 'Liquidations',
    lead: 'Distinguish liquidation events from liquidation-level analysis. Read forced-position closures separately from the distribution of levels shown in liquidation maps.',
    defs: [
      ['Liquidations', 'Recorded forced closures of leveraged derivatives positions.'],
      ['Liquidation Heatmap', 'A price-by-time map of estimated liquidation-level concentrations.'],
      ['Liquidation Zones', 'Grouped price zones of estimated liquidation exposure.'],
    ],
    use: 'Compare where liquidations have occurred with the concentrations shown in the level map.',
    chart: ['heat', 'Illustrative liquidation heatmap with a price line'],
  },
  {
    key: 'cycle',
    title: 'Cycle & market structure',
    lead: 'Add cycle context and structural price zones to conventional market indicators. Compare slower market regimes with more responsive momentum measures.',
    defs: [
      ['ADCI', 'A 0–100 index that places Bitcoin market behavior in a longer-term accumulation–distribution framework.'],
      ['TBBI', 'A bull–bear sentiment oscillator offered in different lookback windows, including 90 and 116 days.'],
      ['Structural Market Bands', 'Support and resistance zones derived from on-chain valuation anchors.'],
    ],
    use: 'Compare the broader cycle backdrop with tactical sentiment and structural price zones.',
    chart: ['osc', 'Illustrative ADCI and TBBI on a 0 to 100 scale'],
  },
  {
    key: 'sentiment',
    title: 'Sentiment & social activity',
    lead: 'Separate market psychology from social attention. Compare composite sentiment gauges with the volume of new posts about an asset.',
    defs: [
      ['Crypto Fear and Greed', 'A composite gauge of cryptocurrency-market sentiment.'],
      ['Stocks Fear and Greed', 'A sentiment gauge for equity markets.'],
      ['Social Interactions Total', 'The catalog’s measure of new posts created about an asset.'],
    ],
    use: 'Compare changes in attention with crypto sentiment and the wider risk backdrop.',
    chart: ['gauge', 'Illustrative Fear and Greed gauge'],
  },
  {
    key: 'macro',
    title: 'Macro & liquidity',
    lead: 'Bring the monetary and financial backdrop into crypto analysis. Follow liquidity, dollar strength, interest rates and credit conditions alongside market data.',
    defs: [
      ['M2 Money Stock', 'A measure of U.S. money supply, including currency, deposits and other liquid money balances.'],
      ['U.S. Dollar Index', 'Dollar strength against a basket of major currencies.'],
      ['10-Year Treasury Yield', 'A benchmark for long-term U.S. government borrowing yields.'],
      ['High-Yield Credit Spread', 'The additional yield demanded on below-investment-grade U.S. corporate bonds relative to comparable Treasuries.'],
    ],
    use: 'Compare crypto-market conditions with changes in liquidity, rates and credit risk.',
    chart: ['macro', 'Illustrative U.S. Dollar Index and 10-Year Treasury Yield lines'],
  },
]

const MODELS = [
  {
    tag: 'ALPHRACTAL MODEL',
    title: 'CVDD Channel',
    text: 'Compare price with the original CVDD reference and Alphractal’s CVDD Model 2. The channel brings coin age and destroyed value into a long-term view of valuation and holder behavior.',
    tech: 'Inputs: Price USD · CVDD · CVDD Model 2.',
    href: `${ACADEMY}/metric/on-chain/cvdd`,
    linkLabel: 'Understand CVDD',
    chart: ['cvdd', 'Illustrative CVDD Channel: price, CVDD and CVDD Model 2'],
  },
  {
    tag: 'ALPHRACTAL PROPRIETARY',
    title: 'Repetition Fractal Cycle',
    text: 'Explore a proprietary timing model built around recurring patterns in Bitcoin’s market cycle. Use the chart to study structural repetition across cycle phases.',
    tech: 'Focus: Bitcoin cycle timing and recurring market structure.',
    href: `${ACADEMY}/metric/on-chain/repetition-fractal-cycle`,
    linkLabel: 'Understand the model',
    chart: ['fractal', 'Illustrative Repetition Fractal Cycle: earlier cycles under the current one'],
  },
  {
    title: 'Accumulation-Distribution Cycle Index',
    short: 'ADCI',
    text: 'Place Bitcoin’s market cycle on a 0–100 accumulation–distribution scale. Compare broader regime conditions with price behavior and holder activity.',
    tech: 'Scale: 0–100 · Focus: longer-term cycle context.',
    href: `${ACADEMY}/metric/on-chain/adci`,
    linkLabel: 'Understand ADCI',
    chart: ['adci', 'Illustrative ADCI line on a 0 to 100 scale'],
  },
  {
    title: 'Tactical Bull-Bear Sentiment Index',
    short: 'TBBI',
    text: 'Track bull–bear sentiment across different lookback windows. Compare more responsive tactical readings with the slower backdrop of the broader market cycle.',
    tech: 'Examples: 90-day and 116-day lookbacks · Scale: 0–100.',
    href: `${ACADEMY}/metric/on-chain/tbbi`,
    linkLabel: 'Understand TBBI',
    chart: ['tbbi', 'Illustrative TBBI in 90-day and 116-day lookback windows'],
  },
  {
    title: 'Structural Market Bands',
    text: 'Read structural support and resistance as zones interpolated between on-chain valuation anchors. Four bands define graduated support and resistance regions, with calibration informed by active, short-term holder and long-term holder realized prices.',
    tech: 'Outputs: upper and lower support bands · upper and lower resistance bands.',
    href: 'https://app.alphractal.com/cryptos/chart?category=Valuation+Models&subCategory=Valuation+Models&chart=Structural+Market+Bands&asset=btc&chartType=C024',
    linkLabel: 'Explore the chart',
    chart: ['bands', 'Illustrative Structural Market Bands: four bands with price between them'],
  },
  {
    title: 'Liquidation Levels',
    text: 'Explore estimated concentrations of leveraged positions at risk of liquidation. Heatmaps and zones help you study how liquidation exposure is distributed across price levels.',
    tech: 'Views: heatmap · price zones. Levels are statistical estimates, not a complete record of exchange positions.',
    href: `${ACADEMY}/metric/derivatives/liquidation-levels`,
    linkLabel: 'Understand liquidation levels',
    chart: ['heat', 'Illustrative liquidation levels heatmap with a price line'],
  },
]

const CHAINS = [
  ['Bitcoin', '/coins/btc.svg'],
  ['Ethereum', '/coins/eth.svg'],
  ['Cardano', '/coins/ada.svg'],
  ['Dogecoin', '/coins/doge.svg'],
  ['Litecoin', '/coins/ltc.svg'],
  ['Zcash', '/coins/zec.svg'],
]

const EXCHANGES = [
  ['Price & volume', 'Binance · Bybit · OKX · Coinbase · Kraken'],
  ['Derivatives & positioning', 'Binance · Bybit · OKX · Bitget · Deribit'],
  ['Liquidation levels', 'Binance · Bybit · OKX · Bitget · Kraken'],
  ['On-chain exchange flows', 'Binance · Bybit · OKX · Bitfinex · Bitstamp'],
]

const FAQ = [
  { q: 'Are the same metrics available for every asset?', a: 'No. Coverage varies by asset and data family. Check the available metrics for the asset you want to analyze.' },
  { q: 'How much historical data can I explore?', a: 'Historical depth varies by metric and asset. Access to historical data also depends on your plan.' },
  { q: 'Are all metrics proprietary to Alphractal?', a: 'No. The library combines established indicators with Alphractal-developed models and specialized chart implementations. Proprietary models are identified separately.' },
  { q: 'How often is the data updated?', a: 'Update frequency depends on the metric and its source. A chart’s time interval describes how data points are grouped; it does not mean every source publishes new data at that frequency.' },
  {
    q: 'Where can I learn the methodology or access the data programmatically?',
    a: (
      <>
        Explore <ExtLink className="faq__link" href={`${ACADEMY}/metrics`}>Alphractal Academy</ExtLink> for metric definitions and interpretation. For programmatic access, visit our{' '}
        <ExtLink className="faq__link" href="/platform/api">API</ExtLink> and <ExtLink className="faq__link" href="/platform/mcp">MCP</ExtLink> pages. Supported data and usage limits depend on the service and your{' '}
        <ExtLink className="faq__link" href="https://app.alphractal.com/plans">plan</ExtLink>.
      </>
    ),
  },
]


/* Opening: a dark field that reads as a liquidation-levels map (price levels by time, cluster rows in purple, yellow and
   red, a price line walking through, cursor light, parallax). Text and buttons sit directly on it. */
function Opening() {
  return (
    <section className="mx-hero" data-nav-theme="dark">
      <div className="mx-hero__bg" aria-hidden="true">
        <LiquidationField />
        <div className="mx-hero__veil" />
        <div className="mx-hero__fade" />
      </div>
      <div className="container mx-hero__inner">
        <p className="eyebrow mx-hero__eyebrow">METRICS &amp; MODELS</p>
        <h1 className="display mx-hero__title">Metrics designed to reveal market structure.</h1>
        <p className="mx-hero__sub">
          Explore 1,500+ metrics across on-chain, derivatives, sentiment and macro. Analyze cost basis, holder behavior, leverage and liquidity with established indicators and Alphractal-developed models.
        </p>
        <div className="mx-hero__actions">
          <GlowButton href={LINKS.start}>Start free</GlowButton>
          <a className="link-arrow mx-hero__more" href="#models">
            Browse the models <span>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* Ten families: compact tab index above one full-width panel. Every panel's text is in the HTML (inactive ones are `hidden`).
   The indicator slides; the panel fades in, its height is tweened, and its chart is drawn again (~0.6s) on every change. */
function Families() {
  const [open, setOpen] = useState(0)
  const list = useRef(null)
  const stage = useRef(null)
  const ind = useRef(null)
  const prevH = useRef(null)
  const tabs = useRef([])

  const place = () => {
    const t = tabs.current[open]
    const i = ind.current
    if (!t || !i) return
    i.style.transform = `translate(${t.offsetLeft}px, ${t.offsetTop}px)`
    i.style.width = `${t.offsetWidth}px`
    i.style.height = `${t.offsetHeight}px`
  }

  useLayoutEffect(() => {
    place()
    const st = stage.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prevH.current != null && st && !reduce) {
      const from = prevH.current
      const panel = st.querySelector('.mx-fam__panel:not([hidden])')
      gsap.killTweensOf([st, panel])
      gsap.fromTo(st, { height: from }, { height: 'auto', duration: 0.55, ease: 'power3.inOut', clearProps: 'height' })
      if (panel) gsap.fromTo(panel, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'all' })
    }
    prevH.current = null
  }, [open])

  useEffect(() => {
    const onResize = () => place()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  const select = (i, focus) => {
    if (i === open) return
    prevH.current = stage.current ? stage.current.offsetHeight : null
    setOpen(i)
    if (focus) tabs.current[i]?.focus()
  }

  const onKey = (e, i) => {
    const n = FAMILIES.length
    let j = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n
    else if (e.key === 'Home') j = 0
    else if (e.key === 'End') j = n - 1
    if (j != null) {
      e.preventDefault()
      select(j, true)
    }
  }

  return (
    <div className="mx-fam">
      <div className="mx-fam__tabs" role="tablist" aria-label="Metric families" ref={list}>
        <span className="mx-fam__ind" ref={ind} aria-hidden="true" />
        {FAMILIES.map((f, i) => (
          <button
            key={f.key}
            ref={(el) => (tabs.current[i] = el)}
            type="button"
            role="tab"
            id={`mx-tab-${f.key}`}
            aria-selected={open === i}
            aria-controls={`mx-panel-${f.key}`}
            tabIndex={open === i ? 0 : -1}
            className="mx-fam__tab"
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {f.title}
          </button>
        ))}
      </div>

      <div className="mx-fam__stage" ref={stage}>
        {FAMILIES.map((f, i) => (
          <div className="mx-fam__panel" key={f.key} id={`mx-panel-${f.key}`} role="tabpanel" aria-labelledby={`mx-tab-${f.key}`} hidden={open !== i}>
            <h3 className="mx-fam__title">{f.title}</h3>
            <p className="mx-fam__lead">{f.lead}</p>
            {open === i && <MetricChart kind={f.chart[0]} label={f.chart[1]} W={960} H={330} dur={0.9} zoom={2.2} />}
            <dl className="mx-fam__defs">
              {f.defs.map(([name, def]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{def}</dd>
                </div>
              ))}
            </dl>
            {f.note && <p className="mx-fam__note">{f.note}</p>}
            <p className="mx-fam__use">
              <b>Use case</b> {f.use}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Exchange table as thin ruled rows. Under motion, the rows start dim and light up one by one as they scroll into view. */
function ExchangeRows() {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const el = root.current
        el.classList.add('is-armed')
        const sts = [...el.querySelectorAll('tbody tr')].map((tr) => ScrollTrigger.create({ trigger: tr, start: 'top 86%', onEnter: () => tr.classList.add('is-lit') }))
        return () => {
          sts.forEach((s) => s.kill())
          el.classList.remove('is-armed')
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )
  return (
    <table className="mx-ex" ref={root}>
      <thead>
        <tr>
          <th scope="col">Data family</th>
          <th scope="col">Exchange examples</th>
        </tr>
      </thead>
      <tbody>
        {EXCHANGES.map(([family, ex]) => (
          <tr key={family}>
            <th scope="row">{family}</th>
            <td>{ex}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Metrics() {
  useMeta({
    title: 'Crypto Metrics & Models: On-Chain, Derivatives & Macro | Alphractal',
    description: 'Explore on-chain, derivatives, sentiment and macro data, Alphractal models, and blockchain and exchange coverage in one analytics platform.',
  })

  return (
    <PageShell>
      <Opening />

      <PBlock
        id="families"
        className="mx-block"
        title="Explore the structure behind the market."
        intro="Follow the question from network activity to valuation, holder behavior, derivatives positioning and macro conditions. Each family brings a different part of the market into view."
      >
        <Families />
      </PBlock>

      <PBlock
        id="models"
        className="mx-block"
        eyebrow="ALPHRACTAL MODELS"
        title="From market data to analytical models."
        intro="Explore models for valuation, cycle structure and leveraged positioning. Understand what each chart measures and how it fits into a broader market analysis."
      >
        <div className="mx-models">
          {MODELS.map((m) => (
            <article className="mx-model" key={m.title}>
              <div className="mx-model__media">
                <MetricChart kind={m.chart[0]} label={m.chart[1]} W={640} H={330} dur={2.6} zoom={2.4} />
              </div>
              <div className="mx-model__body">
                {m.tag && <p className="ptag">{m.tag}</p>}
                <h3>
                  {m.title}
                  {m.short && <span className="mx-model__short"> · {m.short}</span>}
                </h3>
                <p>{m.text}</p>
                <p className="mx-model__tech">{m.tech}</p>
                <ExtLink className="link-arrow mx-model__link" href={m.href}>
                  {m.linkLabel} <span>→</span>
                </ExtLink>
              </div>
            </article>
          ))}
        </div>
        <div className="mx-links">
          <ExtLink className="btn btn--ink" href={LINKS.start}>
            Explore the models
          </ExtLink>
          <ExtLink className="link-arrow" href={`${ACADEMY}/metrics`}>
            Learn how to read the metrics in Alphractal Academy. <span>→</span>
          </ExtLink>
        </div>
      </PBlock>

      <PBlock
        id="coverage"
        className="mx-block"
        title="Go beyond Bitcoin. Explore the coverage behind each metric."
        intro="Explore blockchain data alongside exchange activity and macro context. Available metrics, history and resolution vary by asset and data family."
      >
        <div className="mx-cov">
          <div className="mx-cov__block">
            <h3>Blockchain data</h3>
            <p>Explore on-chain data for Bitcoin, Ethereum, Cardano, Dogecoin, Litecoin and Zcash, among other supported networks.</p>
            <ul className="mx-chains">
              {CHAINS.map(([name, logo]) => (
                <li key={name}>
                  <img src={logo} alt="" width="22" height="22" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-cov__block">
            <h3>Exchange data</h3>
            <p>Coverage depends on the data family. Examples include:</p>
            <ExchangeRows />
          </div>
        </div>
        <div className="mx-links">
          <ExtLink className="link-arrow" href="https://docs.alphractal.com/data/assets">
            View asset coverage <span>→</span>
          </ExtLink>
          <ExtLink className="link-arrow" href="https://docs.alphractal.com/data/exchanges">
            View exchange coverage <span>→</span>
          </ExtLink>
        </div>
      </PBlock>

      <ProductFaq title="Questions about the data" items={FAQ} />

      <FinalCta
        title={['Start with the free plan.']}
        sub="Explore the platform and find the metrics behind your next question."
        primary="Start free"
        primaryHref={LINKS.start}
        secondary="View plans"
        secondaryTo="https://app.alphractal.com/plans"
      />
    </PageShell>
  )
}
