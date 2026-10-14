import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { series, toPath } from '../lib/chart.js'

const W = 560
const H = 118

const HISTORY = [
  'Discussion on Bitcoin Trends and Insights',
  'Request for Explanation of a Perspective',
  'Understanding Bitcoin Overview Metrics',
]
const TOOLS = [
  ['Learn Crypto', <><path d="m22 10-10-5L2 10l10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>],
  ['Market Analysis', <><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></>],
  ['Macroeconomy', <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" /></>],
  ['Sentiment', <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" />],
  ['On-Chain', <path d="M22 12h-4l-3 9L9 3l-3 9H2" />],
]

function Ico({ children, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

function Bar({ credits, busy, ready, press }) {
  return (
    <div className="aiapp__bar">
      <span className="aiapp__chip">
        <Ico>
          <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
        </Ico>
        QUICK ASK
        <Ico className="aiapp__chev">
          <path d="m6 9 6 6 6-6" />
        </Ico>
      </span>
      <span className="aiapp__chip aiapp__chip--trade">$ TRADE</span>
      <span className="aiapp__credits">
        1,000 credits · <b>{credits}</b> left
        <Ico>
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
        </Ico>
      </span>
      <span className={`aiapp__send${ready ? ' is-ready' : ''}${press ? ' is-press' : ''}${busy ? ' is-busy' : ''}`}>
        {busy ? (
          <i className="aiapp__ring" />
        ) : (
          <Ico>
            <path d="M7 17 17 7M8 7h9v9" />
          </Ico>
        )}
      </span>
    </div>
  )
}

/*
 * The real Alpha AI flow, rebuilt in markup and looped: the home screen with the question
 * being typed, the chat view with "Planning data retrieval…" ticking through its steps, then
 * the answer streaming in with citation pills and the chart they open. Runs only while on
 * screen; under prefers-reduced-motion it rests on the finished answer.
 */
export default function AlphaAiDemo() {
  const { t } = useI18n()
  const chat = t.grounded.chat
  const root = useRef(null)
  const question = chat.user

  const [inView, setInView] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [cycle, setCycle] = useState(0)

  const [phase, setPhase] = useState('home')
  const [typed, setTyped] = useState(0)
  const [sent, setSent] = useState(false)
  const [steps, setSteps] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [shown, setShown] = useState(0)
  const [chartOpen, setChartOpen] = useState(false)

  const tokens = useMemo(() => {
    const split = (s) => s.split(' ').filter(Boolean).map((w) => ({ w }))
    return [
      ...split(chat.before),
      { pill: chat.pillA },
      ...split(chat.a),
      ...split(chat.mid),
      { pill: chat.pillB },
      ...split(chat.b + chat.after),
    ]
  }, [chat])

  const stepLabels = useMemo(
    () => ['Analyzing your question...', 'Processing context...', `Retrieving ${chat.pillA}...`, `Retrieving ${chat.pillB}...`],
    [chat],
  )

  const paths = useMemo(() => {
    const a = series(48, 91, { drift: 0.002, vol: 0.13, start: 0.55 })
    const b = series(48, 17, { drift: 0.006, vol: 0.07, start: 0.25 })
    return { a: toPath(a, W, H, 12), b: toPath(b, W, H, 12) }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const running = inView && !reduced

  // Reduced motion: rest on the finished answer
  useEffect(() => {
    if (!reduced) return
    setPhase('answer')
    setTyped(question.length)
    setSent(true)
    setSteps(stepLabels.length)
    setElapsed(34)
    setShown(tokens.length)
    setChartOpen(true)
  }, [reduced, question, stepLabels, tokens])

  useEffect(() => {
    if (!running) return undefined
    const timers = []
    const at = (ms, fn) => timers.push(setTimeout(fn, ms))

    setPhase('home')
    setTyped(0)
    setSent(false)
    setSteps(0)
    setElapsed(0)
    setShown(0)
    setChartOpen(false)

    // Phones: the same script in coarser beats (3 chars per tick, ticks 4x rarer). Every tick is a
    // React render of the whole demo, and doing ~20 a second while the page scrolls was visible jank.
    const lite = window.matchMedia('(max-width: 991px)').matches
    let t = 900
    for (let i = 1; i <= question.length; i += lite ? 3 : 1) {
      t += lite ? 130 : 44
      const n = Math.min(question.length, i + (lite ? 2 : 0))
      at(t, () => setTyped(n))
    }
    t += 750
    at(t, () => setSent(true))
    t += 500
    at(t, () => setPhase('think'))

    const STEP = 720
    const thinkStart = t
    for (let i = 1; i <= stepLabels.length; i++) {
      const n = i
      at(thinkStart + 350 + (i - 1) * STEP, () => setSteps(n))
    }
    const thinkEnd = thinkStart + 350 + stepLabels.length * STEP
    const tick = lite ? 400 : 100
    const ticks = Math.round((thinkEnd - thinkStart) / tick)
    for (let k = 1; k <= ticks; k++) {
      const n = k * (lite ? 4 : 1)
      at(thinkStart + k * tick, () => setElapsed(n))
    }
    t = thinkEnd + 500
    at(t, () => setPhase('answer'))

    t += 450
    for (let i = 1; i <= tokens.length; i++) {
      t += lite ? 110 : 58
      const n = i
      at(t, () => setShown(n))
    }
    t += 700
    at(t, () => setChartOpen(true))
    t += 6500
    at(t, () => setCycle((c) => c + 1))

    return () => timers.forEach(clearTimeout)
  }, [running, cycle, question, stepLabels, tokens])

  const thinking = phase === 'think'
  const done = phase === 'answer'

  return (
    <div ref={root} className="aiapp" data-phase={phase}>
      <span className="ring ring--dark" aria-hidden="true" />
      <div className="aiapp__chrome" aria-hidden="true">
        <span className="aiapp__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="aiapp__url mono">app.alphractal.com/alpha-ai</span>
        <span className="aiapp__tag mono">{chat.illustrative}</span>
      </div>

      <div className="aiapp__screen">
        {/* 1 · home: the question box */}
        <div className={`aiapp__view aiapp__home${phase === 'home' ? ' is-on' : ''}`} aria-hidden={phase !== 'home'}>
          <p className="aiapp__logo">
            <b>Alpha</b> <em>AI</em>
          </p>
          <div className={`aiapp__box${sent ? ' is-sent' : ''}`}>
            <div className="aiapp__field">
              <Ico className="aiapp__search">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </Ico>
              <span className="aiapp__input">
                {typed > 0 ? (
                  <>
                    {question.slice(0, typed)}
                    <i className="aiapp__caret" />
                  </>
                ) : (
                  <span className="aiapp__ph">
                    Search assets, trends, or ask Alpha AI...
                    <i className="aiapp__caret" />
                  </span>
                )}
              </span>
            </div>
            <Bar credits="48,000" ready={typed === question.length} press={sent} />
          </div>
          <div className="aiapp__lists">
            <div className="aiapp__col aiapp__col--hist">
              <p>HISTORY</p>
              <ul>
                {HISTORY.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
            <div className="aiapp__col">
              <p>AI TOOLS</p>
              <ul>
                {TOOLS.map(([label, icon]) => (
                  <li key={label}>
                    <Ico>{icon}</Ico>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 2 · chat: planning, then the answer with its data */}
        <div className={`aiapp__view aiapp__chatview${phase !== 'home' ? ' is-on' : ''}`} aria-hidden={phase === 'home'}>
          <div className="aiapp__scroll">
            <p className="aiapp__user">{question}</p>

            <div className={`aiapp__think${done ? ' is-done' : ''}`}>
              <div className="aiapp__thinkhead">
                <span className={`aiapp__grid${thinking ? ' is-live' : ''}`} aria-hidden="true">
                  {Array.from({ length: 9 }, (_, i) => (
                    <i key={i} style={{ '--i': i }} />
                  ))}
                </span>
                <span className="aiapp__thinktitle">{done ? 'Data retrieved' : 'Planning data retrieval...'}</span>
                <em className="mono">{(elapsed / 10).toFixed(1)}s</em>
              </div>
              <ul className="aiapp__steps">
                {stepLabels.map((s, i) => (
                  <li key={s} className={i < steps ? 'is-in' : undefined}>
                    <Ico>
                      <path d="m5 12 5 5 9-10" />
                    </Ico>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <p className={`aiapp__ans${done ? ' is-on' : ''}`}>
              {tokens.map((tk, i) =>
                tk.pill ? (
                  <button
                    type="button"
                    key={i}
                    className={`aiapp__pill${i < shown ? ' is-in' : ''}${chartOpen ? ' is-open' : ''}`}
                    aria-expanded={chartOpen}
                    onClick={() => setChartOpen((o) => !o)}
                  >
                    {tk.pill}
                  </button>
                ) : (
                  <span key={i} className={i < shown ? 'is-in' : undefined}>
                    {tk.w}{' '}
                  </span>
                ),
              )}
            </p>

            <div className={`aiapp__chart${chartOpen ? ' is-open' : ''}`} aria-hidden={!chartOpen}>
              <div className="aiapp__charthead mono">
                <span>{chat.chartTitle}</span>
                <span>{chat.chartHint}</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                {[0.25, 0.5, 0.75].map((y) => (
                  <line key={y} x1="0" x2={W} y1={y * H} y2={y * H} />
                ))}
                <path d={paths.b} className="aiapp__l2" pathLength="1" />
                <path d={paths.a} className="aiapp__l1" pathLength="1" />
              </svg>
            </div>
          </div>

          <div className="aiapp__follow">
            <p className="aiapp__followph">Ask a follow-up...</p>
            <Bar credits="47,000" busy={thinking} />
          </div>
        </div>
      </div>
    </div>
  )
}
