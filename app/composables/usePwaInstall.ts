import { ref } from 'vue'

export function usePwaInstall() {
  const deferredPrompt = ref<any>(null)
  const canInstall = ref(false)
  const isInstalled = ref(false)

  const checkInstalled = () => {
    if (import.meta.client) {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      isInstalled.value = isStandalone || isIOSStandalone
    }
  }

  const onBeforeInstallPrompt = (e: any) => {
    e.preventDefault()
    deferredPrompt.value = e
    canInstall.value = true
  }

  const onAppInstalled = () => {
    deferredPrompt.value = null
    canInstall.value = false
    isInstalled.value = true
  }

  const install = async () => {
    if (!deferredPrompt.value) return false
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.value = null
      canInstall.value = false
      return true
    }
    return false
  }

  const init = () => {
    if (import.meta.client) {
      checkInstalled()
      window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.addEventListener('appinstalled', onAppInstalled)
    }
  }

  const cleanup = () => {
    if (import.meta.client) {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }

  return { canInstall, isInstalled, install, init, cleanup }
}
