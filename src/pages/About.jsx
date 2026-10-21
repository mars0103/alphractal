import { useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS, SQUAD } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import BorderGlow from '../components/BorderGlow.jsx'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import CountUp from '../components/CountUp.jsx'
import { Section } from '../components/PageBlocks.jsx'
import PostsCarousel from '../components/PostsCarousel.jsx'

/* Scroll-driven line, 2023 → today */
function Timeline({ data }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const line = root.current.querySelector('.tl__fill')
        const nodes = gsap.utils.toArray('.tl__node', root.current)
        const desktop = window.matchMedia(MQ.desktop).matches
        gsap.set(line, desktop ? { scaleX: 0, transformOrigin: '0 50%' } : { scaleY: 0, transformOrigin: '50% 0' })
        gsap.set(nodes, { opacity: 0.3 })
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current.querySelector('.tl'), start: 'top 72%', end: 'bottom 55%', scrub: 0.8 },
        })
        tl.to(line, desktop ? { scaleX: 1, ease: 'none', duration: nodes.length } : { scaleY: 1, ease: 'none', duration: nodes.length })
        nodes.forEach((n, i) => tl.to(n, { opacity: 1, duration: 0.4 }, i * 0.9))
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <Section id="timeline">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {data.timelineEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {data.timelineTitle}
            </h2>
          </div>
          <div className="tl">
            <span className="tl__rail" aria-hidden="true">
              <i className="tl__fill" />
            </span>
            <ol>
              {data.timeline.map((m) => (
                <li className="tl__node" key={m.title}>
                  <i className="tl__dot" aria-hidden="true" />
                  {m.when && <span className="tl__when mono">{m.when}</span>}
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

/* The team, a single row in black & white; the hovered/focused person expands into color. */
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
        <div className="team" data-reveal="up">
          {data.team.map((m, i) => (
            <button
              type="button"
              key={m.name}
              className={`member ${active === i ? 'is-active' : ''}`}
              aria-expanded={active === i}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <img className="member__photo" src={m.photo} alt={m.name} loading="lazy" />
              <span className="member__meta">
                <b>{m.name}</b>
                {m.role && <em>{m.role}</em>}
                {m.bio && <span className="member__bio">{m.bio}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* Eight luminous figures: the team, drawn as quiet busts in the site's blue. */
function Figures() {
  return (
    <ul className="figs" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} style={{ '--i': i }}>
          <svg viewBox="0 0 40 52">
            <circle cx="20" cy="14" r="9" />
            <path d="M4 50c0-10 7-17 16-17s16 7 16 17z" />
          </svg>
        </li>
      ))}
    </ul>
  )
}

const FlagBR = () => (
  <svg viewBox="0 0 28 20" width="28" height="20" role="img" aria-label="Brazil">
    <rect width="28" height="20" fill="#009c3b" />
    <path d="M14 3 25 10 14 17 3 10z" fill="#ffdf00" />
    <circle cx="14" cy="10" r="4.2" fill="#002776" />
  </svg>
)
const FlagAU = () => (
  <svg viewBox="0 0 28 20" width="28" height="20" role="img" aria-label="Australia">
    <rect width="28" height="20" fill="#012169" />
    <path d="M0 0 14 10M14 0 0 10" stroke="#fff" strokeWidth="2" />
    <path d="M7 0v10M0 5h14" stroke="#fff" strokeWidth="3.2" />
    <path d="M7 0v10M0 5h14" stroke="#c8102e" strokeWidth="1.6" />
    <circle cx="7" cy="16" r="1.6" fill="#fff" />
    <circle cx="20" cy="4" r="1.1" fill="#fff" />
    <circle cx="24" cy="9" r="1.1" fill="#fff" />
    <circle cx="20" cy="15" r="1.1" fill="#fff" />
    <circle cx="16" cy="9" r="1.1" fill="#fff" />
  </svg>
)

export default function About() {
  const { t } = useI18n()
  const p = t.pages.about
  useMeta({
    title: 'About Alphractal | Our Team, Research & Community',
    description:
      'Meet the team behind Alphractal and the global community helping shape our crypto analytics platform through research, feedback and shared market insights.',
  })

  const stats = (
    <BorderGlow>
      <div className="vpanel inum inum--row">
        <Figures />
        <ul>
          {p.stats.map((s) => (
            <li key={s.label}>
              <b className="inum__v display">
                <CountUp value={s.value} suffix={s.suffix} />
              </b>
              <span className="mono">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </BorderGlow>
  )

  return (
    <PageShell>
      <PageHero eyebrow={p.eyebrow} title={p.title} sub={p.sub} visual={stats} />

      <Section id="story">
        <div className="container story" data-stagger>
          <span className="story__flags" aria-label={`${p.flags.br} and ${p.flags.au}`}>
            <FlagBR />
            <FlagAU />
          </span>
          {p.body.map((b, i) => (
            <p className={i === 0 ? 'lede story__lead' : 'story__p'} data-item key={b}>
              {b}
            </p>
          ))}
        </div>
      </Section>

      <Timeline data={p} />
      <Team data={p} />

      <Section id="research">
        <div className="container duo">
          <div className="duo__col">
            <h2 className="h2" data-reveal="lines">
              {p.researchTitle}
            </h2>
            <p className="lede" data-reveal="up">
              {p.research}
            </p>
          </div>
          <span className="duo__rule" aria-hidden="true" />
          <div className="duo__col">
            <h2 className="h2" data-reveal="lines">
              {p.directionTitle}
            </h2>
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
        <div className="container careers community">
          <div>
            <p className="eyebrow" data-reveal="fade">
              {p.communityEyebrow}
            </p>
            <h2 className="h2" data-reveal="lines">
              {p.communityTitle}
            </h2>
          </div>
          <div data-reveal="up" data-delay="0.1">
            {p.community.map((para) => (
              <p className="lede" key={para}>
                {para}
              </p>
            ))}
            <a className="btn btn--blue careers__cta" href={LINKS.community}>
              {p.communityCta}
            </a>
          </div>
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
          <ul className="squad" data-stagger>
            {SQUAD.map((m) => (
              <li className="squad__card" data-item key={m.name}>
                <a href={m.url} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on ${m.net}`}>
                  <img src={`/squad/${m.photo}.webp`} alt={m.name} width="200" height="200" loading="lazy" />
                  <b>{m.name}</b>
                  <em>{m.net}</em>
                </a>
              </li>
            ))}
          </ul>
          <div className="invite" data-reveal="up">
            <div>
              <h3>{p.inviteTitle}</h3>
              <p>{p.inviteText}</p>
            </div>
            <a className="btn btn--ink btn--sm" href={LINKS.ambassador}>
              {p.inviteCta}
            </a>
          </div>
        </div>
        <PostsCarousel label="Posts from people who use Alphractal" />
      </Section>
    </PageShell>
  )
}
