import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import { LINKS } from '../lib/facts.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import PageShell from '../components/PageShell.jsx'
import GlowButton from '../components/GlowButton.jsx'
import { Section } from '../components/PageBlocks.jsx'
import { cachedPosts, formatDate, loadPosts } from '../lib/blog.js'
import Soon from './Soon.jsx'

export default function Post() {
  const { slug } = useParams()
  const { t, lang } = useI18n()
  const b = t.pages.blog
  const [posts, setPosts] = useState(cachedPosts)
  const bar = useRef(null)

  useEffect(() => {
    if (!posts) loadPosts().then(setPosts)
  }, [posts])

  const post = posts?.find((p) => p.slug === slug)

  const jsonLd = useMemo(
    () =>
      post && {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.iso,
        author: { '@type': 'Organization', name: post.author },
        publisher: { '@type': 'Organization', name: 'Alphractal', url: 'https://alphractal.com' },
        mainEntityOfPage: `https://alphractal.com/blog/${post.slug}`,
      },
    [post],
  )
  useMeta({ title: post ? `${post.title} · Alphractal` : 'Alphractal', description: post?.description, jsonLd })

  // Reading progress under the header
  useGSAP(
    () => {
      if (!post) return undefined
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          bar.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            transformOrigin: '0 50%',
            scrollTrigger: { trigger: '.post__body', start: 'top 30%', end: 'bottom 70%', scrub: 0.3 },
          },
        )
      })
      return () => mm.revert()
    },
    { dependencies: [post?.slug] },
  )

  const related = useMemo(() => {
    if (!post || !posts) return []
    return posts
      .filter((p) => p.slug !== post.slug)
      .map((p) => ({ p, shared: p.tags.filter((x) => post.tags.includes(x)).length }))
      .sort((a, c) => c.shared - a.shared || c.p.iso.localeCompare(a.p.iso))
      .slice(0, 3)
      .map((x) => x.p)
  }, [post, posts])

  if (posts && !post) return <Soon />
  if (!post) return <div className="post__loading" />

  return (
    <PageShell>
      <div ref={bar} className="post__progress" role="progressbar" aria-label={b.progress} />
      <article data-nav-theme="paper">
        <header className="post__head tpage">
          <div className="container">
            <Link to="/blog" className="link-arrow post__back">
              <span style={{ transform: 'scaleX(-1)' }}>→</span> {b.back}
            </Link>
            <p className="post__tags mono">{post.tags.join(' · ')}</p>
            <h1 className="display post__title">{post.title}</h1>
            <p className="post__by mono">
              {post.author} · {formatDate(post.iso, lang)} · {post.minutes} {b.minutes}
            </p>
            {b.langNote && <p className="legal__note">{b.langNote}</p>}
          </div>
        </header>
        <div className="container post__body">
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </article>

      <Section id="post-cta" dark>
        <div className="container post__cta">
          <h2 className="h2">{b.ctaTitle}</h2>
          <p className="lede">{b.ctaText}</p>
          <GlowButton href={LINKS.start}>{b.ctaButton}</GlowButton>
        </div>
      </Section>

      <Section id="more">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow" data-reveal="fade">
              {b.keepReading}
            </p>
            <h2 className="h2" data-reveal="lines">
              {b.keepReadingTitle}
            </h2>
          </div>
          <div className="rel rel--3" data-stagger>
            {related.map((p) => (
              <Link to={`/blog/${p.slug}`} className="rel__card" data-item key={p.slug}>
                <span className="ring ring--soft" aria-hidden="true" />
                <span className="brow__tags mono">{p.tags.slice(0, 2).join(' · ')}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </PageShell>
  )
}
