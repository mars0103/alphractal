import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from '../lib/gsap.js'

/*
 * Declarative scroll-in animations. Mark elements in JSX:
 *   data-reveal="up | down | left | right | fade | scale | lines | words | rule"
 *   data-delay="0.2"          optional, in seconds
 *   data-stagger              on a parent: its [data-item] children enter in sequence
 * Every reveal runs once, and none of it runs under prefers-reduced-motion.
 */
export function useReveals(scope, deps = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        const root = scope.current
        if (!root) return

        const start = 'top 88%'
        const trig = (el) => ({
          delay: parseFloat(el.dataset.delay || 0),
          scrollTrigger: { trigger: el, start, once: true },
        })

        const dirs = {
          up: { y: 44 },
          down: { y: -32 },
          left: { x: -56 },
          right: { x: 56 },
          fade: {},
          scale: { scale: 0.94 },
        }

        root.querySelectorAll('[data-reveal]').forEach((el) => {
          const kind = el.dataset.reveal || 'up'

          if (kind === 'lines' || kind === 'words') {
            SplitText.create(el, {
              type: kind === 'lines' ? 'lines' : 'lines,words',
              mask: 'lines',
              autoSplit: true,
              aria: 'auto',
              onSplit: (self) => {
                gsap.set(el, { autoAlpha: 1 })
                return gsap.from(kind === 'lines' ? self.lines : self.words, {
                  yPercent: 110,
                  duration: 1.05,
                  ease: 'power4.out',
                  stagger: kind === 'lines' ? 0.11 : 0.045,
                  ...trig(el),
                })
              },
            })
            return
          }

          if (kind === 'rule') {
            gsap.fromTo(
              el,
              { scaleX: 0 },
              { scaleX: 1, duration: 1.4, ease: 'power3.inOut', transformOrigin: '0 50%', ...trig(el) },
            )
            return
          }

          gsap.fromTo(
            el,
            { autoAlpha: 0, ...dirs[kind] },
            { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1, ...trig(el) },
          )
        })

        root.querySelectorAll('[data-stagger]').forEach((parent) => {
          const items = parent.querySelectorAll('[data-item]')
          if (!items.length) return
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.09,
              scrollTrigger: { trigger: parent, start, once: true },
            },
          )
        })
      })

      // Fonts and images change layout: refresh trigger positions once everything settled.
      const refresh = () => ScrollTrigger.refresh()
      document.fonts?.ready.then(refresh)
      window.addEventListener('load', refresh)

      return () => {
        window.removeEventListener('load', refresh)
        mm.revert()
      }
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  )
}
