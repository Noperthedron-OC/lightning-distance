// The hero picture: a storm sky drawn in SVG, and the page that places the
// app's phone screen in it. Everything is generated from fixed seeds, so the
// picture only changes when this file or the app changes.

// Colours of the "warm dark" theme of erichweihs.com (src/design-system/tokens.css).
export const C = {
  canvas: '#15100b',
  surface: '#211912',
  ink: '#f1e8dc',
  muted: '#b3a596',
  line: '#3a2e22',
  lineStrong: '#7c6c5b',
  amber: '#d9a35e',
  teal: '#4fb0c0',
  flash: '#fff3df',
}

export const W = 1200
export const H = 750
export const HORIZON = 520
// Where the lightning reaches the ground, the origin of the sound waves.
export const STRIKE = [528, 514]
// The part of the sky the phone's camera sees (4:3, like the app's viewfinder).
export const CAMERA_VIEW = [348, 70, 400, 300]

// The measurement shown everywhere in the picture: the last strike of the
// screenshot on erichweihs.com (3.70 s at 20 °C).
export const DELAY_S = 3.7
export const SPEED = 331.3 + 0.606 * 20
export const KM = ((DELAY_S * SPEED) / 1000).toFixed(2)
// The five strikes of that screenshot, oldest first.
export const STRIKES_S = [26.5, 3.38, 2.42, 4.92, DELAY_S]

function random(seed) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Midpoint displacement: a jagged line from a to b.
function jag(a, b, rand, depth, rough) {
  let pts = [a, b]
  for (let d = 0; d < depth; d++) {
    const next = [pts[0]]
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1]
      const [qx, qy] = pts[i]
      const len = Math.hypot(qx - px, qy - py)
      const off = (rand() - 0.5) * len * rough
      next.push(
        [
          (px + qx) / 2 + (-(qy - py) / len) * off,
          (py + qy) / 2 + ((qx - px) / len) * off,
        ],
        pts[i],
      )
    }
    pts = next
  }
  return pts
}

const d = (pts) =>
  pts
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join('')

function bolt() {
  const rand = random(11)
  const main = jag([612, -30], STRIKE, rand, 6, 0.36)
  const strokes = [{ d: d(main), w: 3.4 }]
  const branch = (from, angle, length, width, level) => {
    const to = [
      from[0] + Math.sin(angle) * length,
      from[1] + Math.cos(angle) * length,
    ]
    const pts = jag(from, to, rand, 4, 0.55)
    strokes.push({ d: d(pts), w: width })
    if (level < 1) {
      const at = pts[Math.floor(pts.length * (0.35 + rand() * 0.3))]
      branch(
        at,
        angle + (rand() - 0.5) * 1.2,
        length * 0.5,
        width * 0.6,
        level + 1,
      )
    }
  }
  const forks = [
    [0.18, 0.95, 150],
    [0.3, -0.75, 70],
    [0.46, 0.8, 175],
    [0.6, -0.9, 60],
    [0.74, 0.65, 80],
  ]
  for (const [at, angle, length] of forks) {
    branch(main[Math.floor(main.length * at)], angle, length, 1.7, 0)
  }
  return { main, strokes }
}

const BOLT = bolt()

// A point on the main channel, for the light ray.
export const boltPoint = (at) => BOLT.main[Math.floor(BOLT.main.length * at)]

function hills() {
  const rand = random(5)
  const pts = []
  for (let x = -20; x <= W + 20; x += 20) {
    const y =
      HORIZON +
      Math.sin(x / 170) * 7 +
      Math.sin(x / 61 + 1.3) * 3 +
      (rand() - 0.5) * 3 -
      Math.max(0, 1 - Math.abs(x - 210) / 260) * 22
    pts.push([x, y])
  }
  return `${d(pts)}L${W + 20} ${H + 20}L-20 ${H + 20}Z`
}

