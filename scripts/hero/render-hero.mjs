// Renders docs/images/lightning-distance-how-it-works.jpg, the picture that
// explains the app in one image (README, erichweihs.com article and card).
//
//   npm run hero
//
// 1. Draws the part of the storm sky the phone camera sees (scene.mjs).
// 2. Builds the app, opens it in Chromium with that sky as a fake camera and
//    a silent microphone, and taps flash and thunder with exact delays: the
//    five strikes of the screenshot on erichweihs.com, last one 3.70 s.
// 3. Places that phone screen in the full scene and saves a 2400 × 1500 JPEG.
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { chromium } from '@playwright/test'
import { build, preview } from 'vite'
import { CAMERA_VIEW, H, STRIKES_S, W, heroHtml, skySvg } from './scene.mjs'

const root = new URL('../../', import.meta.url)
const out = new URL('docs/images/lightning-distance-how-it-works.jpg', root)
const require = createRequire(import.meta.url)

const dataUrl = async (path, type) =>
  `data:${type};base64,${(await readFile(path)).toString('base64')}`

const fonts = {
  josefin: await dataUrl(
    require.resolve('@fontsource-variable/josefin-sans/files/josefin-sans-latin-wght-normal.woff2'),
    'font/woff2',
  ),
  lato400: await dataUrl(
    require.resolve('@fontsource/lato/files/lato-latin-400-normal.woff2'),
    'font/woff2',
  ),
  lato700: await dataUrl(
    require.resolve('@fontsource/lato/files/lato-latin-700-normal.woff2'),
    'font/woff2',
  ),
}

await build({ root: root.pathname, logLevel: 'warn' })
const server = await preview({
  root: root.pathname,
  preview: { port: 4179, strictPort: true },
  logLevel: 'warn',
})
const appUrl = server.resolvedUrls.local[0]

const browser = await chromium.launch()
try {
  // 1. The camera's view of the sky.
  const sky = await browser.newPage({ viewport: { width: 640, height: 480 } })
  await sky.setContent(
    `<body style="margin:0">${skySvg({ width: 640, height: 480, viewBox: CAMERA_VIEW, id: 'cam' })}</body>`,
  )
  const frame = `data:image/png;base64,${(await sky.screenshot()).toString('base64')}`
  await sky.close()

  // 2. The app, measuring.
  const app = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    // No service worker, so no "ready to work offline" notice on the screen.
    serviceWorkers: 'block',
  })
  const page = await app.newPage()
  await page.addInitScript((frame) => {
    // A frozen clock, so that each flash-to-thunder delay is exact.
    const now = performance.now.bind(performance)
    let frozen = null
    window.__freeze = () => (frozen = now())
    window.__advance = (ms) => (frozen += ms)
    window.__thaw = () => (frozen = null)
    performance.now = () => frozen ?? now()

    // The sky picture as camera, a silent track as microphone.
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const image = new Image()
      image.src = frame
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      const draw = () => canvas.getContext('2d').drawImage(image, 0, 0)
      draw()
      setInterval(draw, 50)
      const stream = constraints.video
        ? canvas.captureStream(30)
        : new MediaStream()
      const audio = new AudioContext().createMediaStreamDestination()
      stream.addTrack(audio.stream.getAudioTracks()[0])
      return stream
    }
  }, frame)
  await page.goto(appUrl)
  await page.evaluate(() => document.fonts.ready)
  await page.getByRole('button', { name: 'Got it' }).click()
  // Room for the phone's status bar, as in the installed app.
  await page.addStyleTag({ content: '.app-shell { padding-top: 44px }' })
  await page.getByRole('button', { name: 'Start Camera & Mic' }).click()
  await page.waitForTimeout(1500)
  const viewfinder = page.locator('canvas')
  for (const seconds of STRIKES_S) {
    await page.evaluate(() => window.__thaw())
    await page.waitForTimeout(200)
    await page.evaluate(() => window.__freeze())
    await viewfinder.click() // flash
    await page.evaluate((ms) => window.__advance(ms), seconds * 1000)
    await page.waitForTimeout(150)
    await viewfinder.click() // thunder
  }
  await page.waitForTimeout(400)
  const screen = `data:image/png;base64,${(await page.screenshot()).toString('base64')}`
  await app.close()

  // 3. The picture.
  const hero = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
  })
  await hero.setContent(heroHtml({ fonts, screen }))
  await hero.evaluate(() => document.fonts.ready)
  await hero.waitForTimeout(300)
  await hero.screenshot({ path: out.pathname, type: 'jpeg', quality: 88 })
  console.log(`wrote ${out.pathname}`)
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
