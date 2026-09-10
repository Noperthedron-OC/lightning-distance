type PwaNoticesProps = {
  online: boolean
  offlineReady: boolean
  needRefresh: boolean
  onUpdate: () => void
  onDismissOffline: () => void
  onDismissUpdate: () => void
}

export function PwaNotices({
  online,
  offlineReady,
  needRefresh,
  onUpdate,
  onDismissOffline,
  onDismissUpdate,
}: PwaNoticesProps) {
  return (
    <div className="notice-stack" aria-live="polite">
      {!online && (
        <div className="notice">
          You’re offline. Saved local features remain available.
        </div>
      )}
      {offlineReady && (
        <div className="notice">
          <span>The app is ready to work offline.</span>
          <button className="text-button" onClick={onDismissOffline}>
            Dismiss
          </button>
        </div>
      )}
      {needRefresh && (
        <div className="notice notice-update">
          <span>A new version is ready.</span>
          <div className="notice-actions">
            <button className="text-button" onClick={onDismissUpdate}>
              Later
            </button>
            <button
              className="button button-primary button-small"
              onClick={onUpdate}
            >
              Update now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
