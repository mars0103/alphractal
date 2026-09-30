import { useMemo, useRef } from 'react'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { gsap, useGSAP, Draggable, MQ } from '../../lib/gsap.js'
import { series, toPath } from '../../lib/chart.js'
import { FACTS } from '../../lib/facts.js'
import BorderGlow from '../BorderGlow.jsx'
import CitationChat from '../CitationChat.jsx'
import Viz from '../Viz.jsx'

/* ------------------------------------------------------------------ Alpha AI */
export function AlphaAiViz() {
  const { t } = useI18n()
  const ex = t.pages.features['alpha-ai'].examples
  return (
    <div className="v-stack">
      <CitationChat start="top 95%" />
      <ul className="v-chips" aria-label={ex.title}>
        {ex.chips.map((c) => (
          <li className="chip chip--ghost" key={c}>
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ Metrics: four domains on one timeline */
export function DomainsViz() {
  const { t } = useI18n()
  const rows = t.pages.features.metrics.domains.items.slice(0, 4)
  const root = useRef(null)
  const paths = useMemo(
    () => [0, 1, 2, 3].map((i) => toPath(series(48, 20 + i * 9, { drift: 0.003 * (i + 1), vol: 0.11, start: 0.3 + i * 0.08 }), 400, 60, 6)),
    [],
  )

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const draws = gsap.utils.toArray('[data-draw]', root.current)
        gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 })
        const scan = root.current.querySelector('.dv__scan')
        gsap
          .timeline({ delay: 0.6 })
          .to(draws, { strokeDashoffset: 0, duration: 1.6, stagger: 0.18, ease: 'power2.inOut' })
          .fromTo(scan, { x: 0, autoAlpha: 0 }, { x: () => scan.parentElement.offsetWidth - 124, autoAlpha: 1, duration: 5, ease: 'none', repeat: -1 }, '>-0.2')
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <BorderGlow>
      <div ref={root} className="vpanel dv">
        <div className="dv__rows">
          {rows.map((r, i) => (
            <div className="dv__row" key={r.name}>
              <span className="mono">{r.name}</span>
              <svg viewBox="0 0 400 60" preserveAspectRatio="none">
                <path d={paths[i]} fill="none" stroke={i === 3 ? '#fbf8f8' : '#4b6bff'} strokeWidth="1.8" data-draw pathLength="1" />
              </svg>
            </div>
          ))}
          <i className="dv__scan" />
        </div>
        <p className="vpanel__foot mono">{t.pages.features.metrics.how.steps[1].title}</p>
      </div>
    </BorderGlow>
  )
}

/* ------------------------------------------------------------------ MCP: a client calling tools */
export function McpViz() {
  const { t } = useI18n()
  const c = t.pages.features.mcp
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const reads = gsap.utils.toArray('.tile.is-read', root.current)
        const lines = gsap.utils.toArray('.mcpv__ans i', root.current)
        gsap.set(reads, { opacity: 0.16 })
        gsap.set(lines, { scaleX: 0, transformOrigin: '0 50%' })
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, delay: 0.8 })
        tl.to(root.current.querySelector('.mcpv__calling'), { autoAlpha: 1, duration: 0.3 })
        tl.to(reads, { opacity: 1, duration: 0.25, stagger: { each: 0.06, from: 'random' } }, '<0.2')
        tl.to(lines, { scaleX: 1, duration: 0.6, stagger: 0.25, ease: 'power2.out' }, '>-1')
        tl.to(root.current.querySelector('.mcpv__calling'), { autoAlpha: 0.4, duration: 0.3 }, '<')
        tl.to(reads, { opacity: 0.16, duration: 0.6, stagger: { each: 0.02, from: 'start' } }, '+=1.4')
        tl.to(lines, { scaleX: 0, duration: 0.4 }, '<')
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <BorderGlow>
      <div ref={root} className="vpanel mcpv">
        <div className="vpanel__top mono">
          <span>{c.client.label}</span>
          <span>{FACTS.mcpEndpoint.replace('https://', '')}</span>
        </div>
        <p className="mcpv__q">{c.client.question}</p>
        <p className="mcpv__calling mono">{c.client.calling}</p>
        <div className="mcpv__tiles" aria-hidden="true">
          {Array.from({ length: FACTS.mcpTools }, (_, i) => (
            <i key={i} className={`tile ${i < FACTS.mcpReadTools ? 'is-read' : 'is-write'}`} />
          ))}
        </div>
        <div className="mcpv__legend mono">
          <span>
            <i className="tile is-read" /> {c.tools.read} · {FACTS.mcpReadTools}
          </span>
          <span>
            <i className="tile is-write" /> {c.tools.write} · {FACTS.mcpWriteTools}
          </span>
        </div>
        <div className="mcpv__ans" aria-hidden="true">
          <i style={{ width: '90%' }} />
          <i style={{ width: '72%' }} />
          <i style={{ width: '48%' }} />
        </div>
      </div>
    </BorderGlow>
  )
}

