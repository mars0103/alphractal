import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'
import Placeholder from '../components/Placeholder.jsx'

// Ticker → real brand color (public/coins/<ticker>.svg is the matching badge).
const ASSET_COLORS = {
  btc: '#f7931a',
  eth: '#627eea',
  sol: '#14f195',
  bnb: '#f3ba2f',
  xrp: '#23292f',
  ada: '#0033ad',
  avax: '#e84142',
  link: '#2a5ada',
  dot: '#e6007a',
  doge: '#c2a633',
  atom: '#2e3148',
  matic: '#8247e5',
}
// Two sets of 7, arranged 2–3–2 like an integrations wall. Only 12 coin badges exist in
// public/coins, so the sets share two tickers — the point is the swap, not 14 unique logos.
// BTC sits at index 3 of GROUP_B, the centre of the middle row, and is the one that gets picked.
const GROUP_A = ['eth', 'sol', 'bnb', 'xrp', 'ada', 'dot', 'link']
const GROUP_B = ['avax', 'doge', 'matic', 'btc', 'atom', 'eth', 'sol']
const ROWS = (group) => [group.slice(0, 2), group.slice(2, 5), group.slice(5, 7)]

function CoinCard({ coin, big }) {
  return (
    <span className={`inc-card${big ? ' inc-card--lg' : ''}`} style={{ '--coin': ASSET_COLORS[coin] }}>
      <img src={`/coins/${coin}.svg`} alt="" width={big ? 32 : 24} height={big ? 32 : 24} loading="lazy" />
    </span>
  )
}

function CoinWall({ group, pickTicker }) {
  return ROWS(group).map((row, ri) => (
    <div className={`inc-row${ri === 1 ? ' inc-row--mid' : ''}`} key={ri}>
      {row.map((c, ci) => (
        <CoinCard coin={c} big={ri === 1 && ci === 1 && c === pickTicker} key={`${c}-${ri}-${ci}`} />
      ))}
    </div>
  ))
}

