import { Dialog } from '@base-ui/react/dialog'
import { Activity, RefreshCw, X } from 'lucide-react'

type AboutDiagnosticsProps = {
  online: boolean
  registrationState: string
  onCheck: () => void
  onResetCaches: () => Promise<void>
}

export function AboutDiagnostics({
  online,
  registrationState,
  onCheck,
  onResetCaches,
}: AboutDiagnosticsProps) {
  const standalone = window.matchMedia('(display-mode: standalone)').matches

  return (
    <Dialog.Root>
      <Dialog.Trigger className="text-button">
        <Activity aria-hidden="true" size={16} />
        About & diagnostics
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="dialog-popup">
          <div className="dialog-heading">
            <Dialog.Title>About & diagnostics</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close">
              <X aria-hidden="true" size={20} />
            </Dialog.Close>
          </div>
          <dl className="diagnostics">
            <div>
              <dt>Version</dt>
              <dd>{__APP_VERSION__}</dd>
            </div>
            <div>
              <dt>Commit</dt>
              <dd>
                <code>{__GIT_SHA__}</code>
              </dd>
            </div>
            <div>
              <dt>Built</dt>
              <dd>{new Date(__BUILD_TIME__).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Connection</dt>
              <dd>{online ? 'Online' : 'Offline'}</dd>
            </div>
            <div>
              <dt>Display</dt>
              <dd>{standalone ? 'Installed' : 'Browser tab'}</dd>
            </div>
            <div>
              <dt>Service worker</dt>
              <dd>{registrationState}</dd>
            </div>
          </dl>
          <button className="button button-primary" onClick={onCheck}>
            <RefreshCw aria-hidden="true" size={18} />
            Check for updates
          </button>
          <button
            className="button button-secondary"
            onClick={() => {
              if (
                window.confirm(
                  'Reset cached app files? Your user data will be kept.',
                )
              ) {
                void onResetCaches().then(() => window.location.reload())
              }
            }}
          >
            Reset cached app files
          </button>
          <p className="signature">An Erich app.</p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
