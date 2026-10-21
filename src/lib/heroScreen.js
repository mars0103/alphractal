/*
 * The picture on the iMac's glass, drawn on a 2D canvas that three.js uses as the display texture (components/IMac3D.jsx).
 * It is a texture on the 3D screen, not an HTML layer: it takes the machine's perspective, glass and light for free.
 * The hero's scroll timeline animates the plain `state` object below; `draw` repaints only when a value changed.
 */
export const W = 1120
export const H = 630
const BAR = 34
const PAD = 16
const GAP = 8
const FONT = "'Inter Variable', Inter, system-ui, sans-serif"
const DISPLAY = "'Albert Sans Variable', 'Albert Sans', system-ui, sans-serif"

const GX = PAD
const GY = BAR + PAD
const GW = W - PAD * 2
const GH = H - GY - PAD
const TW = (GW - GAP * 3) / 4
const TH = (GH - GAP * 2) / 3

export const tileRect = (i) => ({ x: GX + (i % 4) * (TW + GAP), y: GY + Math.floor(i / 4) * (TH + GAP), w: TW, h: TH })
export const GRID = { x: GX, y: GY, w: GW, h: GH }

export const createState = () => ({
  s1: 1, s1x: 0, // scene 1 (metrics)
  s2: 0, s2x: 70, // scene 2 (Alpha AI)
  s3: 0, s3x: 70, // scene 3 (Terminal)
  tiles: 0, // cascade progress of the twelve blocks, 0..~1.6
  pickS: 1, // the picked block's press
  bigT: 0, bigA: 0, // the picked block growing to the grid
  curA: 1, curX: GX + GW * 0.84, curY: GY + GH * 0.8, // cursor: rests low on the screen and breathes until the visitor scrolls
  ripple: 0, // click ring around the cursor, 0..1
  askA: 0, typed: 0, // question box and typed characters
  aiA: 0, aiSteps: 0, resultA: 0, // answer block
})

const HAS_FILTER = typeof document !== 'undefined' && 'filter' in document.createElement('canvas').getContext('2d')
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/* Shrinks an image in halving steps (a single big drawImage reduction aliases badly): returns a canvas ~targetW wide. */
function shrink(img, targetW) {
  let w = img.naturalWidth
  let h = img.naturalHeight
  let src = img
  while (w / 2 >= targetW) {
    const c = document.createElement('canvas')
    c.width = Math.round(w / 2)
    c.height = Math.round(h / 2)
    const g = c.getContext('2d')
    g.imageSmoothingQuality = 'high'
    g.drawImage(src, 0, 0, c.width, c.height)
    src = c
    w = c.width
    h = c.height
  }
  if (w > targetW * 1.05) {
    const c = document.createElement('canvas')
    c.width = Math.round(targetW)
    c.height = Math.round((h * targetW) / w)
    const g = c.getContext('2d')
    g.imageSmoothingQuality = 'high'
    g.drawImage(src, 0, 0, c.width, c.height)
    src = c
  }
  return src
}

function cover(ctx, img, x, y, w, h, pos = 0.5) {
  const nw = img.naturalWidth || img.width
  const nh = img.naturalHeight || img.height
  if (!img || !nw || (img.complete === false)) return
  const s = Math.max(w / nw, h / nh)
  const iw = nw * s
  const ih = nh * s
  ctx.drawImage(img, x - (iw - w) * pos, y + (h - ih) / 2, iw, ih)
}

