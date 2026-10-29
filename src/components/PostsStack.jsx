import { useEffect, useRef, useState } from 'react'
import { PROOF_POSTS } from '../lib/facts.js'
import { gsap, ScrollTrigger, useGSAP, MQ } from '../lib/gsap.js'
import Starfield from './Starfield.jsx'
import { whenNear } from '../lib/whenNear.js'
import '../styles/posts-stack.css'

/*
 * The ten approved posts as 9:16 glass cards with a reflection. Shared by the Home (proof band) and the About page.
 *
 * Desktop with motion: the section pins and, with the scroll, each card enters from the right facing front, turns near the
 * left corner until only its thin side shows, and stops there; the next ones stack up behind it. Hovering (or focusing) a card
 * lifts it out of the pile and turns it to face front again; leaving puts it back.
 * There the cards are real 3D slabs drawn with three.js (lib/postsBoard.js, loaded on demand: rounded body, bevelled blue rim,
 * reflection). If WebGL is missing or fails, the same motion runs on the CSS cards underneath. The scroll timeline is the same
 * in both; only what it moves differs.
 * Phones, tablets and reduced motion: no pin, no 3D. The same cards sit in a swipeable row, facing front.
 * The cards are never links: the posts are production references, not destinations.
 *
 * props: phrase (optional text above the cards, the approved sentence on the Home), label (aria-label of the list),
 * posts (defaults to the ten approved ones), className.
 */
const STEP = 22 // distance between two stacked cards, in px
const TURN = 84 // degrees: the pile shows only the thin side
const PER_CARD = 0.55 // timeline units between two cards entering
const STACK_Q = `${MQ.motion} and ${MQ.desktop} and (min-height: 600px) and (hover: hover)`

function Face({ post, hidden }) {
  return (
    <div className="ps__face">
      <img
        src={`/proof/${post.file}.webp`}
        alt={hidden ? '' : `Post on X by ${post.by}`}
        loading="lazy"
        draggable="false"
        decoding="async"
      />
    </div>
  )
}

