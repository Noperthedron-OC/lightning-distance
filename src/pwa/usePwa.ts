import { useCallback, useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwa() {
  const [online, setOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [registration, setRegistration] = useState<
    ServiceWorkerRegistration | undefined
  >()

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, nextRegistration) {
      setRegistration(nextRegistration)
    },
    onRegisterError(error) {
      console.error('Service-worker registration failed', error)
    },
  })

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine)
    const capturePrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const clearPrompt = () => setInstallPrompt(null)
    const checkOnForeground = () => {
      if (document.visibilityState === 'visible') void registration?.update()
    }

    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    window.addEventListener('beforeinstallprompt', capturePrompt)
    window.addEventListener('appinstalled', clearPrompt)
    document.addEventListener('visibilitychange', checkOnForeground)

    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
      window.removeEventListener('beforeinstallprompt', capturePrompt)
      window.removeEventListener('appinstalled', clearPrompt)
      document.removeEventListener('visibilitychange', checkOnForeground)
    }
  }, [registration])

  const install = useCallback(async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }, [installPrompt])

  const resetAppCaches = useCallback(async () => {
    const keys = await caches.keys()
    const ownedKeys = keys.filter((key) => key.startsWith(`${__APP_ID__}-`))
    await Promise.all(ownedKeys.map((key) => caches.delete(key)))
    await registration?.update()
  }, [registration])

  return {
    online,
    offlineReady,
    needRefresh,
    canInstall: Boolean(installPrompt),
    registrationState: registration?.active?.state ?? 'not active',
    install,
    checkForUpdates: () => registration?.update(),
    updateNow: () => updateServiceWorker(true),
    dismissOfflineReady: () => setOfflineReady(false),
    dismissUpdate: () => setNeedRefresh(false),
    resetAppCaches,
  }
}
