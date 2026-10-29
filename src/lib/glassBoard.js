import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/*
 * The Solution section as a real 3D scene: a board of frosted-glass buttons (rounded solid with a round bevel, not stacked
 * layers), the Alphractal symbol lit on the blue one, six tools printed on their buttons. The blue point light over the centre
 * is what puts the blue on the neighbours' edges, so the reflection comes from the lighting instead of a painted gradient.
 * Hover is a raycast against fixed invisible targets (one per tile, never moving), so a lifted tile can't slide out from
 * under the cursor.
 *
 * Browser only. Loaded on demand by sections/Consolidation.jsx, which falls back to the CSS board if this throws.
 */

const S = 1 // tile edge, in world units
const GAP = 0.085
const P = S + GAP // pitch
const T = 0.2 // thickness
const LIFT = 0.55
const CORE_LIFT = 0.4
const BEVEL = 0.05
const RING_OPACITY = 0.78 // the eight tiles around the symbol: frosted, a little see-through
const OUTER_OPACITY = 0.9 // every other tile
const EDGE_GLOW = 9 // strength of the blue light on their edges

/* The outline is built from explicit points, not Shape.absarc: absarc adds a zero-length segment before every arc, and the
   bevel of ExtrudeGeometry breaks on those (a small notch at each corner). Counter-clockwise, no repeated points. */
function roundedRect(w, r, seg = 14) {
  const h = w / 2 - r
  const pts = []
  ;[
    [h, -h, -Math.PI / 2],
    [h, h, 0],
    [-h, h, Math.PI / 2],
    [-h, -h, Math.PI],
  ].forEach(([cx, cy, a0]) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2)
      pts.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r))
    }
  })
  return new THREE.Shape(pts)
}

function tileGeometry() {
  const w = S - 2 * BEVEL
  const g = new THREE.ExtrudeGeometry(roundedRect(w, 0.17), {
    depth: T - 2 * BEVEL,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelOffset: 0,
    bevelSegments: 7,
    curveSegments: 1,
  })
  g.rotateX(-Math.PI / 2) // extrusion axis becomes up
  g.translate(0, -BEVEL, 0) // centre vertically: y from -T/2 to +T/2
  return g
}

/* one flat picture per tool, in solid blues (the page version used gradients) */
const BLUE = '#3a55f0'
const ICONS = [
  // on-chain: a small network
  `<g fill="none" stroke="${BLUE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 30 34 12 58 26 84 10M34 12 40 36 58 26 70 38 84 10"/></g>${[[12, 30], [34, 12], [58, 26], [84, 10], [40, 36], [70, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#4b6bff"/>`).join('')}`,
  // derivatives: candles
  [[10, 8, 26, 1], [22, 14, 30, 0], [34, 6, 22, 1], [46, 12, 34, 0], [58, 4, 20, 1], [70, 10, 28, 1], [82, 2, 18, 1], [94, 8, 24, 0]]
    .map(([x, y, h, up]) => `<path d="M${x} ${y - 3}V${y + h + 3}" stroke="#6f86ff" stroke-width="1"/><rect x="${x - 3}" y="${y}" width="6" height="${h}" rx="1.2" fill="${up ? '#8fa2ff' : '#2a3fd6'}"/>`)
    .join(''),
  // sentiment: a gauge
  `<path d="M14 40A36 36 0 0 1 86 40" stroke="#c4cbea" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M14 40A36 36 0 0 1 70 10" stroke="${BLUE}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M50 40 66 16" stroke="#1b2a8c" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="40" r="3.4" fill="#1b2a8c"/>`,
  // macro: an area line
  `<path d="M4 34C16 30 22 12 34 16S52 36 62 24 78 8 96 12V44H4Z" fill="#4b6bff" fill-opacity=".22"/><path d="M4 34C16 30 22 12 34 16S52 36 62 24 78 8 96 12" fill="none" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/>`,
  // AI: a spark with lines
  `<path d="M22 22C22 14 26 10 34 10C26 10 22 6 22 -2C22 6 18 10 10 10C18 10 22 14 22 22Z" transform="translate(4 8) scale(1.1)" fill="${BLUE}"/><g stroke="${BLUE}" stroke-width="2.4" stroke-linecap="round"><path d="M46 14H92M46 24H80M46 34H68"/></g>`,
  // terminal: order book + button
  `${[[6, 6, 52, 0], [6, 14, 38, 0], [6, 22, 60, 1], [6, 30, 44, 1]].map(([x, y, w, buy]) => `<rect x="${x}" y="${y}" width="${w}" height="5" rx="2" fill="${buy ? '#4b6bff' : '#b3bdea'}"/>`).join('')}<rect x="68" y="14" width="26" height="16" rx="4" fill="${BLUE}"/>`,
]
const iconSrc = (k) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 44" width="400" height="176">${ICONS[k]}</svg>`)}`

