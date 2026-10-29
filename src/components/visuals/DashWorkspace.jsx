import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../../lib/gsap.js'
import { useLive } from '../../lib/live.js'
import { Chart, Cursor, Siren, put, mix } from './DashCharts.jsx'

/* The dashboard as one surface of 1px lines on paper. Two scenes use it:
   - Workspace: the pinned, scroll-built assembly of the opening (Alerts, STH, MVRV, Screeners, Open Interest).
   - Builder: a small looping demo (empty workspace, modules enter, drag and resize, Save and Share).
   Modules are positioned by percentage rects while a scene plays, so a neighbour really changes position, width and height
   when another module is moved or resized. The finished composition is a plain CSS grid: it is what SSR, phones and
   reduced motion show. */

const MODS = [
  { k: 'alerts', title: 'Alphractal Alerts' },
  { k: 'sth', title: 'STH Realized Price Bands', chart: 'sth' },
  { k: 'mvrv', title: 'MVRV', chart: 'mvrv' },
  { k: 'scr', title: 'Screeners' },
  { k: 'oi', title: 'Open Interest', chart: 'oi' },
]

// four assets, ordered by funding rate (bar lengths are proportional shapes, not data)
const MINI = [
  { c: 'DOGE', w: 90 },
  { c: 'BTC', w: 42, hit: true },
  { c: 'ETH', w: 30 },
]

function Body({ k, chart, title }) {
  if (chart) return <Chart kind={chart} label={`${title} chart`} />
  if (k === 'alerts')
    return (
      <div className="dx-alert">
        <p className="dx-alert__head">
          <Siren /> Bitcoin alert
        </p>
        <p>Funding Rate crossed above 0.05%.</p>
        <p className="dx-alert__next">Review positioning and leverage in Alphractal.</p>
      </div>
    )
  return (
    <div className="dx-mini" role="table" aria-label="Screener, sorted by Funding Rate">
      <div className="dx-mini__row dx-mini__row--head" role="row">
        <span role="columnheader">Coin</span>
        <span role="columnheader">Funding Rate ↓</span>
      </div>
      {MINI.map((r) => (
        <div key={r.c} className={`dx-mini__row${r.hit ? ' dx-hit' : ''}`} role="row">
          <b role="cell">{r.c}</b>
          <span role="cell">
            <i style={{ width: `${r.w}%` }} />
          </span>
        </div>
      ))}
    </div>
  )
}

