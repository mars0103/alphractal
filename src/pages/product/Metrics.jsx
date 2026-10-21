import { useState } from 'react'
import { useMeta } from '../../hooks/useMeta.js'
import { LINKS } from '../../lib/facts.js'
import PageShell from '../../components/PageShell.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { Cards, ExtLink, PBlock, ProductFaq, ProductHero, Shot } from '../../components/ProductBlocks.jsx'

/* /platform/metrics — five sections: opening, ten families, six models, coverage, FAQ + closing CTA.
   Copy: Textos/Metrics.md. Captures: real ones where the project already has them, named placeholders elsewhere. */

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
    shot: { name: 'Active Addresses chart', src: '/metrics/active-addresses.webp', alt: 'Bitcoin Active Addresses chart from the Alphractal platform' },
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
    shot: { name: 'MVRV chart', src: '/metrics/mvrv.webp', alt: 'Bitcoin MVRV chart from the Alphractal platform' },
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
    shot: { name: 'Supply in Profit chart', src: '/metrics/supply-in-profit.webp', alt: 'Bitcoin Supply in Profit chart from the Alphractal platform' },
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
    shot: { name: 'SOPR chart', src: '/metrics/sopr.webp', alt: 'Bitcoin Spent Output Profit Ratio (SOPR) chart from the Alphractal platform' },
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
    shot: { name: 'Exchange Netflow chart', src: '/metrics/exchange-netflow.webp', alt: 'Bitcoin Exchange Netflow chart from the Alphractal platform' },
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
    shot: { name: 'Open Interest chart', src: '/metrics/open-interest.webp', alt: 'Bitcoin Open Interest chart from the Alphractal platform' },
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
    shot: { name: 'Liquidation Heatmap', src: '/metrics/liquidation.webp', alt: 'Liquidation Levels heatmap from the Alphractal platform' },
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
    shot: { name: 'ADCI chart', src: '/metrics/adci.webp', alt: 'Bitcoin Accumulation-Distribution Cycle Index chart from the Alphractal platform' },
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
    shot: { name: 'Crypto Fear and Greed chart', src: '/metrics/fear-greed.webp', alt: 'Crypto Fear and Greed chart from the Alphractal platform' },
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
    shot: { name: 'U.S. Dollar Index chart', src: '/metrics/dxy.webp', alt: 'U.S. Dollar Index versus Bitcoin price chart from the Alphractal platform' },
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
    shot: { name: 'CVDD Channel chart', src: '/metrics/cvdd-channel.webp', alt: 'CVDD Channel chart from the Alphractal platform' },
  },
  {
    tag: 'ALPHRACTAL PROPRIETARY',
    title: 'Repetition Fractal Cycle',
    text: 'Explore a proprietary timing model built around recurring patterns in Bitcoin’s market cycle. Use the chart to study structural repetition across cycle phases.',
    tech: 'Focus: Bitcoin cycle timing and recurring market structure.',
    href: `${ACADEMY}/metric/on-chain/repetition-fractal-cycle`,
    linkLabel: 'Understand the model',
    shot: { name: 'Repetition Fractal Cycle chart', src: '/metrics/fractal-cycle.webp', alt: 'Repetition Fractal Cycle chart from the Alphractal platform' },
  },
  {
    title: 'Accumulation-Distribution Cycle Index',
    short: 'ADCI',
    text: 'Place Bitcoin’s market cycle on a 0–100 accumulation–distribution scale. Compare broader regime conditions with price behavior and holder activity.',
    tech: 'Scale: 0–100 · Focus: longer-term cycle context.',
    href: `${ACADEMY}/metric/on-chain/adci`,
    linkLabel: 'Understand ADCI',
    shot: { name: 'ADCI chart', src: '/metrics/adci.webp', alt: 'Bitcoin Accumulation-Distribution Cycle Index chart from the Alphractal platform' },
  },
  {
    title: 'Tactical Bull-Bear Sentiment Index',
    short: 'TBBI',
    text: 'Track bull–bear sentiment across different lookback windows. Compare more responsive tactical readings with the slower backdrop of the broader market cycle.',
    tech: 'Examples: 90-day and 116-day lookbacks · Scale: 0–100.',
    href: `${ACADEMY}/metric/on-chain/tbbi`,
    linkLabel: 'Understand TBBI',
    shot: { name: 'TBBI chart', src: '/metrics/tbbi.webp', alt: 'Bitcoin Tactical Bull-Bear Sentiment Index chart, 116-day window, from the Alphractal platform' },
  },
  {
    title: 'Structural Market Bands',
    text: 'Read structural support and resistance as zones interpolated between on-chain valuation anchors. Four bands define graduated support and resistance regions, with calibration informed by active, short-term holder and long-term holder realized prices.',
    tech: 'Outputs: upper and lower support bands · upper and lower resistance bands.',
    href: 'https://app.alphractal.com/cryptos/chart?category=Valuation+Models&subCategory=Valuation+Models&chart=Structural+Market+Bands&asset=btc&chartType=C024',
    linkLabel: 'Explore the chart',
    shot: { name: 'Structural Market Bands chart', src: '/metrics/structural-market-bands.webp', alt: 'Bitcoin Structural Market Bands chart from the Alphractal platform' },
  },
  {
    title: 'Liquidation Levels',
    text: 'Explore estimated concentrations of leveraged positions at risk of liquidation. Heatmaps and zones help you study how liquidation exposure is distributed across price levels.',
    tech: 'Views: heatmap · price zones. Levels are statistical estimates, not a complete record of exchange positions.',
    href: `${ACADEMY}/metric/derivatives/liquidation-levels`,
    linkLabel: 'Understand liquidation levels',
    shot: { name: 'Liquidation Levels heatmap', src: '/metrics/liquidation.webp', alt: 'Liquidation Levels heatmap from the Alphractal platform' },
  },
]

