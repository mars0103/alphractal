import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { graphFor, ogImageFor, seoFor } from '../lib/seo.js'

const ORIGIN = 'https://alphractal.com'

// Populated on every render (client or server). The prerender script reads this right
// after renderToString() resolves, since each server render is exactly one route/page,
// to bake the same title/description/canonical/jsonLd into the static HTML head.
export const headState = { current: null }

const upsert = (selector, create) => {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

/*
 * Per-page metadata (brief §8: every page needs its own, none inherits the home title).
 * This is client-side. For crawlers that do not run JS, pre-render the routes at build time.
 */
export function useMeta({ title, description, jsonLd, noindex = false }) {
  const loc = useLocation()
  // One canonical per route: no trailing slash, no query or hash (campaign and referral parameters never reach it).
  const pathname = loc.pathname.length > 1 ? loc.pathname.replace(/\/+$/, '') : loc.pathname
  // Routes in lib/seo.js take their title, description and a single JSON-LD graph from that table; other public
  // pages keep their own title/description and still get the shared graph. Nothing else injects JSON-LD.
  const seo = seoFor(pathname)
  if (seo) {
    title = seo.title
    description = seo.description
    jsonLd = graphFor(pathname)
  } else {
    jsonLd = noindex ? null : graphFor(pathname, { title, description })
  }

  const image = ogImageFor(pathname)
  headState.current = { title, description, jsonLd, noindex, image, url: noindex ? null : `${ORIGIN}${pathname}` }

  useEffect(() => {
    document.title = title
    const set = (sel, attr, value, make) => upsert(sel, make).setAttribute(attr, value)
    const meta = (name) => () => Object.assign(document.createElement('meta'), { name })
    const prop = (property) => () => {
      const el = document.createElement('meta')
      el.setAttribute('property', property)
      return el
    }
    if (description) {
      set('meta[name="description"]', 'content', description, meta('description'))
      set('meta[property="og:description"]', 'content', description, prop('og:description'))
    }
    set('meta[property="og:title"]', 'content', title, prop('og:title'))
    set('meta[property="og:site_name"]', 'content', 'Alphractal', prop('og:site_name'))
    set('meta[name="twitter:card"]', 'content', image ? 'summary_large_image' : 'summary', meta('twitter:card'))
    if (image) {
      set('meta[property="og:image"]', 'content', image, prop('og:image'))
      set('meta[property="og:image:width"]', 'content', '1200', prop('og:image:width'))
      set('meta[property="og:image:height"]', 'content', '630', prop('og:image:height'))
      set('meta[property="og:image:alt"]', 'content', title, prop('og:image:alt'))
      set('meta[name="twitter:image"]', 'content', image, meta('twitter:image'))
    }
    set('meta[name="twitter:title"]', 'content', title, meta('twitter:title'))
    if (description) set('meta[name="twitter:description"]', 'content', description, meta('twitter:description'))
    const canonical = document.head.querySelector('link[rel="canonical"]')
    if (noindex) {
      canonical?.remove()
    } else {
      set('meta[property="og:url"]', 'content', `${ORIGIN}${pathname}`, prop('og:url'))
      set('link[rel="canonical"]', 'href', `${ORIGIN}${pathname}`, () => Object.assign(document.createElement('link'), { rel: 'canonical' }))
    }
    set('meta[name="robots"]', 'content', noindex ? 'noindex' : 'index,follow', meta('robots'))

    // The prerendered page already ships the graph in <head>: reuse that one script instead of adding a second.
    const scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
    scripts.forEach((el, i) => i > 0 && el.remove())
    let script = scripts[0]
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.dataset.page = 'true'
        document.head.appendChild(script)
      }
      const text = JSON.stringify(jsonLd)
      if (script.textContent !== text) script.textContent = text
    } else {
      script?.remove()
    }
  }, [title, description, pathname, noindex, jsonLd, image])
}
