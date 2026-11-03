import { useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS, SQUAD } from '../lib/facts.js'
import { gsap, ScrollTrigger, Observer, SplitText, useGSAP, MQ } from '../lib/gsap.js'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import CrowdScene from '../components/CrowdScene.jsx'
import CountUp from '../components/CountUp.jsx'
import TextShimmer from '../components/TextShimmer.jsx'
import GlassLogoReveal from '../components/GlassLogoReveal.jsx'
import { Section } from '../components/PageBlocks.jsx'
/* Block 9: the Home's social-proof block, same component (PostsStack: 10 stacked 9:16 posts). The Home passes a `phrase`, and so does this page now
   above the cards; the About brief only asks for the cards and their animation, so it is left out here. */
import PostsStack from '../components/PostsStack.jsx'

/* ------------------------------------------------------------------ 1 · Hero visual */
/* A small crowd in three rows, dark and quiet, with five figures lit in blue. Static markup: it never carries the numbers. */
const ROWS = [
  { y: 74, s: 0.6, n: 10, shift: 0, tone: 'back', lit: [4] },
  { y: 116, s: 0.82, n: 8, shift: 0.5, tone: 'mid', lit: [2, 6] },
  { y: 170, s: 1.08, n: 6, shift: 0, tone: 'front', lit: [1, 4] },
]

