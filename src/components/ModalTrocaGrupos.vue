<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserPlus, X } from 'lucide-vue-next'
import { obterTemaCor, obterNomePadraoGrupo } from '../composables/useGameStore'
import type { SessaoJogo } from '../types'

const props = defineProps<{
  aberto: boolean
  sessao: SessaoJogo
}>()

const emit = defineEmits<{
  (e: 'fechar'): void
  (e: 'salvar-troca', novosAtivosIds: string[]): void
  (e: 'criar-grupo', nome: string): void
}>()

const selecionadosIds = ref<string[]>([])
const nomeNovoGrupo = ref('')

watch(
  () => props.aberto,
  (estaAberto) => {
    if (estaAberto) {
      selecionadosIds.value = [...props.sessao.gruposAtivosIds]
      nomeNovoGrupo.value = ''
    }
  },
  { immediate: true }
)

function alternarSelecao(grupoId: string) {
  const idx = selecionadosIds.value.indexOf(grupoId)
  if (idx >= 0) {
    if (selecionadosIds.value.length > 1) {
      selecionadosIds.value.splice(idx, 1)
    }
  } else {
    selecionadosIds.value.push(grupoId)
  }
}

function adicionarGrupo() {
  emit('criar-grupo', nomeNovoGrupo.value.trim())
  const ultimo = props.sessao.grupos[props.sessao.grupos.length - 1]
  if (ultimo && !selecionadosIds.value.includes(ultimo.id)) {
    selecionadosIds.value.push(ultimo.id)
  }
  nomeNovoGrupo.value = ''
}

function confirmar() {
  if (selecionadosIds.value.length === 0) return
  emit('salvar-troca', [...selecionadosIds.value])
}
</script>

<template>
  <div
    v-if="aberto"
    class="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
  >
    <div class="animar-entrada-folha bg-[#1e1a17] border-t sm:border border-[#332c27] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[92dvh] overflow-y-auto">
      <div class="flex items-center justify-between gap-2">
        <h2 class="fonte-display text-xl font-extrabold text-[#faf6f0]">
          Quem está jogando agora?
        </h2>
        <button
          type="button"
          @click="emit('fechar')"
          class="p-1.5 rounded-full text-[#b5a898] hover:text-[#faf6f0] cursor-pointer shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-2 max-h-60 overflow-y-auto">
        <button
          v-for="grp in sessao.grupos"
          :key="grp.id"
          type="button"
          @click="alternarSelecao(grp.id)"
          :class="[
            'min-h-[48px] w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-left transition cursor-pointer',
            selecionadosIds.includes(grp.id)
              ? `${obterTemaCor(grp.cor).gradiente} text-white`
              : 'bg-[#12100e] border border-[#332c27] text-[#b5a898]',
          ]"
        >
          <span class="fonte-display font-extrabold text-base break-words min-w-0">{{ grp.nome }}</span>
          <span class="text-xs font-extrabold shrink-0">
            {{ selecionadosIds.includes(grp.id) ? 'Jogando' : 'Na fila' }}
          </span>
        </button>
      </div>

      <div class="flex gap-2 pt-1">
        <input
          v-model="nomeNovoGrupo"
          type="text"
          :placeholder="`Novo grupo (padrão: ${obterNomePadraoGrupo(sessao.grupos.length, sessao.grupos.map((g) => g.nome))})`"
          @keydown.enter.prevent="adicionarGrupo"
          class="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#332c27] text-[#faf6f0] text-sm font-bold focus:outline-none focus:border-amber-400"
        />
        <button
          type="button"
          @click="adicionarGrupo"
          class="min-h-[44px] flex items-center gap-1 px-4 py-2 rounded-xl bg-[#332c27] text-amber-400 font-extrabold text-xs cursor-pointer shrink-0"
        >
          <UserPlus class="w-4 h-4" />
          <span>Criar</span>
        </button>
      </div>

      <button
        type="button"
        @click="confirmar"
        class="w-full min-h-[50px] py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 fonte-display font-extrabold text-base cursor-pointer"
      >
        CONFIRMAR ({{ selecionadosIds.length }})
      </button>
    </div>
  </div>
</template>
