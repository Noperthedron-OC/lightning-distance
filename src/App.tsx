import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
} from 'react'
import {
  AudioLines,
  Camera,
  Ear,
  Eye,
  RotateCcw,
  TriangleAlert,
  Zap,
} from 'lucide-react'
import './App.css'
import { usePwa } from './pwa/usePwa'
import { PwaNotices } from './components/PwaNotices'
import { AboutDiagnostics } from './components/AboutDiagnostics'

// ── Types ─────────────────────────────────────────────────────────────────────
interface StrikeRecord {
  km: number
  sec: number
  id: number
}

type AppPhase = 'idle' | 'watching' | 'flash' | 'thunder-detected'

// ── Constants ─────────────────────────────────────────────────────────────────
const SUSTAIN_FRAMES = 4
const WATCHING = 'Watching for lightning…'

// ── Helpers ───────────────────────────────────────────────────────────────────
function speedOfSound(tempC: number): number {
  return 331.3 + 0.606 * tempC
}

// Slider fill for WebKit, which has no ::range-progress.
function sliderFill(value: number, min: number, max: number): CSSProperties {
  return {
    '--fill': `${((value - min) / (max - min)) * 100}%`,
  } as CSSProperties
}

function getAverageLuminance(imageData: ImageData): number {
  const d = imageData.data
  let sum = 0,
    count = 0
  for (let i = 0; i < d.length; i += 16) {
    sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    count++
  }
  return sum / count
}

