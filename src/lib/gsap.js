import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Draggable } from 'gsap/Draggable'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, Flip, useGSAP)

gsap.defaults({ ease: 'power3.out', duration: 0.9 })

export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 992px)',
  mobile: '(max-width: 991px)',
}

export { gsap, ScrollTrigger, SplitText, Draggable, Flip, useGSAP }
