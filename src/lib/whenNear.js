/* Resolves once `el` is within `margin` px of the viewport (or at once where IntersectionObserver is missing), so heavy
   things like three.js are only downloaded when the visitor is about to reach the section that uses them. Call the returned
   function to stop waiting. */
export function whenNear(el, margin = 1400) {
  let stop = () => {}
  const promise = new Promise((resolve) => {
    if (!el || typeof IntersectionObserver === 'undefined') return resolve()
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect()
          resolve()
        }
      },
      { rootMargin: `${margin}px 0px` },
    )
    io.observe(el)
    stop = () => io.disconnect()
  })
  return { promise, stop: () => stop() }
}
