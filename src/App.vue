<script setup lang="ts">
import { ref, watch } from 'vue'
import CabecalhoApp, { type AbaNavegacao } from './components/CabecalhoApp.vue'
import SetupGameView from './components/SetupGameView.vue'
import ScoreboardView from './components/ScoreboardView.vue'
import HistoryView from './components/HistoryView.vue'
import { useGameStore } from './composables/useGameStore'
import { useWakeLock } from './composables/useWakeLock'

useWakeLock()

const store = useGameStore()
const abaAtiva = ref<AbaNavegacao>(store.sessaoAtual.value ? 'placar' : 'configurar')

watch(
  () => store.sessaoAtual.value,
  (sessao) => {
    if (!sessao && abaAtiva.value === 'placar') {
      abaAtiva.value = 'configurar'
    }
  }
)
</script>

<template>
  <div class="min-h-dvh w-full flex flex-col bg-[#12100e] text-[#faf6f0]">
    <CabecalhoApp
      v-if="abaAtiva !== 'placar'"
      :aba-ativa="abaAtiva"
      :tem-sessao-ativa="Boolean(store.sessaoAtual.value)"
      :total-sessoes="store.sessoes.value.length"
      @mudar-aba="(novaAba) => (abaAtiva = novaAba)"
    />

    <main class="flex-1 flex flex-col w-full">
      <SetupGameView
        v-if="abaAtiva === 'configurar'"
        @iniciado="abaAtiva = 'placar'"
      />

      <ScoreboardView
        v-else-if="abaAtiva === 'placar' && store.sessaoAtual.value"
        @ir-historico="abaAtiva = 'historico'"
        @novo-jogo="abaAtiva = 'configurar'"
      />

      <HistoryView
        v-else
        @retomar="abaAtiva = 'placar'"
        @novo-jogo="abaAtiva = 'configurar'"
      />
    </main>
  </div>
</template>
