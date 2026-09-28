import { useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { gsap, Flip, useGSAP, MQ } from '../lib/gsap.js'
import PageShell from '../components/PageShell.jsx'
import { formatDate, loadPosts } from '../lib/blog.js'

/* Research & Insights: the 50 migrated articles, filterable, re-laid out with Flip. */
export default function Blog() {
  const { t, lang } = useI18n()
  const b = t.pages.blog
  const [posts, setPosts] = useState(null)
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('ALL')
  const flip = useRef(null)
  const root = useRef(null)

  useMeta({ title: `${b.title.replace(/\.$/, '')} · Alphractal`, description: b.sub })

  useEffect(() => {
    loadPosts().then(setPosts)
  }, [])

  const tags = useMemo(() => {
    if (!posts) return []
    const count = new Map()
    posts.forEach((p) => p.tags.forEach((x) => count.set(x, (count.get(x) || 0) + 1)))
    return [...count.entries()].sort((a, c) => c[1] - a[1]).slice(0, 8).map(([x]) => x)
  }, [posts])

  const shown = useMemo(() => {
    if (!posts) return []
    const needle = q.trim().toLowerCase()
    return posts.filter(
      (p) =>
        (tag === 'ALL' || p.tags.includes(tag)) &&
        (!needle || `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(needle)),
    )
  }, [posts, q, tag])

  const capture = () => {
    if (window.matchMedia(MQ.motion).matches) flip.current = Flip.getState('.brow')
  }

  // Rows that stay glide to their new place, new ones fade in
  useLayoutEffect(() => {
    if (!flip.current) return
    Flip.from(flip.current, {
      targets: '.brow',
      duration: 0.55,
      ease: 'power2.inOut',
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 }),
    })
    flip.current = null
  }, [shown])

  // First paint of the list
  useGSAP(
    () => {
      if (!posts) return undefined
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from(gsap.utils.toArray('.brow', root.current).slice(0, 14), { autoAlpha: 0, y: 22, duration: 0.7, stagger: 0.04, delay: 0.1 })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [posts === null, lang] },
  )

  return (
    <PageShell>
      <div ref={root}>
        <section className="tpage blog__head" data-nav-theme="paper">
          <div className="container">
            <p className="eyebrow" data-reveal="fade">
              {b.eyebrow}
            </p>
            <h1 className="display blog__title" data-reveal="lines">
              {b.title}
            </h1>
            <p className="lede" data-reveal="up" data-delay="0.1">
              {b.sub}
            </p>
            {b.langNote && <p className="legal__note">{b.langNote}</p>}

            <div className="blog__tools" data-reveal="up" data-delay="0.15">
              <label className="blog__search">
                <span className="sr-only">{b.search}</span>
                <input
                  type="search"
                  value={q}
                  placeholder={`${b.search}…`}
                  onChange={(e) => {
                    capture()
                    setQ(e.target.value)
                  }}
                />
              </label>
              <div className="blog__tags" role="group" aria-label="Tags">
                {['ALL', ...tags].map((x) => (
                  <button
                    type="button"
                    key={x}
                    aria-pressed={tag === x}
                    onClick={() => {
                      capture()
                      setTag(x)
                    }}
                  >
                    {x === 'ALL' ? b.all : x}
                  </button>
                ))}
              </div>
              <p className="blog__count mono" aria-live="polite">
                {b.count(shown.length)}
              </p>
            </div>
          </div>
        </section>

        <section className="blog__list section--tight" data-nav-theme="paper">
          <div className="hrule">
            <i />
          </div>
          <div className="container">
            {!posts && <p className="blog__loading mono">…</p>}
            <ul>
              {shown.map((p) => (
                <li key={p.slug}>
                  <Link to={`/blog/${p.slug}`} className="brow">
                    <span className="brow__date mono">{formatDate(p.iso, lang)}</span>
                    <span className="brow__main">
                      <span className="brow__tags mono">{p.tags.join(' · ')}</span>
                      <h2>{p.title}</h2>
                      <p>{p.description}</p>
                    </span>
                    <span className="brow__meta mono">
                      {p.minutes} {b.minutes}
                    </span>
                    <span className="brow__go" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {posts && shown.length === 0 && <p className="blog__empty">{b.empty}</p>}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
