import { ref } from 'vue'

const somAtivo = ref<boolean>(true)
let instanciaAudio: HTMLAudioElement | null = null

function obterAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!instanciaAudio) {
    instanciaAudio = new Audio('/victory.mp3')
    instanciaAudio.preload = 'auto'
  }
  return instanciaAudio
}

export function useAudioVitoria() {
  function tocarSomVitoria() {
    if (!somAtivo.value) return
    try {
      const audio = obterAudio()
      if (!audio) return
      audio.pause()
      audio.currentTime = 0
      audio.play().catch((err) => {
        console.warn('Não foi possível reproduzir o áudio de vitória automaticamente:', err)
      })
    } catch (e) {
      console.warn('Erro ao reproduzir áudio de vitória:', e)
    }
  }

  function pararSomVitoria() {
    try {
      if (instanciaAudio) {
        instanciaAudio.pause()
        instanciaAudio.currentTime = 0
      }
    } catch {
      // ignora erro de áudio
    }
  }

  function alternarSom() {
    somAtivo.value = !somAtivo.value
    if (!somAtivo.value) {
      pararSomVitoria()
    }
  }

  return {
    somAtivo,
    tocarSomVitoria,
    pararSomVitoria,
    alternarSom,
  }
}
