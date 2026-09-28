import { useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'

/* A tabular number that counts from 0 once, when it scrolls into view. */
export default function CountUp({ value, suffix = '', prefix = '', className = '' }) {
  const { num } = useI18n()
  const ref = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const state = { v: 0 }
        ref.current.textContent = `${prefix}${num(0)}${suffix}`
        gsap.to(state, {
          v: value,
          duration: 2,
          ease: 'power3.out',
          onUpdate: () => (ref.current.textContent = `${prefix}${num(Math.round(state.v))}${suffix}`),
          scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [value, num] },
  )

  return (
    <span ref={ref} className={`num ${className}`}>
      {prefix}
      {num(value)}
      {suffix}
    </span>
  )
}