function rain() {
  const rand = random(3)
  let out = ''
  for (let i = 0; i < 260; i++) {
    const x = rand() * (W + 200) - 100
    const y = rand() * HORIZON
    const l = 10 + rand() * 18
    out += `M${x.toFixed(1)} ${y.toFixed(1)}l${(-l * 0.18).toFixed(1)} ${l.toFixed(1)}`
  }
  return out
}

// The sky, clouds, lightning and land. viewBox crops it (for the camera frame).
export function skySvg({
  width = W,
  height = H,
  viewBox = [0, 0, W, H],
  id = 's',
} = {}) {
  const [cx, cy] = [STRIKE[0] + 40, 150]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox.join(' ')}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#080605"/>
      <stop offset="0.45" stop-color="#14100c"/>
      <stop offset="0.68" stop-color="#2a1e14"/>
      <stop offset="0.7" stop-color="#2a1e14"/>
      <stop offset="1" stop-color="#2a1e14"/>
    </linearGradient>
    <linearGradient id="${id}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#110c08"/>
      <stop offset="0.25" stop-color="#0d0906"/>
      <stop offset="1" stop-color="#0a0705"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="${cx}" cy="${cy}" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.flash}" stop-opacity="0.55"/>
      <stop offset="0.35" stop-color="${C.amber}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${C.amber}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-strike" cx="${STRIKE[0]}" cy="${STRIKE[1]}" r="160" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.flash}" stop-opacity="0.75"/>
      <stop offset="0.3" stop-color="${C.amber}" stop-opacity="0.25"/>
      <stop offset="1" stop-color="${C.amber}" stop-opacity="0"/>
    </radialGradient>
    <mask id="${id}-lit">
      <rect x="-100" y="-100" width="${W + 200}" height="${H + 200}" fill="url(#${id}-glow)"/>
    </mask>
    <filter id="${id}-clouds" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.0026 0.0085" numOctaves="6" seed="19"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.8 0 0 0 -1.05"/>
    </filter>
    <filter id="${id}-wisps" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="4" seed="4"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3.2 0 0 0 -1.5"/>
    </filter>
    <filter id="${id}-blur-l" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="${id}-blur-m" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${id}-blur-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
    <clipPath id="${id}-air"><rect x="-100" y="-100" width="${W + 200}" height="${HORIZON + 100 + 30}"/></clipPath>
  </defs>
  <rect x="-100" y="-100" width="${W + 200}" height="${H + 200}" fill="url(#${id}-sky)"/>
  <g clip-path="url(#${id}-air)">
    <rect x="-100" y="-100" width="${W + 200}" height="${HORIZON + 140}" filter="url(#${id}-clouds)" opacity="0.16"/>
    <g mask="url(#${id}-lit)">
      <rect x="-100" y="-100" width="${W + 200}" height="${HORIZON + 140}" filter="url(#${id}-clouds)" opacity="0.95"/>
      <rect x="-100" y="-100" width="${W + 200}" height="${HORIZON + 140}" filter="url(#${id}-wisps)" opacity="0.5"/>
      <rect x="-100" y="-100" width="${W + 200}" height="${H + 200}" fill="url(#${id}-glow)"/>
    </g>
    <path d="${rain()}" stroke="${C.ink}" stroke-width="0.8" opacity="0.07"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${BOLT.strokes.map((s) => `<path d="${s.d}" stroke="${C.amber}" stroke-width="${s.w * 9}" opacity="0.5" filter="url(#${id}-blur-l)"/>`).join('')}
      ${BOLT.strokes.map((s) => `<path d="${s.d}" stroke="${C.flash}" stroke-width="${s.w * 2.6}" opacity="0.75" filter="url(#${id}-blur-m)"/>`).join('')}
      ${BOLT.strokes.map((s) => `<path d="${s.d}" stroke="#fffaf2" stroke-width="${s.w * 1.4}" filter="url(#${id}-blur-s)"/>`).join('')}
      ${BOLT.strokes.map((s) => `<path d="${s.d}" stroke="#ffffff" stroke-width="${s.w * 0.75}"/>`).join('')}
    </g>
  </g>
  <ellipse cx="${STRIKE[0]}" cy="${STRIKE[1]}" rx="190" ry="60" fill="url(#${id}-strike)"/>
  <path d="${hills()}" fill="url(#${id}-ground)"/>
  <path d="${hills().split('L' + (W + 20) + ' ' + (H + 20))[0]}" fill="none" stroke="${C.amber}" stroke-opacity="0.32" stroke-width="1"/>