function canvasTexture(size, draw, renderer) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return tex
}

export function createGlassBoard({ host, n, mid, firstRow, slots, topics, logo, reduced }) {
  const probe = document.createElement('canvas')
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl')

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.autoUpdate = false // the shadows are redone only when something moves
  const cv = renderer.domElement
  cv.style.cssText = 'display:block;width:100%;height:100%'
  host.appendChild(cv)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new RoomEnvironment()
  scene.environment = pmrem.fromScene(envScene, 0.04).texture

  const camera = new THREE.PerspectiveCamera(16, 1, 0.1, 200)
  const target = new THREE.Vector3(0, 0, 0)

  // --- lights ---
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe6ff, 0.55))
  const key = new THREE.DirectionalLight(0xffffff, 2.1)
  key.position.set(-3.5, 7, 4.5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  const sc = key.shadow.camera
  sc.left = -8
  sc.right = 8
  sc.top = 8
  sc.bottom = -8
  sc.near = 1
  sc.far = 24
  key.shadow.bias = -0.0006
  key.shadow.radius = 5
  scene.add(key)
  const blue = new THREE.PointLight(0x3866ff, 2.5, 3.6, 2)
  blue.position.set(0, 0.8, 0)
  scene.add(blue)

  // --- floor that only catches shadows ---
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ color: 0x28306e, opacity: 0.2 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -T / 2 - 0.002
  floor.receiveShadow = true
  scene.add(floor)

  // --- materials ---
  // Opaque on purpose: a see-through single mesh blends its own inner faces in the wrong order (steps at the corners).
  // The glass reads from the clear coat and the environment reflections instead; it turns transparent only while it fades in.
  const glassBase = new THREE.MeshPhysicalMaterial({
    color: 0xf1f4ff,
    roughness: 0.28,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xdfe7ff),
    envMapIntensity: 1.15,
  })
  const coreMat = new THREE.MeshPhysicalMaterial({
    // solid blue: no clear coat and almost no specular/env, so the key light and the point light stop washing the top white
    color: 0x0b1f8f,
    roughness: 0.7,
    metalness: 0,
    clearcoat: 0,
    specularIntensity: 0,
    emissive: 0x0a1c8a,
    emissiveIntensity: 0.35,
    envMapIntensity: 0.05,
  })
  const geo = tileGeometry()

  // --- the logo, drawn flat once and laid on the blue button ---
  const [vbW, vbH] = logo.viewBox
  const paths = logo.paths.map((d) => new Path2D(d))
  const drawLogo = (ctx, size, glow) => {
    const k = (size * 0.86) / Math.max(vbW, vbH)
    ctx.save()
    ctx.translate((size - vbW * k) / 2, (size - vbH * k) / 2)
    ctx.scale(k, k)
    ctx.fillStyle = '#fff'
    if (glow) {
      // only the glow: the shape itself is drawn off-canvas and its shadow lands in place
      const off = size * 3
      ctx.translate(-off, 0)
      ctx.shadowColor = 'rgba(190,215,255,1)'
      ctx.shadowOffsetX = off
      ctx.shadowBlur = 46
      for (let i = 0; i < 2; i++) paths.forEach((p) => ctx.fill(p))
    } else paths.forEach((p) => ctx.fill(p))
    ctx.restore()
  }
  const logoTex = canvasTexture(1024, (c, s) => drawLogo(c, s, false), renderer)
  const haloTex = canvasTexture(1024, (c, s) => drawLogo(c, s, true), renderer)

  const font = getComputedStyle(host).fontFamily || 'system-ui, sans-serif'
  const decalMat = (map, extra = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false, ...extra })
  const flat = (mat, size, y) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat)
    m.rotation.x = -Math.PI / 2
    m.position.y = y
    m.renderOrder = 2
    return m
  }

  // --- the board ---
  const tiles = []
  const hits = []
  const hitGeo = new THREE.BoxGeometry(S * 0.52, 0.7, S * 0.52)
  const textures = [logoTex, haloTex]
  const materials = [glassBase, coreMat]
  let halo = null

  // Nothing goes behind row firstRow: that row is the straight top edge of the board. The columns run on past n so the
  // board reaches the right edge of the screen along that same line.
  for (let row = firstRow; row < n; row++) {
    for (let col = 0; col < n + 4; col++) {
      const dx = col - mid
      const dz = row - mid
      const ring = Math.max(Math.abs(dx), Math.abs(dz))
      const core = ring === 0
      const slot = slots[`${col},${row}`]
      const x = dx * P
      const z = dz * P
      const mat = core ? coreMat : glassBase.clone()
      if (!core) materials.push(mat)
      // The eight tiles around the symbol: near-clear white glass whose only blue is a light on the bevel (the face normal
      // leaning away from straight up), instead of the point light tinting the whole top.
      const op = core ? 1 : ring === 1 ? RING_OPACITY : OUTER_OPACITY
      if (!core) {
        // frosted: mostly solid, so the shadows under it stop showing through, with a little colour in the white
        mat.color.set(ring === 1 ? 0xf5f7ff : 0xe6ebff)
        mat.sheen = 0
        mat.depthWrite = true
        mat.transparent = true
        mat.opacity = op
      }
      if (ring === 1) {
        mat.onBeforeCompile = (sh) => {
          sh.vertexShader = sh.vertexShader
            .replace('void main() {', 'varying float vUp;\nvoid main() {')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvUp = objectNormal.y;')
          sh.fragmentShader = sh.fragmentShader
            .replace('void main() {', 'varying float vUp;\nvoid main() {')
            .replace(
              '#include <emissivemap_fragment>',
              `#include <emissivemap_fragment>
              float edgeK = 1.0 - smoothstep(0.5, 0.93, vUp);
              totalEmissiveRadiance += vec3(0.1, 0.3, 1.0) * edgeK * ${EDGE_GLOW.toFixed(2)};`,
            )
        }
        mat.customProgramCacheKey = () => 'ring1-edge'
      }
      const mesh = new THREE.Mesh(geo, mat)
      mesh.castShadow = true
      mesh.receiveShadow = !core
      const g = new THREE.Group()
      g.position.set(x, 0, z)
      g.add(mesh)
      const top = T / 2 + 0.004

      if (core) {
        g.add(flat(decalMat(logoTex), S * 0.62, top))
        halo = flat(decalMat(haloTex, { blending: THREE.AdditiveBlending, opacity: 0.8 }), S * 0.62, top + 0.001)
        g.add(halo)
      } else if (slot != null) {
        const tex = canvasTexture(
          1024,
          (ctx, size) => {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = `600 124px ${font}`
            ctx.fillStyle = 'rgba(255,255,255,.85)'
            ctx.fillText(topics[slot], size / 2 + 3, 330 + 3)
            ctx.fillStyle = 'rgba(20,32,120,.92)'
            ctx.fillText(topics[slot], size / 2, 330)
            const img = new Image()
            img.onload = () => {
              ctx.drawImage(img, size / 2 - 250, 470, 500, 220)
              tex.needsUpdate = true
              invalidate()
            }
            img.src = iconSrc(slot)
          },
          renderer,
        )
        textures.push(tex)
        g.add(flat(decalMat(tex), S * 0.96, top))
      }

      scene.add(g)
      const hit = new THREE.Mesh(hitGeo)
      hit.position.set(x, 0.1, z)
      hit.updateMatrixWorld(true)
      hit.userData.i = tiles.length
      hits.push(hit)
      tiles.push({
        g,
        mat,
        core,
        baseY: core ? 0.05 : 0,
        lift: 0,
        goal: 0,
        op,
        appear: reduced ? 1 : 0,
        delay: Math.hypot(dx, dz) * 0.075,
        fading: false,
      })
    }
  }

  // --- sizing: tile pixels follow the page column, the board's centre sits where the layout wants it ---
  const mobileMQ = window.matchMedia('(max-width: 991px)')
  const fit = () => {
    const col = host.parentElement.clientWidth || 1
    const W = Math.max(1, host.clientWidth)
    const H = Math.max(1, host.clientHeight)
    const mobile = mobileMQ.matches
    const ppu = col * (mobile ? 0.235 : 0.145) // pixels per world unit on the board plane
    const fov = camera.fov
    const D = H / (2 * Math.tan((fov * Math.PI) / 360) * ppu)
    const elev = (32 * Math.PI) / 180
    const h = Math.cos(elev) / Math.SQRT2
    camera.position.set(-D * h, D * Math.sin(elev), D * h)
    camera.aspect = W / H
    camera.lookAt(target)
    const cx = mobile ? W / 2 : (W - col) / 2 + col * 0.66
    const cy = H * (mobile ? 0.5 : 0.58)
    camera.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H)
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75))
    renderer.setSize(W, H, false)
    invalidate()
  }

  // --- loop: runs only while on screen ---
  let raf = 0
  let running = false
  let visible = false
  let startAt = null
  let last = 0
  let time = 0
  let hot = -1
  let dirty = true
  let lastDraw = 0

  function invalidate() {
    dirty = true
    if (visible && !running) {
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }

  const ease = (t) => 1 - Math.pow(1 - t, 3)
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    time += dt
    let moving = false // a tile is travelling: the shadows have to follow
    let entering = false
    for (const t of tiles) {
      if (startAt !== null && t.appear < 1) {
        t.appear = Math.min(1, Math.max(0, (now - startAt) / 1000 - t.delay) / 1.25)
        entering = true
      }
      const e = ease(t.appear)
      const goal = t.goal
      const nl = t.lift + (goal - t.lift) * (1 - Math.exp(-dt * 11))
      if (Math.abs(nl - t.lift) > 0.0004) moving = true
      t.lift = Math.abs(goal - nl) < 0.0004 ? goal : nl
      t.g.position.y = t.baseY + t.lift - (1 - e) * 2.2
      const fading = e < 1
      if (t.fading !== fading) {
        t.fading = fading
        t.mat.transparent = fading || t.op < 1
        t.mat.needsUpdate = true
      }
      if (fading || t.op < 1) t.mat.opacity = e * t.op
      t.g.visible = e > 0.001
    }
    const pulse = !!halo && !reduced
    if (pulse) halo.material.opacity = 0.62 + 0.38 * Math.sin(time * 1.75)
    // the symbol's breathing alone is drawn at ~30 fps and never touches the shadows
    const needs = moving || entering || dirty || (pulse && now - lastDraw > 32)
    if (needs) {
      if (moving || entering || dirty) renderer.shadowMap.needsUpdate = true
      renderer.render(scene, camera)
      lastDraw = now
      dirty = false
    }
    // keep going while something moves or breathes; otherwise idle until invalidated
    if (visible && (moving || entering || pulse)) raf = requestAnimationFrame(frame)
    else running = false
  }

  // --- hover: raycast against fixed targets ---
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const setHot = (i) => {
    if (i === hot) return
    if (hot >= 0) tiles[hot].goal = 0
    hot = i
    if (hot >= 0) tiles[hot].goal = tiles[hot].core ? CORE_LIFT : LIFT
    invalidate()
  }
  const onMove = (e) => {
    const r = cv.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
    ray.setFromCamera(ndc, camera)
    const hit = ray.intersectObjects(hits, false)[0]
    setHot(hit ? hit.object.userData.i : -1)
  }
  const onLeave = () => setHot(-1)
  cv.addEventListener('pointermove', onMove, { passive: true })
  cv.addEventListener('pointerleave', onLeave)

  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting
      if (visible) {
        if (startAt === null) startAt = performance.now() + 120
        invalidate()
      }
    },
    { threshold: 0.2 },
  )
  io.observe(host)
  const ro = new ResizeObserver(fit)
  ro.observe(host)
  ro.observe(host.parentElement)
  fit()

  return {
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      cv.removeEventListener('pointermove', onMove)
      cv.removeEventListener('pointerleave', onLeave)
      geo.dispose()
      hitGeo.dispose()
      floor.geometry.dispose()
      floor.material.dispose()
      materials.forEach((m) => m.dispose())
      textures.forEach((t) => t.dispose())
      scene.environment?.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      cv.remove()
    },
  }
}
