import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { buildPiCycle } from '../../lib/piCycle.js'

/*
 * Hero scene: layered shader waves that rise into being while the camera dollies in, with unframed
 * charts floating above them (a Pi Cycle on the front, two smaller studies at the sides).
 * `state` is driven from outside (GSAP): { intro 0→1, scroll 0→1 }.
 */
const BLUE = ['#001d87', '#1749ff', '#4b6bff', '#666dff', '#9fb2ff']

const waveVert = /* glsl */ `
  uniform float uTime; uniform float uAmp; uniform float uSeed; uniform float uGrow;
  varying float vH; varying float vFade; varying vec2 vUv;
  void main(){
    vUv = uv;
    vec3 p = position;
    float w = sin(p.x*0.35 + uTime*0.55 + uSeed)*0.9
            + sin(p.x*0.8 - p.y*0.5 + uTime*0.8 + uSeed*2.0)*0.45
            + sin(p.y*0.9 + uTime*0.4 + uSeed*3.0)*0.35;
    p.z += w * uAmp * uGrow;
    vH = w;
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    vFade = smoothstep(46.0, 8.0, -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const waveFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uAlpha; uniform float uGrow;
  varying float vH; varying float vFade; varying vec2 vUv;
  void main(){
    float edge = smoothstep(0.0,0.12,vUv.x)*smoothstep(1.0,0.88,vUv.x)*smoothstep(0.0,0.2,vUv.y);
    float crest = smoothstep(-0.6, 1.2, vH);
    vec3 c = mix(uColor*0.55, uColor*1.25, crest);
    gl_FragColor = vec4(c, uAlpha * edge * vFade * uGrow * (0.55 + crest*0.45));
  }
`

function label(text, { size = 34, color = '#cdd3e4', weight = 500, w = 512 } = {}) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = 96
  const g = c.getContext('2d')
  g.font = `${weight} ${size}px Inter, system-ui, sans-serif`
  g.fillStyle = color
  g.textBaseline = 'middle'
  g.fillText(text, 8, 48)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  const s = new THREE.Sprite(m)
  s.scale.set(w / 96 / 3.4, 1 / 3.4, 1)
  s.center.set(0, 0.5)
  return s
}

function dot(color, size) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, color)
  grad.addColorStop(0.35, color)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  s.scale.set(size, size, 1)
  return s
}

