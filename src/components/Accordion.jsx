import { useRef, useState } from 'react'
import { gsap, MQ } from '../lib/gsap.js'

/* Height-tween accordion. One item open at a time, first open by default. */
export default function Accordion({ items, idPrefix = 'acc' }) {
  const root = useRef(null)
  const [open, setOpen] = useState(0)

  const toggle = (i) => {
    const reduce = window.matchMedia(MQ.reduced).matches
    const panels = root.current.querySelectorAll('.faq__a')
    const next = open === i ? -1 : i
    panels.forEach((el, k) => {
      gsap.killTweensOf(el)
      gsap.to(el, { height: k === next ? 'auto' : 0, duration: reduce ? 0 : 0.6, ease: 'power3.inOut' })
    })
    setOpen(next)
  }

  return (
    <ul ref={root} className="faq__list" data-stagger>
      {items.map((item, i) => (
        <li className={`faq__item ${open === i ? 'is-open' : ''}`} data-item key={item.q}>
          <h3>
            <button
              type="button"
              className="faq__q"
              aria-expanded={open === i}
              aria-controls={`${idPrefix}-${i}`}
              onClick={() => toggle(i)}
            >
              <span>{item.q}</span>
              <i aria-hidden="true" />
            </button>
          </h3>
          <div
            id={`${idPrefix}-${i}`}
            className="faq__a"
            role="region"
            style={{ height: i === 0 ? 'auto' : 0 }}
            aria-hidden={open !== i}
          >
            <p>{item.a}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
