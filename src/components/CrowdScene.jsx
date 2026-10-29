import { useEffect, useRef, useState } from 'react'

/* About hero backdrop: a big, dense field of small dark 3D figures filling the whole hero, seen from above and at an angle,
   all turned toward the text on the left. Five of them in the right half are lit blue, and each throws a pool of blue light on
   the crowd around it (real point lights, so the neighbours catch it), as in the reference. On entering, the five light up slowly
   one after the other; with a mouse, the five blue ones rise as the pointer passes near them (a wave through the five) and settle
   back slowly. The grey crowd never moves. It renders only while something moves. Reduced motion: the five are lit and nothing reacts. three.js is loaded on demand; without WebGL the caller's fallback (the flat SVG crowd) stays. */
const SX = 0.8 // distance between figures, sideways
const SZ = 0.86 // and front to back
const COLS = 41
const ROWS = 24
const YAW = -0.7 // everyone is turned toward the text, on the left
const LIT = [
  [3.0, 7],
  [6.2, 9],
  [8.4, 6],
  [4.6, 12],
  [7.4, 13],
] // [x, row] of the five lit figures, in world units across and rows back from the front
const ENTRY_DELAY = 500 // ms before the five start to light
const ENTRY_STAGGER = 0.5 // s between one lighting and the next
const ENTRY_TIME = 2.4 // s each takes to come fully on
const WAVE_R2 = 3.2 * 3.2 // reach of the pointer's wave (squared), in world units
const LIFT_Y = 0.7 // how high a blue figure rises, whole and undistorted