// ── Intro Modal ───────────────────────────────────────────────────────────────
function IntroModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="intro-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <div className="intro-box">
        <p className="label">How far away is the storm?</p>
        <h2 id="intro-title">Lightning Distance</h2>
        <p>
          This app measures how far away a thunderstorm is. It watches for a
          lightning flash through the camera and listens for the thunder through
          the microphone. The time between the two determines the distance.
        </p>
        <ol className="intro-steps">
          <li>
            <Zap aria-hidden="true" size={18} className="intro-icon-flash" />
            <span>
              Point the camera at the sky. When lightning flashes, the timer
              starts.
            </span>
          </li>
          <li>
            <AudioLines
              aria-hidden="true"
              size={18}
              className="intro-icon-thunder"
            />
            <span>
              When the thunder arrives, it stops and shows the distance.
            </span>
          </li>
        </ol>
        <p className="muted">
          The app needs access to your camera and microphone to work. Both are
          used locally — nothing is sent anywhere.
        </p>

        <details>
          <summary>Install on Android</summary>
          <div className="install-steps">
            <ol>
              <li>
                Open this page in <strong>Chrome</strong>
              </li>
              <li>
                Tap the <strong>⋮ menu</strong> (top right)
              </li>
              <li>
                Tap <strong>"Add to Home screen"</strong>
              </li>
              <li>
                Tap <strong>Install</strong> to confirm
              </li>
            </ol>
          </div>
        </details>

        <details>
          <summary>Install on iPhone / iPad</summary>
          <div className="install-steps">
            <ol>
              <li>
                Open this page in <strong>Safari</strong>
              </li>
              <li>
                Tap the <strong>Share button</strong> (bottom bar)
              </li>
              <li>
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </li>
              <li>
                Tap <strong>Add</strong> to confirm
              </li>
            </ol>
          </div>
        </details>

        <button className="button button-primary intro-close" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const {
    online,
    offlineReady,
    needRefresh,
    registrationState,
    checkForUpdates,
    updateNow,
    dismissOfflineReady,
    dismissUpdate,
    resetAppCaches,
  } = usePwa()

  const [showIntro, setShowIntro] = useState(true)
  const [phase, setPhase] = useState<AppPhase>('idle')
  const [statusText, setStatusText] = useState('Tap Start to begin')
  const [timerSec, setTimerSec] = useState(0)
  const [result, setResult] = useState<{
    km: number
    mi: number
    sec: number
    soundSpeed: number
  } | null>(null)
  const [history, setHistory] = useState<StrikeRecord[]>([])
  const [audioOnlyMode, setAudioOnlyMode] = useState(false)
  const [running, setRunning] = useState(false)
  const [lumInfo, setLumInfo] = useState('')
  const [brightWarning, setBrightWarning] = useState(false)
  const [flashOverlay, setFlashOverlay] = useState(false)

  // Settings
  const [flashSpike, setFlashSpike] = useState(20)
  const [avgWindow, setAvgWindow] = useState(20)
  const [thunderSens, setThunderSens] = useState(50)
  const [temperature, setTemperature] = useState(20)

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const thunderRafRef = useRef<number | null>(null)
  const timerRafRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const flashTimeRef = useRef<number | null>(null)
  const flashCooldownRef = useRef(0)
  const thunderCooldownRef = useRef(0)
  const noiseFloorRef = useRef(1)
  const sustainCountRef = useRef(0)
  const lumHistoryRef = useRef<number[]>([])
  const strikeIdRef = useRef(0)

  // ── Flash handling ──────────────────────────────────────────────────────────
  const onFlash = useCallback(() => {
    flashTimeRef.current = performance.now()
    flashCooldownRef.current = 45
    setFlashOverlay(true)
    setTimeout(() => setFlashOverlay(false), 100)
    setPhase('flash')
    setStatusText('Flash. Listening for thunder…')
    setTimerSec(0)

    // Timer display
    if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current)
    const t0 = performance.now()
    const tick = () => {
      if (!flashTimeRef.current) return
      setTimerSec((performance.now() - t0) / 1000)
      timerRafRef.current = requestAnimationFrame(tick)
    }
    timerRafRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Thunder handling ────────────────────────────────────────────────────────
  const onThunder = useCallback(() => {
    if (!flashTimeRef.current) return
    const elapsed = (performance.now() - flashTimeRef.current) / 1000
    flashTimeRef.current = null
    thunderCooldownRef.current = 90
    if (timerRafRef.current) {
      cancelAnimationFrame(timerRafRef.current)
      timerRafRef.current = null
    }

    const v = speedOfSound(temperature)
    const distM = elapsed * v
    const distKm = distM / 1000
    const distMi = distM / 1609.34

    setResult({ km: distKm, mi: distMi, sec: elapsed, soundSpeed: v })
    setPhase('thunder-detected')
    setStatusText('Thunder detected')
    setHistory((h) => [
      { km: distKm, sec: elapsed, id: ++strikeIdRef.current },
      ...h,
    ])

    setTimeout(() => {
      setStatusText(WATCHING)
      setPhase('watching')
    }, 3000)
  }, [temperature])

  // ── Thunder audio loop ──────────────────────────────────────────────────────
  const checkThunder = useCallback(() => {
    if (!analyserRef.current || !audioDataRef.current || !audioCtxRef.current)
      return
    analyserRef.current.getByteFrequencyData(audioDataRef.current)

    const binHz = audioCtxRef.current.sampleRate / analyserRef.current.fftSize
    const lowLo = Math.max(1, Math.floor(20 / binHz))
    const lowHi = Math.ceil(100 / binHz)
    const midLo = Math.floor(200 / binHz)
    const midHi = Math.ceil(700 / binHz)

    let lowSum = 0,
      midSum = 0
    for (let i = lowLo; i <= lowHi; i++) lowSum += audioDataRef.current[i]
    for (let i = midLo; i <= midHi; i++) midSum += audioDataRef.current[i]

    const lowAvg = lowSum / (lowHi - lowLo + 1)
    const midAvg = midSum / (midHi - midLo + 1)

    noiseFloorRef.current =
      0.9983 * noiseFloorRef.current + 0.0017 * Math.max(lowAvg, 1)

    const sensitivity = thunderSens
    const multiplier = 1.5 + ((100 - sensitivity) / 100) * 3.0
    const exceedance = lowAvg / Math.max(noiseFloorRef.current, 1)
    const isThunderShape = lowAvg >= midAvg * 0.5

    if (thunderCooldownRef.current > 0) {
      thunderCooldownRef.current--
      sustainCountRef.current = 0
    } else if (
      flashTimeRef.current &&
      exceedance > multiplier &&
      isThunderShape
    ) {
      sustainCountRef.current++
      if (sustainCountRef.current >= SUSTAIN_FRAMES) {
        sustainCountRef.current = 0
        onThunder()
      }
    } else {
      sustainCountRef.current = 0
    }

    thunderRafRef.current = requestAnimationFrame(checkThunder)
  }, [thunderSens, onThunder])

  // ── Camera frame loop ───────────────────────────────────────────────────────
  const detectFrame = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || video.readyState < video.HAVE_CURRENT_DATA) {
      rafRef.current = requestAnimationFrame(detectFrame)
      return
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const lum = getAverageLuminance(imageData)

    const history = lumHistoryRef.current
    history.push(lum)
    if (history.length > avgWindow) history.shift()

    const avg = history.length
      ? history.reduce((a, b) => a + b, 0) / history.length
      : 0
    setLumInfo(`Brightness ${lum.toFixed(1)} · average ${avg.toFixed(1)}`)
    setBrightWarning(avg > 180)

    if (flashCooldownRef.current > 0) {
      flashCooldownRef.current--
    } else if (
      !flashTimeRef.current &&
      history.length >= avgWindow &&
      avg > 0
    ) {
      const spike = ((lum - avg) / avg) * 100
      if (spike > flashSpike) onFlash()
    }

    rafRef.current = requestAnimationFrame(detectFrame)
  }, [avgWindow, flashSpike, onFlash])

  // ── Start ───────────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    let stream: MediaStream | null
    let audioOnly = false

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      })
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioOnly = true
      } catch (e2: unknown) {
        const err = e2 as DOMException
        setStatusText(
          err.name === 'NotAllowedError'
            ? 'Microphone blocked. Tap the lock icon in your browser to allow.'
            : `Could not access microphone: ${err.message}`,
        )
        return
      }
    }

    if (!audioOnly && stream) {
      const video = document.createElement('video')
      videoRef.current = video
      video.srcObject = new MediaStream(stream.getVideoTracks())
      video.playsInline = true
      video.muted = true
      try {
        await video.play()
      } catch {
        /* ok */
      }
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
      }
    }

    // Set up audio — resume() required on iOS where AudioContext starts suspended
    const audioCtx = new AudioContext()
    await audioCtx.resume()
    audioCtxRef.current = audioCtx
    const src = audioCtx.createMediaStreamSource(stream!)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.4
    audioDataRef.current = new Uint8Array(analyser.frequencyBinCount)
    src.connect(analyser)
    analyserRef.current = analyser
    noiseFloorRef.current = 1
    sustainCountRef.current = 0

    setAudioOnlyMode(audioOnly)
    setRunning(true)
    setPhase('watching')

    if (audioOnly) {
      setStatusText('Listening. Tap the flash button when you see lightning.')
    } else {
      setStatusText(WATCHING)
    }
  }, [])

  // ── Stop ────────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    setRunning(false)
    setPhase('idle')
    flashTimeRef.current = null
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (thunderRafRef.current) {
      cancelAnimationFrame(thunderRafRef.current)
      thunderRafRef.current = null
    }
    if (timerRafRef.current) {
      cancelAnimationFrame(timerRafRef.current)
      timerRafRef.current = null
    }

    const video = videoRef.current
    if (video?.srcObject) {
      ;(video.srcObject as MediaStream).getTracks().forEach((t) => t.stop())
      video.srcObject = null
    }
    videoRef.current = null

    if (audioCtxRef.current) {
      audioCtxRef.current.close()
      audioCtxRef.current = null
      analyserRef.current = null
    }

    noiseFloorRef.current = 1
    sustainCountRef.current = 0
    lumHistoryRef.current = []

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }

    setStatusText('Stopped. Tap Start to begin again.')
    setLumInfo('')
    setBrightWarning(false)
    setAudioOnlyMode(false)
  }, [])

  // Start/stop loops when running changes
  useEffect(() => {
    if (running) {
      if (!audioOnlyMode) {
        rafRef.current = requestAnimationFrame(detectFrame)
      }
      thunderRafRef.current = requestAnimationFrame(checkThunder)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (thunderRafRef.current) cancelAnimationFrame(thunderRafRef.current)
    }
  }, [running, audioOnlyMode, detectFrame, checkThunder])

  const handleStartStop = () => {
    if (running) stop()
    else void start()
  }

  const handleReset = () => {
    flashTimeRef.current = null
    if (timerRafRef.current) {
      cancelAnimationFrame(timerRafRef.current)
      timerRafRef.current = null
    }
    setPhase('watching')
    setStatusText(WATCHING)
  }

  const handleCanvasClick = () => {
    if (!running) return
    if (flashTimeRef.current) onThunder()
    else onFlash()
  }

  const statusClass =
    phase === 'flash'
      ? 'status flash'
      : phase === 'thunder-detected'
        ? 'status thunder'
        : 'status'

  const StatusIcon =
    phase === 'flash'
      ? Zap
      : phase === 'thunder-detected'
        ? AudioLines
        : phase === 'watching'
          ? audioOnlyMode
            ? Ear
            : Eye
          : null

  return (
    <>
      {showIntro && <IntroModal onClose={() => setShowIntro(false)} />}

      <PwaNotices
        online={online}
        offlineReady={offlineReady}
        needRefresh={needRefresh}
        onUpdate={updateNow}
        onDismissOffline={dismissOfflineReady}
        onDismissUpdate={dismissUpdate}
      />

      <div className="app-shell">
        <header className="app-header">
          <h1 className="brand">
            <span className="brand-mark" aria-hidden="true">
              <Zap size={18} strokeWidth={2.25} />
            </span>
            Lightning Distance
          </h1>
          <AboutDiagnostics
            online={online}
            registrationState={registrationState}
            onCheck={() => void checkForUpdates()}
            onResetCaches={resetAppCaches}
          />
        </header>

        <main className="app-main">
          <section className="stage" aria-label="Camera and controls">
            {/* Camera view */}
            <div
              className={`viewfinder phase-${phase}`}
              style={{ display: audioOnlyMode ? 'none' : undefined }}
            >
              <canvas
                ref={canvasRef}
                className="camera-canvas"
                width={640}
                height={480}
                onClick={handleCanvasClick}
                aria-label="Camera view — tap to mark flash or thunder"
              />
              <div className="viewfinder-frame" aria-hidden="true" />
              {!running && (
                <div className="viewfinder-idle" aria-hidden="true">
                  <Camera size={28} strokeWidth={1.5} />
                  <span>Point the camera at the sky</span>
                </div>
              )}
              {running && (
                <div className="tap-hint" aria-hidden="true">
                  Tap to mark flash, then thunder
                </div>
              )}
              {flashOverlay && <div className="flash-overlay" />}
              {phase === 'flash' && (
                <div className="timer" aria-live="off">
                  <span className="timer-text">
                    {timerSec.toFixed(1)}
                    <span className="timer-unit">s</span>
                  </span>
                </div>
              )}
            </div>
            {lumInfo && <p className="lum-display">{lumInfo}</p>}

            {/* Status */}
            <p className={statusClass} aria-live="polite">
              {StatusIcon && <StatusIcon aria-hidden="true" size={20} />}
              <span>{statusText}</span>
            </p>
            {brightWarning && (
              <p className="bright-warning">
                <TriangleAlert aria-hidden="true" size={16} />
                Very bright scene — flash detection unreliable
              </p>
            )}

            {/* Buttons */}
            <div className="actions">
              <button
                className={`button button-start${running ? ' running' : ''}`}
                onClick={handleStartStop}
              >
                {running ? (
                  <>
                    <span className="live-dot" aria-hidden="true" />
                    Listening — tap to stop
                  </>
                ) : (
                  <>
                    <Camera aria-hidden="true" size={20} />
                    Start Camera & Mic
                  </>
                )}
              </button>

              {audioOnlyMode && running && (
                <button
                  className="button button-flash"
                  onClick={() => onFlash()}
                >
                  <Zap aria-hidden="true" size={22} />I saw a flash!
                </button>
              )}

              {audioOnlyMode && running && (
                <p className="permission-hint">
                  Camera access was denied — using mic only. Tap the button
                  above when you see lightning.
                </p>
              )}

              {phase === 'flash' && (
                <button className="text-button btn-reset" onClick={handleReset}>
                  <RotateCcw aria-hidden="true" size={16} />
                  Reset last flash
                </button>
              )}
            </div>
          </section>

          <section className="readings" aria-label="Measurements">
            {/* Result card */}
            <section className="readout" aria-labelledby="readout-title">
              <h2 id="readout-title" className="label">
                Last strike
              </h2>
              {result ? (
                <>
                  <p className="readout-distance">
                    <span className="readout-value">
                      {result.km.toFixed(2)}
                    </span>
                    <span className="readout-unit">km</span>
                    <span className="readout-alt">
                      {result.mi.toFixed(2)} mi
                    </span>
                  </p>
                  <div className="delay-line" aria-hidden="true">
                    <span className="delay-end delay-flash">
                      <Zap size={16} />
                      Flash
                    </span>
                    <span className="delay-track">
                      <span className="delay-time">
                        {result.sec.toFixed(2)} s
                      </span>
                    </span>
                    <span className="delay-end delay-thunder">
                      Thunder
                      <AudioLines size={16} />
                    </span>
                  </div>
                  <p className="readout-meta">
                    {result.sec.toFixed(2)} s delay ·{' '}
                    {result.soundSpeed.toFixed(0)} m/s · Rule of thumb:{' '}
                    {(result.sec / 3).toFixed(1)} km
                  </p>
                </>
              ) : (
                <>
                  <p className="readout-distance readout-empty">
                    <span className="readout-value">–</span>
                    <span className="readout-unit">km</span>
                  </p>
                  <p className="readout-meta">
                    The seconds between flash and thunder, times the speed of
                    sound, give the distance.
                  </p>
                </>
              )}
            </section>

            {/* History */}
            {history.length > 0 && (
              <section
                className="history-section"
                aria-labelledby="history-title"
              >
                <h2 id="history-title" className="label">
                  Strike history
                </h2>
                <ul className="history-list">
                  {history.map((s) => (
                    <li key={s.id} className="history-item">
                      <span className="history-index" aria-hidden="true">
                        {String(s.id).padStart(2, '0')}
                      </span>
                      <span className="history-km">{s.km.toFixed(2)} km</span>
                      <span className="history-sec">{s.sec.toFixed(1)} s</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Controls / Settings */}
            <section className="controls" aria-labelledby="settings-title">
              <h2 id="settings-title" className="label">
                Detection settings
              </h2>
              <div className="slider-row">
                <label htmlFor="flash-spike">Flash spike</label>
                <output htmlFor="flash-spike">{flashSpike} %</output>
                <input
                  id="flash-spike"
                  type="range"
                  min={5}
                  max={60}
                  value={flashSpike}
                  style={sliderFill(flashSpike, 5, 60)}
                  onChange={(e) => setFlashSpike(Number(e.target.value))}
                />
              </div>
              <div className="slider-row">
                <label htmlFor="avg-window">Average window</label>
                <output htmlFor="avg-window">{avgWindow} frames</output>
                <input
                  id="avg-window"
                  type="range"
                  min={5}
                  max={60}
                  value={avgWindow}
                  style={sliderFill(avgWindow, 5, 60)}
                  onChange={(e) => setAvgWindow(Number(e.target.value))}
                />
              </div>
              <div className="slider-row">
                <label htmlFor="thunder-sens">Thunder sensitivity</label>
                <output htmlFor="thunder-sens">{thunderSens}</output>
                <input
                  id="thunder-sens"
                  type="range"
                  min={5}
                  max={100}
                  value={thunderSens}
                  style={sliderFill(thunderSens, 5, 100)}
                  onChange={(e) => setThunderSens(Number(e.target.value))}
                />
              </div>
              <div className="slider-row">
                <label htmlFor="temperature">Temperature</label>
                <output htmlFor="temperature">{temperature} °C</output>
                <input
                  id="temperature"
                  type="range"
                  min={-10}
                  max={40}
                  value={temperature}
                  style={sliderFill(temperature, -10, 40)}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
              </div>
            </section>
          </section>
        </main>
      </div>
    </>
  )
}