export default function PostsStack({ phrase, label = 'Posts from people who use Alphractal', posts = PROOF_POSTS, className = '' }) {
  const root = useRef(null)
  const glHost = useRef(null)
  // 'pending' until the client has decided between the 3D cards and the CSS ones (only matters where the pile runs)
  const [mode, setMode] = useState('pending')
  const [board, setBoard] = useState(null)

  useEffect(() => {
    let alive = true
    let api = null
    let waiting = false
    const near = whenNear(root.current)
    const mq = window.matchMedia(STACK_Q)
    const decide = async () => {
      if (!mq.matches) {
        api?.dispose()
        api = null
        setBoard(null)
        setMode('css')
        return
      }
      if (api || waiting) return
      waiting = true
      try {
        await near.promise // three.js is only downloaded when the section is about to be reached
        waiting = false
        if (!alive || !mq.matches || api) return
        const { createPostsBoard } = await import('../lib/postsBoard.js')
        if (!alive || !mq.matches || api) return
        api = createPostsBoard({ host: glHost.current, posts, reduced: false })
        setBoard(api)
        setMode('3d')
      } catch {
        if (alive) setMode('css')
      }
    }
    decide()
    mq.addEventListener('change', decide)
    return () => {
      alive = false
      near.stop()
      mq.removeEventListener('change', decide)
      api?.dispose()
    }
  }, [posts])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(STACK_Q, () => {
        if (mode === 'pending') return undefined
        const el = root.current
        const q = (s) => el.querySelector(s)
        const qa = (s) => gsap.utils.toArray(s, el)
        const three = mode === '3d' && board
        el.classList.add('is-stack')
        if (three) el.classList.add('is-3d')

        const list = q('.ps__list')
        const pin = q('.ps__pin')
        const items = qa('.ps__item')
        const cards = qa('.ps__card')
        const m = { cw: 300, ch: 530, sw: 1600 }

        const measure = () => {
          const stageH = list.clientHeight
          m.ch = Math.max(260, Math.min(stageH * 0.7, 640))
          m.cw = (m.ch * 9) / 16
          m.sw = window.innerWidth - list.getBoundingClientRect().left + 60
          list.style.setProperty('--ch', `${m.ch}px`)
          list.style.setProperty('--cw', `${m.cw}px`)
          if (three) {
            const lr = list.getBoundingClientRect()
            const pr = pin.getBoundingClientRect()
            // the css cards sat with their centre 14% of a card height above the middle of the list
            board.layout({ cw: m.cw, ch: m.ch, left: lr.left - pr.left, cy: lr.top - pr.top + list.clientHeight / 2 - m.ch * 0.14 })
          }
        }
        measure()
        ScrollTrigger.addEventListener('refreshInit', measure)

        const rest = (i) => 14 + i * STEP - m.cw / 2
        // what the timeline moves: the css items, or the plain state objects the 3D cards read
        const target = (i) => (three ? board.cards[i] : items[i])
        const prop = three ? { rot: 'rot' } : { rot: 'rotationY' }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: three ? board.invalidate : undefined,
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: `+=${Math.round(items.length * 52 + 70)}%`,
            pin,
            scrub: 0.3,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        items.forEach((_, i) => {
          const at = i * PER_CARD
          const t = target(i)
          tl.fromTo(t, { x: () => m.sw, [prop.rot]: 0 }, { x: () => rest(i) + m.cw * 0.95, duration: 1.5, ease: 'power1.out' }, at)
          tl.to(t, { x: () => rest(i), [prop.rot]: TURN, duration: 0.75, ease: 'power2.inOut' }, at + 1.5)
        })
        tl.to({}, { duration: 0.7 })

        // hover / focus
        let cleanups
        if (three) {
          // hover is a raycast in the 3D scene; keyboard focus on a card does the same
          cleanups = items.map((li, i) => {
            const up = () => board.setHot(i)
            const down = () => board.setHot(-1)
            li.addEventListener('focus', up)
            li.addEventListener('blur', down)
            return () => {
              li.removeEventListener('focus', up)
              li.removeEventListener('blur', down)
            }
          })
        } else {
          // the card rises out of the pile and turns to face front again (net rotation 0)
          cleanups = items.map((li, i) => {
            const card = cards[i]
            const up = () => {
              li.style.zIndex = '60'
              gsap.to(card, { rotationY: -gsap.getProperty(li, 'rotationY'), y: -m.ch * 0.08, scale: 1.04, duration: 0.6, ease: 'power3.out', overwrite: 'auto' })
              li.classList.add('is-up')
            }
            const down = () => {
              li.classList.remove('is-up')
              gsap.to(card, {
                rotationY: 0,
                y: 0,
                scale: 1,
                duration: 0.55,
                ease: 'power3.inOut',
                overwrite: 'auto',
                onComplete: () => {
                  li.style.zIndex = ''
                },
              })
            }
            li.addEventListener('pointerenter', up)
            li.addEventListener('pointerleave', down)
            li.addEventListener('focus', up)
            li.addEventListener('blur', down)
            return () => {
              li.removeEventListener('pointerenter', up)
              li.removeEventListener('pointerleave', down)
              li.removeEventListener('focus', up)
              li.removeEventListener('blur', down)
            }
          })
        }

        return () => {
          cleanups.forEach((fn) => fn())
          ScrollTrigger.removeEventListener('refreshInit', measure)
          el.classList.remove('is-stack', 'is-3d')
          if (!three) gsap.set([...items, ...cards], { clearProps: 'all' })
          list.style.removeProperty('--ch')
          list.style.removeProperty('--cw')
        }
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [mode, board] },
  )

  return (
    <section ref={root} className={`ps ${className}`} data-nav-theme="dark" aria-label={label}>
      <Starfield className="ps__stars" />
      <div className="ps__pin">
        <div className="ps__gl" ref={glHost} aria-hidden="true" />
        {phrase && (
          <div className="container ps__head">
            <p className="ps__phrase" data-reveal="up">
              {phrase}
            </p>
          </div>
        )}
        <div className="container ps__stage">
          <ul className="ps__list">
            {posts.map((post, i) => (
              <li className="ps__item" key={post.file} tabIndex={0} aria-label={`Post on X by ${post.by}`} style={{ '--i': i }}>
                <div className="ps__card">
                  <Face post={post} />
                  <i className="ps__edge" aria-hidden="true" />
                  <i className="ps__back" aria-hidden="true" />
                  <div className="ps__refl" aria-hidden="true">
                    <Face post={post} hidden />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
