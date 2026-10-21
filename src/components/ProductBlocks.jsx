import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { LINKS } from '../lib/facts.js'
import PageHero from './PageHero.jsx'
import GlowButton from './GlowButton.jsx'
import Placeholder from './Placeholder.jsx'
import Accordion from './Accordion.jsx'
import { Section } from './PageBlocks.jsx'

/* Building blocks shared by the six product pages (Metrics, API, Research, Alpha AI, MCP, Dashboards).
   Page copy lives next to each page; nothing here carries product claims. */

/* One link component for every destination: app/docs URLs, in-page anchors and internal routes. */
export function ExtLink({ href, children, className = '', ...rest }) {
  if (/^https?:|^mailto:/.test(href)) {
    return (
      <a className={className} href={href} {...rest}>
        {children}
      </a>
    )
  }
  if (href.startsWith('#')) {
    return (
      <a className={className} href={href} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link className={className} to={href} {...rest}>
      {children}
    </Link>
  )
}

/* The six product pages as a pill rail, current one lit. */
export function ProductRail({ current }) {
  const { t } = useI18n()
  const rows = t.pages.hub.rows.filter((r) => ['metrics', 'alpha-ai', 'mcp', 'api', 'dashboards', 'research'].includes(r.key))
  return (
    <ul className="phero__rail" aria-label="Platform">
      {rows.map((r, i) => (
        <li key={r.key}>
          <Link to={r.to} className={r.key === current ? 'is-on' : ''} aria-current={r.key === current ? 'page' : undefined}>
            <b className="mono">{String(i + 1).padStart(2, '0')}</b> {r.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/* Hero: eyebrow, H1, subtitle, two buttons, one short line, the page's own visual on the right. */
export function ProductHero({ current, eyebrow, title, sub, line, primary, secondary, visual }) {
  const actions = (
    <>
      <GlowButton href={primary.href || LINKS.start}>{primary.label}</GlowButton>
      {secondary && (
        <ExtLink className="link-arrow phero__more" href={secondary.href}>
          {secondary.label} <span>→</span>
        </ExtLink>
      )}
    </>
  )
  return <PageHero eyebrow={eyebrow} title={title} sub={sub} actions={actions} note={line} visual={visual} rail={<ProductRail current={current} />} centered />
}

/* A page section with the usual eyebrow / H2 / lede head. */
export function PBlock({ id, eyebrow, title, intro, dark = false, children, className = '' }) {
  return (
    <Section id={id} dark={dark} className={`pblock ${className}`}>
      <div className="container">
        {(eyebrow || title || intro) && (
          <div className="section__head">
            {eyebrow && (
              <p className="eyebrow" data-reveal="fade">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="h2" data-reveal="lines">
                {title}
              </h2>
            )}
            {intro && (
              <p className="lede" data-reveal="up">
                {intro}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </Section>
  )
}

/* A real capture, or a named placeholder while the capture is still to be made. */
export function Shot({ src, name, note, ratio = '16 / 9', alt = '', dark = false, caption, className = '' }) {
  if (!src) return <Placeholder name={name} note={note} ratio={ratio} dark={dark} className={className} />
  return (
    <figure className={`shot2 ${className}`} style={{ aspectRatio: ratio }}>
      <img src={src} alt={alt} loading="lazy" draggable="false" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

/* Cards with an optional capture on top, a tag, title, text, a small technical line and one link. */
export function Cards({ items, cols = 2, className = '' }) {
  return (
    <div className={`pcards pcards--${cols} ${className}`} data-stagger>
      {items.map((c) => (
        <article className="pcard" data-item key={c.title}>
          {c.media && <div className="pcard__media">{c.media}</div>}
          <div className="pcard__body">
            {c.tag && <p className="ptag">{c.tag}</p>}
            <h3>
              {c.title}
              {c.short && <span className="pcard__short"> · {c.short}</span>}
            </h3>
            {c.text && <p>{c.text}</p>}
            {c.tech && <p className="pcard__tech">{c.tech}</p>}
            {c.href && (
              <ExtLink className="pcard__link link-arrow" href={c.href}>
                {c.linkLabel} <span>→</span>
              </ExtLink>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

/* FAQ section: an accordion; answers may carry inline links. */
export function ProductFaq({ title, items, eyebrow = 'FAQ' }) {
  return (
    <Section id="faq" className="faq" theme="paper">
      <div className="container faq__grid">
        <div className="section__head faq__head">
          <p className="eyebrow" data-reveal="fade">
            {eyebrow}
          </p>
          <h2 className="h2" data-reveal="lines">
            {title}
          </h2>
        </div>
        <Accordion items={items} idPrefix="pfaq" />
      </div>
    </Section>
  )
}
