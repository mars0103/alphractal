import { useEffect } from 'react'

/*
 * One IntersectionObserver for the whole page: every <section> (and the inner-page hero) that
 * is out of view gets `.is-offscreen`, and base.css pauses all CSS animation inside it.
 * The page is full of small infinite loops; this keeps the ones nobody can see off the
 * compositor, which is what phones were struggling with.
 */
export function useOffscreenPause(scope, deps = []) {
  useEffect(() => {
    const root = scope.current
    if (!root || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting))
      },
      { rootMargin: '120px 0px' },
    )
    root.querySelectorAll('section').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      root.querySelectorAll('.is-offscreen').forEach((el) => el.classList.remove('is-offscreen'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