/* ------------------------------------------------------------------ API: the rate ladder */
export function RateViz() {
  const { t } = useI18n()
  const a = t.pages.features.api
  const root = useRef(null)
  const values = [30, 200, 500, 800]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const fills = gsap.utils.toArray('.rv__fill', root.current)
        gsap.set(fills, { scaleX: 0 })
        gsap.to(fills, { scaleX: (i) => values[i] / 800, duration: 1.6, stagger: 0.18, ease: 'power3.out', delay: 0.7, transformOrigin: '0 50%' })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <BorderGlow>
      <div ref={root} className="vpanel rv">
        <p className="vpanel__top mono">
          <span>{a.ladder.title}</span>
        </p>
        <ul>
          {a.ladder.plans.map((p, i) => (
            <li className="rv__row" key={p}>
              <span className="mono">{p}</span>
              <span className="rv__track">
                <i className="rv__fill" style={{ transform: `scaleX(${values[i] / 800})` }} />
              </span>
              <b className="num">
                {i === 3 ? `${a.ladder.up} ` : ''}
                {values[i]}
              </b>
            </li>
          ))}
        </ul>
        <p className="vpanel__foot mono">{a.tiers.rows.map((r) => r[1]).join('  →  ')}</p>
      </div>
    </BorderGlow>
  )
}

/* ------------------------------------------------------------------ Dashboards: a workbench you can actually drag */
const CELLS = { cols: 3, rows: 2, gap: 10 }
const WB_KINDS = ['onchain', 'derivs', 'sentiment', 'macro', 'chart']