function Module({ m }) {
  return (
    <section className={`dx-mod dx-mod--${m.k}`} data-mod={m.k} aria-label={m.title}>
      <div className="dx-mod__in">
        <h3 className="dx-mod__t">{m.title}</h3>
        <Body {...m} />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Workspace (pinned, scrubbed by scroll) */
const FINAL = { alerts: [0, 0, 0.5, 0.3], sth: [0.5, 0, 0.5, 0.3], mvrv: [0, 0.3, 0.5, 0.3], scr: [0.5, 0.3, 0.5, 0.3], oi: [0, 0.6, 1, 0.4] }

export function Workspace() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ desk: `${MQ.desktop} and ${MQ.motion}`, mob: `${MQ.mobile} and ${MQ.motion}` }, (ctx) => {
        const mobile = !!ctx.conditions.mob
        const q = (s) => root.current.querySelector(s)
        const ws = q('.dx-ws')
        const stage = q('.dx-stage')
        const m = Object.fromEntries(MODS.map((x) => [x.k, q(`[data-mod="${x.k}"]`)]))
        const cursor = q('.dx-cursor')
        const handle = q('.dx-handle')
        const dest = q('.dx-dest')
        const lines = q('.dx-lines')
        const hit = q('.dx-hit')

        // where every module is at each moment of the story (the neighbours' rects change as the others move)
        // desktop: a 2 x 3 grid. Phones: the same story on one column, modules moving up and down instead of sideways.
        const R = mobile
          ? {
              A0: [0, 0.05, 1, 0.14], C0: [0, 0.22, 1, 0.34], S0: [0, 0.04, 1, 0.5], S1: [0, 0.17, 1, 0.19], S2: [0, 0.17, 1, 0.19],
              M0: [0, 0.5, 1, 0.4], M1: [0, 0.36, 1, 0.2], O0: [0, 0.66, 1, 0.3],
              FIN: { alerts: [0, 0, 1, 0.17], sth: [0, 0.17, 1, 0.19], mvrv: [0, 0.36, 1, 0.2], scr: [0, 0.56, 1, 0.26], oi: [0, 0.82, 1, 0.18] },
            }
          : {
              A0: [0.22, 0.08, 0.56, 0.22], C0: [0.22, 0.34, 0.56, 0.34], S0: [0.1, 0.04, 0.8, 0.66], S1: [0.54, 0, 0.46, 0.4], S2: [0.5, 0, 0.5, 0.46],
              M0: [0.25, 0.5, 0.5, 0.45], M1: [0, 0, 0.5, 0.46], O0: [0.2, 0.62, 0.6, 0.38], FIN: FINAL,
            }
        const { A0, C0, S0, S1, S2, M0, M1, O0, FIN } = R

        const head = (r) => [r[0] + 0.05, r[1] + 0.035]
        const corner = (r) => [r[0] + r[2] - 0.004, r[1] + r[3] - 0.006]
        const toPx = (p) => ({ x: p[0] * ws.offsetWidth, y: p[1] * ws.offsetHeight })

        root.current.classList.add('is-live')
        stage.style.display = 'block'
        stage.style.position = 'relative'
        if (mobile) stage.style.height = `${Math.round(Math.min(window.innerHeight * 0.86 - 20, 760))}px`
        gsap.set(Object.values(m), { position: 'absolute', autoAlpha: 0 })
        put(m.alerts, A0)
        put(m.scr, C0)
        put(m.sth, S0)
        put(m.mvrv, M0)
        put(m.oi, O0)
        put(dest, S1)
        gsap.set([cursor, handle, dest, lines], { autoAlpha: 0 })
        gsap.set(hit, { color: '#0b0d14' })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: mobile ? '+=300%' : '+=320%', pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
        })

        // Moves a module between two rects, optionally dragging the cursor (and the corner handle) with it.
        const morph = (key, from, to, at, dur, grab) => {
          const o = { v: 0 }
          tl.to(
            o,
            {
              v: 1,
              duration: dur,
              onUpdate: () => {
                const r = mix(from, to, o.v)
                put(m[key], r)
                if (grab === 'head') gsap.set(cursor, toPx(head(r)))
                if (grab === 'corner') {
                  const c = toPx(corner(r))
                  gsap.set(cursor, c)
                  gsap.set(handle, { x: c.x - 5, y: c.y - 5 })
                }
              },
            },
            at,
          )
        }
        // The cursor travels between two points of the stage.
        const travel = (from, to, at, dur) => {
          const o = { v: 0 }
          tl.to(o, { v: 1, duration: dur, onUpdate: () => gsap.set(cursor, toPx(mix(from, to, o.v))) }, at)
        }

        // 1. the alert comes in, the screener after it and highlights Bitcoin
        tl.to(m.alerts, { autoAlpha: 1, duration: 1 }, 0)
          .to(m.scr, { autoAlpha: 1, duration: 1 }, 1)
          .to(hit, { color: '#4b6bff', duration: 0.6 }, 2)
        // 2. STH Realized Price Bands alone, large: the cursor holds its header, drags it right and docks it
          .to([m.alerts, m.scr], { autoAlpha: 0, duration: 0.8 }, 3.2)
          .to(lines, { autoAlpha: 1, duration: 0.8 }, 3.4)
          .to(m.sth, { autoAlpha: 1, duration: 0.8 }, 3.6)
          .to(cursor, { autoAlpha: 1, duration: 0.4 }, 4.4)
          .to(dest, { autoAlpha: 1, duration: 0.6 }, 4.6)
        gsap.set(cursor, toPx(head(S0)))
        morph('sth', S0, S1, 5, 1.8, 'head')
        // 3. the corner handle resizes it: its real width and height change
        tl.call(() => put(dest, S2), null, 6.9)
        tl.to(handle, { autoAlpha: 1, duration: 0.3 }, 6.9)
        travel(head(S1), corner(S1), 6.9, 0.5)
        morph('sth', S1, S2, 7.5, 1.2, 'corner')
        tl.to(handle, { autoAlpha: 0, duration: 0.3 }, 8.9)
        // 4. MVRV arrives alone, is dragged to the left and fitted beside it
        tl.to(m.mvrv, { autoAlpha: 1, duration: 0.8 }, 9)
        travel(corner(S2), head(M0), 9, 0.8)
        tl.call(() => put(dest, M1), null, 9.8)
        morph('mvrv', M0, M1, 10, 1.6, 'head')
        // 5. Alerts and Screeners take the free cells of the same grid; MVRV and STH make room for them
        morph('alerts', A0, FIN.alerts, 11.8, 0.01)
        morph('scr', C0, FIN.scr, 11.8, 0.01)
        tl.to([m.alerts, m.scr], { autoAlpha: 1, duration: 1.2, stagger: 0.25 }, 11.9)
        morph('mvrv', M1, FIN.mvrv, 11.8, 1.4)
        morph('sth', S2, FIN.sth, 11.8, 1.4)
        tl.to(hit, { color: '#4b6bff', duration: 0.1 }, 12.6)
        // 6. Open Interest arrives last and widens across the base; grid, handles and cursor go
        tl.to(cursor, { autoAlpha: 0, duration: 0.4 }, 13.2)
          .to(m.oi, { autoAlpha: 1, duration: 1 }, 13.4)
          .to(dest, { autoAlpha: 0, duration: 0.6 }, 13.4)
        morph('oi', O0, FIN.oi, 13.8, 1.3)
        tl.to(lines, { autoAlpha: 0, duration: 0.8 }, 14.6).to({}, { duration: 1.2 }, 15.2)

        return () => {
          tl.scrollTrigger && tl.scrollTrigger.kill()
          tl.kill()
          root.current.classList.remove('is-live')
          stage.removeAttribute('style')
          Object.values(m).forEach((el) => el.removeAttribute('style'))
          ;[cursor, handle, dest, lines, hit].forEach((el) => el.removeAttribute('style'))
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div className="dx-scene" ref={root} data-nav-theme="paper">
      <div className="dx-ws" role="group" aria-label="Workspace">
        <div className="dx-lines" aria-hidden="true" />
        <div className="dx-stage">
          {MODS.map((x) => (
            <Module m={x} key={x.k} />
          ))}
        </div>
        <div className="dx-dest" aria-hidden="true" />
        <span className="dx-handle" aria-hidden="true" />
        <Cursor />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Builder (loops while on screen) */
const BMODS = [
  { k: 'sth', title: 'STH Realized Price Bands', chart: 'sth' },
  { k: 'mvrv', title: 'MVRV', chart: 'mvrv' },
  { k: 'oi', title: 'Open Interest', chart: 'oi' },
]
const CELLS = [[0, 0, 0.5, 0.64], [0.5, 0, 0.5, 0.64], [0, 0.64, 1, 0.36]]

const TALLER = { sth: [0.5, 0, 0.5, 0.64], mvrv: [0, 0, 0.5, 0.64], oi: [0, 0.64, 1, 0.36] }

export function Builder() {
  const root = useRef(null)

  useLive(root, (el) => {
    const q = (s) => el.querySelector(s)
    const stage = q('.bd-stage')
    const m = Object.fromEntries(BMODS.map((x) => [x.k, q(`[data-mod="${x.k}"]`)]))
    const cells = [...el.querySelectorAll('.bd-cell')]
    const cursor = q('.dx-cursor')
    const handle = q('.dx-handle')
    const [save, share] = [q('[data-act="save"]'), q('[data-act="share"]')]
    const toPx = (p) => ({ x: p[0] * stage.offsetWidth, y: p[1] * stage.offsetHeight })
    const head = (r) => [r[0] + 0.06, r[1] + 0.05]
    const corner = (r) => [r[0] + r[2] - 0.01, r[1] + r[3] - 0.015]
    const btn = (b) => {
      const s = stage.getBoundingClientRect()
      const r = b.getBoundingClientRect()
      return [(r.left + r.width / 2 - s.left) / s.width, (r.top + r.height / 2 - s.top) / s.height]
    }
    const L = { sth: [0, 0, 0.5, 0.5], mvrv: [0.5, 0, 0.5, 0.5], oi: [0, 0.5, 1, 0.5] }
    const swapped = { sth: [0.5, 0, 0.5, 0.5], mvrv: [0, 0, 0.5, 0.5] }

    const t = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8, defaults: { ease: 'power2.inOut' } })
    const morph = (key, from, to, at, dur, grab) => {
      const o = { v: 0 }
      t.to(
        o,
        {
          v: 1,
          duration: dur,
          onUpdate: () => {
            const r = mix(from, to, o.v)
            put(m[key], r)
            if (grab === 'head') gsap.set(cursor, toPx(head(r)))
            if (grab === 'corner') {
              const c = toPx(corner(r))
              gsap.set(cursor, c)
              gsap.set(handle, { x: c.x - 5, y: c.y - 5 })
            }
          },
        },
        at,
      )
    }
    const travel = (from, to, at, dur) => {
      const o = { v: 0 }
      t.to(o, { v: 1, duration: dur, onUpdate: () => gsap.set(cursor, toPx(mix(from, to, o.v))) }, at)
    }
    // empty workspace
    const reset = () => {
      BMODS.forEach((x) => put(m[x.k], L[x.k]))
      gsap.set(Object.values(m), { autoAlpha: 0, y: 14 })
      ;[L.sth, L.mvrv, L.oi].forEach((r, i) => put(cells[i], r))
      gsap.set(cells, { autoAlpha: 1 })
      gsap.set([cursor, handle], { autoAlpha: 0 })
      gsap.set([save, share], { color: '#0b0d14' })
    }
    reset()
    t.call(reset, null, 0)
    // the charts come in one after another
    t.to(Object.values(m), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.45, ease: 'power3.out' }, 0.8).to(cells, { autoAlpha: 0, duration: 0.6 }, 2)
    // drag: MVRV takes the left cell and STH makes room
    t.call(() => gsap.set(cursor, toPx(head(L.mvrv))), null, 2.9).to(cursor, { autoAlpha: 1, duration: 0.3 }, 3)
    morph('mvrv', L.mvrv, swapped.mvrv, 3.3, 1.2, 'head')
    morph('sth', L.sth, swapped.sth, 3.3, 1.2)
    // resize: the corner handle makes the pair taller and Open Interest steps down
    travel(head(swapped.mvrv), corner(swapped.mvrv), 4.6, 0.6)
    t.to(handle, { autoAlpha: 1, duration: 0.25 }, 5)
    morph('mvrv', swapped.mvrv, TALLER.mvrv, 5.3, 1.1, 'corner')
    morph('sth', swapped.sth, TALLER.sth, 5.3, 1.1)
    morph('oi', L.oi, TALLER.oi, 5.3, 1.1)
    t.to(handle, { autoAlpha: 0, duration: 0.25 }, 6.5)
    // Save, then Share
    t.call(() => gsap.set(cursor, toPx(btn(save))), null, 6.9)
    t.to(save, { color: '#4b6bff', duration: 0.3 }, 7.1).to(cursor, { x: () => toPx(btn(share)).x, y: () => toPx(btn(share)).y, duration: 0.7 }, 7.3)
    t.to(share, { color: '#4b6bff', duration: 0.3 }, 8.1)
    t.to(cursor, { autoAlpha: 0, duration: 0.4 }, 8.6).to({}, { duration: 1.4 }, 8.8)

    return {
      start: () => t.play(),
      toggle: (on) => t.paused(!on),
      kill: () => {
        t.kill()
        BMODS.forEach((x) => {
          m[x.k].removeAttribute('style')
          put(m[x.k], TALLER[x.k])
        })
        ;[...cells, cursor, handle, save, share].forEach((e) => gsap.set(e, { clearProps: 'all' }))
      },
    }
  })

  return (
    <div className="bd" ref={root} aria-hidden="true">
      <div className="bd-bar">
        <span data-act="save">Save</span>
        <span data-act="share">Share</span>
      </div>
      <div className="bd-stage">
        {CELLS.map((c, i) => (
          <div className="bd-cell" key={i} style={{ left: `${c[0] * 100}%`, top: `${c[1] * 100}%`, width: `${c[2] * 100}%`, height: `${c[3] * 100}%` }}>
            <i />
          </div>
        ))}
        {BMODS.map((x) => {
          const r = TALLER[x.k]
          return (
            <section className="dx-mod bd-mod" data-mod={x.k} key={x.k} style={{ left: `${r[0] * 100}%`, top: `${r[1] * 100}%`, width: `${r[2] * 100}%`, height: `${r[3] * 100}%` }}>
              <div className="dx-mod__in">
                <h3 className="dx-mod__t">{x.title}</h3>
                <Chart kind={x.chart} label="" />
              </div>
            </section>
          )
        })}
        <span className="dx-handle" />
        <Cursor />
      </div>
    </div>
  )
}