export default function HowItWorks() {
  const { t } = useI18n()
  const h = t.how
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const q = (s) => root.current.querySelector(s)
      const qa = (s) => gsap.utils.toArray(s, root.current)

      const build = (scrollTrigger, timed = false) => {
        const groupA = q('.inc-group--a')
        const groupB = q('.inc-group--b')
        const cardsA = qa('.inc-group--a .inc-card')
        const cardsB = qa('.inc-group--b .inc-card')
        const btcCard = q('.inc-group--b .inc-card--lg')
        const otherCardsB = cardsB.filter((el) => el !== btcCard)
        const scene1 = q('.scene--assets')
        const scene2 = q('.scene--chart')
        const scene3 = q('.scene--ask')
        const scene4 = q('.scene--act')
        const steps = qa('.how__step')
        const fill = q('.how__fill')
        const chartImg = q('.scene--chart .shot')
        const askCard = q('.scene--ask .shot')
        let current = -1

        gsap.set(groupB, { autoAlpha: 0 })
        // Group A starts fully visible — at progress 0 the scrubbed timeline hasn't played
        // any tween yet, so an entrance tween here would leave the panel blank right at the
        // top of the pin (the one moment a visitor is guaranteed to pass through).
        gsap.set(cardsA, { autoAlpha: 1, y: 0 })
        gsap.set(cardsB, { autoAlpha: 0, y: 10 })
        gsap.set(otherCardsB, { filter: 'grayscale(0) brightness(1)', opacity: 1 })
        gsap.set(q('.assets__pick'), { autoAlpha: 0, y: 8 })
        gsap.set([scene2, scene3, scene4], { autoAlpha: 0 })
        gsap.set(scene1, { autoAlpha: 1 })
        gsap.set(chartImg, { clipPath: 'inset(0 100% 0 0)' })
        gsap.set(askCard, { autoAlpha: 0, x: 40 })

        const sync = (progress) => {
          gsap.set(fill, { scaleY: progress })
          const idx = progress < 0.26 ? 0 : progress < 0.5 ? 1 : progress < 0.76 ? 2 : 3
          if (idx !== current) {
            current = idx
            steps.forEach((s, i) => s.classList.toggle('is-active', i === idx))
          }
        }
        // Desktop scrubs the timeline with the pinned scroll. On phones the panel sits below the
        // copy, so a scroll-scrubbed run would already be over by the time it is on screen:
        // there it plays on its own, once, when the panel comes into view.
        const tl = timed
          ? gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onUpdate: () => sync(tl.progress()) })
          : gsap.timeline({
              defaults: { ease: 'power2.inOut' },
              scrollTrigger: { ...scrollTrigger, scrub: 1, onUpdate: (self) => sync(self.progress) },
            })

        // 01: the coin wall sits for a read, then swaps for a second set with BTC centred and picked
        tl.to({}, { duration: 0.6 })
        tl.to(groupA, { autoAlpha: 0, y: -12, duration: 0.4 }, '+=0')
        tl.to(groupB, { autoAlpha: 1, duration: 0.01 }, '<')
        tl.to(cardsB, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.03 }, '<')
        tl.to(btcCard, { scale: 1.08, duration: 0.3, ease: 'back.out(2)' }, '+=0.15')
        // GSAP's className special property (even via .to()) replaced the whole attribute
        // with the literal string "+=is-picked" here instead of adding a class, wiping out
        // inc-card/inc-card--lg — classList.add via a plain callback is what actually works.
        tl.call(() => btcCard.classList.add('is-picked'), null, '<')
        tl.to(otherCardsB, { filter: 'grayscale(1) brightness(0.6)', opacity: 0.5, duration: 0.4 }, '<')
        tl.to(q('.assets__pick'), { autoAlpha: 1, y: 0, duration: 0.3 }, '<')
        tl.to({}, { duration: 0.25 })

        // 02: the real Whale vs Retail Delta chart wipes in from the left
        tl.to(scene1, { autoAlpha: 0, y: -24, duration: 0.35 })
        tl.to(scene2, { autoAlpha: 1, duration: 0.3 }, '<')
        tl.to(chartImg, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power2.out' }, '<0.1')
        tl.to({}, { duration: 0.3 })

        // 03: the same chart stays, and Alpha AI's real answer opens over it
        tl.to(scene2, { autoAlpha: 0, duration: 0.01 })
        tl.to(scene3, { autoAlpha: 1, duration: 0.3 }, '<')
        tl.to(askCard, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out' }, '<0.1')
        tl.to({}, { duration: 0.4 })

        // 04: on to the Terminal
        tl.to(scene3, { autoAlpha: 0, y: -16, duration: 0.45 })
        tl.to(scene4, { autoAlpha: 1, duration: 0.4 }, '<')
        tl.to({}, { duration: 0.4 })

        if (timed) {
          ScrollTrigger.create({
            trigger: q('.how__panel'),
            start: 'top 78%',
            once: true,
            onEnter: () => tl.timeScale(1.5).play(),
          })
        }
      }

      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        build({
          trigger: q('.how__pin'),
          start: 'top top',
          end: '+=400%',
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      })
      // Phones: the section locks too, like on desktop — copy on top, the panel under it, and the
      // three steps advance with the scroll until the visitor has been through all of them.
      mm.add(`${MQ.motion} and ${MQ.mobile} and (min-height: 700px)`, () => {
        build({
          trigger: q('.how__pin'),
          start: 'top top',
          end: '+=380%',
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      })
      // Very short phones: no lock, the run plays once when the panel scrolls into view
      mm.add(`${MQ.motion} and ${MQ.mobile} and (max-height: 699px)`, () => {
        build({}, true)
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [h] },
  )

  return (
    <section ref={root} className="section how section--dark" data-nav-theme="dark" id="how">
      <div className="hrule">
        <i data-reveal="rule" />
      </div>
      <div className="how__pin">
        <div className="container how__grid">
          <div className="how__copy">
            <p className="eyebrow" data-reveal="fade">
              {h.eyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {h.title}
            </h2>
            <ol className="how__steps">
              <span className="how__track" aria-hidden="true">
                <i className="how__fill" />
              </span>
              {h.steps.map((s, i) => (
                <li className={`how__step ${i === 0 ? 'is-active' : ''}`} key={s.n}>
                  <span className="how__n mono">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="how__panel" aria-hidden="true">
            <div className="scene scene--assets">
              <p className="scene__label mono">{h.pick}</p>
              <div className="inc-stack">
                <div className="inc-group inc-group--a">
                  <CoinWall group={GROUP_A} />
                </div>
                <div className="inc-group inc-group--b">
                  <CoinWall group={GROUP_B} pickTicker="btc" />
                </div>
              </div>
              <p className="assets__pick mono">BTC · 300+</p>
            </div>

            <div className="scene scene--chart">
              <div className="shot">
                <img src="/metrics/whale-retail.webp" alt="" width="1165" height="562" loading="lazy" />
              </div>
            </div>

            <div className="scene scene--ask">
              <div className="shot">
                <img src="/product/whale-ai.webp" alt="" width="1590" height="853" loading="lazy" />
              </div>
            </div>

            <div className="scene scene--act">
              <Placeholder dark className="scene__ph" name={h.actShot} note={h.actShotNote} ratio="auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