export function Workbench() {
  const { t } = useI18n()
  const d = t.pages.features.dashboards
  const labels = t.consolidation.tools
  const root = useRef(null)

  useGSAP(
    () => {
      const box = root.current.querySelector('.wb__grid')
      const panels = gsap.utils.toArray('.wb__panel', root.current)
      const cellOf = panels.map((_, i) => i) // panel i sits in cell i, cell 5 stays free
      let cw = 0
      let ch = 0
      const pos = (cell) => ({
        x: (cell % CELLS.cols) * cw,
        y: Math.floor(cell / CELLS.cols) * ch,
      })
      const layout = (animate) => {
        const r = box.getBoundingClientRect()
        cw = r.width / CELLS.cols
        ch = r.height / CELLS.rows
        panels.forEach((p, i) => {
          gsap.set(p, { width: cw - CELLS.gap, height: ch - CELLS.gap })
          animate ? gsap.to(p, { ...pos(cellOf[i]), duration: 0.6, ease: 'power3.out' }) : gsap.set(p, pos(cellOf[i]))
        })
      }
      layout(false)
      const onResize = () => layout(false)
      window.addEventListener('resize', onResize)

      const drags = Draggable.create(panels, {
        type: 'x,y',
        bounds: box,
        zIndexBoost: true,
        edgeResistance: 0.7,
        onPress() {
          gsap.to(this.target, { scale: 1.03, boxShadow: '0 24px 50px -20px rgba(0,0,0,.7)', duration: 0.25 })
        },
        onRelease() {
          const i = panels.indexOf(this.target)
          const cx = this.x + (cw - CELLS.gap) / 2
          const cy = this.y + (ch - CELLS.gap) / 2
          const col = Math.min(CELLS.cols - 1, Math.max(0, Math.floor(cx / cw)))
          const row = Math.min(CELLS.rows - 1, Math.max(0, Math.floor(cy / ch)))
          const target = row * CELLS.cols + col
          const other = cellOf.indexOf(target)
          if (other !== -1 && other !== i) cellOf[other] = cellOf[i]
          cellOf[i] = target
          gsap.to(this.target, { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.3 })
          layout(true)
        },
      })

      // A small nudge on load so the panels read as movable
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from(panels, { autoAlpha: 0, scale: 0.9, duration: 0.9, stagger: 0.09, delay: 0.7, ease: 'power3.out', clearProps: 'opacity,visibility' })
      })

      return () => {
        window.removeEventListener('resize', onResize)
        drags.forEach((dr) => dr.kill())
        mm.revert()
      }
    },
    { scope: root },
  )

  return (
    <BorderGlow>
      <div ref={root} className="vpanel wb">
        <div className="vpanel__top mono">
          <span>{d.workbench.hint}</span>
          <span>{t.pages.common.illustrative}</span>
        </div>
        <div className="wb__grid">
          {WB_KINDS.map((k, i) => (
            <div className="wb__panel" key={k}>
              <span className="mono">{labels[i]}</span>
              <Viz kind={k} />
            </div>
          ))}
        </div>
        <p className="vpanel__foot mono">{d.workbench.illustrative}</p>
      </div>
    </BorderGlow>
  )
}

/* ------------------------------------------------------------------ Research: a report that stays live */
export function ReportViz() {
  const { t } = useI18n()
  const r = t.pages.features.research.report
  const root = useRef(null)
  const live = useMemo(() => toPath(series(44, 77, { drift: 0.006, vol: 0.11, start: 0.3 }), 300, 90, 8), [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => root.current.querySelector(s)
        const path = q('.rp__chart path')
        gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(q('.rp__dot'), { autoAlpha: 0 })
        gsap
          .timeline({ delay: 0.7 })
          .to(path, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' })
          .to(q('.rp__dot'), { autoAlpha: 1, duration: 0.3 }, '-=0.2')
        gsap.to(q('.rp__dot'), { scale: 1.8, opacity: 0.35, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3 })
        gsap.fromTo(q('.rp__play i'), { scaleX: 0 }, { scaleX: 1, duration: 9, ease: 'none', repeat: -1, transformOrigin: '0 50%', delay: 0.8 })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className="rp">
      <div className="rp__top mono">
        <span>{r.title}</span>
        <span className="rp__v">{r.version}</span>
      </div>
      <div className="rp__lines">
        <i style={{ width: '78%', height: 12 }} />
        <i style={{ width: '94%' }} />
        <i style={{ width: '88%' }} />
      </div>
      <div className="rp__chartwrap">
        <span className="rp__tag mono">{r.live}</span>
        <svg className="rp__chart" viewBox="0 0 300 90" preserveAspectRatio="none">
          <path d={live} fill="none" stroke="#3049d8" strokeWidth="2" pathLength="1" />
        </svg>
        <i className="rp__dot" />
      </div>
      <div className="rp__lines">
        <i style={{ width: '90%' }} />
        <i style={{ width: '62%' }} />
      </div>
      <div className="rp__play mono">
        <span>▶ {r.narration}</span>
        <em>
          <i />
        </em>
        <span>
          {r.chapter} 2
        </span>
      </div>
    </div>
  )
}
