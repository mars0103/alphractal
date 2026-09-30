import { useMemo, useRef } from 'react'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { gsap, useGSAP, Flip, ScrollTrigger, MQ } from '../../lib/gsap.js'
import { series, toPath } from '../../lib/chart.js'
import { FACTS, LINKS } from '../../lib/facts.js'
import BorderGlow from '../BorderGlow.jsx'
import { Section } from '../PageBlocks.jsx'

/* ------------------------------------------------------------------ Metrics: proprietary models (dark) */
export function ModelsSection() {
  const { t } = useI18n()
  const m = t.pages.features.metrics.models
  const root = useRef(null)
  const sparks = useMemo(
    () => m.list.map((_, i) => toPath(series(30, 100 + i * 11, { drift: 0.007, vol: 0.15, start: 0.3 }), 120, 30, 3)),
    [m.list],
  )

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const draws = gsap.utils.toArray('[data-draw]', root.current)
        gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.to(draws, {
          strokeDashoffset: 0,
          duration: 1.5,
          stagger: 0.08,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: root.current.querySelector('.models__grid'), start: 'top 82%', once: true },
        })
        // Hover redraws the line
        const items = gsap.utils.toArray('.model', root.current)
        const off = items.map((el) => {
          const path = el.querySelector('[data-draw]')
          const enter = () => gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', overwrite: true })
          el.addEventListener('pointerenter', enter)
          return () => el.removeEventListener('pointerenter', enter)
        })
        return () => off.forEach((f) => f())
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <Section id="models" dark>
        <div className="container split split--even split--top">
          <div className="models__copy">
            <p className="eyebrow" data-reveal="fade">
              {m.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {m.title}
            </h2>
            <p className="lede" data-reveal="up">
              {m.sub}
            </p>
            <p className="lede" data-reveal="up" data-delay="0.1">
              {m.body}
            </p>
            <a className="link-arrow models__cta" href={LINKS.start} data-reveal="fade">
              {m.cta} <span>→</span>
            </a>
          </div>
          <div>
            <p className="models__hint mono">{m.hint}</p>
            <ul className="models__grid">
              {m.list.map((name, i) => (
                <li className="model" key={name}>
                  <span className="model__name">{name}</span>
                  <svg viewBox="0 0 120 30" aria-hidden="true">
                    <path d={sparks[i]} fill="none" stroke="currentColor" strokeWidth="1.6" data-draw pathLength="1" />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------------------------------------ Metrics: the 46-panel macro mosaic */
export function MacroSection() {
  const { t } = useI18n()
  const m = t.pages.features.metrics.macro
  const root = useRef(null)
  const tiles = useMemo(() => Array.from({ length: FACTS.macroPanels }, (_, i) => ({ id: i, w: 0.35 + ((i * 53) % 60) / 100, k: i % 4 })), [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const grid = root.current.querySelector('.mosaic')
        let timer
        let running = false
        const shuffle = () => {
          const els = Array.from(grid.children)
          const state = Flip.getState(els)
          gsap.utils.shuffle(els).forEach((el) => grid.appendChild(el))
          Flip.from(state, { duration: 1.3, ease: 'power3.inOut', stagger: { each: 0.012, from: 'random' }, absolute: false })
        }
        const st = ScrollTrigger.create({
          trigger: grid,
          start: 'top 85%',
          end: 'bottom 5%',
          onToggle: (self) => {
            running = self.isActive
            clearInterval(timer)
            if (running) timer = setInterval(shuffle, 3800)
          },
        })
        return () => {
          clearInterval(timer)
          st.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <Section id="macro">
        <div className="container">
          <div className="macro__head">
            <div className="section__head">
              <p className="eyebrow" data-reveal="fade">
                {m.eyebrow}
              </p>
              <h2 className="h2" data-reveal="lines">
                {m.title}
              </h2>
            </div>
            <div className="macro__text" data-reveal="up" data-delay="0.1">
              <p className="lede">{m.sub}</p>
              <p className="problem__p">{m.body}</p>
            </div>
          </div>
          <div className="mosaic" data-reveal="up" aria-label={`${FACTS.macroPanels} panels`}>
            {tiles.map((tl) => (
              <div className={`mtile mtile--${tl.k}`} key={tl.id}>
                <i style={{ '--w': tl.w }} />
                <i style={{ '--w': 1 - tl.w / 2 }} />
              </div>
            ))}
          </div>
          <p className="mosaic__hint mono">
            {FACTS.macroPanels} · {m.hint}
          </p>
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------------------------------------ MCP: the whole catalog */
export function ToolCatalog() {
  const { t } = useI18n()
  const c = t.pages.features.mcp.tools
  return (
    <Section id="tools">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {c.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {c.title}
          </h2>
        </div>
        <div className="catalog">
          <div className="catalog__col catalog__col--read" data-reveal="up">
            <header>
              <h3>
                {c.read} <b className="num">{FACTS.mcpReadTools}</b>
              </h3>
              <span className="mono">{c.readNote}</span>
            </header>
            <ul>
              {c.readList.map((n) => (
                <li key={n}>
                  <i className="tile is-read" /> {n}
                </li>
              ))}
            </ul>
          </div>
          <div className="catalog__col catalog__col--write" data-reveal="up" data-delay="0.1">
            <header>
              <h3>
                {c.write} <b className="num">{FACTS.mcpWriteTools}</b>
              </h3>
              <span className="mono">{c.writeNote}</span>
            </header>
            <ul>
              {c.writeList.map((n) => (
                <li key={n}>
                  <i className="tile is-write" /> {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ API: plan table + commercial tiers */
export function ApiTiers() {
  const { t } = useI18n()
  const a = t.pages.features.api.tiers
  return (
    <Section id="tiers">
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {a.eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {a.title}
          </h2>
        </div>
        <div className="tbl" data-reveal="up">
          <span className="ring ring--soft" aria-hidden="true" />
          <table>
            <thead>
              <tr>
                {a.cols.map((c) => (
                  <th key={c} scope="col" className="mono">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.rows.map((r) => (
                <tr key={r[0]}>
                  {r.map((cell, i) => (i === 0 ? <th scope="row" key={i}>{cell}</th> : <td key={i}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="commercial">
          <div>
            <h3>{a.commercial.title}</h3>
            <p>{a.commercial.text}</p>
          </div>
          <ul>
            {a.commercial.items.map((it) => (
              <li key={it.name}>
                <span className="mono">{it.name}</span>
                <b className="num">{it.price}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ Dashboards: a composed alert */
export function AlertsSection() {
  const { t } = useI18n()
  const a = t.pages.features.dashboards.alerts
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = (s) => root.current.querySelector(s)
        const qa = (s) => gsap.utils.toArray(s, root.current)
        const chips = qa('.rule__chan span')
        gsap.set([q('.rule__a'), q('.rule__b'), q('.rule__out')], { autoAlpha: 0, y: 14 })
        gsap.set(q('.rule__and'), { autoAlpha: 0, scale: 0.7 })
        gsap.set(q('.rule__link'), { scaleY: 0, transformOrigin: '50% 0' })
        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 1.5,
          scrollTrigger: { trigger: q('.rule'), start: 'top 78%', toggleActions: 'play pause resume pause' },
        })
        tl.to(q('.rule__a'), { autoAlpha: 1, y: 0, duration: 0.6 })
          .to(q('.rule__link'), { scaleY: 1, duration: 0.4 }, '>-0.1')
          .to(q('.rule__and'), { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '<0.2')
          .to(q('.rule__b'), { autoAlpha: 1, y: 0, duration: 0.6 }, '>-0.1')
          .to(q('.rule__out'), { autoAlpha: 1, y: 0, duration: 0.6 }, '+=0.3')
          .to(chips, { backgroundColor: 'rgba(75,107,255,.35)', color: '#fff', duration: 0.25, stagger: 0.3 }, '>-0.1')
          .to(chips, { backgroundColor: 'rgba(75,107,255,.08)', color: '#aab5ff', duration: 0.4 }, '+=1.6')
          .to([q('.rule__a'), q('.rule__b'), q('.rule__out'), q('.rule__and')], { autoAlpha: 0, duration: 0.4 }, '<')
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <Section id="alerts" dark>
        <div className="container split split--even split--top">
          <div className="alerts__copy">
            <p className="eyebrow" data-reveal="fade">
              {a.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {a.title}
            </h2>
            <p className="lede" data-reveal="up">
              {a.sub}
            </p>
            {a.body.map((p) => (
              <p className="lede" data-reveal="up" key={p}>
                {p}
              </p>
            ))}
            <p className="alerts__hist mono">{a.historic}</p>
          </div>
          <div>
            <BorderGlow>
              <div className="rule vpanel">
                <div className="rule__row rule__a">
                  <span className="mono">{a.rule.when}</span>
                  <b className="tok">{a.rule.a}</b>
                  <em>{a.rule.aOp}</em>
                  <b className="tok tok--v">{a.rule.aVal}</b>
                </div>
                <i className="rule__link" />
                <span className="rule__and mono">{a.rule.and}</span>
                <div className="rule__row rule__b">
                  <b className="tok">{a.rule.b}</b>
                  <em>{a.rule.bOp}</em>
                  <b className="tok tok--v">{a.rule.bVal}</b>
                </div>
                <div className="rule__row rule__out">
                  <span className="mono">{a.rule.then}</span>
                  <div className="rule__chan mono">
                    {a.channels.map((c) => (
                      <span key={c}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </BorderGlow>
            <div className="limits">
              <span className="mono">{a.limitsTitle}</span>
              <ul>
                {a.limits.map(([plan, n]) => (
                  <li key={plan}>
                    <span>{plan}</span>
                    <b className="num">{n}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------------------------------------ Dashboards: a screener that re-ranks */
const ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'LINK']

export function ScreenersSection() {
  const { t } = useI18n()
  const s = t.pages.features.dashboards.screeners
  const root = useRef(null)
  const scores = useMemo(() => ASSETS.map((a, i) => ({ a, v: 0.9 - i * 0.09 })), [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const list = root.current.querySelector('.rank')
        let timer
        const rerank = () => {
          const rows = Array.from(list.children)
          const state = Flip.getState(rows)
          const next = gsap.utils.shuffle(rows.slice())
          next.forEach((r, i) => {
            const v = 0.95 - i * 0.1
            r.style.setProperty('--v', v)
            list.appendChild(r)
          })
          Flip.from(state, { duration: 1, ease: 'power3.inOut', stagger: 0.04 })
        }
        const st = ScrollTrigger.create({
          trigger: list,
          start: 'top 85%',
          end: 'bottom 5%',
          onToggle: (self) => {
            clearInterval(timer)
            if (self.isActive) timer = setInterval(rerank, 3400)
          },
        })
        return () => {
          clearInterval(timer)
          st.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <Section id="screeners">
        <div className="container split split--even">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {s.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {s.title}
            </h2>
            <p className="lede" data-reveal="up">
              {s.sub}
            </p>
          </div>
          <div className="tbl tbl--rank" data-reveal="up">
            <span className="ring ring--soft" aria-hidden="true" />
            <p className="tbl__tag mono">{s.illustrative}</p>
            <ul className="rank">
              {scores.map((r, i) => (
                <li key={r.a} style={{ '--v': r.v }}>
                  <span className="rank__n mono">{String(i + 1).padStart(2, '0')}</span>
                  <b>{r.a}</b>
                  <span className="rank__bar">
                    <i />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------------------------------------ Research: the Academy staircase */
export function Academy() {
  const { t } = useI18n()
  const a = t.pages.features.research.academy
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const steps = gsap.utils.toArray('.stair__step i', root.current)
        gsap.from(steps, {
          scaleY: 0,
          transformOrigin: '50% 100%',
          duration: 1.2,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current.querySelector('.stair'), start: 'top 82%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <Section id="academy" dark>
        <div className="container split split--even">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {a.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {a.title}
            </h2>
            <p className="lede" data-reveal="up">
              {a.sub}
            </p>
          </div>
          <ol className="stair">
            {a.levels.map((l, i) => (
              <li className="stair__step" key={l} style={{ '--n': i }}>
                <i />
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <b>{l}</b>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </div>
  )
}
