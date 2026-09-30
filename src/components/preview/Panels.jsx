import { ASSETS, SCREEN, MACRO, SENTIMENT } from '../../lib/preview-data.js'
import { FACTS } from '../../lib/facts.js'
import Icon from './Icon.jsx'

/* The seven screens of the interface preview. Every animated piece is marked so AppPreview can play it on entry:
   data-in (rise + fade), data-bar (scaleX), data-draw (stroke draw), data-gauge (arc fill). */

const pct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`
const sign = (n) => (n > 0 ? 'up' : n < 0 ? 'down' : 'flat')
const signStr = (s) => (s.startsWith('-') ? 'down' : 'up')

function Head({ title, children }) {
  return (
    <div className="pv-head" data-in>
      <h3 className="pv-title">{title}</h3>
      {children && <div className="pv-head__r">{children}</div>}
    </div>
  )
}

function Chips({ items }) {
  return items.map((c, i) => (
    <span key={c} className="pv-chip" data-on={i === 0}>
      {c}
    </span>
  ))
}

const Coin = ({ sym }) => <img className="pv-coin" src={`/coins/${sym.toLowerCase()}.svg`} alt="" width="22" height="22" loading="lazy" />

export function CryptosPanel({ p, loc }) {
  const c = p.cryptos
  return (
    <>
      <Head title={c.title}>
        <span className="pv-badge">{c.badge}</span>
        <Chips items={c.filters} />
      </Head>
      <div className="pv-tablewrap" data-in>
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
              <th className="c4">{c.cols.signal}</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.sym} data-in>
                <td>
                  <div className="pv-asset">
                    <Coin sym={a.sym} />
                    <div>
                      <b>{a.name}</b>
                      <span>{a.sym}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {loc(a.price)}
                  <small className={sign(a.chg)}>{loc(pct(a.chg))}</small>
                </td>
                <td className="c2">{loc(a.mcap)}</td>
                <td className="c2">{loc(a.vol)}</td>
                <td className="c3">{loc(a.realized)}</td>
                <td className="c3">
                  {loc(a.addr)}
                  <small className={sign(a.addrD)}>{loc(pct(a.addrD))}</small>
                </td>
                <td className="c4">
                  {loc(a.oi)}
                  <small className={sign(a.oiD)}>{loc(pct(a.oiD))}</small>
                </td>
                <td className="c4">{loc(a.liq)}</td>
                <td className="c4">
                  <span className={`pv-sig ${a.signal === 'bullish' ? 'up' : a.signal === 'bearish' ? 'down' : 'flat'}`}>
                    {c.signals[a.signal]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AiPanel({ p }) {
  const a = p.ai
  return (
    <div className="pv-ai">
      <div className="pv-ai__head" data-in>
        <span className="pv-ai__ico">
          <Icon name="network" />
        </span>
        <div>
          <p className="pv-ai__name">{a.name}</p>
          <p className="pv-ai__status">{a.status}</p>
        </div>
        <div className="pv-head__r">
          {a.modes.map((m, i) => (
            <span key={m} className="pv-mode" data-k={i}>
              {m}
            </span>
          ))}
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
        <div className="pv-rows">
          {a.rows.map((r) => (
            <div key={r.label} className="pv-row" data-in>
              <span>{r.label}</span>
              <b className={r.tone === 'up' ? 'up' : 'flat'}>{r.text}</b>
            </div>
          ))}
        </div>
        <div className="pv-cites" data-in>
          {a.cites.map((c) => (
            <span key={c} className="pill">
              {c}
            </span>
          ))}
        </div>
        <div className="pv-typing" data-in aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="pv-ai__input" data-in>
        <span>{a.placeholder}</span>
        <span className="pv-send" aria-label={a.send}>
          <Icon name="send" />
        </span>
      </div>
    </div>
  )
}

const SIGNAL_TONE = { strongBuy: 'up', buy: 'up', neutral: 'flat', sell: 'down' }
const MACD_TONE = { buy: 'up', neutral: 'flat', sell: 'down' }

export function ScreenersPanel({ p, loc, num }) {
  const s = p.screeners
  return (
    <>
      <Head title={s.title}>
        <span className="pv-badge">
          {num(FACTS.assetsPaid)}+ {s.ranked}
        </span>
        <Chips items={s.filters} />
      </Head>
      <div className="pv-tablewrap" data-in>
        <table className="pv-table">
          <thead>
            <tr>
              <th>{s.cols.asset}</th>
              <th>{s.cols.price}</th>
              <th className="c2">{s.cols.rsi}</th>
              <th className="c2">{s.cols.macd}</th>
              <th className="c3">{s.cols.funding}</th>
              <th>{s.cols.signal}</th>
              <th className="c3">{s.cols.strength}</th>
            </tr>
          </thead>
          <tbody>
            {SCREEN.map((r) => (
              <tr key={r.sym} data-in>
                <td>
                  <div className="pv-asset">
                    <Coin sym={r.sym} />
                    <div>
                      <b>{r.name}</b>
                      <span>{r.sym}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {loc(r.price)}
                  <small className={sign(r.chg)}>{loc(pct(r.chg))}</small>
                </td>
                <td className="c2">{r.rsi}</td>
                <td className="c2">
                  <span className={`pv-sig ${MACD_TONE[r.macd]}`}>{s.macd[r.macd]}</span>
                </td>
                <td className="c3">{loc(r.funding)}</td>
                <td>
                  <span className={`pv-sig ${SIGNAL_TONE[r.signal]}`}>{s.signals[r.signal]}</span>
                </td>
                <td className="c3">
                  <span className="pv-track">
                    <i data-bar style={{ width: `${r.strength}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function AlertsPanel({ p }) {
  const a = p.alerts
  const fired = a.items.filter((i) => i.st === 'triggered').length
  return (
    <>
      <Head title={a.title}>
        <span className="pv-badge">
          {fired} {a.triggered}
        </span>
        <span className="pv-chip">
          {a.items.length - fired} {a.active}
        </span>
      </Head>
      <div className="pv-tabs2" data-in>
        {a.tabs.map((t, i) => (
          <span key={t} data-on={i === 0}>
            {t}
          </span>
        ))}
      </div>
      <div className="pv-alerts">
        {a.items.map((i) => (
          <div key={i.text} className="pv-alert" data-in>
            <span className="pv-dot" data-st={i.st} aria-hidden="true" />
            <div>
              <p className="pv-alert__t">
                <b>{i.sym}</b> {i.text}
              </p>
              <p className="pv-alert__m">
                {i.kind} · {i.ch.join(' · ')}
              </p>
            </div>
            <span className="pv-alert__w" data-st={i.st}>
              {i.st === 'watching' ? a.watching : i.when}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

export function ResearchPanel({ p }) {
  const r = p.research
  return (
    <>
      <Head title={r.title}>
        <Chips items={r.filters} />
      </Head>
      <div className="pv-reports">
        {r.items.map((i) => (
          <article key={i.title} className="pv-report" data-in>
            <div>
              <h4>{i.title}</h4>
              <p className="pv-report__meta">
                <span>{i.kind}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {i.mins} {r.read}
                </span>
                <span aria-hidden="true">·</span>
                <span>{i.tags.join(' · ')}</span>
              </p>
            </div>
            <span className="pv-tier" data-free={i.tier === 'Free' || i.tier === 'Grátis'}>
              {i.tier}
            </span>
          </article>
        ))}
      </div>
    </>
  )
}

const spark = (pts) => {
  const max = Math.max(...pts)
  const min = Math.min(...pts)
  return pts
    .map((v, i) => `${((i / (pts.length - 1)) * 64).toFixed(1)},${(18 - ((v - min) / (max - min || 1)) * 16).toFixed(1)}`)
    .join(' ')
}

export function MacroPanel({ p, loc, num }) {
  const m = p.macro
  return (
    <>
      <Head title={m.title}>
        <span className="pv-badge">
          {num(FACTS.macroPanels)} {m.panels}
        </span>
        <Chips items={m.filters} />
      </Head>
      <div className="pv-tablewrap" data-in>
        <table className="pv-table">
          <thead>
            <tr>
              <th>{m.cols.name}</th>
              <th>{m.cols.last}</th>
              <th className="c2">{m.cols.prev}</th>
              <th>{m.cols.chg}</th>
              <th className="c3">{m.cols.d30}</th>
              <th className="c3">{m.cols.ytd}</th>
              <th className="c2">{m.cols.trend}</th>
            </tr>
          </thead>
          <tbody>
            {MACRO.map((r, i) => (
              <tr key={m.rows[i].name} data-in>
                <td>
                  <div className="pv-asset">
                    <div>
                      <b>{m.rows[i].name}</b>
                      <span>{m.rows[i].type}</span>
                    </div>
                  </div>
                </td>
                <td>{loc(r.last)}</td>
                <td className="c2">{loc(r.prev)}</td>
                <td className={signStr(r.chg)}>{loc(r.chg)}</td>
                <td className={`c3 ${signStr(r.d30)}`}>{loc(r.d30)}</td>
                <td className={`c3 ${signStr(r.ytd)}`}>{loc(r.ytd)}</td>
                <td className="c2">
                  <svg className="pv-spark" viewBox="0 0 64 20" aria-hidden="true">
                    <polyline points={spark(r.spark)} data-draw pathLength="1" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function SentimentPanel({ p, loc }) {
  const s = p.sentiment
  const d = SENTIMENT
  return (
    <>
      <Head title={s.title}>
        <span className="pv-chip">{s.snapshot}</span>
      </Head>
      <div className="pv-sent">
        <div className="pv-sent__a">
          <div className="pv-gaugebox" data-in>
            <div className="pv-gauge">
              <svg viewBox="0 0 200 110" aria-hidden="true">
                <defs>
                  <linearGradient id="pv-gauge-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#e5484d" />
                    <stop offset="35%" stopColor="#8c93a6" />
                    <stop offset="65%" stopColor="#1ead64" />
                    <stop offset="100%" stopColor="#4b6bff" />
                  </linearGradient>
                </defs>
                <path d="M20 100A80 80 0 0 1 180 100" pathLength="100" className="pv-gauge__track" />
                <path
                  d="M20 100A80 80 0 0 1 180 100"
                  pathLength="100"
                  className="pv-gauge__fill"
                  data-gauge={d.gauge}
                  strokeDasharray={`${d.gauge} 100`}
                />
              </svg>
              <div className="pv-gauge__read">
                <span className="display">{d.gauge}</span>
                <span className="up">{s.gauge}</span>
              </div>
            </div>
            <div className="pv-stats">
              {d.stats.map((x) => (
                <div key={x.key} className="pv-stat">
                  <span>{s.stats[x.key]}</span>
                  <b>
                    {loc(x.value)} <em className={x.up ? 'up' : 'down'}>{loc(x.delta)}</em>
                  </b>
                </div>
              ))}
            </div>
          </div>

          <div className="pv-social" data-in>
            <p className="pv-sub">{s.social}</p>
            {d.social.map((x) => (
              <div key={x.sym} className="pv-social__row">
                <span>{x.sym}</span>
                <span className="pv-split">
                  <i data-bar style={{ width: `${x.bull}%` }} />
                </span>
                <b className="up">{x.bull}%</b>
              </div>
            ))}
          </div>
        </div>

        <div className="pv-sent__b">
          <div className="pv-liq" data-in>
            <p className="pv-sub">{s.liq}</p>
            <div className="pv-liq__row">
              <div>
                <div className="pv-liq__labels">
                  <span className="up">
                    {s.longs} {loc(d.liq.longs)}
                  </span>
                  <span className="down">
                    {s.shorts} {loc(d.liq.shorts)}
                  </span>
                </div>
                <span className="pv-split pv-split--thick">
                  <i data-bar style={{ width: `${d.liq.longPct}%` }} />
                </span>
              </div>
              <div className="pv-liq__total">
                <b>{loc(d.liq.total)}</b>
                <span>{s.total}</span>
              </div>
            </div>
          </div>
          <div className="pv-venues">
            {d.venues.map((v) => (
              <div key={v.name} className="pv-venue" data-in>
                <span>{v.name}</span>
                <b>{loc(v.ratio)}</b>
                <em className="up">
                  {loc(v.longs)} {s.long}
                </em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
