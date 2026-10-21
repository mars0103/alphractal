import { useCallback, useEffect, useRef, useState } from 'react'
import '../../styles/p-alpha-ai.css'
import { useMeta } from '../../hooks/useMeta.js'
import { LINKS } from '../../lib/facts.js'
import PageShell from '../../components/PageShell.jsx'
import FinalCta from '../../sections/FinalCta.jsx'
import { Cards, PBlock, ProductHero, Shot } from '../../components/ProductBlocks.jsx'

/* /platform/alpha-ai — hero with the recorded demonstration, the problem, four ways to ask, related, closing CTA.
   Copy: Textos/Alpha AI.md · script: Alpha AI demonstracao.md · the only AI answer shown is the one in Alpha AI resposta real.md. */

const RECORDED = 'Recorded example · 19 Oct 2026'

const SUGGESTED = [
  'What does Bitcoin’s liquidation activity say about leverage risk?',
  'Is on-chain activity confirming the derivatives positioning?',
  'How do current conditions compare with previous market cycles?',
  'Which metrics should I examine to test this thesis?',
]

/* Verbatim from the real run. The three blocks are a typographic split of the same text, nothing added or cut. */
const QUESTION =
  'Using only data accessible on this plan, summarize Bitcoin’s 24-hour long and short liquidations and 12-hour short liquidations. Is this a one-sided setup? Cite the actual metrics consulted and include their data timestamp if available. If no timestamp is available, say so. Do not use Liquidation Levels. Keep the answer under 100 words.'
const ANSWER = [
  'Bitcoin 24h liquidations: $58.95M total, with $33.18M longs vs $25.77M shorts; 12h short liquidations are $15.58M.',
  'The platform does not track standalone metrics named “24-hour long liquidations,” “24-hour short liquidations,” or “12-hour short liquidations”, so these figures come from the BTC liquidations summary. No timestamp is available in the accessible data.',
  'This is not strongly one-sided over 24h since longs lead by only $7.41M, but the last 12h was more skewed against shorts at $15.58M vs $3.42M longs.',
]
const DATA = [
  ['Total liquidations, 24h', '$58.95M'],
  ['Longs, 24h', '$33.18M'],
  ['Shorts, 24h', '$25.77M'],
  ['Shorts, 12h', '$15.58M'],
]
/* Hold time of each moment (ms): question, query, data, answer, check. */
const HOLD = [3000, 2000, 4000, 12000, 6000]
const MOMENTS = ['Question', 'Query', 'Data', 'Answer', 'Check']

const MODES = [
  {
    n: '01',
    id: 'quick',
    title: 'Quick Ask',
    text: 'Ask a focused question about an asset, metric or market condition. Get a direct explanation and follow up as your analysis develops.',
    prompt: 'What does Bitcoin’s liquidation activity say about leverage risk?',
  },
  {
    n: '02',
    id: 'deep',
    title: 'Deep Research',
    text: 'Take a market thesis further with multi-step analysis across relevant data sources. Bring the findings together in a structured report you can review in detail.',
    prompt: 'Is Bitcoin’s current derivatives positioning supported by on-chain activity and macro conditions?',
  },
  {
    n: '03',
    id: 'chart',
    title: 'Chart copilot',
    text: 'Ask about the chart in front of you. Keep the asset and metric in context while you explore what the data means for your thesis.',
    prompt: 'What does this chart show, and what should I compare it with before drawing a conclusion?',
  },
  {
    n: '04',
    id: 'voice',
    title: 'Voice',
    text: 'Speak your question and turn it into text, then continue the conversation with Alpha AI.',
    prompt: 'What changed in Bitcoin’s leverage conditions?',
  },
]

const STEPS = ['Asset', 'Focus', 'Depth', 'Sources', 'Launch']

const RELATED = [
  { title: 'Metrics & Models', text: 'Explore the metrics and models behind your analysis.', href: '/platform/metrics', linkLabel: 'Open Metrics & Models' },
  { title: 'MCP', text: 'Bring Alphractal data into your AI assistant or agent.', href: '/platform/mcp', linkLabel: 'Open MCP' },
  { title: 'Research & Academy', text: 'Explore the research and learn how to interpret the data.', href: '/platform/research', linkLabel: 'Open Research & Academy' },
]

/* Starts CSS animations the first time a block scrolls into view. Content is always in the HTML and visible by default. */
function usePlayOnView(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.setAttribute('data-play', '')
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}