export function createHeroScene(canvas, state, { small = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120)

  const lineMats = []
  const mkLine = (pts, color, width, opacity = 1) => {
    const geo = new LineGeometry()
    geo.setPositions(pts)
    const mat = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false })
    lineMats.push(mat)
    const l = new Line2(geo, mat)
    l.userData.total = geo.instanceCount
    return l
  }

  // ---------- Waves ----------
  const waves = []
  const segX = small ? 90 : 180
  const segY = small ? 24 : 44
  BLUE.forEach((hex, i) => {
    const geo = new THREE.PlaneGeometry(70, 16, segX, segY)
    const mat = new THREE.ShaderMaterial({
      vertexShader: waveVert,
      fragmentShader: waveFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: i > 1 ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 1.5 - i * 0.12 },
        uSeed: { value: i * 1.7 },
        uGrow: { value: 0 },
        uColor: { value: new THREE.Color(hex) },
        uAlpha: { value: 0.9 - i * 0.1 },
      },
    })
    const m = new THREE.Mesh(geo, mat)
    m.rotation.x = -Math.PI / 2.35
    m.position.set(0, -2.6 + i * 0.28, -1.5 - i * 1.7)
    m.userData.i = i
    scene.add(m)
    waves.push(m)
  })

  // ---------- Charts (no frames: lines, a few hairline gridlines, labels) ----------
  const charts = new THREE.Group()
  scene.add(charts)

  // Pi Cycle, front and centre
  const pi = buildPiCycle()
  const W = 8.4
  const H = 3.5
  const piGroup = new THREE.Group()
  piGroup.position.set(0, 1.55, 1.2)
  charts.add(piGroup)
  const lo = Math.log(Math.min(...pi.price) * 0.8)
  const hi = Math.log(Math.max(...pi.price) * 1.15)
  const px = (i) => (i / (pi.days - 1)) * W - W / 2
  const py = (v) => ((Math.log(v) - lo) / (hi - lo)) * H - H / 2
  const series = (arr, step = 3) => {
    const pts = []
    for (let i = 0; i < arr.length; i += step) if (arr[i] != null) pts.push(px(i), py(arr[i]), 0)
    return pts
  }
  const grid = []
  for (let k = 0; k <= 4; k++) grid.push(-W / 2, -H / 2 + (k / 4) * H, 0, W / 2, -H / 2 + (k / 4) * H, 0)
  const gridGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(grid, 3))
  const gridMat = new THREE.LineBasicMaterial({ color: 0x8fa0d8, transparent: true, opacity: 0.12 })
  piGroup.add(new THREE.LineSegments(gridGeo, gridMat))

  const priceL = mkLine(series(pi.price, 2), 0xe8ecf8, 1.6, 0.85)
  const ma111L = mkLine(series(pi.ma111), 0x38bdf8, 2.4)
  const ma350L = mkLine(series(pi.ma350x2), 0xff7a59, 2.4)
  piGroup.add(priceL, ma350L, ma111L)

  const marks = []
  pi.crosses.forEach((ci) => {
    const x = px(ci)
    const y = py(pi.ma350x2[ci])
    const d = dot('#ffd166', 0.32)
    d.position.set(x, y, 0.02)
    const v = new THREE.Line(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([x, y, 0, x, -H / 2, 0], 3)),
      new THREE.LineBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.35 }),
    )
    const t = label('Pi Cycle Top signal', { size: 30, color: '#ffd166', weight: 600 })
    t.position.set(x - 2.2, y + 0.38, 0.02)
    piGroup.add(v, d, t)
    marks.push(d, v, t)
  })
  const lg1 = label('111DMA', { color: '#38bdf8', weight: 600 })
  const lg2 = label('350DMA ×2', { color: '#ff7a59', weight: 600 })
  const lg3 = label('Price (log)', { color: '#e8ecf8', weight: 600 })
  lg1.position.set(-W / 2, H / 2 + 0.42, 0)
  lg2.position.set(-W / 2 + 1.35, H / 2 + 0.42, 0)
  lg3.position.set(-W / 2 + 3.0, H / 2 + 0.42, 0)
  const cap = label('Simulated data · Pi Cycle Top logic: 111DMA × 350DMA ×2', { size: 26, color: '#7f8aa6', w: 760 })
  cap.position.set(-W / 2, -H / 2 - 0.4, 0)
  piGroup.add(lg1, lg2, lg3, cap)
  const tip = dot('#e8ecf8', 0.45)
  tip.position.set(px(pi.days - 1), py(pi.price[pi.days - 1]), 0.03)
  piGroup.add(tip)
  // the visitor's read: a projected path from the live tip, drawn when Long / Short is clicked
  const pickState = { dir: 0, t: 0 }
  const pickGroup = new THREE.Group()
  pickGroup.visible = false
  piGroup.add(pickGroup)
  const pickTip = { x: px(pi.days - 1), y: py(pi.price[pi.days - 1]) }
  let pickLine = null
  let pickDot = null
  let pickLabel = null
  piGroup.userData.lines = [priceL, ma350L, ma111L]

  // Side studies
  const wide = []
  const side = (x, z, rotY, pts, color, name) => {
    const g = new THREE.Group()
    g.position.set(x, 1.3, z)
    g.rotation.y = rotY
    const l = mkLine(pts, color, 2.2)
    g.add(l)
    const tl = label(name, { size: 28, color: '#a4abbb' })
    tl.position.set(-1.7, 1.25, 0)
    g.add(tl)
    charts.add(g)
    wide.push(g)
    return l
  }
  const osc = []
  for (let i = 0; i <= 160; i++) {
    const u = i / 160
    osc.push(-1.7 + u * 3.4, Math.sin(u * 9) * 0.5 * (0.5 + u) + Math.sin(u * 23) * 0.12 + 0.1, 0)
  }
  const oscL = side(-6.2, -0.8, 0.42, osc, 0x9fb2ff, 'Cycle oscillator · simulated')
  const bars = new THREE.Group()
  const barMat = new THREE.MeshBasicMaterial({ color: 0x4b6bff, transparent: true, opacity: 0.85 })
  for (let i = 0; i < 28; i++) {
    const h = 0.25 + Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.4)) * 1.6
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.09, h), barMat)
    b.position.set(-1.65 + i * 0.125, h / 2 - 0.5, 0)
    bars.add(b)
  }
  const barG = new THREE.Group()
  barG.position.set(6.2, 1.3, -0.8)
  barG.rotation.y = -0.42
  barG.add(bars)
  const bl = label('Liquidation levels · simulated', { size: 28, color: '#a4abbb' })
  bl.position.set(-1.7, 1.25, 0)
  barG.add(bl)
  charts.add(barG)
  wide.push(barG)
  void oscL

  // ---------- Camera + loop ----------
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  const onMove = (e) => {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 2
    pointer.y = (e.clientY / window.innerHeight - 0.5) * 2
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  let aspect = 1
  let vw = 1
  let vh = 1
  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    aspect = w / h
    camera.aspect = aspect
    // sit the whole scene in the lower part of the frame; the copy owns the top
    vw = w
    vh = h
    camera.updateProjectionMatrix()
    lineMats.forEach((m) => m.resolution.set(w, h))
    wide.forEach((g) => (g.visible = aspect > 1.1))
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  // scroll roteiro: where the camera sits and looks (world units) at each stop
  const cx = pi.crosses.length ? px(pi.crosses[0]) : 0
  const cyv = pi.crosses.length ? py(pi.ma350x2[pi.crosses[0]]) : 0
  const tipX = px(pi.days - 1)
  const tipY = py(pi.price[pi.days - 1])
  const KEYS = [
    { at: 0.0, dist: 12.5, cy: 1.5, tx: 0, ty: 1.3, tz: 1.2, shift: 0.3 },
    { at: 0.16, dist: 4.4, cy: 2.4, tx: cx, ty: 1.55 + cyv, tz: 1.2, shift: 0 },
    { at: 0.34, dist: 22, cy: 5.5, tx: 0, ty: 0.4, tz: 0, shift: 0 },
    { at: 0.52, dist: 3.6, cy: -1.9, tx: -1.5, ty: -2.5, tz: -6, shift: 0 },
    { at: 0.7, dist: 17, cy: 3, tx: 0, ty: 1.5, tz: 0, shift: 0.05 },
    { at: 0.86, dist: 9.5, cy: 2.2, tx: tipX * 0.6, ty: 1.55 + tipY, tz: 1.2, shift: 0 },
    { at: 1.0, dist: 4.6, cy: 2.0, tx: tipX - 0.4, ty: 1.55 + tipY, tz: 1.2, shift: 0.05 },
  ]
  const ease = (u) => u * u * (3 - 2 * u)
  const sampleKeys = (p) => {
    let i = 0
    while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++
    const A = KEYS[i]
    const B = KEYS[i + 1]
    const u = ease(THREE.MathUtils.clamp((p - A.at) / (B.at - A.at), 0, 1))
    const o = {}
    for (const key of ['dist', 'cy', 'tx', 'ty', 'tz', 'shift']) o[key] = A[key] + (B[key] - A[key]) * u
    return o
  }
  const cam = { ...KEYS[0] }

  const clock = new THREE.Clock()
  let raf = 0
  let running = false
  const target = new THREE.Vector3()

  const frame = () => {
    const t = clock.getElapsedTime()
    const intro = state.intro
    const e = 1 - Math.pow(1 - intro, 3)
    pointer.sx += (pointer.x - pointer.sx) * 0.05
    pointer.sy += (pointer.y - pointer.sy) * 0.05

    waves.forEach((m) => {
      const i = m.userData.i
      const u = m.material.uniforms
      u.uTime.value = t
      // each layer swells up in turn
      const k = THREE.MathUtils.clamp((intro - i * 0.1) / 0.55, 0, 1)
      u.uGrow.value = 1 - Math.pow(1 - k, 3)
      m.position.y = -2.6 + i * 0.28 - (1 - u.uGrow.value) * 2.2
    })

    // Camera: waves rise while it approaches (intro), then the scroll flies it through the keyframes (zoom in / out)
    const k = sampleKeys(state.scroll)
    cam.dist += (k.dist - cam.dist) * 0.09
    cam.ty += (k.ty - cam.ty) * 0.09
    cam.tx += (k.tx - cam.tx) * 0.09
    cam.tz += (k.tz - cam.tz) * 0.09
    cam.cy += (k.cy - cam.cy) * 0.09
    cam.shift += (k.shift - cam.shift) * 0.09
    const far = 1 / Math.min(1, aspect / 1.6)
    camera.setViewOffset(vw, vh, 0, -vh * cam.shift, vw, vh)
    camera.position.set(cam.tx + pointer.sx * 0.9 + Math.sin(t * 0.18) * 0.35, cam.cy + (1 - e) * 3.2 - pointer.sy * 0.35, cam.tz + cam.dist * far + (1 - e) * 11.5)
    target.set(cam.tx + pointer.sx * 0.25, cam.ty + (1 - e) * -0.9, cam.tz)
    camera.lookAt(target)
    camera.rotation.z = Math.sin(t * 0.2) * 0.012 + pointer.sx * -0.015

    charts.position.y = Math.sin(t * 0.7) * 0.07
    charts.children.forEach((g, i) => (g.rotation.y += (i ? 0 : (pointer.sx * 0.18 - g.rotation.y) * 0.04)))
    // charts draw themselves in after the waves are up
    const draw = THREE.MathUtils.clamp((intro - 0.45) / 0.5, 0, 1)
    piGroup.userData.lines.forEach((l, i) => {
      const k = THREE.MathUtils.clamp(draw * 1.25 - i * 0.12, 0, 1)
      l.geometry.instanceCount = Math.max(1, Math.floor(l.userData.total * k))
    })
    piGroup.children.forEach((c) => {
      if (c.material && c.material.opacity !== undefined && c.type !== 'Line2') c.visible = draw > 0.02
    })
    marks.forEach((m) => (m.visible = draw > 0.85))
    if (pickState.dir) {
      pickState.t = Math.min(1, pickState.t + 0.016)
      const k = 1 - Math.pow(1 - pickState.t, 3)
      pickLine.geometry.instanceCount = Math.max(1, Math.floor(pickLine.userData.total * k))
      pickDot.position.set(pickTip.x + 1.1 * k, pickTip.y + pickState.dir * 0.85 * k, 0.04)
      pickDot.scale.setScalar(0.28 + Math.sin(t * 4) * 0.05)
      pickLabel.material.opacity = k
    }
    tip.visible = draw > 0.95
    tip.scale.setScalar(0.38 + Math.sin(t * 3.2) * 0.1)
    wide.forEach((g) => g.children.forEach((c) => c.material && (c.material.opacity = Math.min(0.9, draw))))

    renderer.render(scene, camera)
  }
  const loop = () => {
    if (!running) return
    frame()
    raf = requestAnimationFrame(loop)
  }

  return {
    start() {
      if (running) return
      running = true
      clock.start()
      loop()
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    pick(dir) {
      if (pickLine) {
        pickGroup.remove(pickLine, pickDot, pickLabel)
        pickLine.geometry.dispose()
      }
      const col = dir > 0 ? 0x22d39b : 0xff5d73
      const pts = []
      for (let i = 0; i <= 24; i++) {
        const u = i / 24
        pts.push(pickTip.x + 1.1 * u, pickTip.y + dir * 0.85 * u * (0.55 + 0.45 * u) + Math.sin(u * 14) * 0.05, 0.04)
      }
      pickLine = mkLine(pts, col, 3)
      pickLine.material.resolution.set(canvas.clientWidth, canvas.clientHeight)
      pickDot = dot(dir > 0 ? '#22d39b' : '#ff5d73', 0.3)
      pickLabel = label(dir > 0 ? 'Your read: Long' : 'Your read: Short', { size: 30, color: dir > 0 ? '#22d39b' : '#ff5d73', weight: 700 })
      pickLabel.position.set(pickTip.x - 1.7, pickTip.y + dir * 1.05, 0.04)
      pickLabel.material.opacity = 0
      pickGroup.add(pickLine, pickDot, pickLabel)
      pickGroup.visible = true
      pickState.dir = dir
      pickState.t = 0
    },
    renderOnce() {
      frame()
    },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      ro.disconnect()
      scene.traverse((o) => {
        o.geometry?.dispose?.()
        const m = o.material
        if (m) (Array.isArray(m) ? m : [m]).forEach((x) => (x.map?.dispose?.(), x.dispose()))
      })
      renderer.dispose()
    },
  }
}
