import { onMounted, onUnmounted } from 'vue'

export function useWakeLock() {
  let wakeLock: WakeLockSentinel | null = null
  let solicitando = false

  async function ativarWakeLock() {
    if (
      typeof navigator === 'undefined' ||
      !('wakeLock' in navigator) ||
      typeof document === 'undefined' ||
      document.visibilityState !== 'visible'
    ) {
      return
    }

    if (wakeLock && !wakeLock.released) {
      return
    }

    if (solicitando) return
    solicitando = true

    try {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => {
        wakeLock = null
      })
    } catch {
      // Alguns navegadores exigem um primeiro toque na tela antes de liberar o Wake Lock
    } finally {
      solicitando = false
    }
  }

  function aoMudarVisibilidade() {
    if (document.visibilityState === 'visible') {
      void ativarWakeLock()
    }
  }

  function aoInteragirNaTela() {
    if (!wakeLock || wakeLock.released) {
      void ativarWakeLock()
    }
  }

  onMounted(() => {
    void ativarWakeLock()
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    window.addEventListener('pointerdown', aoInteragirNaTela, { passive: true })
    window.addEventListener('touchstart', aoInteragirNaTela, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', aoMudarVisibilidade)
    window.removeEventListener('pointerdown', aoInteragirNaTela)
    window.removeEventListener('touchstart', aoInteragirNaTela)

    if (wakeLock && !wakeLock.released) {
      void wakeLock.release().catch(() => {})
      wakeLock = null
    }
  })
}
