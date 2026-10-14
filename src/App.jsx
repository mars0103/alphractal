import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import { useI18n } from './i18n/I18nProvider.jsx'
import { ScrollTrigger } from './lib/gsap.js'

// Home ships in the main bundle (it's the first thing almost everyone sees, and the splash
// screen covers that load anyway); every other route is its own chunk, fetched on demand,
// so a phone never has to parse pages it isn't looking at.
const loaders = {
  platform: () => import('./pages/Platform.jsx'),
  feature: () => import('./pages/Feature.jsx'),
  terminal: () => import('./pages/Terminal.jsx'),
  institutional: () => import('./pages/Institutional.jsx'),
  about: () => import('./pages/About.jsx'),
  vs: () => import('./pages/Vs.jsx'),
  legal: () => import('./pages/Legal.jsx'),
  blog: () => import('./pages/Blog.jsx'),
  post: () => import('./pages/Post.jsx'),
  soon: () => import('./pages/Soon.jsx'),
}
const Platform = lazy(loaders.platform)
const Feature = lazy(loaders.feature)
const Terminal = lazy(loaders.terminal)
const Institutional = lazy(loaders.institutional)
const About = lazy(loaders.about)
const Vs = lazy(loaders.vs)
const Legal = lazy(loaders.legal)
const Blog = lazy(loaders.blog)
const Post = lazy(loaders.post)
const Soon = lazy(loaders.soon)

/* Fetches the chunk behind a URL. entry-client awaits this before hydrating, so a prerendered
   page hydrates against loaded code instead of a suspended boundary (which React reports as a
   hydration mismatch and then re-renders from scratch). */
export function preloadRoute(pathname) {
  const p = pathname.replace(/\/+$/, '') || '/'
  if (p === '/') return Promise.resolve()
  if (p === '/platform') return loaders.platform()
  if (p.startsWith('/platform/')) return loaders.feature()
  if (p.startsWith('/vs/')) return loaders.vs()
  if (p === '/privacy' || p === '/terms') return loaders.legal()
  if (p === '/blog') return loaders.blog()
  if (p.startsWith('/blog/')) return loaders.post()
  if (loaders[p.slice(1)]) return loaders[p.slice(1)]()
  return loaders.soon()
}

export default function App() {
  const { lang } = useI18n()
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // Let the new page mount and its pins measure, then land on the anchor
      const id = hash.slice(1)
      const timer = setTimeout(() => {
        ScrollTrigger.refresh()
        document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
      }, 350)
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
    return undefined
  }, [pathname, hash])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      {/* Remounting on language change replays the entrance and re-splits text cleanly. */}
      <main id="main" key={`${lang}-${pathname}`} className="page">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/platform/:slug" element={<Feature />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/institutional" element={<Institutional />} />
            <Route path="/about" element={<About />} />
            <Route path="/vs/:slug" element={<Vs />} />
            <Route path="/privacy" element={<Legal kind="privacy" />} />
            <Route path="/terms" element={<Legal kind="terms" />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Post />} />
            <Route path="*" element={<Soon />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
