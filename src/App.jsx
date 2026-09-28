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
const Platform = lazy(() => import('./pages/Platform.jsx'))
const Feature = lazy(() => import('./pages/Feature.jsx'))
const Terminal = lazy(() => import('./pages/Terminal.jsx'))
const Institutional = lazy(() => import('./pages/Institutional.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Pricing = lazy(() => import('./pages/Pricing.jsx'))
const Vs = lazy(() => import('./pages/Vs.jsx'))
const Legal = lazy(() => import('./pages/Legal.jsx'))
const Blog = lazy(() => import('./pages/Blog.jsx'))
const Post = lazy(() => import('./pages/Post.jsx'))
const Soon = lazy(() => import('./pages/Soon.jsx'))

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
            <Route path="/pricing" element={<Pricing />} />
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