export default function CrowdScene({ fallback, fill = false }) {
  const host = useRef(null)
  const [ok, setOk] = useState(true)

  useEffect(() => {
    let dispose = () => {}
    let alive = true
    const el = host.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ;(async () => {
      try {
        const probe = document.createElement('canvas')
        if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl')
        const THREE = await import('three')
        const { mergeGeometries } = await import('three/examples/jsm/utils/BufferGeometryUtils.js')
        if (!alive) return

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
        renderer.setClearColor(0x000000, 0)
        const cv = renderer.domElement
        cv.style.cssText = 'display:block;width:100%;height:100%'
        el.appendChild(cv)

        const INK = 0x0b0d14 // the hero's black
        const scene = new THREE.Scene()
        scene.fog = new THREE.Fog(INK, 15, 36) // the far crowd sinks into the dark
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 90)

        // one figure: round head, rounded shoulders and body, two arms and two legs, a little thick
        const rr = (x, y, w, h, r) => {
          const s = new THREE.Shape()
          s.moveTo(x + r, y)
          s.lineTo(x + w - r, y)
          s.quadraticCurveTo(x + w, y, x + w, y + r)
          s.lineTo(x + w, y + h - r)
          s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
          s.lineTo(x + r, y + h)
          s.quadraticCurveTo(x, y + h, x, y + h - r)
          s.lineTo(x, y + r)
          s.quadraticCurveTo(x, y, x + r, y)
          return s
        }
        const ex = (shape) => new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 6 })
        const parts = [
          ex(rr(-0.2, 0.46, 0.4, 0.5, 0.14)), // torso, rounded at the shoulders
          ex(rr(-0.33, 0.5, 0.1, 0.42, 0.05)), // arms
          ex(rr(0.23, 0.5, 0.1, 0.42, 0.05)),
          ex(rr(-0.17, 0.0, 0.14, 0.52, 0.05)), // legs
          ex(rr(0.03, 0.0, 0.14, 0.52, 0.05)),
        ]
        const head = new THREE.SphereGeometry(0.15, 20, 14).toNonIndexed()
        head.translate(0, 1.13, 0.05)
        parts.forEach((g) => g.translate(0, 0, -0.05))
        const all = [...parts, head].map((g) => {
          const n = g.index ? g.toNonIndexed() : g
          n.deleteAttribute('uv')
          return n
        })
        const geo = mergeGeometries(all)
        geo.computeVertexNormals()

        // Light: nearly nothing but a faint cool light from above, so the crowd is dark and the five blue lights do the work.
        scene.add(new THREE.HemisphereLight(0x2c2f3a, 0x0b0d14, 0.45))
        const key = new THREE.DirectionalLight(0xdfe4ff, 1.0)
        key.position.set(-5, 9, 4)
        scene.add(key)
        const rim = new THREE.DirectionalLight(0x4b6bff, 0.9) // a thin blue edge from behind
        rim.position.set(5, 3, -8)
        scene.add(rim)

        // deterministic jitter, so the crowd is the same on every visit
        let seed = 7
        const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
        const spots = []
        for (let r = -6; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const x = (c - (COLS - 1) / 2) * SX + (r % 2 ? SX * 0.5 : 0) + (rnd() - 0.5) * 0.16
            const z = -r * SZ + (rnd() - 0.5) * 0.16
            const near = LIT.some(([lx, lr]) => lr === r && Math.abs(lx - x) < SX * 0.75)
            if (!near) spots.push({ x, z, r, s: 0.94 + rnd() * 0.14, yaw: YAW + (rnd() - 0.5) * 0.3, v: 0.21 + rnd() * 0.05 })
          }
        }
        const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62, metalness: 0 })
        const crowd = new THREE.InstancedMesh(geo, mat, spots.length)
        const dummy = new THREE.Object3D()
        const col = new THREE.Color()
        spots.forEach((sp, i) => {
          dummy.position.set(sp.x, 0, sp.z)
          dummy.rotation.y = sp.yaw
          dummy.scale.setScalar(sp.s)
          dummy.updateMatrix()
          crowd.setMatrixAt(i, dummy.matrix)
          col.setRGB(sp.v, sp.v, sp.v * 1.04)
          crowd.setColorAt(i, col)
        })
        scene.add(crowd)

        // a soft pool of blue on the ground under each lit figure
        const poolTex = (() => {
          const c = document.createElement('canvas')
          c.width = c.height = 256
          const x = c.getContext('2d')
          const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
          g.addColorStop(0, 'rgba(70,110,255,0.4)')
          g.addColorStop(0.45, 'rgba(50,90,255,0.1)')
          g.addColorStop(1, 'rgba(40,80,255,0)')
          x.fillStyle = g
          x.fillRect(0, 0, 256, 256)
          const t = new THREE.CanvasTexture(c)
          t.colorSpace = THREE.SRGBColorSpace
          return t
        })()
        const poolGeo = new THREE.PlaneGeometry(4.2, 4.2)

        const lit = LIT.map(([x, r]) => {
          const z = -r * SZ
          const material = new THREE.MeshStandardMaterial({ color: 0x1d3bd8, emissive: 0x3358ff, emissiveIntensity: 0, roughness: 0.4, metalness: 0 })
          const mesh = new THREE.Mesh(geo, material)
          mesh.position.set(x, 0, z)
          mesh.rotation.y = YAW
          mesh.scale.setScalar(1.05)
          const light = new THREE.PointLight(0x3f6bff, 0, 4, 1.8) // what lights the figures around it
          light.position.set(x, 1.7, z + 0.6)
          const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
          const pool = new THREE.Mesh(poolGeo, poolMat)
          pool.rotation.x = -Math.PI / 2
          pool.position.set(x, 0.01, z)
          scene.add(mesh, light, pool)
          return { mesh, light, material, poolMat, x, z, v: reduced ? 1 : 0, amp: 0 }
        })
        const setLit = (l) => {
          l.material.emissiveIntensity = (1.1 + 0.6 * l.amp) * l.v
          l.light.intensity = (7 + 5 * l.amp) * l.v
          l.mesh.position.y = LIFT_Y * l.amp
          l.light.position.y = 1.7 + LIFT_Y * l.amp
          l.poolMat.opacity = l.v
        }
        lit.forEach(setLit)

        const fit = () => {
          const W = Math.max(1, el.clientWidth)
          const H = Math.max(1, el.clientHeight)
          const wide = W / H
          camera.aspect = wide
          // seen from above and at an angle, the five lit figures landing in the right half, under the top-right corner
          camera.position.set(-4.5, 9.6, 12.8)
          camera.lookAt(1.5, 0, -5.4)
          camera.fov = wide > 1.2 ? 32 : 46
          camera.updateProjectionMatrix()
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
          renderer.setSize(W, H, false)
          kick()
        }
        // --- animation: the five light up slowly on entering, and the pointer sends a wave through the crowd ---
        let raf = 0
        let running = false
        let visible = true
        let last = 0
        let startAt = null
        let entering = !reduced
        let active = false // the pointer is over the hero
        const P = new THREE.Vector3() // where the pointer meets the crowd (world units)
        const ray = new THREE.Raycaster()
        const ndc = new THREE.Vector2()
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.55)
        const ease = (t) => t * t * (3 - 2 * t)

        function frame(now) {
          const dt = Math.min(0.05, (now - last) / 1000)
          last = now
          let busy = false
          if (entering) {
            if (startAt === null) startAt = now + ENTRY_DELAY
            const t = (now - startAt) / 1000
            let done = true
            lit.forEach((l, i) => {
              const k = Math.min(1, Math.max(0, (t - i * ENTRY_STAGGER) / ENTRY_TIME))
              l.v = ease(k)
              setLit(l)
              if (k < 1) done = false
            })
            if (done) entering = false
            busy = true
          }
          if (!reduced) {
            // only the five blue figures react: each one rises as the pointer's wave reaches it, and settles back slowly
            for (const l of lit) {
              let target = 0
              if (active) {
                const dx = l.x - P.x
                const dz = l.z - P.z
                target = Math.exp(-(dx * dx + dz * dz) / (2 * WAVE_R2))
              }
              const na = l.amp + (target - l.amp) * (1 - Math.exp(-(target > l.amp ? 7 : 2.4) * dt))
              const v = na < 0.003 && target === 0 ? 0 : na
              if (v !== l.amp) {
                l.amp = v
                setLit(l)
                if (v > 0) busy = true
              }
            }
          }
          renderer.render(scene, camera)
          if (visible && (busy || active)) raf = requestAnimationFrame(frame)
          else running = false
        }
        function kick() {
          if (running || !visible) return
          running = true
          last = performance.now()
          raf = requestAnimationFrame(frame)
        }

        const hero = el.closest('.phero') || el.parentElement
        const onMove = (e) => {
          const r = el.getBoundingClientRect()
          ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
          ray.setFromCamera(ndc, camera)
          active = !!ray.ray.intersectPlane(plane, P)
          kick()
        }
        const onLeave = () => {
          active = false
          kick()
        }
        const fine = !reduced && window.matchMedia('(pointer: fine)').matches
        if (fine) {
          hero.addEventListener('pointermove', onMove, { passive: true })
          hero.addEventListener('pointerleave', onLeave)
        }

        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting
          if (visible) kick()
        })
        io.observe(el)
        const ro = new ResizeObserver(fit)
        ro.observe(el)
        fit()

        dispose = () => {
          cancelAnimationFrame(raf)
          hero.removeEventListener('pointermove', onMove)
          hero.removeEventListener('pointerleave', onLeave)
          io.disconnect()
          ro.disconnect()
          geo.dispose()
          mat.dispose()
          lit.forEach((l) => {
            l.material.dispose()
            l.poolMat.dispose()
          })
          crowd.dispose()
          poolGeo.dispose()
          poolTex.dispose()
          renderer.dispose()
          renderer.forceContextLoss()
          cv.remove()
        }
      } catch {
        if (alive) setOk(false)
      }
    })()
    return () => {
      alive = false
      dispose()
    }
  }, [])

  if (!ok) return fallback
  return <div ref={host} className={`abt-crowd3d${fill ? ' abt-crowd3d--fill' : ''}`} aria-hidden="true" />
}
