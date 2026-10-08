import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'

const REAL_SRC = '/screens/home.png'

/* Where the five pieces sit before they converge, as a fraction of the stage: [x, y, rotation] */
const SCATTER = [
  [-0.3, -0.3, -5],
  [0.3, -0.34, 4],
  [-0.34, 0.3, 3],
  [0.32, 0.3, -4],
  [0, -0.02, 6],
]

/* Where each piece docks inside the laptop screen, as a fraction of the screen box: [x, y, w, h].
   These five rects fully tile the screen (0 → 1 on both axes), so once every piece is in place
   there is no gap or seam left to paper over — the pieces ARE the finished screenshot. */
const DOCK = [
  [0, 0, 1 / 3, 0.55],
  [1 / 3, 0, 1 / 3, 0.55],
  [2 / 3, 0, 1 / 3, 0.55],
  [0, 0.55, 0.5, 0.45],
  [0.5, 0.55, 0.5, 0.45],
]

export default function Consolidation() {
  const { t } = useI18n()
  const c = t.consolidation
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)

      // Desktop: pinned, scroll-driven. The laptop screen opens, then each piece — already a crop
      // of the real screenshot, not an illustration — flies into its slot, so the five converge
      // straight into the real interface with nothing to swap or crossfade at the end.
      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        const stage = q('.cons__stage')
        const screenEl = q('.mac__screen')
        const wins = qa('.win')
        const count = q('.cons__count-n')
        const countLabel = q('.cons__count-l')
        const state = { n: 5 }

        count.textContent = 5
        countLabel.textContent = c.tabs
        gsap.set(wins, { left: '50%', top: '50%', xPercent: -50, yPercent: -50 })

        // Each piece's background is a slice of the real screenshot, sized and positioned so
        // that once the piece reaches its docked scale, the slice lines up at 1:1 with its
        // neighbours — the same "window into a bigger image" trick as the footer wordmark
        // (see Footer.jsx): the crop is defined in the element's own untransformed coordinates,
        // so GSAP's transform:scale carries it to the right size for free.
        const layoutShots = () => {
          const scRect = screenEl.getBoundingClientRect()
          wins.forEach((w, i) => {
            const [dx, dy, dw, dh] = DOCK[i]
            const sx = (dw * scRect.width) / w.offsetWidth
            const sy = (dh * scRect.height) / w.offsetHeight
            const shot = w.querySelector('.win__shot')
            shot.style.backgroundSize = `${scRect.width / sx}px ${scRect.height / sy}px`
            shot.style.backgroundPosition = `${(-dx * scRect.width) / sx}px ${(-dy * scRect.height) / sy}px`
          })
        }

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: q('.cons__pin'),
            start: 'top top',
            end: '+=170%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: layoutShots,
          },
        })
        layoutShots()

        wins.forEach((w, i) => {
          const [fx, fy, rot] = SCATTER[i]
          const [dx, dy, dw, dh] = DOCK[i]
          const start = i * 0.05
          const bar = w.querySelector('.win__bar')

          const dockValue = (axis) => () => {
            const sRect = stage.getBoundingClientRect()
            const scRect = screenEl.getBoundingClientRect()
            const cellW = dw * scRect.width
            const cellH = dh * scRect.height
            const cellCx = scRect.left - sRect.left + dx * scRect.width + cellW / 2
            const cellCy = scRect.top - sRect.top + dy * scRect.height + cellH / 2
            if (axis === 'x') return cellCx - sRect.width / 2
            if (axis === 'y') return cellCy - sRect.height / 2
            if (axis === 'scaleX') return cellW / w.offsetWidth
            return cellH / w.offsetHeight
          }

          tl.fromTo(
            w,
            { x: () => fx * stage.offsetWidth, y: () => fy * stage.offsetHeight, rotation: rot, scaleX: 1, scaleY: 1, autoAlpha: 1 },
            { x: dockValue('x'), y: dockValue('y'), rotation: 0, scaleX: dockValue('scaleX'), scaleY: dockValue('scaleY'), duration: 1 },
            start,
          )
          // The "card" framing (outline, shadow, label chip) sells the piece as a floating window
          // while it flies; both dissolve as it docks, so the seam between pieces disappears too.
          // (An outline, not a border, so it doesn't shrink the padding box the full-bleed image
          // is positioned against — a border here would leave a 1px gap at every tile edge.)
          tl.to(w, { outlineColor: 'transparent', boxShadow: '0 0 0 0 rgba(0,0,0,0)', duration: 0.4 }, start + 0.6)
          tl.to(bar, { autoAlpha: 0, duration: 0.3 }, start + 0.6)
        })

        tl.to(
          state,
          {
            n: 1,
            duration: 1.2,
            ease: 'none',
            onUpdate: () => {
              const n = Math.max(1, Math.round(state.n))
              count.textContent = n
              countLabel.textContent = n === 1 ? c.tabsOne : c.tabs
            },
          },
          0,
        )

        tl.to({}, { duration: 0.3 }) // hold the finished, fully-assembled screen for a beat before the pin releases
      })

      // Mobile: no pin, the same story in reveals. The laptop's screen is a plain CSS background
      // of the real screenshot (see styles/story.css), so there is nothing to assemble here.
      mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
        gsap.from(qa('.win'), {
          autoAlpha: 0,
          y: 40,
          rotation: (i) => (i % 2 ? 2 : -2),
          stagger: 0.09,
          duration: 0.9,
          scrollTrigger: { trigger: q('.cons__stage'), start: 'top 82%', once: true },
        })
        gsap.from(q('.mac'), {
          autoAlpha: 0,
          y: 50,
          duration: 1,
          scrollTrigger: { trigger: q('.mac'), start: 'top 88%', once: true },
        })
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [c] },
  )

  return (
    <section ref={root} className="section cons" data-nav-theme="paper" id="one-terminal">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="cons__pin">
        <div className="container cons__grid">
          <div className="cons__copy">
            <p className="eyebrow" data-reveal="fade">
              {c.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {c.title}
            </h2>
            <div className="cons__body" data-reveal="up" data-delay="0.15">
              {c.body.map((p, i) => (
                <p className={i ? 'cons__punch' : 'lede'} key={p}>
                  {p}
                </p>
              ))}
            </div>
            <p className="cons__count mono" aria-hidden="true">
              <span className="cons__count-n num">5</span>
              <span className="cons__count-l">{c.tabs}</span>
            </p>
          </div>

          <div className="cons__stage" role="img" aria-label={`${c.tools.join(', ')} → ${c.unified}`}>
            <div className="mac">
              <div className="mac__screen" />
              <img className="mac__frame" src="/mockups/macbook.png" alt="" aria-hidden="true" />
              <span className="mac__tag mono">{c.illustrative}</span>
            </div>

            {c.tools.map((tool, i) => {
              const [dx, dy, dw, dh] = DOCK[i]
              return (
                <div className="win" key={tool}>
                  <div
                    className="win__shot"
                    aria-hidden="true"
                    style={{
                      backgroundImage: `url(${REAL_SRC})`,
                      backgroundSize: 'cover',
                      backgroundPosition: `${(dx + dw / 2) * 100}% ${(dy + dh / 2) * 100}%`,
                    }}
                  />
                  <div className="win__bar mono">
                    <span>{tool}</span>
                    <i />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