const CHAINS = [
  ['Bitcoin', '/coins/btc.svg'],
  ['Ethereum', '/coins/eth.svg'],
  ['Cardano', '/coins/ada.svg'],
  ['Dogecoin', '/coins/doge.svg'],
  ['Litecoin', null],
  ['Zcash', null],
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

/* The ten families: index on the left, the open family on the right (desktop); the same markup folds into an accordion on phones.
   Every panel is in the HTML; only the active one is shown. */
function Families() {
  const [open, setOpen] = useState(0)
  return (
    <ul className="fam">
      {FAMILIES.map((f, i) => (
        <li className="fam__item" key={f.key}>
          <button type="button" className="fam__tab" aria-expanded={open === i} aria-controls={`fam-${f.key}`} id={`fam-tab-${f.key}`} onClick={() => setOpen(i)}>
            <b>{String(i + 1).padStart(2, '0')}</b>
            {f.title}
          </button>
          <div className="fam__panel" id={`fam-${f.key}`} role="region" aria-labelledby={`fam-tab-${f.key}`} hidden={open !== i}>
            <p className="fam__lead">{f.lead}</p>
            <dl className="fam__defs">
              {f.defs.map(([name, def]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{def}</dd>
                </div>
              ))}
            </dl>
            {f.note && <p className="fam__note">{f.note}</p>}
            <p className="fam__use">
              <b>Use case</b> {f.use}
            </p>
            <Shot {...f.shot} ratio="16 / 7" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Metrics() {
  useMeta({
    title: 'Crypto Metrics & Models: On-Chain, Derivatives & Macro | Alphractal',
    description: 'Explore on-chain, derivatives, sentiment and macro data, Alphractal models, and blockchain and exchange coverage in one analytics platform.',
  })

  const visual = (
    <div className="quad">
      <Shot name="ON-CHAIN" src="/metrics/cvdd-channel.webp" alt="On-chain chart from the Alphractal platform" ratio="16 / 10" caption="On-chain" />
      <Shot name="DERIVATIVES" src="/metrics/liquidation.webp" alt="Derivatives chart from the Alphractal platform" ratio="16 / 10" caption="Derivatives" />
      <Shot name="SENTIMENT" src="/metrics/fear-greed.webp" alt="Sentiment chart from the Alphractal platform" ratio="16 / 10" caption="Sentiment" />
      <Shot name="MACROECONOMY" src="/metrics/dxy.webp" alt="Macro chart from the Alphractal platform" ratio="16 / 10" caption="Macroeconomy" />
    </div>
  )

  return (
    <PageShell>
      <ProductHero
        current="metrics"
        eyebrow="METRICS & MODELS"
        title="Metrics designed to reveal market structure."
        sub="Explore 1,500+ metrics across on-chain, derivatives, sentiment and macro. Analyze cost basis, holder behavior, leverage and liquidity with established indicators and Alphractal-developed models."
        primary={{ label: 'Start free', href: LINKS.start }}
        secondary={{ label: 'Browse the models', href: '#models' }}
        visual={visual}
      />

      <PBlock
        id="families"
        eyebrow="THE FAMILIES"
        title="Explore the structure behind the market."
        intro="Follow the question from network activity to valuation, holder behavior, derivatives positioning and macro conditions. Each family brings a different part of the market into view."
      >
        <Families />
      </PBlock>

      <PBlock
        id="models"
        eyebrow="ALPHRACTAL MODELS"
        title="From market data to analytical models."
        intro="Explore models for valuation, cycle structure and leveraged positioning. Understand what each chart measures and how it fits into a broader market analysis."
      >
        <Cards
          cols={2}
          items={MODELS.map((m) => ({ ...m, media: <Shot {...m.shot} ratio="16 / 8" /> }))}
        />
        <div className="cov__links">
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
        eyebrow="COVERAGE"
        title="Go beyond Bitcoin. Explore the coverage behind each metric."
        intro="Explore blockchain data alongside exchange activity and macro context. Available metrics, history and resolution vary by asset and data family."
      >
        <div className="cov">
          <div>
            <h3>Blockchain data</h3>
            <p>Explore on-chain data for Bitcoin, Ethereum, Cardano, Dogecoin, Litecoin and Zcash, among other supported networks.</p>
            <ul className="chains">
              {CHAINS.map(([name, logo]) => (
                <li key={name}>
                  {logo ? <img src={logo} alt="" width="20" height="20" /> : <i aria-hidden="true" />}
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <div className="ptable-wrap">
            <table className="ptable">
              <caption>Exchange data</caption>
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
            <p className="fam__note" style={{ marginTop: 12 }}>
              Coverage depends on the data family. Examples include the exchanges above.
            </p>
          </div>
        </div>
        <div className="cov__links">
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
