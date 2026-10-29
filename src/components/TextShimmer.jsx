import { createElement, useEffect, useRef } from 'react'

/*
 * Infinite headline shimmer (port of the shadcn "text-shimmer" component to plain JSX + CSS, see styles/text-shimmer.css).
 * Two paint layers clipped to the text: a solid base fill and a moving transparent → shine → transparent band.
 * Only background-position animates. The loop pauses off screen, in hidden tabs and on hover (optional) via a data attribute.
 * `text` may be a string or an array of lines; each line stays on its own row on wide screens.
 */
export default function TextShimmer({
  text,
  as = 'span',
  duration = 3,
  baseColor,
  shimmerColor,
  spread = 22,
  angle = 90,
  direction = 'left',
  yoyo = false,
  pauseOnHover = false,
  className = '',
}) {
  const ref = useRef(null)
  const lines = Array.isArray(text) ? text : [text]
  const chars = lines.reduce((n, l) => n + l.length, 0) || 1

  const total = Math.max(2, duration)
  const band = Math.max(8, Math.round(chars * (Math.min(60, Math.max(8, spread)) / 11)))

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    let inView = true
    let visible = document.visibilityState !== 'hidden'
    const sync = () => {
      node.dataset.shimmerPaused = inView && visible ? 'false' : 'true'
    }
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting)
        sync()
      },
      { threshold: 0.01 },
    )
    const onVis = () => {
      visible = document.visibilityState !== 'hidden'
      sync()
    }
    io.observe(node)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const style = {
    '--ts-duration': `${total}s`,
    '--ts-spread': `${band}px`,
    ...(baseColor ? { '--ts-base': baseColor } : null),
    ...(shimmerColor ? { '--ts-hi': shimmerColor } : null),
    backgroundImage: [
      `linear-gradient(${angle}deg, transparent calc(50% - var(--ts-spread)), var(--ts-hi), transparent calc(50% + var(--ts-spread)))`,
      'linear-gradient(var(--ts-base), var(--ts-base))',
    ].join(', '),
  }

  return createElement(
    as,
    {
      ref,
      className: `text-shimmer ${className}`.trim(),
      style,
      'data-shimmer-yoyo': yoyo ? 'true' : 'false',
      'data-shimmer-direction': direction,
      onMouseEnter: pauseOnHover ? (e) => (e.currentTarget.dataset.shimmerPaused = 'true') : undefined,
      onMouseLeave: pauseOnHover ? (e) => (e.currentTarget.dataset.shimmerPaused = 'false') : undefined,
    },
    lines.map((l, i) => (
      <span className="text-shimmer__line" key={l}>
        {l}
        {i < lines.length - 1 ? ' ' : ''}
      </span>
    )),
  )
}
