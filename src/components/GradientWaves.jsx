import { useId, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'

/*
 * The Figma hero gradient, kept as a real SVG: six stacked wave paths with a 50px blur.
 * Path data is verbatim from the design (node 1:100). Each layer drifts on its own period,
 * the whole field parallaxes with scroll and leans toward the cursor.
 */
const LAYERS = [
  {
    id: 'w6',
    fill: '#0B0D14',
    d: 'M550.415 147.615C294.355 -2.345 159.945 237.5 124.748 376.167L100 596H3342V408.55C2518.16 384.055 806.476 297.575 550.415 147.615Z',
  },
  {
    id: 'w5',
    fill: '#030033',
    d: 'M550.415 200.615C294.355 50.655 159.945 290.5 124.748 429.167L100 649H3342V461.55C2518.16 437.055 806.476 350.575 550.415 200.615Z',
  },
  {
    id: 'w4',
    fill: '#1749FF',
    d: 'M550.415 253.615C294.355 103.655 159.945 343.5 124.748 482.167L100 702H3342V514.55C2518.16 490.055 806.476 403.575 550.415 253.615Z',
  },
  {
    id: 'w2',
    fill: '#666DFF',
    d: 'M550.415 290.615C294.355 140.655 159.945 380.5 124.748 519.167L100 739H3342V551.55C2518.16 527.055 806.476 440.575 550.415 290.615Z',
  },
  {
    id: 'w1',
    fill: '#1843DF',
    d: 'M538.335 363.103C306.539 227.353 184.866 444.47 153.003 569.998L130.6 769H3065.39V599.312C2319.62 577.138 770.132 498.853 538.335 363.103Z',
  },
  {
    id: 'w3',
    fill: '#FAFAF9',
    d: 'M487.122 429.095C293.011 315.416 191.12 497.234 164.438 602.352L145.678 769H2603.32V626.901C1978.8 608.332 681.232 542.775 487.122 429.095Z',
  },
]

export default function GradientWaves({ scrollTrigger, className = '', interactive = true }) {
  const root = useRef(null)
  const inner = useRef(null)
  const fid = `waves-blur-${useId().replace(/:/g, '')}`

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        const layers = gsap.utils.toArray('.wave-layer', root.current)

        // Entrance: the field rises into place, layer by layer (hero only)
        if (interactive) {
          gsap.from(layers, {
            y: 180,
            autoAlpha: 0,
            duration: 2.6,
            stagger: 0.14,
            ease: 'power3.out',
            svgOrigin: '1700 800',
          })
        }

        // Idle drift: each layer breathes on its own period so the edge never repeats exactly.
        // The origin sits on the bottom edge (y 769) so the paper layer always covers the layers under it.
        const drift = layers.map((layer, i) => {
          const dir = i % 2 ? 1 : -1
          return gsap.to(layer, {
            x: dir * gsap.utils.random(40, 110),
            scaleY: 1 + gsap.utils.random(0.04, 0.11) * (1 - i * 0.08),
            skewX: dir * gsap.utils.random(0.8, 2.2),
            svgOrigin: '1700 769',
            duration: gsap.utils.random(6.5, 10.5),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 1.2 + i * 0.2,
          })
        })

        // Keep the GPU quiet while the hero is off screen
        const gate = scrollTrigger?.current
          ? ScrollTrigger.create({
              trigger: scrollTrigger.current,
              start: 'top bottom',
              end: 'bottom top',
              onToggle: (self) => drift.forEach((t) => (self.isActive ? t.resume() : t.pause())),
            })
          : null

        // Scroll parallax on the whole field
        let parallax = null
        if (interactive && scrollTrigger?.current) {
          parallax = gsap.to(root.current, {
            yPercent: -14,
            ease: 'none',
            scrollTrigger: { trigger: scrollTrigger.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
          })
        }

        // Cursor lean (fine pointers only)
        let move
        if (interactive && window.matchMedia('(pointer: fine)').matches) {
          const qx = gsap.quickTo(inner.current, 'x', { duration: 1.6, ease: 'power3.out' })
          const qy = gsap.quickTo(inner.current, 'y', { duration: 1.6, ease: 'power3.out' })
          move = (e) => {
            qx((e.clientX / window.innerWidth - 0.5) * -46)
            qy((e.clientY / window.innerHeight - 0.5) * -26)
          }
          window.addEventListener('pointermove', move, { passive: true })
        }

        return () => {
          gate?.kill()
          parallax?.kill()
          drift.forEach((t) => t.kill())
          if (move) window.removeEventListener('pointermove', move)
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className={`waves ${className}`} aria-hidden="true">
      <div ref={inner} className="waves__inner">
        <svg viewBox="0 0 3442 869" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
          <g filter={`url(#${fid})`}>
            {LAYERS.map((l) => (
              <path key={l.id} className="wave-layer" d={l.d} fill={l.fill} />
            ))}
          </g>
          <defs>
            <filter
              id={fid}
              x="0"
              y="0"
              width="3442"
              height="869"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  )
}