export function createScreen(copy, existing) {
  // per screen: the hero and the Alpha AI card each draw their own bitmap at their own size
  let SCALE = 2
  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')
  const state = existing || createState()

  const tiles = copy.tiles.map((t) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = `/metrics/${t.img}.webp`
    return { ...t, im: img }
  })
  let version = 0
  tiles.forEach((t) => {
    const done = () => {
      t.small = shrink(t.im, 700)
      t.big = shrink(t.im, 1500)
      version++
    }
    if (t.im.complete && t.im.naturalWidth) done()
    else t.im.onload = done
  })
  let last = ''
  let fontsReady = false
  document.fonts?.ready.then(() => {
    fontsReady = true
    version++
  })
  const pickIdx = Math.max(0, tiles.findIndex((t) => t.pick))

  const label = (text, x, y, w, h, size) => {
    const g = ctx.createLinearGradient(0, y + h - 34, 0, y + h)
    g.addColorStop(0, 'rgba(3,5,13,0)')
    g.addColorStop(1, 'rgba(3,5,13,0.92)')
    ctx.fillStyle = g
    ctx.fillRect(x, y + h - 34, w, 34)
    ctx.fillStyle = '#e5e8f0'
    ctx.font = `500 ${size}px ${FONT}`
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(text, x + 10, y + h - 9)
  }

  function scene1(a) {
    tiles.forEach((t, i) => {
      const r = tileRect(i)
      const ta = clamp((state.tiles - i * 0.05) / 0.4) * a
      if (ta <= 0) return
      const press = i === pickIdx ? state.pickS : 1
      ctx.save()
      ctx.globalAlpha = ta
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2 + (1 - ta / Math.max(a, 0.001)) * 14)
      ctx.scale(press, press)
      ctx.translate(-r.w / 2, -r.h / 2)
      ctx.fillStyle = '#0d1325'
      rr(ctx, 0, 0, r.w, r.h, 4)
      ctx.fill()
      ctx.save()
      rr(ctx, 0, 0, r.w, r.h, 4)
      ctx.clip()
      ctx.globalAlpha = ta
      if (HAS_FILTER) ctx.filter = 'brightness(1.4) contrast(1.08) saturate(1.2)'
      cover(ctx, t.small || t.im, 0, 0, r.w, r.h, 0.5)
      ctx.filter = 'none'
      ctx.globalAlpha = ta
      label(t.label, 0, 0, r.w, r.h, 13)
      ctx.restore()
      ctx.strokeStyle = '#34405f'
      ctx.lineWidth = 1
      rr(ctx, 0.5, 0.5, r.w - 1, r.h - 1, 4)
      ctx.stroke()
      ctx.restore()
    })
    if (state.bigA > 0.01) {
      const p = tileRect(pickIdx)
      const t = state.bigT
      const x = lerp(p.x, GX, t)
      const y = lerp(p.y, GY, t)
      const w = lerp(p.w, GW, t)
      const h = lerp(p.h, GH, t)
      ctx.save()
      ctx.globalAlpha = state.bigA * a
      ctx.fillStyle = '#03050d'
      rr(ctx, x, y, w, h, 4)
      ctx.fill()
      ctx.save()
      rr(ctx, x, y, w, h, 4)
      ctx.clip()
      if (HAS_FILTER) ctx.filter = 'brightness(1.35) contrast(1.06) saturate(1.15)'
      cover(ctx, w > TW * 1.4 ? tiles[pickIdx].big || tiles[pickIdx].im : tiles[pickIdx].small || tiles[pickIdx].im, x, y, w, h, 0.5)
      ctx.filter = 'none'
      label(tiles[pickIdx].label, x, y, w, h, lerp(13, 19, t))
      ctx.restore()
      ctx.strokeStyle = '#3a4260'
      rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 4)
      ctx.stroke()
      ctx.restore()
    }
    if (state.curA > 0.01) {
      // The cursor: big, white, glowing, with a slow float so it reads as 'move me' before and during the glide
      const now = performance.now()
      const bob = state.s1 > 0.5 ? Math.sin(now / 700) * 5 : 0
      const cx = state.curX + Math.sin(now / 1100) * 3
      const cy = state.curY + bob
      if (state.ripple > 0 && state.ripple < 1) {
        ctx.save()
        ctx.globalAlpha = (1 - state.ripple) * 0.8 * a
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx + 4, cy + 4, 10 + state.ripple * 46, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
      ctx.save()
      ctx.globalAlpha = state.curA * a
      ctx.translate(cx, cy)
      ctx.scale(2.3, 2.3)
      ctx.shadowColor = 'rgba(255,255,255,0.85)'
      ctx.shadowBlur = 14
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = 'rgba(11,13,20,0.55)'
      ctx.lineWidth = 1
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(15, 7.5)
      ctx.lineTo(8.4, 9.4)
      ctx.lineTo(6, 16)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.stroke()
      ctx.restore()
    }
  }

  function scene2(a) {
    const cx = W / 2
    ctx.save()
    ctx.globalAlpha = a
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.font = `800 52px ${DISPLAY}`
    ctx.fillStyle = '#fbf8f8'
    const aw = ctx.measureText('Alpha ').width
    ctx.fillText('Alpha', cx - 330, 122)
    ctx.font = `italic 300 52px ${DISPLAY}`
    ctx.fillStyle = '#4b6bff'
    ctx.fillText('AI', cx - 330 + aw, 122)

    ctx.globalAlpha = a * (0.4 + 0.6 * state.askA)
    const bx = cx - 330
    const by = 146
    ctx.fillStyle = '#0b1020'
    rr(ctx, bx, by, 660, 118, 12)
    ctx.fill()
    ctx.strokeStyle = 'rgba(75,107,255,0.55)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.strokeStyle = '#8f9bff'
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.arc(bx + 30, by + 34, 7, 0, Math.PI * 2)
    ctx.moveTo(bx + 35, by + 39)
    ctx.lineTo(bx + 41, by + 45)
    ctx.stroke()
    const q = copy.question.slice(0, Math.round(state.typed))
    ctx.fillStyle = '#fbf8f8'
    ctx.font = `500 20px ${FONT}`
    ctx.fillText(q, bx + 56, by + 41)
    if (Math.floor(performance.now() / 500) % 2 === 0 && state.askA > 0.5) {
      const cw = ctx.measureText(q).width
      ctx.fillRect(bx + 58 + cw, by + 24, 2, 24)
    }
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(bx, by + 66, 660, 1)
    ctx.font = `600 12px ${FONT}`
    ctx.fillStyle = '#9aa3c2'
    ctx.fillText('QUICK ASK', bx + 20, by + 96)
    ctx.fillStyle = 'rgba(30,173,100,0.16)'
    rr(ctx, bx + 108, by + 78, 76, 28, 6)
    ctx.fill()
    ctx.fillStyle = '#1ead64'
    ctx.fillText('$ TRADE', bx + 122, by + 96)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#7d8599'
    ctx.font = `400 12px ${FONT}`
    ctx.fillText('1,000 credits · 49,000 left', bx + 612, by + 96)
    ctx.fillStyle = '#1a2150'
    rr(ctx, bx + 620, by + 78, 30, 28, 6)
    ctx.fill()
    ctx.textAlign = 'left'

    ctx.globalAlpha = a * state.aiA
    const ay = 292
    ctx.fillStyle = '#0b1020'
    rr(ctx, bx, ay, 660, 190, 12)
    ctx.fill()
    ctx.strokeStyle = 'rgba(143,155,255,0.22)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#4b6bff'
    ctx.beginPath()
    const sx = bx + 34
    const sy = ay + 34
    ctx.moveTo(sx, sy - 14)
    ctx.quadraticCurveTo(sx, sy, sx + 14, sy)
    ctx.quadraticCurveTo(sx, sy, sx, sy + 14)
    ctx.quadraticCurveTo(sx, sy, sx - 14, sy)
    ctx.quadraticCurveTo(sx, sy, sx, sy - 14)
    ctx.fill()
    ctx.fillStyle = '#e5e8f0'
    ctx.font = `500 16px ${FONT}`
    ctx.fillText(copy.thinking, bx + 62, ay + 40)
    copy.domains.forEach((d, i) => {
      const sa = clamp(state.aiSteps - i)
      ctx.globalAlpha = a * state.aiA * sa
      const yy = ay + 78 + i * 28 + (1 - sa) * 6
      ctx.strokeStyle = '#4b6bff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(bx + 34, yy - 5)
      ctx.lineTo(bx + 39, yy)
      ctx.lineTo(bx + 47, yy - 10)
      ctx.stroke()
      ctx.fillStyle = '#c9cedb'
      ctx.font = `400 15px ${FONT}`
      ctx.fillText(d.label, bx + 62, yy)
    })
    ctx.globalAlpha = a * state.aiA * state.resultA
    ctx.fillStyle = '#8f9bff'
    ctx.font = `600 12px ${FONT}`
    ctx.fillText(copy.resultLabel.toUpperCase(), bx + 34, ay + 178)
    ctx.restore()
  }

  function scene3(a) {
    ctx.save()
    ctx.globalAlpha = a
    const x = 24
    const y = BAR + 24
    const w = W - 48
    const h = H - BAR - 48
    ctx.fillStyle = 'rgba(251,248,248,0.03)'
    rr(ctx, x, y, w, h, 6)
    ctx.fill()
    ctx.setLineDash([7, 6])
    ctx.strokeStyle = 'rgba(251,248,248,0.28)'
    ctx.lineWidth = 1.4
    ctx.stroke()
    ctx.setLineDash([])
    ctx.textAlign = 'center'
    ctx.fillStyle = '#4b6bff'
    rr(ctx, W / 2 - 54, y + h / 2 - 66, 108, 24, 3)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `600 12px ${FONT}`
    ctx.fillText('PLACEHOLDER', W / 2, y + h / 2 - 49)
    ctx.fillStyle = 'rgba(251,248,248,0.78)'
    ctx.font = `600 26px ${DISPLAY}`
    ctx.fillText(copy.terminalShot, W / 2, y + h / 2 - 8)
    ctx.fillStyle = 'rgba(251,248,248,0.55)'
    ctx.font = `400 16px ${FONT}`
    ctx.fillText(copy.terminalShotNote, W / 2, y + h / 2 + 22)
    ctx.fillStyle = '#1ead64'
    rr(ctx, W - 190, H - 100, 120, 44, 5)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `600 18px ${FONT}`
    ctx.fillText('Long', W - 130, H - 72)
    ctx.restore()
  }

  function draw() {
    // GSAP stamps its own bookkeeping onto tweened objects, so build the change key from the numbers only
    let key = version + '|' + (state.askA > 0.5 && state.s2 > 0.01 ? Math.floor(performance.now() / 500) : '') + (state.curA > 0.01 && state.s1 > 0.01 ? Math.floor(performance.now() / 40) : '')
    for (const k in state) if (typeof state[k] === 'number') key += state[k].toFixed(3) + ','
    if (key === last) return false
    last = key
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0a0f1e'
    ctx.fillRect(0, 0, W, H)
    // browser bar
    ctx.fillStyle = '#0d1325'
    ctx.fillRect(0, 0, W, BAR)
    ctx.fillStyle = '#1a2033'
    ctx.fillRect(0, BAR - 1, W, 1)
    ;['#2c3348', '#2c3348', '#2c3348'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(20 + i * 16, BAR / 2, 4.5, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = '#10152a'
    rr(ctx, W / 2 - 110, 7, 220, 20, 6)
    ctx.fill()
    ctx.fillStyle = '#7d8599'
    ctx.font = `400 11px ${FONT}`
    ctx.textAlign = 'center'
    ctx.fillText('app.alphractal.com', W / 2, 21)
    ctx.textAlign = 'left'
    void fontsReady
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, BAR, W, H - BAR)
    ctx.clip()
    if (state.s1 > 0.005) {
      ctx.save()
      ctx.translate(state.s1x, 0)
      scene1(state.s1)
      ctx.restore()
    }
    if (state.s2 > 0.005) {
      ctx.save()
      ctx.translate(state.s2x, 0)
      scene2(state.s2)
      ctx.restore()
    }
    if (state.s3 > 0.005) {
      ctx.save()
      ctx.translate(state.s3x, 0)
      scene3(state.s3)
      ctx.restore()
    }
    ctx.restore()
    return true
  }

  // The bitmap is drawn at the size it is actually shown (perspective-warped by CSS), so the browser never has to
  // shrink it by a large factor: that is what made the text and chart lines look jagged.
  function setScale(k) {
    const next = Math.min(2.2, Math.max(0.7, Math.round(k * 20) / 20))
    if (next === SCALE) return
    SCALE = next
    canvas.width = Math.round(W * SCALE)
    canvas.height = Math.round(H * SCALE)
    last = ''
  }
  canvas.width = Math.round(W * SCALE)
  canvas.height = Math.round(H * SCALE)

  return { canvas, state, draw, W, H, setScale }
}
