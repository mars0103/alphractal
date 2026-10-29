import * as THREE from 'three'

/*
 * The proof band's ten post cards as real 3D slabs: a rounded body with a round bevel (the bright blue rim you see when the
 * card turns on its side), the post on the front, a soft blue glow behind and a fading reflection underneath.
 *
 * It only draws. components/PostsStack.jsx owns the scroll timeline: it moves `cards[i].x` (css px, like the old DOM cards) and
 * `cards[i].rot` (degrees) and calls invalidate(). Hover is a raycast against the cards themselves: a hovered card turns to
 * face front and rises, and since it grows under the pointer it can't slide away from it.
 *
 * Browser only, loaded on demand; PostsStack falls back to the CSS pile if this throws.
 */

const T = 16 // card thickness, px
const B = 5 // bevel
const R = 24 // plan corner radius, px
const REFL_GAP = 8
const D = 1700 // camera distance, matches the old css perspective

function roundedRect(w, h, r, seg = 12) {
  const hx = w / 2 - r
  const hy = h / 2 - r
  const pts = []
  ;[
    [hx, -hy, -Math.PI / 2],
    [hx, hy, 0],
    [-hx, hy, Math.PI / 2],
    [-hx, -hy, Math.PI],
  ].forEach(([cx, cy, a0]) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2)
      pts.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r))
    }
  })
  return new THREE.Shape(pts)
}

function slabGeometry(w, h) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w - 2 * B, h - 2 * B, R - B), {
    depth: T - 2 * B,
    bevelEnabled: true,
    bevelThickness: B,
    bevelSize: B,
    bevelSegments: 3,
    curveSegments: 1,
  })
  g.translate(0, 0, -(T / 2 - B)) // front at +T/2, back at -T/2
  return g
}

function faceGeometry(w, h) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, R), 1)
  const p = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5)
  uv.needsUpdate = true
  return g
}

/* the card as the css drew it: a dark gradient glass panel, a fine blue border, the whole post (never cropped) inside */
function drawFace(ctx, w, h, img) {
  const r = (R / 270) * w // the css radius was for ~270px wide cards
  const path = (x, y, ww, hh, rr) => {
    ctx.beginPath()
    ctx.roundRect(x, y, ww, hh, rr)
  }
  ctx.clearRect(0, 0, w, h)
  path(0, 0, w, h, r)
  ctx.save()
  ctx.clip()
  const g = ctx.createLinearGradient(0, 0, w * 0.75, h)
  g.addColorStop(0, 'rgba(60,80,190,.5)')
  g.addColorStop(0.38, 'rgba(14,20,52,1)')
  g.addColorStop(1, '#080b1c')
  ctx.fillStyle = '#080b1c'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  const hl = ctx.createLinearGradient(0, 0, 0, h * 0.06)
  hl.addColorStop(0, 'rgba(255,255,255,.14)')
  hl.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = hl
  ctx.fillRect(0, 0, w, h * 0.06)
  if (img) {
    const pad = w * 0.07
    const iw = w - pad * 2
    const ih = (img.naturalHeight / img.naturalWidth) * iw
    const maxH = h - pad * 2
    const [dw, dh] = ih > maxH ? [(img.naturalWidth / img.naturalHeight) * maxH, maxH] : [iw, ih]
    const x = (w - dw) / 2
    const y = (h - dh) / 2
    ctx.save()
    path(x, y, dw, dh, (10 / 270) * w)
    ctx.clip()
    ctx.drawImage(img, x, y, dw, dh)
    ctx.restore()
  }
  ctx.restore()
  path(1.5, 1.5, w - 3, h - 3, r)
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(111,134,255,.6)'
  ctx.stroke()
}

