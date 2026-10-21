import { useMemo } from 'react'
import { series, toPath } from '../../lib/chart.js'
import AppFrame from './AppFrame.jsx'

/*
 * Research hero: a page of the app in the same layout as the real Metrics overview — asset
 * header, side navigation, a headline chart panel, then question-and-answer rows each with a
 * small chart. Every number is a placeholder shape, labelled illustrative.
 */
const COPY = {
  en: {
    asset: 'Bitcoin',
    stats: ['Current price', 'Market cap', 'Volume 24h', '7D change'],
    values: ['$ — — —', '$ — — —', '$ — — —', '— —%'],
    nav: 'Research',
    search: 'Search reports',
    tabs: ['Reports', 'Academy'],
    cats: ['Latest', 'On-chain', 'Derivatives', 'Macro', 'Sentiment', 'Cycle'],
    head: 'This week’s report',
    ask: 'Explain this report',
    panelTitle: 'Funding turns while leverage builds',
    panelSub: 'Chapter 2 of 5 · charts update as you read',
    live: 'LIVE CHART',
    version: 'V3 · UPDATED',
    rows: [
      { q: 'How is leveraged positioning changing?', a: 'Open interest and funding, read together.', link: 'Open the chart' },
      { q: 'Where is liquidation exposure concentrated?', a: 'Both sides of price, with the estimate labelled.', link: 'Open the chart' },
    ],
    narration: 'Narration',
    chapter: 'Chapter 2',
    illustrative: 'Illustrative report',
  },
}

export default function ResearchApp() {
  const c = COPY.en
  const paths = useMemo(
    () => ({
      main: toPath(series(70, 41, { drift: 0.004, vol: 0.12, start: 0.35 }), 760, 150, 10),
      a: toPath(series(48, 12, { drift: 0.002, vol: 0.14, start: 0.5 }), 300, 70, 6),
      b: toPath(series(48, 27, { drift: -0.001, vol: 0.12, start: 0.55 }), 300, 70, 6),
    }),
    [],
  )
  const bars = useMemo(() => series(34, 5, { drift: 0, vol: 0.5, start: 0.5 }), [])

  return (
    <AppFrame url="app.alphractal.com/research" className="appframe--app">
      <div className="rs">
        <div className="rs__top">
          <span className="rs__coin" aria-hidden="true">
            ₿
          </span>
          <strong>{c.asset}</strong>
          <em className="mono">(BTC)</em>
          {c.stats.map((label, i) => (
            <span className="rs__stat" key={label}>
              <small className="mono">{label}</small>
              <b>{c.values[i]}</b>
            </span>
          ))}
          <span className="rs__tag mono">{c.illustrative}</span>
        </div>

        <div className="rs__body">
          <aside className="rs__side" aria-hidden="true">
            <p className="rs__nav">← {c.nav}</p>
            <p className="rs__search mono">{c.search}</p>
            <p className="rs__tabs">
              <b>{c.tabs[0]}</b>
              <span>{c.tabs[1]}</span>
            </p>
            <ul>
              {c.cats.map((cat, i) => (
                <li key={cat} className={i === 0 ? 'is-on' : ''}>
                  {cat}
                </li>
              ))}
            </ul>
          </aside>

          <div className="rs__main">
            <div className="rs__head">
              <strong>{c.head}</strong>
              <span className="mono">✦ {c.ask}</span>
            </div>

            <div className="rs__panel">
              <div className="rs__panelhead">
                <div>
                  <b>{c.panelTitle}</b>
                  <small>{c.panelSub}</small>
                </div>
                <span className="rs__ver mono">{c.version}</span>
              </div>
              <svg viewBox="0 0 760 150" preserveAspectRatio="none" className="rs__chart" aria-hidden="true">
                <line x1="0" x2="760" y1="75" y2="75" className="rs__guide" />
                <path d={paths.main} className="rs__line" pathLength="1" />
              </svg>
              <span className="rs__live mono">
                <i /> {c.live}
              </span>
            </div>

            {c.rows.map((r, i) => (
              <div className="rs__row" key={r.q}>
                <div>
                  <b>{r.q}</b>
                  <small>{r.a}</small>
                  <span className="rs__link">{r.link} ↗</span>
                </div>
                <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="rs__mini" aria-hidden="true">
                  <path d={i === 0 ? paths.a : paths.b} className={i === 0 ? 'rs__line rs__line--red' : 'rs__line rs__line--green'} pathLength="1" />
                  {i === 1 && bars.slice(0, 28).map((v, k) => <rect key={k} x={k * 10.7} y={70 - v * 22} width="7" height={v * 22} className="rs__bar" />)}
                </svg>
              </div>
            ))}

            <div className="rs__play mono">
              <span>▶ {c.narration}</span>
              <em>
                <i />
              </em>
              <span>{c.chapter}</span>
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  )
}
