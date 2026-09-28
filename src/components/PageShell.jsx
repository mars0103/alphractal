import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useReveals } from '../hooks/useReveals.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { useI18n } from '../i18n/I18nProvider.jsx'

/* Wraps every page: scroll-in reveals, and the two column rules that draw down the page on load. */
export default function PageShell({ children, className = '' }) {
  const { lang } = useI18n()
  const { pathname } = useLocation()
  const root = useRef(null)

  useReveals(root, [lang, pathname])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.col-lines i', { scaleY: 0, duration: 2.2, ease: 'power3.inOut', stagger: 0.18 })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className={`home ${className}`}>
      <div className="col-lines" aria-hidden="true">
        <i />
        <i />
      </div>
      {children}
    </div>
  )
}
