import { useEffect, useRef } from 'react'

/*
 * The hero's iMac: a flat photo of a monitor (public/hero-imac.webp, its screen area cut out to transparent) with the live
 * screen drawn BEHIND it, warped onto the screen quad by a matrix3d. The bezel, edge and reflections of the photo sit on
 * top, so the picture is exactly the glass. No WebGL, no 3D model: one 40 KB image and one 2D canvas, and it renders
 * on the server too (the photo is plain markup; the screen canvas arrives with the script).
 */
// The screen corners in the photo's own 1024×768 space: top-left, top-right, bottom-right, bottom-left.
const QUAD = [
  [128.3, 163.3],
  [939.5, 73.3],
  [898.6, 630.0],
  [67.5, 657.3],
]
const IMG_W = 1024

/* 3x3 homography taking 4 source points to 4 destination points (Gaussian elimination on 8 unknowns). */
function homography(s, d) {
  const A = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = s[i]
    const [X, Y] = d[i]
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y, X])
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y, Y])
  }
  for (let c = 0; c < 8; c++) {
    let p = c
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
    ;[A[c], A[p]] = [A[p], A[c]]
    const div = A[c][c] || 1e-9
    for (let k = c; k < 9; k++) A[c][k] /= div
    for (let r = 0; r < 8; r++) {
      if (r === c) continue
      const f = A[r][c]
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k]
    }
  }
  const h = A.map((row) => row[8])
  return [...h, 1]
}
const toMatrix3d = (h) => `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,${h[8]})`

export const SCREEN_CENTER = [
  QUAD.reduce((a, p) => a + p[0], 0) / 4 / IMG_W,
  QUAD.reduce((a, p) => a + p[1], 0) / 4 / 768,
]

export default function ImacScreen({ screen, wrapRef, className = '' }) {
  const box = useRef(null)
  const canvas = useRef(null)

  useEffect(() => {
    if (!screen || !canvas.current || !box.current) return undefined
    const cv = canvas.current
    // the screen module owns its own canvas; show that one
    cv.replaceWith(screen.canvas)
    const el = screen.canvas
    el.className = 'imac2d__screen'
    el.style.cssText = `position:absolute;left:0;top:0;width:${screen.W}px;height:${screen.H}px;transform-origin:0 0;z-index:0;pointer-events:none`
    canvas.current = el

    const fit = () => {
      const k = box.current.getBoundingClientRect().width / IMG_W || 1
      // the screen's longest edge in device pixels / the logical width: that is the bitmap scale that avoids any shrinking
      const edge = Math.hypot(QUAD[1][0] - QUAD[0][0], QUAD[1][1] - QUAD[0][1]) * k
      screen.setScale((edge * (window.devicePixelRatio || 1)) / screen.W)
      const H = homography(
        [
          [0, 0],
          [screen.W, 0],
          [screen.W, screen.H],
          [0, screen.H],
        ],
        QUAD.map(([x, y]) => [x * k, y * k]),
      )
      el.style.transform = toMatrix3d(H)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box.current)

    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(box.current)
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (visible) screen.draw()
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [screen])

  const setBox = (n) => {
    box.current = n
    if (typeof wrapRef === 'function') wrapRef(n)
    else if (wrapRef) wrapRef.current = n
  }

  return (
    <div ref={setBox} className={`imac2d ${className}`} aria-hidden="true">
      <canvas ref={canvas} className="imac2d__screen" width="1" height="1" />
      <img className="imac2d__photo" src="/hero-imac.webp" alt="" width="1024" height="768" decoding="async" fetchPriority="high" />
    </div>
  )
}
