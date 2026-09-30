let cache = null
let resolved = null

/* The posts are ~440 KB of text, so they load on demand and only once. */
export function loadPosts() {
  cache = cache || import('../content/blog.json').then((m) => (resolved = m.default))
  return cache
}

// Synchronous read of whatever loadPosts() already resolved. Used as the useState
// initializer so a page rendered after the prerender script warms this module (or after
// a previous client-side visit) has real data on its very first render, instead of only
// after an effect fires — effects never run during renderToString().
export function cachedPosts() {
  return resolved
}

export const formatDate = (iso, lang) =>
  new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
