import { ArrowRight, Sparkles } from 'lucide-react'
import app from '../app.config.json'
import { AboutDiagnostics } from './components/AboutDiagnostics'
import { HelpDialog } from './components/HelpDialog'
import { PwaNotices } from './components/PwaNotices'
import { usePwa } from './pwa/usePwa'

export function App() {
  const pwa = usePwa()

  return (
    <>
      <header className="app-header">
        <a
          className="brand"
          href={`/${app.slug}/`}
          aria-label={`${app.name} home`}
        >
          <span className="brand-mark">
            <Sparkles aria-hidden="true" size={19} />
          </span>
          <span>{app.name}</span>
        </a>
        <HelpDialog canInstall={pwa.canInstall} onInstall={pwa.install} />
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Portable web app starter</p>
          <h1>Calm tools, reliably delivered.</h1>
          <p className="hero-copy">
            Replace this page with the app’s smallest complete user journey.
            Keep the design tokens, install help, update handling, diagnostics,
            and quality gates.
          </p>
          <button className="button button-primary">
            Primary action <ArrowRight aria-hidden="true" size={18} />
          </button>
        </section>

        <section className="feature-grid" aria-label="Starter capabilities">
          <article className="card">
            <p className="card-number">01</p>
            <h2>Installable</h2>
            <p>
              Manifest, standard icons, a maskable icon, and platform-specific
              guidance are included.
            </p>
          </article>
          <article className="card">
            <p className="card-number">02</p>
            <h2>Update-safe</h2>
            <p>
              New versions prompt before reloading, while diagnostics expose the
              exact build.
            </p>
          </article>
          <article className="card">
            <p className="card-number">03</p>
            <h2>Recognizably yours</h2>
            <p>
              Stable house tokens provide continuity; color and one motif give
              each app its identity.
            </p>
          </article>
        </section>
      </main>

      <footer>
        <AboutDiagnostics
          online={pwa.online}
          registrationState={pwa.registrationState}
          onCheck={() => void pwa.checkForUpdates()}
          onResetCaches={pwa.resetAppCaches}
        />
      </footer>

      <PwaNotices
        online={pwa.online}
        offlineReady={pwa.offlineReady}
        needRefresh={pwa.needRefresh}
        onUpdate={() => void pwa.updateNow()}
        onDismissOffline={pwa.dismissOfflineReady}
        onDismissUpdate={pwa.dismissUpdate}
      />
    </>
  )
}
