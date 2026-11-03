import { useRef } from 'react'
import { useReveals } from '../hooks/useReveals.js'
import { useOffscreenPause } from '../hooks/useOffscreenPause.js'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { useMeta } from '../hooks/useMeta.js'
import Hero from '../sections/Hero2.jsx'
import Band from '../sections/Band.jsx'
import Consolidation from '../sections/Consolidation.jsx'
import HowItWorks from '../sections/HowItWorks.jsx'
import Inside from '../sections/Inside.jsx'
import Proof from '../sections/Proof.jsx'
import TerminalBlock from '../sections/TerminalBlock.jsx'
import Faq from '../sections/Faq.jsx'
import FinalCta from '../sections/FinalCta.jsx'

export default function HomeB() {
  const { lang, t } = useI18n()
  useMeta({ title: "Alphractal | Hero B", description: t.hero.steps[0].sub, noindex: true })
  const root = useRef(null)

  useReveals(root, [lang])
  useOffscreenPause(root, [lang])

  return (
    <div ref={root} className="home">
      <Hero />
      <TerminalBlock />
      <Band />
      <Consolidation />
      <Proof />
      <HowItWorks />
      <Inside />
      <Faq />
      <FinalCta solo />
    </div>
  )
}
