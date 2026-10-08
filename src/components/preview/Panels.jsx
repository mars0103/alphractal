import { ASSETS, SCREEN, MACRO, SENTIMENT } from '../../lib/preview-data.js'
import Icon from './Icon.jsx'

// Bullish/neutral/bearish and screener signals → the shared .up/.flat/.down color classes (see styles/preview.css).
const SIGNAL_TONE = { bullish: 'up', neutral: 'flat', bearish: 'down' }
const SCREEN_SIGNAL_TONE = { strongBuy: 'up', buy: 'up', neutral: 'flat', sell: 'down' }
const toneOf = (chg) => (chg > 0 ? 'up' : chg < 0 ? 'down' : 'flat')
const sign = (n) => (n > 0 ? '+' : '')

function Spark({ points }) {
  const w = 64
  const h = 20
  const d = points.map((v, i) => `${(i * w) / (points.length - 1)},${h - (v / 100) * (h - 2) - 1}`).join(' ')
  return (
    <svg className="pv-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={d} pathLength="1" data-draw />
    </svg>
  )
}

function Coin({ sym }) {
  return <img className="pv-coin" src={`/coins/${sym.toLowerCase()}.svg`} alt="" width="22" height="22" loading="lazy" />
}

export function CryptosPanel({ p, loc }) {
  const c = p.cryptos
  return (
    <div data-in>
      <div className="pv-head">
        <h3 className="pv-title">{c.title}</h3>
        <div className="pv-head__r">
          <span className="pv-badge">{c.badge}</span>
          {c.filters.map((f, i) => (
            <span className="pv-chip" data-on={i === 0} key={f}>
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="pv-tablewrap">
        <table className="pv-table">
          <thead>
            <tr>
              <th>{c.cols.asset}</th>
              <th>{c.cols.price}</th>
              <th className="c2">{c.cols.mcap}</th>
              <th className="c2">{c.cols.vol}</th>
              <th className="c3">{c.cols.realized}</th>
              <th className="c3">{c.cols.addr}</th>
              <th className="c4">{c.cols.oi}</th>
              <th className="c4">{c.cols.liq}</th>
              <th>{c.cols.signal}</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.sym}>
                <td>
                  <span className="pv-asset">
                    <Coin sym={a.sym} />
                    <span>
                      <b>{a.sym}</b>
                      <span>{a.name}</span>
                    </span>
                  </span>
                </td>
                <td>
                  {loc(a.price)}
                  <br />
                  <small className={toneOf(a.chg)}>
                    {sign(a.chg)}
                    {a.chg}%
                  </small>
                </td>
                <td className="c2">{loc(a.mcap)}</td>
                <td className="c2">{loc(a.vol)}</td>
                <td className="c3">{loc(a.realized)}</td>
                <td className="c3">
                  {loc(a.addr)}
                  <br />
                  <small className={toneOf(a.addrD)}>
                    {sign(a.addrD)}
                    {a.addrD}%
                  </small>
                </td>
                <td className="c4">
                  {loc(a.oi)}
                  <br />
                  <small className={toneOf(a.oiD)}>
                    {sign(a.oiD)}
                    {a.oiD}%
                  </small>
                </td>
                <td className="c4">{loc(a.liq)}</td>
                <td>
                  <span className={`pv-sig ${SIGNAL_TONE[a.signal]}`}>{c.signals[a.signal]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AiPanel({ p }) {
  const a = p.ai
  return (
    <div className="pv-ai">
      <div className="pv-ai__head">
        <span className="pv-ai__ico">
          <Icon name="network" />
        </span>
        <div>
          <div className="pv-ai__name">{a.name}</div>
          <div className="pv-ai__status">{a.status}</div>
        </div>
        <div className="pv-head__r">
          <span className="pv-mode">{a.modes[0]}</span>
          <span className="pv-mode" data-k="1">
            {a.modes[1]}
          </span>
        </div>
      </div>
      <div className="pv-ai__body">
        <p className="pv-bubble pv-bubble--user" data-in>
          {a.user}
        </p>
        <p className="pv-bubble pv-bubble--ai" data-in>
          {a.lead[0]}
          <strong>{a.lead[1]}</strong>
          {a.lead[2]}
        </p>
        <div className="pv-rows" data-in>
          {a.rows.map((r) => (
            <div className="pv-row" key={r.label}>
              <span>{r.label}</span>
              <b className={r.tone}>{r.text}</b>
            </div>
          ))}
        </div>
        <div className="pv-cites" data-in>
          {a.cites.map((c) => (
            <span className="pv-chip" data-on="true" key={c}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="pv-ai__input">
        <Icon name="search" />
        {a.placeholder}
        <span className="pv-send">
          <Icon name="send" />
        </span>
      </div>
    </div>
  )
}

export function ScreenersPanel({ p, loc, num }) {
  const s = p.screeners
  return (
    <div data-in>
      <div className="pv-head">
        <h3 className="pv-title">{s.title}</h3>
        <div className="pv-head__r">
          <span className="pv-badge">
            {SCREEN.length} {s.ranked}
          </span>
          {s.filters.map((f, i) => (
            <span className="pv-chip" data-on={i === 0} key={f}>
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="pv-tablewrap">
        <table className="pv-table">
          <thead>
            <tr>
              <th>{s.cols.asset}</th>
              <th>{s.cols.price}</th>
              <th className="c2">{s.cols.rsi}</th>
              <th className="c2">{s.cols.macd}</th>
              <th className="c3">{s.cols.funding}</th>
              <th>{s.cols.signal}</th>
              <th className="c4">{s.cols.strength}</th>
            </tr>
          </thead>
          <tbody>
            {SCREEN.map((row) => (
              <tr key={row.sym}>
                <td>
                  <span className="pv-asset">
                    <Coin sym={row.sym} />
                    <span>
                      <b>{row.sym}</b>
                      <span>{row.name}</span>
                    </span>
                  </span>
                </td>
                <td>
                  {loc(row.price)}
                  <br />
                  <small className={toneOf(row.chg)}>
                    {sign(row.chg)}
                    {row.chg}%
                  </small>
                </td>
                <td className="c2">{num(row.rsi)}</td>
                <td className="c2">
                  <span className={row.macd === 'buy' ? 'up' : row.macd === 'sell' ? 'down' : 'flat'}>{s.macd[row.macd]}</span>
                </td>
                <td className="c3">{row.funding}</td>
                <td>
                  <span className={`pv-sig ${SCREEN_SIGNAL_TONE[row.signal]}`}>{s.signals[row.signal]}</span>
                </td>
                <td className="c4">
                  <span className="pv-track">
                    <i style={{ transform: `scaleX(${row.strength / 100})` }} />
                  </span>{' '}
                  {num(row.strength)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AlertsPanel({ p }) {
  const a = p.alerts
  const triggeredCount = a.items.filter((i) => i.st === 'triggered').length
  return (
    <div data-in>
      <div className="pv-head">
        <h3 className="pv-title">{a.title}</h3>
        <div className="pv-head__r">
          <span className="pv-badge">
            {triggeredCount} {a.triggered}
          </span>
        </div>
      </div>
      <div className="pv-tabs2">
        {a.tabs.map((tTab, i) => (
          <span data-on={i === 0} key={tTab}>
            {tTab}
          </span>
        ))}
      </div>
      <div className="pv-alerts">
        {a.items.map((item, i) => (
          <div className="pv-alert" key={i}>
            <span className="pv-dot" data-st={item.st} />
            <span>
              <span className="pv-alert__t">
                <b>{item.sym}</b>
                {item.text}
              </span>
              <br />
              <span className="pv-alert__m">
                {item.kind} · {item.ch.join(', ')}
              </span>
            </span>
            <span className="pv-alert__w" data-st={item.st}>
              {item.st === 'watching' ? a.watching : item.when}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ResearchPanel({ p }) {
  const r = p.research
  return (
    <div data-in>
      <div className="pv-head">
        <h3 className="pv-title">{r.title}</h3>
        <div className="pv-head__r">
          {r.filters.map((f, i) => (
            <span className="pv-chip" data-on={i === 0} key={f}>
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="pv-reports">
        {r.items.map((item) => {
          const free = item.tier === 'Free' || item.tier === 'Grátis'
          return (
            <div className="pv-report" key={item.title}>
              <div>
                <h4>{item.title}</h4>
                <div className="pv-report__meta">
                  <span>{item.kind}</span>
                  <span>
                    {item.mins} {r.read}
                  </span>
                  <span>{item.tags.join(', ')}</span>
                </div>
              </div>
              <span className="pv-tier" data-free={free}>
                {item.tier}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MacroPanel({ p, loc, num }) {
  const m = p.macro
  return (
    <div data-in>
      <div className="pv-head">
        <h3 className="pv-title">{m.title}</h3>
        <div className="pv-head__r">
          <span className="pv-badge">{m.badge}</span>
          <span className="pv-chip">
            {MACRO.length} {m.panels}
          </span>
          {m.filters.map((f, i) => (
            <span className="pv-chip" data-on={i === 0} key={f}>
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="pv-tablewrap">
        <table className="pv-table">
          <thead>
            <tr>
              <th>{m.cols.name}</th>
              <th>{m.cols.last}</th>
              <th className="c2">{m.cols.prev}</th>
              <th>{m.cols.chg}</th>
              <th className="c3">{m.cols.d30}</th>
              <th className="c3">{m.cols.ytd}</th>
              <th className="c4">{m.cols.trend}</th>
            </tr>
          </thead>
          <tbody>
            {m.rows.map((row, i) => {
              const d = MACRO[i]
              return (
                <tr key={row.name}>
                  <td>
                    <span className="pv-asset">
                      <span>
                        <b>{row.name}</b>
                        <span>{row.type}</span>
                      </span>
                    </span>
                  </td>
                  <td>{loc(d.last)}</td>
                  <td className="c2">{loc(d.prev)}</td>
                  <td className={d.chg.startsWith('-') ? 'down' : 'up'}>{loc(d.chg)}</td>
                  <td className={`c3 ${d.d30.startsWith('-') ? 'down' : 'up'}`}>{loc(d.d30)}</td>
                  <td className={`c3 ${d.ytd.startsWith('-') ? 'down' : 'up'}`}>{loc(d.ytd)}</td>
                  <td className="c4">
                    <Spark points={d.spark} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SentimentPanel({ p, loc }) {
  const s = p.sentiment
  const d = SENTIMENT
  return (
    <div className="pv-sent" data-in>
      <div className="pv-sent__a">
        <div>
          <h3 className="pv-title">{s.title}</h3>
          <p className="pv-sub">{s.snapshot}</p>
        </div>
        <div className="pv-gaugebox">
          <span className="pv-gauge">
            <svg viewBox="0 0 160 92" aria-hidden="true">
              <defs>
                <linearGradient id="pv-gauge-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--red)" />
                  <stop offset="50%" stopColor="#e8b13a" />
                  <stop offset="100%" stopColor="var(--green)" />
                </linearGradient>
              </defs>
              <path className="pv-gauge__track" d="M 12 84 A 68 68 0 0 1 148 84" />
              <path className="pv-gauge__fill" d="M 12 84 A 68 68 0 0 1 148 84" pathLength="100" data-gauge={d.gauge} style={{ strokeDasharray: `${d.gauge} 100` }} />
            </svg>
            <span className="pv-gauge__read">
              <span className="display">{d.gauge}</span>
              <span className="mono">{s.gauge}</span>
            </span>
          </span>
          <div className="pv-stats">
            {d.stats.map((st) => (
              <div className="pv-stat" key={st.key}>
                <span>{s.stats[st.key]}</span>
                <b>
                  {loc(st.value)} <em className={st.up ? 'up' : 'down'}>{st.delta}</em>
                </b>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="pv-sub">{s.social}</p>
          {d.social.map((row) => (
            <div className="pv-social__row" key={row.sym}>
              <span>{row.sym}</span>
              <span className="pv-split">
                <i style={{ transform: `scaleX(${row.bull / 100})` }} />
              </span>
              <b>{row.bull}%</b>
            </div>
          ))}
        </div>
      </div>
      <div className="pv-sent__b">
        <div className="pv-liq">
          <p className="pv-sub">{s.liq}</p>
          <div className="pv-liq__row">
            <div>
              <div className="pv-liq__labels">
                <span>
                  {s.longs} {d.liq.longPct}%
                </span>
                <span>{s.shorts}</span>
              </div>
              <span className="pv-split pv-split--thick">
                <i style={{ transform: `scaleX(${d.liq.longPct / 100})` }} />
              </span>
            </div>
            <div className="pv-liq__total">
              <b>{loc(d.liq.total)}</b>
              <span>
                {loc(d.liq.longs)} / {loc(d.liq.shorts)}
              </span>
            </div>
          </div>
        </div>
        <div className="pv-venues">
          {d.venues.map((v) => (
            <div className="pv-venue" key={v.name}>
              <span>{v.name}</span>
              <b>{v.ratio}</b>
              <em>{v.longs} {s.long}</em>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
