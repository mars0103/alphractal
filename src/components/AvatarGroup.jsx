import { useState } from 'react'

/*
 * Overlapping avatar stack: hover lifts one avatar above the rest and shows its name.
 * Plain React + CSS (no Tailwind / framer-motion in this project). Each item is
 * { slug, label, color, viewBox, markup } — a brand glyph drawn inside a round chip.
 */
export default function AvatarGroup({ items, maxVisible = 6, size = 44, overlap = 14 }) {
  const [hovered, setHovered] = useState(null)
  const visible = items.slice(0, maxVisible)
  const extra = items.length - maxVisible

  return (
    <ul className="ava" style={{ '--s': `${size}px`, '--o': `${overlap}px` }} aria-label={items.map((i) => i.label).join(', ')}>
      {visible.map((it, i) => (
        <li
          key={it.slug}
          className={`ava__item${hovered === i ? ' is-hover' : ''}`}
          style={{ zIndex: hovered === i ? 100 : visible.length - i }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <svg
            className="ava__logo"
            viewBox={it.viewBox}
            fill={it.color}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: it.markup }}
          />
          <span className="ava__tip" role="tooltip">
            {it.label}
          </span>
        </li>
      ))}
      {extra > 0 && (
        <li className="ava__item ava__more" style={{ zIndex: 0 }} title={items.slice(maxVisible).map((i) => i.label).join(', ')}>
          +{extra}
        </li>
      )}
    </ul>
  )
}
