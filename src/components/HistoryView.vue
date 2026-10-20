<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, PlusCircle } from 'lucide-vue-next'
import ItemHistoricoSessao from './ItemHistoricoSessao.vue'
import { useGameStore } from '../composables/useGameStore'

const emit = defineEmits<{
  (e: 'retomar'): void
  (e: 'novo-jogo'): void
}>()

const store = useGameStore()
const idsExpandidos = ref<Record<string, boolean>>({})

function alternarExpansao(sessaoId: string) {
  idsExpandidos.value[sessaoId] = !idsExpandidos.value[sessaoId]
}

function estaExpandido(sessaoId: string, index: number) {
  if (idsExpandidos.value[sessaoId] === undefined) {
    return index === 0
  }
  return idsExpandidos.value[sessaoId]
}

function aoRetomar(sessaoId: string) {
  store.retomarSessao(sessaoId)
  emit('retomar')
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto px-3 sm:px-5 py-4 pb-20 space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#332c27]">
      <h2 class="fonte-display text-2xl font-extrabold text-[#faf6f0]">
        Histórico Local ({{ store.sessoes.value.length }})
      </h2>

      <button
        v-if="store.sessoes.value.length > 0"
        type="button"
        @click="store.limparTodoHistorico()"
        class="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1a17] hover:bg-[#2a2420] border border-[#332c27] text-amber-400 text-xs font-extrabold cursor-pointer"
      >
        <Trash2 class="w-3.5 h-3.5" />
        <span>Limpar histórico</span>
      </button>
    </div>

    <div
      v-if="store.sessoes.value.length === 0"
      class="py-12 text-center space-y-4"
    >
      <p class="text-sm text-[#b5a898]">
        Nenhuma partida salva neste aparelho ainda.
      </p>
      <button
        type="button"
        @click="emit('novo-jogo')"
        class="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs cursor-pointer"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Configurar Nova Mesa</span>
      </button>
    </div>

    <div class="divide-y divide-[#332c27]">
      <ItemHistoricoSessao
        v-for="(sess, idx) in store.sessoes.value"
        :key="sess.id"
        :sessao="sess"
        :eh-sessao-atual="sess.id === store.sessaoAtualId.value"
        :expandido="estaExpandido(sess.id, idx)"
        @alternar-expansao="alternarExpansao(sess.id)"
        @retomar="aoRetomar(sess.id)"
        @excluir="store.excluirSessao(sess.id)"
      />
    </div>
  </div>
</template>