function Crowd() {
  let k = 0
  return (
    <div className="abt-crowd" aria-hidden="true">
      <svg viewBox="0 0 600 230" focusable="false">
        {ROWS.map((row) => {
          const step = 600 / row.n
          return Array.from({ length: row.n }, (_, i) => {
            const lit = row.lit.includes(i)
            const idx = lit ? k++ : -1
            const x = step * (i + 0.5) + row.shift * step * 0.35
            return (
              <g
                key={`${row.tone}-${i}`}
                transform={`translate(${x.toFixed(1)} ${row.y}) scale(${row.s})`}
                className={`abt-fig abt-fig--${row.tone}${lit ? ' is-lit' : ''}`}
                style={lit ? { '--i': idx } : undefined}
              >
                <circle cx="0" cy="0" r="11" />
                <path d="M-22 40C-22 17-10 13 0 13s22 4 22 27z" />
              </g>
            )
          })
        })}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ 2 · Story */
/* The two paragraphs are read letter by letter, line by line, as the page scrolls: the block is pinned in the middle of the
   screen and the scroll only advances the text, until the last letter is dark; then the page goes on. Without motion the
   text is simply all dark. */
function Story({ body }) {
  const root = useRef(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const box = root.current.querySelector('.abt-story')
        const splits = gsap.utils.toArray('.abt-story__p', root.current).map((el) => new SplitText(el, { type: 'words,chars', wordsClass: 'abt-w', charsClass: 'abt-c' }))
        const chars = splits.flatMap((sp) => sp.chars)
        gsap.set(chars, { color: '#b3b9c6' })
        gsap
          .timeline({
            scrollTrigger: {
              trigger: box,
              start: 'center center',
              end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(chars, { color: '#0b0d14', ease: 'none', duration: 0.05, stagger: 0.02 })
        return () => splits.forEach((sp) => sp.revert())
      })
      return () => mm.revert()
    },
    { scope: root },
  )
  return (
    <div ref={root}>
      <Section id="story">
        <div className="container abt-story">
          {body.map((b, i) => (
            <p className={`abt-story__p${i === 0 ? ' abt-story__p--lead' : ''}`} key={b}>
              {b}
            </p>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------------------------------------ 3 · Timeline */
/* Circular checkpoints on a rail. Blue energy runs along the rail with the scroll, lights each checkpoint and the title
   that goes with it. Without motion (or before the script runs) everything is already lit and readable. */
function Timeline({ data }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const el = root.current
      const rail = el.querySelector('.abt-tl__rail')
      const nodes = gsap.utils.toArray('.abt-tl__node', el)
      const mmSize = gsap.matchMedia()
      mmSize.add(MQ.mobile, () => {
        // vertical rail: from the first checkpoint to the last one
        const dots = el.querySelectorAll('.abt-tl__dot')
        const fit = () => {
          const a = dots[0].getBoundingClientRect()
          const b = dots[dots.length - 1].getBoundingClientRect()
          rail.style.height = `${Math.round(b.top - a.top)}px`
        }
        fit()
        window.addEventListener('resize', fit)
        return () => {
          window.removeEventListener('resize', fit)
          rail.style.height = ''
        }
      })

      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const fill = el.querySelector('.abt-tl__fill')
        const vertical = window.matchMedia(MQ.mobile).matches
        gsap.set(fill, vertical ? { scaleY: 0, transformOrigin: '50% 0' } : { scaleX: 0, transformOrigin: '0 50%' })
        const last = nodes.length - 1
        const steps = nodes.length // checkpoint i comes on at time i + 1; time 0 is the rest state, with every dot off
        // Desktop: the section is held in place and the scroll is taken over: each gesture runs the lit line from one dot to
        // the next (or back to the previous one) in one go, so it can never be left stopped half way. After the
        // last dot (or before the first) the page goes on as usual. Mobile: the rail is vertical and follows the scroll.
        const pinned = !vertical
        const tl = gsap.timeline(pinned ? { paused: true } : { scrollTrigger: { trigger: el.querySelector('.abt-tl'), start: 'top 70%', end: 'bottom 58%', scrub: 0.8 } })
        // the lit line starts running once the first dot is on, and reaches each next dot as it comes on
        tl.fromTo(fill, vertical ? { scaleY: 0 } : { scaleX: 0 }, vertical ? { scaleY: 1, ease: 'none', duration: last } : { scaleX: 1, ease: 'none', duration: last }, 1)
        nodes.forEach((n, i) => tl.fromTo(n, { '--lit': 0 }, { '--lit': 1, duration: 0.45, ease: 'power2.out' }, i + 0.55))
        tl.to({}, { duration: 0.25 }, steps)
        for (let i = 0; i <= steps; i++) tl.addLabel(`s${i}`, i)
        tl.addLabel('end', tl.duration())

        if (!pinned) return undefined

        let idx = 0 // 0 = every dot off ... steps = every dot on
        let tween = null
        let lastAt = 0
        let state = 'idle' // 'holding' while the scroll is taken over; 'released' once the last (or first) step has been passed
        // Every gesture moves to the next dot right away: a new gesture retargets a tween that is still running instead of
        // being ignored until it ends, and only a very short lockout keeps one flick of the wheel from jumping two dots.
        const goTo = (n) => {
          idx = n
          if (tween) tween.kill()
          tween = tl.tweenTo(`s${n}`, { duration: 0.5, ease: 'power2.out' })
        }
        const step = (dir) => {
          const now = performance.now()
          if (now - lastAt < 220) return
          lastAt = now
          const n = idx + dir
          if (n < 0 || n > steps) {
            finish()
            return
          }
          goTo(n)
        }
        const keys = (e) => {
          if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
            e.preventDefault()
            step(1)
          } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
            e.preventDefault()
            step(-1)
          }
        }
        const obs = Observer.create({
          type: 'wheel,touch',
          wheelSpeed: -1,
          tolerance: 12,
          preventDefault: true,
          onUp: () => step(1), // the user scrolls down
          onDown: () => step(-1), // the user scrolls up
        })
        obs.disable()
        const unlock = () => {
          obs.disable()
          window.removeEventListener('keydown', keys)
        }
        function finish() {
          state = 'released'
          unlock()
        }
        const hold = (from) => {
          state = 'holding'
          idx = from === 'below' ? steps : 0
          if (tween) tween.kill()
          tl.pause().seek(from === 'below' ? `s${steps}` : 0)
          lastAt = 0
          st.scroll(st.start) // a fast scroll can overshoot the section: bring it back to where it is held
          obs.enable()
          window.addEventListener('keydown', keys)
        }
        // The held zone is a single pixel, so a quick scroll can cross it in one go: onEnter and onLeave then arrive together.
        // Entering always holds (unless the section was just passed on purpose); leaving only resets, and is ignored while holding.
        const leave = () => {
          if (state === 'released') state = 'idle'
        }
        const st = ScrollTrigger.create({
          trigger: el.querySelector('.container'),
          start: 'center center',
          end: '+=1',
          pin: true,
          onEnter: () => state === 'idle' && hold('above'),
          onEnterBack: () => state === 'idle' && hold('below'),
          onLeave: leave,
          onLeaveBack: leave,
        })
        return () => {
          unlock()
          obs.kill()
          st.kill()
        }
      })
      return () => {
        mm.revert()
        mmSize.revert()
      }
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <Section id="timeline">
        <div className="container">
          <div className="section__head">
            <h2 className="h2" data-reveal="lines">
              {data.timelineTitle}
            </h2>
          </div>
          <div className="abt-tl">
            <span className="abt-tl__rail" aria-hidden="true">
              <i className="abt-tl__fill" />
            </span>
            <ol>
              {data.timeline.map((m) => (
                <li className="abt-tl__node" key={m.title}>
                  <i className="abt-tl__dot" aria-hidden="true" />
                  <span className="abt-tl__when" aria-hidden={m.when ? undefined : 'true'}>
                    {m.when}
                  </span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------------------------------------ 4 · Team */
const XGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const InGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

/* Desktop: one row of black-and-white portraits; the hovered, focused or tapped person opens into color with the name, role,
   bio and networks. Mobile: a list of rows that open the same way. Every action works by touch and keyboard. */
function Team({ data }) {
  const [active, setActive] = useState(0)

  return (
    <Section id="team" dark>
      <div className="container">
        <div className="section__head">
          <p className="eyebrow" data-reveal="fade">
            {data.teamEyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {data.teamTitle}
          </h2>
          <p className="lede" data-reveal="up">
            {data.teamSub}
          </p>
        </div>
        <ul className="abt-team" data-reveal="up">
          {data.team.map((m, i) => {
            const open = active === i
            return (
              <li
                key={m.name}
                className={`abt-member${open ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <button type="button" className="abt-member__hit" aria-expanded={open} aria-controls={`abt-bio-${i}`} onClick={() => setActive(i)}>
                  <img className="abt-member__photo" src={m.photo} alt={m.name} width="720" height="720" loading="lazy" />
                  <span className="sr-only">{`, ${m.role}`}</span>
                </button>
                <div className="abt-member__id">
                  <h3>{m.name}</h3>
                  <p>{m.role}</p>
                </div>
                <div className="abt-member__panel" id={`abt-bio-${i}`}>
                  <p className="abt-member__bio">{m.bio}</p>
                  <span className="abt-member__social">
                    {m.x && (
                      <a href={m.x} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on X`}>
                        <XGlyph />
                      </a>
                    )}
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}>
                        <InGlyph />
                      </a>
                    )}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ 6 · Community */
/* The Telegram mark, revealed by a liquid-glass tile (GlassLogoReveal): it lingers big against the glass rim, which bends it
   into colour, then lets go and leaves the logo. Click to replay. */
const TELEGRAM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2aabee"/><path fill="#fff" d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`

function CommunityScene() {
  return (
    <GlassLogoReveal
      className="abt-comm__scene abt-comm__scene--glass"
      logo={TELEGRAM_SVG}
      label="Telegram"
      look="dark"
      iconPlate={false}
      originalColors
      background="#0b0d14"
      logoScale={0.62}
      finalScale={0.8}
      tuning={{ startZoom: 2.3 }}
    />
  )
}

/* ------------------------------------------------------------------ Page */
export default function About() {
  const { t } = useI18n()
  const p = t.pages.about
  useMeta({
    title: 'About Alphractal | Our Team, Research & Community',
    description:
      'Meet the team behind Alphractal and the global community helping shape our crypto analytics platform through research, feedback and shared market insights.',
  })

  // no card: the crowd is the hero's whole backdrop (see PageHero's `backdrop`), and the numbers are a plain row
  const stats = (
    <div className="abt-hero-vis">
      <ul className="abt-stats">
        {p.stats.map((s) => (
          <li key={s.label}>
            <b className="display">
              <CountUp value={s.value} suffix={s.suffix} />
            </b>
            <span className="mono">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <PageShell>
      <PageHero eyebrow={p.eyebrow} title={p.title} sub={p.sub} visual={stats} grid={false} backdrop={<><CrowdScene fill fallback={<Crowd />} /><div className="abt-fog" aria-hidden="true" /></>} />

      <Story body={p.body} />
      <Timeline data={p} />
      <Team data={p} />

      <Section id="research">
        <div className="container duo">
          <div className="duo__col">
            <div data-reveal="up">
              <TextShimmer as="h2" className="h2" text={p.researchTitle} duration={3.2} baseColor="#0b0d14" shimmerColor="#ffffff" spread={26} />
            </div>
            <p className="lede" data-reveal="up">
              {p.research}
            </p>
          </div>
          <span className="duo__rule" aria-hidden="true" />
          <div className="duo__col">
            <div data-reveal="up" data-delay="0.1">
              <TextShimmer as="h2" className="h2" text={p.directionTitle} duration={3.2} baseColor="#0b0d14" shimmerColor="#ffffff" spread={26} />
            </div>
            <p className="lede" data-reveal="up" data-delay="0.1">
              {p.direction}
            </p>
          </div>
        </div>
      </Section>

      <Section id="careers">
        <div className="container careers">
          <div>
            <p className="eyebrow" data-reveal="fade">
              {p.careersEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {p.careersTitle}
            </h2>
          </div>
          <div data-reveal="up" data-delay="0.1">
            <p className="lede">{p.careersText}</p>
            <a className="btn btn--ink careers__cta" href={LINKS.careers}>
              {p.careersCta}
            </a>
          </div>
        </div>
      </Section>

      <Section id="community" dark>
        <div className="container abt-comm">
          <div className="abt-comm__copy">
            <p className="eyebrow" data-reveal="fade">
              {p.communityEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {p.communityTitle}
            </h2>
            <div data-reveal="up" data-delay="0.1">
              {p.community.map((c) => (
                <p className="lede" key={c}>
                  {c}
                </p>
              ))}
              <a className="btn btn--blue abt-comm__cta" href={LINKS.community}>
                {p.communityCta}
              </a>
            </div>
          </div>
          <CommunityScene />
        </div>
      </Section>

      <Section id="squad">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {p.squadEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {p.squadTitle}
            </h2>
            <p className="lede" data-reveal="up">
              {p.squadSub}
            </p>
          </div>
          <ul className="abt-squad" data-stagger>
            {SQUAD.map((m) => (
              <li className="abt-squad__card" key={m.name} data-item>
                <a href={m.url} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on ${m.net}`}>
                  <span className={`abt-squad__ph${m.photo === 'rafaela-romano' ? ' abt-squad__ph--zoom' : ''}`}>
                    <img
                      src={`/squad/${m.photo}.webp`}
                      alt={`${m.name}, profile photo`}
                      width={m.photo === 'rafaela-romano' ? 467 : 400}
                      height={m.photo === 'rafaela-romano' ? 433 : 400}
                      loading="lazy"
                    />
                  </span>
                  <h3>{m.name}</h3>
                  <em>{m.net}</em>
                </a>
              </li>
            ))}
          </ul>
          <div className="abt-invite" data-reveal="up">
            <div>
              <h3>{p.inviteTitle}</h3>
              <p>{p.inviteText}</p>
            </div>
            <a className="abt-amb" href={LINKS.ambassador} target="_blank" rel="noopener noreferrer">
              <span>{p.inviteCta}</span>
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </Section>

      <PostsStack phrase={p.postsPhrase} label={t.proof.postsLabel} />
    </PageShell>
  )
}