export function createPostsBoard({ host, posts, reduced }) {
  const probe = document.createElement('canvas')
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl')

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const cv = renderer.domElement
  cv.style.cssText = 'display:block;width:100%;height:100%'
  host.appendChild(cv)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000)
  camera.position.z = D

  scene.add(new THREE.AmbientLight(0xffffff, 1.15))
  const key = new THREE.DirectionalLight(0xffffff, 1.8)
  key.position.set(-600, 500, 900)
  scene.add(key)
  const rim = new THREE.PointLight(0x4b6bff, 1.6e5, 1600, 1.4)
  rim.position.set(-500, 100, 300)
  scene.add(rim)

  // shared materials / textures
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x070b24, roughness: 0.38, metalness: 0.25 })
  const sideMat = new THREE.MeshStandardMaterial({
    color: 0x3a56ff,
    emissive: 0x4b6bff,
    emissiveIntensity: 0.95,
    roughness: 0.32,
    metalness: 0.1,
  })
  const glowTex = (() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 256
    const x = c.getContext('2d')
    x.shadowColor = 'rgba(80,115,255,1)'
    x.shadowBlur = 34
    x.fillStyle = 'rgba(80,115,255,.9)'
    x.beginPath()
    x.roundRect(30, 30, 68, 196, 18)
    x.fill()
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })()
  const fadeTex = (() => {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 128
    const x = c.getContext('2d')
    // the plane is mirrored, so the bottom of this texture (v = 0) ends up next to the card: opaque there, gone by mid-height
    const g = x.createLinearGradient(0, 0, 0, 128)
    g.addColorStop(0, '#000')
    g.addColorStop(0.45, '#000')
    g.addColorStop(1, '#fff')
    x.fillStyle = g
    x.fillRect(0, 0, 4, 128)
    return new THREE.CanvasTexture(c)
  })()

  const cards = posts.map((post, i) => {
    const face = document.createElement('canvas')
    face.width = 576
    face.height = 1024
    const tex = new THREE.CanvasTexture(face)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    const fctx = face.getContext('2d')
    drawFace(fctx, face.width, face.height, null)
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      drawFace(fctx, face.width, face.height, img)
      tex.needsUpdate = true
      invalidate()
    }
    img.src = `/proof/${post.file}.webp`
    return { i, x: 0, rot: 0, hot: 0, goal: 0, tex, group: new THREE.Group(), face }
  })

  // geometry depends on the card size, so it is (re)built when the layout says the size changed
  let size = { cw: 0, ch: 0 }
  let geos = null
  const disposeGeos = () => {
    if (!geos) return
    geos.slab.dispose()
    geos.face.dispose()
    geos.glow.dispose()
    geos.refl.dispose()
  }
  const build = (cw, ch) => {
    disposeGeos()
    geos = {
      slab: slabGeometry(cw, ch),
      face: faceGeometry(cw - 2, ch - 2),
      glow: new THREE.PlaneGeometry(cw * 1.6, ch * 1.3),
      refl: new THREE.PlaneGeometry(cw, ch),
    }
    cards.forEach((c) => {
      c.group.clear()
      const glow = new THREE.Mesh(geos.glow, new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }))
      glow.position.z = -T / 2 - 6
      glow.renderOrder = -1
      const body = new THREE.Mesh(geos.slab, [bodyMat, sideMat])
      const face = new THREE.Mesh(geos.face, new THREE.MeshBasicMaterial({ map: c.tex, transparent: true, toneMapped: false }))
      face.position.z = T / 2 + 0.6
      face.renderOrder = 1
      const refl = new THREE.Mesh(
        geos.refl,
        new THREE.MeshBasicMaterial({ map: c.tex, alphaMap: fadeTex, transparent: true, opacity: 0.4, depthWrite: false, toneMapped: false }),
      )
      refl.scale.y = -1
      refl.position.set(0, -(ch + REFL_GAP), T / 2)
      refl.renderOrder = 0
      c.group.add(glow, body, face, refl)
      c.glow = glow
      c.body = body
      scene.add(c.group)
    })
    size = { cw, ch }
  }

  // --- layout: pixels in the page's own coordinates, measured by PostsStack ---
  let L = { cw: 300, ch: 530, left: 0, cy: 0 } // left = list's left edge in the canvas, cy = card centre height in the canvas
  let W = 1
  let H = 1
  const layout = (m) => {
    L = { ...L, ...m }
    if (Math.abs(L.cw - size.cw) > 0.5 || Math.abs(L.ch - size.ch) > 0.5) build(L.cw, L.ch)
    invalidate()
  }

  const fit = () => {
    W = Math.max(1, host.clientWidth)
    H = Math.max(1, host.clientHeight)
    camera.aspect = W / H
    camera.fov = (2 * Math.atan(H / 2 / D) * 180) / Math.PI
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setSize(W, H, false)
    invalidate()
  }

  // --- loop: on demand ---
  let raf = 0
  let running = false
  let visible = false
  let last = 0
  let dirty = true
  let hotIndex = -1

  function invalidate() {
    dirty = true
    if (visible && !running) {
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }
  const ease = (t) => t * t * (3 - 2 * t)
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    let moving = false
    const k = 1 - Math.exp(-dt * 9)
    for (const c of cards) {
      const nh = c.hot + (c.goal - c.hot) * k
      if (Math.abs(nh - c.hot) > 0.001) moving = true
      c.hot = Math.abs(c.goal - nh) < 0.001 ? c.goal : nh
      const h = ease(c.hot)
      const cx = L.left + c.x + L.cw / 2
      // a lifted card rises, comes forward a little and slides out to the right of the pile so it shows whole
      c.group.position.set(cx - W / 2 + h * L.cw * 0.52, H / 2 - L.cy + h * L.ch * 0.06, c.i * 2 + h * 130)
      c.group.rotation.y = ((c.rot * Math.PI) / 180) * (1 - h)
      c.group.scale.setScalar(1 + 0.04 * h)
      c.glow.material.opacity = 0.5 + 0.45 * h
    }
    if (dirty || moving) {
      renderer.render(scene, camera)
      dirty = false
    }
    if (visible && moving) raf = requestAnimationFrame(frame)
    else running = false
  }

  // --- hover ---
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const setHot = (i) => {
    if (i === hotIndex) return
    if (hotIndex >= 0) cards[hotIndex].goal = 0
    hotIndex = i
    if (hotIndex >= 0) cards[hotIndex].goal = 1
    invalidate()
  }
  let moveEvt = null
  let moveRaf = 0
  // the raycast against the slabs runs at most once per frame, not on every pointer event
  const onMove = (e) => {
    moveEvt = e
    if (!moveRaf) moveRaf = requestAnimationFrame(pick)
  }
  const pick = () => {
    moveRaf = 0
    const e = moveEvt
    const r = cv.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
    ray.setFromCamera(ndc, camera)
    const bodies = cards.filter((c) => c.body).map((c) => c.body)
    const hit = ray.intersectObjects(bodies, false)[0]
    if (!hit) return setHot(-1)
    setHot(cards.find((c) => c.body === hit.object).i)
  }
  cv.addEventListener('pointermove', onMove, { passive: true })
  cv.addEventListener('pointerleave', () => setHot(-1))

  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting
      if (visible) invalidate()
    },
    { threshold: 0 },
  )
  io.observe(host)
  const ro = new ResizeObserver(fit)
  ro.observe(host)
  fit()

  return {
    cards,
    layout,
    invalidate,
    setHot,
    dispose() {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(moveRaf)
      io.disconnect()
      ro.disconnect()
      cv.removeEventListener('pointermove', onMove)
      disposeGeos()
      cards.forEach((c) => c.tex.dispose())
      ;[bodyMat, sideMat, glowTex, fadeTex].forEach((x) => x.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      cv.remove()
    },
  }
}