function Spark() {
  return (
    <svg className="aai-spark" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9z" fill="currentColor" />
    </svg>
  )
}

/* The hero panel. Server/initial render shows the finished state (everything readable); after mount, when motion is
   allowed, it replays the five moments once, with Pause / Previous / Next / Replay. */
function DemoPanel() {
  const [step, setStep] = useState(4)
  const [playing, setPlaying] = useState(false)
  const motion = useRef(false)
  const timer = useRef(0)

  useEffect(() => {
    motion.current = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (motion.current) {
      setStep(0)
      setPlaying(true)
    }
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!playing) return undefined
    if (step >= HOLD.length - 1) {
      setPlaying(false)
      return undefined
    }
    timer.current = setTimeout(() => setStep((s) => s + 1), HOLD[step])
    return () => clearTimeout(timer.current)
  }, [playing, step])

  const go = useCallback((n) => {
    setPlaying(false)
    setStep(Math.max(0, Math.min(HOLD.length - 1, n)))
  }, [])
  const toggle = () => {
    if (playing) setPlaying(false)
    else {
      if (step >= HOLD.length - 1) setStep(0)
      setPlaying(true)
    }
  }
  const atEnd = step >= HOLD.length - 1

  return (
    <div className="aai-panel" id="alpha-demo" data-step={step}>
      <div className="aai-panel__bar">
        <span className="aai-panel__brand">
          <Spark /> Alpha AI
        </span>
        <span className="aai-mode">Quick Ask</span>
      </div>

      <div className="aai-panel__body">
        <p className="aai-q">{QUESTION}</p>

        <div className={`aai-fetch ${step >= 1 ? 'is-on' : ''} ${step >= 2 ? 'is-done' : ''}`} aria-live="polite">
          <i aria-hidden="true" />
          <span>{step === 1 ? 'Fetching screener data…' : 'Screener data fetched'}</span>
        </div>

        <div className={`aai-data ${step >= 2 ? 'is-on' : ''}`}>
          <p className="aai-data__tag">Source consulted{step >= 4 ? '' : ''}</p>
          <table>
            <caption>BTC liquidations summary</caption>
            <tbody>
              {DATA.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="aai-a">
          {ANSWER.map((p, i) => (
            <p key={p} className={step >= 3 ? 'is-on' : ''} style={{ '--i': i }}>
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="aai-panel__foot">
        <span className="aai-rec">{RECORDED}</span>
        <div className="aai-ctrl" role="group" aria-label="Demonstration controls">
          <ol className="aai-dots">
            {MOMENTS.map((m, i) => (
              <li key={m}>
                <button type="button" className={i === step ? 'is-on' : i < step ? 'is-past' : ''} onClick={() => go(i)} aria-label={`Show moment ${i + 1}: ${m}`} aria-current={i === step ? 'step' : undefined} />
              </li>
            ))}
          </ol>
          <button type="button" className="aai-btn" onClick={toggle}>
            {playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          </button>
        </div>
      </div>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="aai-hero">
      <DemoPanel />
      <div className="aai-suggest">
        <p className="aai-suggest__label">Questions to start with</p>
        <ul>
          {SUGGESTED.map((q) => (
            <li key={q}>
              <a href="#alpha-demo">{q}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Problem() {
  const ref = useRef(null)
  usePlayOnView(ref)
  return (
    <PBlock id="problem" eyebrow="THE PROBLEM" title="A market answer needs market data.">
      <div className="aai-problem">
        <div className="aai-problem__text" data-stagger>
          <p className="lede" data-item>
            A convincing explanation is only useful when you can understand what supports it. Without the right data, a market summary can miss the positioning, context and risks behind a move.
          </p>
          <p className="aai-problem__p" data-item>
            Alpha AI connects your questions to Alphractal’s analytics. Explore on-chain behavior, derivatives, sentiment and macro context, then follow the available data and chart references to examine the analysis yourself.
          </p>
        </div>
        <ol ref={ref} className="aai-flow" aria-label="From question to answer">
          <li style={{ '--i': 0 }}>
            <b>Your question</b>
            <span>{SUGGESTED[0]}</span>
          </li>
          <li style={{ '--i': 1 }}>
            <b>Alphractal data</b>
            <span className="aai-flow__chips">
              <i>On-chain</i>
              <i>Derivatives</i>
              <i>Sentiment</i>
              <i>Macro</i>
            </span>
          </li>
          <li style={{ '--i': 2 }}>
            <b>An answer you can check</b>
            <span>Read the explanation next to the data it was built on.</span>
          </li>
        </ol>
      </div>
    </PBlock>
  )
}

function ModeText({ m }) {
  return (
    <div className="aai-mode-text">
      <p className="aai-mode-n">{m.n}</p>
      <h3>{m.title}</h3>
      <p>{m.text}</p>
      <p className="aai-prompt">
        <span>Example prompt</span>
        {m.prompt}
      </p>
    </div>
  )
}

function QuickVisual() {
  const ref = useRef(null)
  usePlayOnView(ref)
  return (
    <div ref={ref} className="aai-vis aai-vis--dark aai-quick">
      <p className="aai-vis__tag">Excerpt · {RECORDED}</p>
      <p className="aai-q">{QUESTION}</p>
      <p className="aai-fetch is-on is-done aai-quick__f">
        <i aria-hidden="true" />
        <span>Screener data fetched</span>
      </p>
      <p className="aai-quick__a">{ANSWER[0]}</p>
      <p className="aai-quick__a aai-quick__a--2">{ANSWER[2]}</p>
    </div>
  )
}

function DeepVisual() {
  return (
    <div className="aai-vis aai-deep">
      <Shot
        name="Deep Research setup"
        src="/product/deep-research.webp"
        alt="The Deep Research setup in Alpha AI: five steps (Asset, Focus, Depth, Sources, Launch), with a research focus typed in"
        ratio="1132 / 990"
        dark
      />
      <p className="aai-vis__tag aai-vis__tag--foot">Setup flow of the app. A completed report is not shown.</p>
    </div>
  )
}

function ChartVisual() {
  return (
    <div className="aai-vis aai-chart">
      <Shot
        name="Chart copilot panel"
        src="/product/chart-copilot.webp"
        alt="The Alpha AI panel open beside the Bitcoin Supply in Profit chart, with a question typed in"
        ratio="16 / 8.6"
      />
    </div>
  )
}

function VoiceVisual() {
  const ref = useRef(null)
  usePlayOnView(ref)
  return (
    <div ref={ref} className="aai-vis aai-vis--dark aai-voice">
      <button type="button" className="aai-mic" tabIndex={-1} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
      </button>
      <span className="aai-wave" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </span>
      <p className="aai-voice__t">Voice input → text</p>
      <p className="aai-q aai-voice__q">{MODES[3].prompt}</p>
    </div>
  )
}

function Modes() {
  const visuals = [QuickVisual, DeepVisual, ChartVisual, VoiceVisual]
  return (
    <PBlock id="how" eyebrow="HOW IT WORKS" title="Four ways to ask." intro="Start with a question, investigate a thesis or explore the chart in front of you.">
      <div className="aai-modes">
        {MODES.map((m, i) => {
          const V = visuals[i]
          return (
            <article className="aai-mode-row" key={m.id} data-reveal="up">
              <ModeText m={m} />
              <V />
            </article>
          )
        })}
      </div>
    </PBlock>
  )
}

export default function AlphaAi() {
  useMeta({
    title: 'Alpha AI: Ask Crypto Market Questions With Data | Alphractal',
    description: 'Ask Alpha AI about an asset or setup and bring on-chain, derivatives, sentiment and macro data into the conversation. Ask in your language and explore the data behind the answer.',
  })

  return (
    <PageShell>
      <ProductHero
        current="alpha-ai"
        eyebrow="ALPHA AI"
        title="An AI that turns the data into your next move."
        sub="Ask about an asset or setup. Alpha AI brings on-chain, derivatives, sentiment and macro data into the conversation, helping you understand market conditions, assess risk and explore what matters for your strategy."
        line="Ask in your language. Explore the data behind the answer."
        primary={{ label: 'Start free', href: LINKS.start }}
        secondary={{ label: 'See the four modes', href: '#how' }}
        visual={<HeroVisual />}
      />

      <Problem />
      <Modes />

      <PBlock id="related" eyebrow="KEEP GOING" title="Continue your analysis.">
        <Cards cols={3} items={RELATED} />
      </PBlock>

      <FinalCta
        title={['Bring your next', 'market question.']}
        sub="Explore the data, challenge your thesis and build a clearer view with Alpha AI."
        primary="Start free"
        primaryHref={LINKS.start}
        secondary="View plans"
        secondaryTo="https://app.alphractal.com/plans"
      />
    </PageShell>
  )
}
