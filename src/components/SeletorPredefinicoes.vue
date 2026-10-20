<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { PredefinicaoJogo } from '../types'

defineProps<{
  predefinicoes: PredefinicaoJogo[]
  predefinicaoSelecionadaId: string
}>()

const emit = defineEmits<{
  (e: 'selecionar', predefinicao: PredefinicaoJogo): void
}>()
</script>

<template>
  <!-- Grade 2x2 no mobile e 4 colunas no PC: nunca corta lateralmente -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <button
      v-for="item in predefinicoes"
      :key="item.id"
      type="button"
      @click="emit('selecionar', item)"
      :class="[
        'min-h-[48px] px-3 py-2.5 rounded-xl text-left transition cursor-pointer flex items-center justify-between gap-1.5 border',
        predefinicaoSelecionadaId === item.id
          ? 'bg-amber-400 text-amber-950 border-amber-300 font-black'
          : 'bg-[#1e1a17] text-[#faf6f0] border-[#332c27] hover:bg-[#2a2420] font-bold',
      ]"
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <Icon
          :icon="item.icone"
          :class="[
            'w-4 h-4 shrink-0',
            predefinicaoSelecionadaId === item.id ? 'text-amber-950' : 'text-amber-400',
          ]"
        />
        <span class="fonte-display text-sm sm:text-base font-extrabold leading-tight truncate">
          {{ item.nome.split(' ')[0] }}
        </span>
      </div>
      <span
        :class="[
          'numeral-placar text-xs px-1.5 py-0.5 rounded-md font-extrabold shrink-0',
          predefinicaoSelecionadaId === item.id
            ? 'bg-amber-950/15 text-amber-950'
            : 'bg-[#12100e] text-amber-400',
        ]"
      >
        +{{ item.passoPontos }}•{{ item.pontosVitoria }}
      </span>
    </button>
  </div>
</template>