</svg>`
}

// Sound waves: arcs around the strike, opening towards the phone.
function waves() {
  const [x0, y0] = STRIKE
  const a1 = (-62 * Math.PI) / 180
  const a2 = (-22 * Math.PI) / 180
  let out = ''
  for (let k = 0; k < 6; k++) {
    const r = 64 + k * 46
    const p = (a) =>
      `${(x0 + r * Math.cos(a)).toFixed(1)} ${(y0 + r * Math.sin(a)).toFixed(1)}`
    out += `<path d="M${p(a1)}A${r} ${r} 0 0 1 ${p(a2)}" stroke="${C.teal}" stroke-width="2.2" stroke-linecap="round" opacity="${(0.95 - k * 0.13).toFixed(2)}"/>`
  }
  return out
}

const font = (family, url, weight) =>
  `@font-face{font-family:"${family}";src:url(${url}) format("woff2");font-weight:${weight};font-style:normal}`

const ICON = {
  // Lucide "zap" and "audio-lines" (ISC licence), as used in the app.
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  audio:
    '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
  ruler:
    '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
}
const icon = (name, size, color) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`

// Phone placement, in picture pixels. The screen shows the app at 390 × 844.
export const PHONE = { x: 850, y: 40, w: 296, bezel: 11, radius: 48 }
PHONE.h = Math.round(PHONE.w / 0.4874)

