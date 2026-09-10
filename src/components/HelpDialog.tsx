import { Dialog } from '@base-ui/react/dialog'
import { CircleHelp, Download, X } from 'lucide-react'

type HelpDialogProps = {
  canInstall: boolean
  onInstall: () => Promise<void>
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function HelpDialog({ canInstall, onInstall }: HelpDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="button button-secondary">
        <CircleHelp aria-hidden="true" size={18} />
        Install & help
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="dialog-popup">
          <div className="dialog-heading">
            <Dialog.Title>Install this app</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close">
              <X aria-hidden="true" size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted">
            Installation gives the app its own icon and standalone window.
          </Dialog.Description>

          {canInstall ? (
            <button
              className="button button-primary"
              onClick={() => void onInstall()}
            >
              <Download aria-hidden="true" size={18} />
              Install app
            </button>
          ) : isIOS() ? (
            <ol>
              <li>Open this page in Safari.</li>
              <li>Open the Share menu.</li>
              <li>Choose “Add to Home Screen”, then tap “Add”.</li>
            </ol>
          ) : (
            <p>
              Use your browser menu and choose “Install app” or “Add to Home
              screen”.
            </p>
          )}

          <h3>Having update trouble?</h3>
          <p className="muted">
            Open About & diagnostics, check for an update, and confirm the
            displayed version.
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
