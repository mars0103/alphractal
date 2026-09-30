import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

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
  const { pathname } = useLocation()

  headState.current = { title, description, jsonLd, noindex, url: `${ORIGIN}${pathname}` }

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
    set('meta[property="og:url"]', 'content', `${ORIGIN}${pathname}`, prop('og:url'))
    set('link[rel="canonical"]', 'href', `${ORIGIN}${pathname}`, () => Object.assign(document.createElement('link'), { rel: 'canonical' }))
    set('meta[name="robots"]', 'content', noindex ? 'noindex' : 'index,follow', meta('robots'))

    let script = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.page = 'true'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    return () => script?.remove()
  }, [title, description, pathname, noindex, jsonLd])
}
