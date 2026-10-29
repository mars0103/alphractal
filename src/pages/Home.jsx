import { useRef } from 'react'
import { useReveals } from '../hooks/useReveals.js'
import { useOffscreenPause } from '../hooks/useOffscreenPause.js'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import Hero from '../sections/Hero3.jsx'
import Band from '../sections/Band.jsx'
import Consolidation from '../sections/Consolidation.jsx'
import HowItWorks from '../sections/HowItWorks.jsx'
import Inside from '../sections/Inside.jsx'
import Proof from '../sections/Proof.jsx'
import TerminalBlock from '../sections/TerminalBlock.jsx'
import Faq from '../sections/Faq.jsx'
import FinalCta from '../sections/FinalCta.jsx'

export default function Home() {
  const { lang, t } = useI18n()
  useMeta({ title: `Alphractal — ${t.hero.steps[0].title.join(' ')}`, description: t.hero.steps[0].sub })
  const root = useRef(null)

  useReveals(root, [lang])
  useOffscreenPause(root, [lang])

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
      <Hero />
      {/* The two column rules start below the hero, so the pinned animation is not framed by them */}
      <div className="home__rest">
        <div className="col-lines" aria-hidden="true">
          <i />
          <i />
        </div>
        <TerminalBlock />
        <Band />
        <Consolidation />
        <Proof />
        <HowItWorks />
        <Inside />
        <Faq />
        <FinalCta solo />
      </div>
    </div>
  )
}
