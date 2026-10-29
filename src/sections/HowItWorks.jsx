import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import Placeholder from '../components/Placeholder.jsx'
import Starfield from '../components/Starfield.jsx'
import '../styles/home.css'

/* Four steps, one recording each. The title of the active step appears first and its text follows; there is no progress bar
   and no numbering. Until Matheus records the four app captures, each step holds a named Placeholder (step-1-recording ...
   step-4-recording): home → Crypto → filters → BTC; BTC → Alpha Metrics → a proprietary chart; chart → Alpha AI → a question and
   its real answer; the Terminal. Desktop with motion: the section pins and the scroll moves from step to step.
   Anything else: the four steps are stacked, each with its recording under its text. */
/* Real recordings of app.alphractal.com, edited with motion (public/recordings/step-N.mp4, 16:9; masters in /gravacoes). Step 4
   (the Terminal) has no capture yet, so it keeps its named Placeholder, at the same ratio so the frame does not jump. */
const REC = [true, true, true]
const REC_RATIO = '16 / 9'

export default function HowItWorks() {
  const { t } = useI18n()
  const h = t.how
  const root = useRef(null)
  // Only one recording decodes at a time: the active step's, and only while the section is on screen. Four 1080p videos
  // playing together (three hidden) was what made scrolling through here stutter.
  const play = useRef({ visible: false, active: 0, pinned: false })

  const syncVideos = () => {
    const p = play.current
    root.current?.querySelectorAll('.hw__rec').forEach((v, i) => {
      if (p.visible && (!p.pinned || i === p.active)) v.play().catch(() => {})
      else v.pause()
    })
  }

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        play.current.visible = e.isIntersecting
        syncVideos()
      },
      { rootMargin: '150px 0px' },
    )
    io.observe(root.current)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`${MQ.motion} and ${MQ.desktop} and (min-height: 640px)`, () => {
        const el = root.current
        const steps = gsap.utils.toArray('.hw__step', el)
        const shots = gsap.utils.toArray('.hw__shot', el)
        el.classList.add('is-pinned')
        let current = -1
        const show = (idx) => {
          if (idx === current) return
          current = idx
          steps.forEach((s, i) => s.classList.toggle('is-active', i === idx))
          shots.forEach((s, i) => s.setAttribute('aria-hidden', i === idx ? 'false' : 'true'))
          play.current.active = idx
          syncVideos()
        }
        play.current.pinned = true
        // the next section starts under this one's pinned panel, so it rises over it during the held scroll
        const next = el.nextElementSibling
        const cover = () => {
          el.style.paddingBottom = '0'
          if (next) next.style.marginTop = `-${el.querySelector('.hw__pin').offsetHeight}px`
        }
        cover()
        window.addEventListener('resize', cover)
        show(0)
        gsap.to('.hw__stars', {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: () => `+=${steps.length * 0.85 * window.innerHeight + window.innerHeight}`, // the last viewport is held while Inside slides over
              pin: el.querySelector('.hw__pin'),
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const vh = window.innerHeight
                const run = steps.length * 0.85 * vh
                show(Math.min(steps.length - 1, Math.floor(((self.progress * (run + vh)) / run) * steps.length)))
              },
            },
          })
          .to({}, { duration: 1 })
        return () => {
          el.classList.remove('is-pinned')
          play.current.pinned = false
          syncVideos()
          window.removeEventListener('resize', cover)
          el.style.paddingBottom = ''
          if (next) next.style.marginTop = ''
          steps.forEach((s, i) => s.classList.toggle('is-active', i === 0))
          shots.forEach((s) => s.removeAttribute('aria-hidden'))
        }
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [h] },
  )

  return (
    <section ref={root} className="hw" data-nav-theme="dark" id="how">
      <Starfield className="hw__stars" />
      <div className="hw__pin">
        <div className="container hw__grid">
          <h2 className="h2 hw__title" data-reveal="lines">
            {h.title}
          </h2>
          <ol className="hw__list">
            {h.steps.map((s, i) => (
              <li className={`hw__step${i === 0 ? ' is-active' : ''}`} key={s.title}>
                <div className="hw__txt">
                  <h3>{s.title}</h3>
                  <div className="hw__more">
                    <p>{s.text}</p>
                  </div>
                </div>
                <div className="hw__shot">
                  <div className="hw__frame">
                    {REC[i] ? (
                      <video
                        className="hw__rec"
                        src={`/recordings/step-${i + 1}.mp4`}
                        poster={`/recordings/step-${i + 1}.jpg`}
                        aria-label={s.shotNote}
                        width="1920"
                        height="1080"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        disablePictureInPicture
                      />
                    ) : (
                      <Placeholder dark className="hw__ph" name={s.shot} note={s.shotNote} ratio={REC_RATIO} />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
