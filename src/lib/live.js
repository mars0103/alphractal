import { gsap, ScrollTrigger, useGSAP, MQ } from './gsap.js'

/* Shared "alive" behaviour for chart scenes (extracted from the Institutional page, where it was approved).
   - useLive: grows a scene in when it first comes into view, then keeps it moving while it is on screen.
   - useZoom(root, scale, selector): on a mouse, the first child of the `selector` frame (default `.ist__zoom`, any element
     with `overflow:hidden`; `.live-zoom` is provided) magnifies around the pointer. Both are no-ops where motion is reduced. */

/* Runs `run(el, state)` only where motion is allowed. `run` returns { start, frame?, toggle?, kill? }: start() plays the
   intro once, when the scene first comes into view; frame(seconds) is called ~30x/s while it is on screen. */
export function useLive(root, run) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const state = { on: false }
        const api = run(root.current, state)
        let started = false
        const go = () => {
          if (started) return
          started = true
          api.start()
        }
        const set = (on) => {
          state.on = on
          if (on) go()
          if (api.toggle) api.toggle(on)
        }
        const st = ScrollTrigger.create({ trigger: root.current, start: 'top 88%', end: 'bottom 4%', onToggle: (s) => set(s.isActive) })
        if (st.isActive) set(true)
        let acc = 0
        const tick = (_, dt) => {
          if (!state.on || !started || !api.frame) return
          acc += dt
          if (acc < 33) return
          api.frame(acc / 1000)
          acc = 0
        }
        gsap.ticker.add(tick)
        return () => {
          gsap.ticker.remove(tick)
          st.kill()
          if (api.kill) api.kill()
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )
}

/* Mouse only: the chart magnifies around the pointer (the point under the cursor stays put, everything else grows away
   from it), and eases back when the pointer leaves. */
export function useZoom(root, S = 2.2, sel = '.ist__zoom') {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`(hover: hover) and (pointer: fine) and ${MQ.motion}`, () => {
        const box = root.current.querySelector(sel)
        if (!box) return undefined
        const svg = box.firstElementChild // the one child that is scaled; the frame (box) clips it
        gsap.set(svg, { transformOrigin: '0 0' })
        const to = (vars) => gsap.to(svg, { ...vars, duration: 0.6, ease: 'power3.out', overwrite: true })
        const move = (e) => {
          // measure from the wrapper: the svg itself is the part being scaled
          const b = box.getBoundingClientRect()
          to({ scale: S, x: (1 - S) * (e.clientX - b.left), y: (1 - S) * (e.clientY - b.top) })
        }
        const leave = () => to({ scale: 1, x: 0, y: 0 })
        box.addEventListener('pointermove', move)
        box.addEventListener('pointerleave', leave)
        return () => {
          box.removeEventListener('pointermove', move)
          box.removeEventListener('pointerleave', leave)
          gsap.set(svg, { clearProps: 'transform' })
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )
}
