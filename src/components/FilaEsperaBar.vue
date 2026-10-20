<script setup lang="ts">
import type { Grupo } from '../types'

defineProps<{
  gruposNaFila: Grupo[]
}>()

const emit = defineEmits<{
  (e: 'abrir-troca'): void
}>()
</script>

<template>
  <div
    v-if="gruposNaFila.length > 0"
    @click="emit('abrir-troca')"
    class="w-full bg-amber-400 text-amber-950 px-3 py-1.5 text-xs font-extrabold flex flex-wrap items-center justify-between gap-2 shrink-0 cursor-pointer"
  >
    <div class="flex flex-wrap items-center gap-1.5 min-w-0">
      <span class="uppercase tracking-tight font-black shrink-0">
        Fila:
      </span>
      <span
        v-for="(grupoFila, idx) in gruposNaFila"
        :key="grupoFila.id"
        class="break-words"
      >
        {{ idx + 1 }}º {{ grupoFila.nome }}{{ idx < gruposNaFila.length - 1 ? ' •' : '' }}
      </span>
    </div>
    <span class="underline font-black shrink-0">Trocar</span>
  </div>
</template>