export function heroHtml({ fonts, screen }) {
  const sw = PHONE.w - 2 * PHONE.bezel
  const scale = sw / 390
  // Where the app's viewfinder sits on the screen (for the light ray).
  const finder = { x: PHONE.x, y: PHONE.y + PHONE.bezel + 274 * scale }
  const from = boltPoint(0.5)
  const [sx] = STRIKE
  const ruleY = HORIZON + 30
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${font('Josefin Sans', fonts.josefin, '100 700')}
${font('Lato', fonts.lato400, 400)}
${font('Lato', fonts.lato700, 700)}
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.canvas}}
body{position:relative;font-family:Lato,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased}
.layer{position:absolute;inset:0}
.josefin{font-family:"Josefin Sans",sans-serif;font-weight:600}
.brand{position:absolute;left:64px;top:60px;display:flex;align-items:center;gap:14px;font-size:22px;line-height:1}
.brand .mark{width:34px;height:34px;display:grid;place-items:center;background:${C.amber}}
.brand span:last-child{padding-top:3px}
h1{position:absolute;left:60px;top:122px;font-size:72px;line-height:0.94;letter-spacing:-0.025em;text-shadow:0 2px 30px rgba(8,6,5,.6)}
.lead{position:absolute;left:64px;top:296px;width:440px;font-size:20px;line-height:1.5;color:${C.muted};text-shadow:0 1px 16px rgba(8,6,5,.9)}
.tag{position:absolute;font-size:15px;line-height:1;font-weight:700;display:flex;align-items:center;gap:7px;white-space:nowrap}
.steps{position:absolute;left:64px;top:${HORIZON + 94}px;display:grid;grid-template-columns:repeat(3,228px);gap:24px}
.step h2{display:flex;align-items:baseline;gap:12px;font-family:"Josefin Sans",sans-serif;font-weight:600;font-size:27px;line-height:1;letter-spacing:-0.01em}
.num{font-family:"Josefin Sans",sans-serif;font-weight:300;font-size:42px;line-height:1}
.step p{font-size:15px;line-height:1.45;color:${C.muted};margin-top:10px}
.step p b{color:${C.ink};font-weight:700}
.km{position:absolute;font-family:"Josefin Sans",sans-serif;font-weight:600;font-size:26px;line-height:1;color:${C.ink}}
.phone{position:absolute;left:${PHONE.x}px;top:${PHONE.y}px;width:${PHONE.w}px;height:${PHONE.h}px;border-radius:${PHONE.radius}px;
  background:linear-gradient(145deg,#4a4038,#1d1814 40%,#2c251f 75%,#463c33);padding:${PHONE.bezel}px;
  box-shadow:0 0 0 1px rgba(241,232,220,.16) inset,0 30px 80px rgba(0,0,0,.6),0 0 120px rgba(79,176,192,.10)}
.screen{position:relative;width:100%;height:100%;border-radius:${PHONE.radius - PHONE.bezel}px;overflow:hidden;background:${C.canvas}}
.screen img{display:block;width:100%}
.island{position:absolute;left:50%;top:10px;width:86px;height:25px;border-radius:13px;background:#000;transform:translateX(-50%)}
.btn{position:absolute;width:3px;border-radius:2px;background:#3a322b}
</style></head><body>
<div class="layer">${skySvg({ id: 'hero' })}</div>
<svg class="layer" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
  <defs>
    <marker id="tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="${C.amber}"/>
    </marker>
  </defs>
  <path d="M${from[0] + 12} ${from[1]}L${finder.x - 10} ${finder.y}" stroke="${C.amber}" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" marker-end="url(#tip)"/>
  ${waves()}
  <path d="M${sx} ${ruleY - 8}v16M${sx} ${ruleY}H${PHONE.x - 14}M${PHONE.x - 14} ${ruleY - 8}v16" stroke="${C.ink}" stroke-opacity="0.75" stroke-width="1.5"/>
</svg>
<div class="tag" style="left:${from[0] + 64}px;top:${Math.min(from[1], finder.y) - 30}px;color:${C.amber}">${icon('zap', 16, C.amber)}Light: almost instantly</div>
<div class="tag" style="left:${sx + 72}px;top:${STRIKE[1] - 19}px;color:${C.teal}">${icon('audio', 16, C.teal)}Sound: ${Math.round(SPEED)} m/s</div>
<div class="km" style="left:${(sx + PHONE.x - 14) / 2 - 40}px;top:${ruleY + 14}px">${KM} km</div>

<div class="brand josefin"><span class="mark">${icon('zap', 20, C.canvas)}</span><span>Lightning Distance</span></div>
<h1 class="josefin">How far away<br>is the storm?</h1>
<p class="lead">The camera sees the flash, the microphone hears the thunder. The delay gives the distance.</p>

<div class="steps">
  <div class="step"><h2><span class="num" style="color:${C.amber}">01</span>Flash</h2><p>The camera sees the lightning<br>and starts the timer.</p></div>
  <div class="step"><h2><span class="num" style="color:${C.teal}">02</span>Thunder</h2><p>The microphone hears the<br>rumble and stops the timer.</p></div>
  <div class="step"><h2><span class="num" style="color:${C.ink}">03</span>Distance</h2><p><b>${DELAY_S.toFixed(2)} s × ${Math.round(SPEED)} m/s</b><br>= ${KM} km away</p></div>
</div>

<div class="phone">
  <div class="btn" style="left:-3px;top:120px;height:30px"></div>
  <div class="btn" style="left:-3px;top:170px;height:54px"></div>
  <div class="btn" style="left:-3px;top:236px;height:54px"></div>
  <div class="btn" style="right:-3px;top:190px;height:86px"></div>
  <div class="screen"><img src="${screen}" alt=""><div class="island"></div></div>
</div>
</body></html>`
}
