let cache = null

/* The posts are ~440 KB of text, so they load on demand and only once. */
export function loadPosts() {
  cache = cache || import('../content/blog.json').then((m) => m.default)
  return cache
}

export const formatDate = (iso, lang) =>
  new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )
