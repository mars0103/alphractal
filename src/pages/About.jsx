import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import PageShell from '../components/PageShell.jsx'
import PageHero from '../components/PageHero.jsx'
import CountUp from '../components/CountUp.jsx'
import { Section } from '../components/PageBlocks.jsx'
import FinalCta from '../sections/FinalCta.jsx'

const PHOTO = '/team/team.jpg'

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
                  <span className="tl__when mono">{m.when || '—'}</span>
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

/*
 * The team, together (brief §5.6). If public/team/team.jpg exists it is shown whole, with five hover zones on top;
 * until then a five-panel composition stands in. Hobbies are added to `hobby` once collected.
 */
function Team({ data }) {
  const [active, setActive] = useState(2)
  const [photo, setPhoto] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setPhoto(true)
    img.src = PHOTO
  }, [])

  const initials = (n) =>
    n
      .split(' ')
      .filter((w) => /^[A-Z]/.test(w))
      .map((w) => w[0])
      .slice(0, 2)
      .join('')

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
        </div>
        <div className={`team ${photo ? 'team--photo' : ''}`} data-reveal="up" style={photo ? { '--photo': `url(${PHOTO})` } : undefined}>
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
              {!photo && <span className="member__mono display">{initials(m.name)}</span>}
              <span className="member__meta">
                <b>{m.name}</b>
                <em className="mono">{m.role}</em>
                <span className="member__line">{m.line}</span>
                {m.hobby && <span className="member__hobby mono">{m.hobby}</span>}
              </span>
            </button>
          ))}
        </div>
        <p className="team__hint mono">{data.teamHint}</p>
      </div>
    </Section>
  )
}

export default function About() {
  const { t } = useI18n()
  const p = t.pages.about
  const c = t.pages.common
  useMeta({ title: `${t.nav.about} · Alphractal`, description: p.body[0] })

  const stats = (
    <div className="vpanel inum">
      <span className="ring ring--dark" aria-hidden="true" />
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
  )

  return (
    <PageShell>
      <PageHero eyebrow={p.eyebrow} title={p.title} visual={stats} />

      <Section id="story">
        <div className="container story" data-stagger>
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
        <div className="container split split--even split--top">
          <div>
            <p className="eyebrow" data-reveal="fade">
              {p.researchEyebrow}
            </p>
            <p className="lede about__research" data-reveal="up">
              {p.research}
            </p>
          </div>
          <div>
            <p className="eyebrow" data-reveal="fade">
              {p.directionEyebrow}
            </p>
            <p className="lede about__research" data-reveal="up" data-delay="0.1">
              {p.direction}
            </p>
            <p className="terminal__legal mono" data-reveal="fade">
              {t.pages.terminal.disclaimer}
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

      <FinalCta title={c.ctaTitle} sub={c.ctaSub} primary={c.startFree} secondary={c.seePlatform} />
    </PageShell>
  )
}
