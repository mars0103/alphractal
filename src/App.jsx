import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Platform from './pages/Platform.jsx'
import Feature from './pages/Feature.jsx'
import Terminal from './pages/Terminal.jsx'
import Institutional from './pages/Institutional.jsx'
import About from './pages/About.jsx'
import Pricing from './pages/Pricing.jsx'
import Vs from './pages/Vs.jsx'
import Legal from './pages/Legal.jsx'
import Blog from './pages/Blog.jsx'
import Post from './pages/Post.jsx'
import Soon from './pages/Soon.jsx'
import { useI18n } from './i18n/I18nProvider.jsx'
import { ScrollTrigger } from './lib/gsap.js'

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
      </main>
      <Footer />
    </>
  )
}
