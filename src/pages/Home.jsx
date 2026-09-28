import { useRef } from 'react'
import { useReveals } from '../hooks/useReveals.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import Hero from '../sections/Hero.jsx'
import AppPreview from '../sections/AppPreview.jsx'
import Band from '../sections/Band.jsx'
import Consolidation from '../sections/Consolidation.jsx'
import HowItWorks from '../sections/HowItWorks.jsx'
import Inside from '../sections/Inside.jsx'
import Grounded from '../sections/Grounded.jsx'
import Compare from '../sections/Compare.jsx'
import Proof from '../sections/Proof.jsx'
import TerminalTeaser from '../sections/TerminalTeaser.jsx'
import Faq from '../sections/Faq.jsx'
import FinalCta from '../sections/FinalCta.jsx'

export default function Home() {
  const { lang, t } = useI18n()
  useMeta({ title: `Alphractal — ${t.hero.title.join(' ')}`, description: t.hero.sub })
  const root = useRef(null)

  useReveals(root, [lang])

  /* The two column rules draw down the page on load */
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
    <div ref={root} className="home">
      <div className="col-lines" aria-hidden="true">
        <i />
        <i />
      </div>
      <Hero />
      <AppPreview />
      <Band />
      <Consolidation />
      <HowItWorks />
      <Inside />
      <Grounded />
      <Compare />
      <Proof />
      <TerminalTeaser />
      <Faq />
      <FinalCta />
    </div>
  )
}
