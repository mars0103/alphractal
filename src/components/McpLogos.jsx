import { useRef } from 'react'
import { gsap, useGSAP, MQ } from '../lib/gsap.js'
import { AI_LOGOS } from '../lib/ai-logos.js'

/*
 * MCP hero visual: three large AI-client marks (Claude, GPT, Grokbot) sitting directly on the page's dark field, flat.
 * Claude spins in from the left side, GPT arrives from the other direction, Grokbot comes in third out of the depth.
 * Once they are in, small speech balloons rise from each mark and fade out, each carrying the id of a real tool from the
 * catalog further down the page (what that client would be calling). Quiet by design: thin outline, low contrast, slow.
 * The marks are the clients' own marks (Claude in its official colour, the others white) and are not presented as a partnership.
 * The name 'Grokbot' follows the MCP copy document (the home keeps 'Grok').
 */
const MARKS = [
  { slug: 'claude', name: 'Claude', color: '#D97757', tools: ['search_metrics', 'get_metric_data', 'suggest_charts'] },
  { slug: 'openai', name: 'GPT', color: '#ffffff', tools: ['search_assets', 'get_metric_info', 'compare_metrics'] },
  { slug: 'grok', name: 'Grokbot', color: '#ffffff', tools: ['get_liquidation_clusters', 'search_reports', 'get_report_key_insights'] },
].map((m) => ({ ...m, logo: AI_LOGOS.find((l) => l.slug === m.slug) }))

// Where each balloon sits across the mark (px from its centre), when it starts, and where it rests if motion is reduced.
const SPOTS = [
  { x: -74, d: '0s', rest: '-44px' },
  { x: 58, d: '-3.1s', rest: '-72px' },
  { x: -6, d: '-6s', rest: '-100px' },
]

export default function McpLogos() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const items = gsap.utils.toArray('.mcpl__item', root.current)
        const [claude, gpt, grok] = items
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.55 })
        tl.from(claude, { xPercent: -260, autoAlpha: 0, rotation: -540, scale: 0.55, duration: 1.6, ease: 'power4.out' }, 0)
        tl.from(gpt, { xPercent: 240, yPercent: -70, autoAlpha: 0, rotationY: 300, rotation: 90, scale: 0.6, duration: 1.7, ease: 'power4.out' }, 0.55)
        tl.from(grok, { yPercent: 80, autoAlpha: 0, scale: 0.12, rotationX: 70, transformPerspective: 900, duration: 1.8, ease: 'expo.out' }, 1.15)
        // the balloons start once the last mark has landed
        tl.add(() => root.current?.classList.add('is-in'), 2.6)
      })
      mm.add(MQ.reduced, () => {
        root.current?.classList.add('is-in')
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <div ref={root} className="mcpl">
      <ul className="mcpl__row" aria-label="Claude, GPT and Grokbot">
        {MARKS.map((m, i) => (
          <li key={m.slug} className="mcpl__item" style={{ '--i': i }}>
            <ul className="mcpl__bubbles" aria-hidden="true">
              {m.tools.map((tool, k) => (
                <li key={tool} className="mcpl__bubble" style={{ '--x': `${SPOTS[k].x}px`, '--d': `${parseFloat(SPOTS[k].d) - i * 1.4}s`, '--rest': SPOTS[k].rest }}>
                  {tool}
                </li>
              ))}
            </ul>
            <svg className="mcpl__mark" viewBox={m.logo.viewBox} aria-hidden="true" focusable="false">
              <g fill={m.color} dangerouslySetInnerHTML={{ __html: m.logo.markup }} />
            </svg>
            <span className="mcpl__name">{m.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
