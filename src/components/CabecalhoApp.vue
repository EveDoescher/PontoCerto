<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Gamepad2, PlusCircle, History, Volume2, VolumeX } from 'lucide-vue-next'
import { useAudioVitoria } from '../composables/useAudioVitoria'

export type AbaNavegacao = 'configurar' | 'placar' | 'historico'

defineProps<{
  abaAtiva: AbaNavegacao
  temSessaoAtiva: boolean
  totalSessoes: number
}>()

const emit = defineEmits<{
  (e: 'mudar-aba', aba: AbaNavegacao): void
}>()

const { somAtivo, alternarSom } = useAudioVitoria()
</script>

<template>
  <header class="w-full border-b border-[#332c27] bg-[#12100e] px-3 sm:px-6 lg:px-10 xl:px-14 py-2.5 lg:py-3.5">
    <div class="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <!-- Topo no mobile / Esquerda no PC: Marca + Botão de Som -->
      <div class="flex items-center justify-between gap-2">
        <h1
          @click="emit('mudar-aba', temSessaoAtiva ? 'placar' : 'configurar')"
          class="fonte-display text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-amber-400 cursor-pointer leading-none flex items-center gap-2"
        >
          <Icon icon="mdi:cards-playing-spade-multiple" class="w-6 h-6 lg:w-7 lg:h-7 shrink-0" />
          <span>PLACARCERTO</span>
        </h1>

        <button
          type="button"
          @click="alternarSom"
          :title="somAtivo ? 'Som de vitória ativado' : 'Som de vitória silenciado'"
          class="sm:hidden min-h-[38px] px-3 py-1.5 rounded-xl bg-[#1e1a17] border border-[#332c27] text-xs font-bold text-[#faf6f0] flex items-center gap-1.5 cursor-pointer"
        >
          <Volume2 v-if="somAtivo" class="w-4 h-4 text-amber-400" />
          <VolumeX v-else class="w-4 h-4 text-[#b5a898]" />
          <span>{{ somAtivo ? 'Som' : 'Sem som' }}</span>
        </button>
      </div>

      <!-- Barra de Abas 100% responsiva (nunca corta em telas pequenas) -->
      <div class="flex items-center gap-2">
        <nav
          aria-label="Navegação principal"
          class="flex-1 sm:flex-initial grid grid-flow-col auto-cols-fr gap-1 bg-[#1e1a17] p-1 rounded-xl border border-[#332c27]"
        >
          <button
            type="button"
            @click="emit('mudar-aba', 'configurar')"
            :class="[
              'min-h-[38px] lg:min-h-[44px] px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition',
              abaAtiva === 'configurar'
                ? 'bg-amber-400 text-amber-950'
                : 'text-[#b5a898] hover:text-[#faf6f0]',
            ]"
          >
            <PlusCircle class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
            <span>Nova Mesa</span>
          </button>

          <button
            v-if="temSessaoAtiva"
            type="button"
            @click="emit('mudar-aba', 'placar')"
            :class="[
              'min-h-[38px] lg:min-h-[44px] px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition',
              abaAtiva === 'placar'
                ? 'bg-amber-400 text-amber-950'
                : 'text-[#faf6f0] hover:bg-[#2a2420]',
            ]"
          >
            <Gamepad2 class="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" />
            <span>Placar</span>
          </button>

          <button
            type="button"
            @click="emit('mudar-aba', 'historico')"
            :class="[
              'min-h-[38px] lg:min-h-[44px] px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition',
              abaAtiva === 'historico'
                ? 'bg-amber-400 text-amber-950'
                : 'text-[#b5a898] hover:text-[#faf6f0]',
            ]"
          >
            <History class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
            <span>Histórico</span>
            <span
              v-if="totalSessoes > 0"
              class="numeral-placar text-[11px] lg:text-xs font-black"
            >
              ({{ totalSessoes }})
            </span>
          </button>
        </nav>

        <button
          type="button"
          @click="alternarSom"
          :title="somAtivo ? 'Som de vitória ativado' : 'Som de vitória silenciado'"
          class="hidden sm:flex min-h-[40px] lg:min-h-[46px] min-w-[40px] lg:min-w-[46px] p-2 rounded-xl bg-[#1e1a17] border border-[#332c27] text-[#faf6f0] hover:bg-[#2a2420] items-center justify-center cursor-pointer"
        >
          <Volume2 v-if="somAtivo" class="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" />
          <VolumeX v-else class="w-4 h-4 lg:w-5 lg:h-5 text-[#b5a898]" />
        </button>
      </div>
    </div>
  </header>
</template>
