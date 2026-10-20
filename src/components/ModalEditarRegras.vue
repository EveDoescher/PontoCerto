<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { SessaoJogo } from '../types'

const props = defineProps<{
  aberto: boolean
  sessao: SessaoJogo
}>()

const emit = defineEmits<{
  (e: 'fechar'): void
  (
    e: 'salvar',
    dados: {
      titulo: string
      passoPontos: number
      pontosVitoria: number
      atalhosExtras: number[]
    }
  ): void
}>()

const titulo = ref('')
const passo = ref(1)
const meta = ref(12)
const atalhos = ref<number[]>([])

const opcoesAtalhos = [3, 6, 9, 10, 12, 15, 20]

watch(
  () => props.aberto,
  (estaAberto) => {
    if (estaAberto) {
      titulo.value = props.sessao.titulo
      passo.value = props.sessao.passoPontos
      meta.value = props.sessao.pontosVitoria
      atalhos.value = [...props.sessao.atalhosExtras]
    }
  },
  { immediate: true }
)

function alternarAtalho(valor: number) {
  const idx = atalhos.value.indexOf(valor)
  if (idx >= 0) {
    atalhos.value.splice(idx, 1)
  } else {
    atalhos.value.push(valor)
    atalhos.value.sort((a, b) => a - b)
  }
}

function salvar() {
  emit('salvar', {
    titulo: titulo.value,
    passoPontos: Math.max(1, Number(passo.value) || 1),
    pontosVitoria: Math.max(1, Number(meta.value) || 1),
    atalhosExtras: [...atalhos.value],
  })
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
          Regras da Partida
        </h2>
        <button
          type="button"
          @click="emit('fechar')"
          class="p-1 text-[#b5a898] hover:text-[#faf6f0] cursor-pointer shrink-0"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label for="editar-titulo" class="block text-xs font-bold text-[#b5a898] mb-1">
            Nome do Jogo
          </label>
          <input
            id="editar-titulo"
            v-model="titulo"
            type="text"
            class="w-full px-3.5 py-2.5 rounded-xl bg-[#12100e] border border-[#332c27] text-[#faf6f0] text-sm font-bold focus:outline-none focus:border-amber-400"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="editar-passo" class="block text-xs font-bold text-[#b5a898] mb-1">
              Soma por toque
            </label>
            <input
              id="editar-passo"
              v-model.number="passo"
              type="number"
              min="1"
              class="w-full px-3 py-2.5 rounded-xl bg-[#12100e] border border-[#332c27] text-[#faf6f0] numeral-placar font-extrabold text-center text-lg focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label for="editar-meta" class="block text-xs font-bold text-[#b5a898] mb-1">
              Pontos para vencer
            </label>
            <input
              id="editar-meta"
              v-model.number="meta"
              type="number"
              min="1"
              class="w-full px-3 py-2.5 rounded-xl bg-[#12100e] border border-[#332c27] text-[#faf6f0] numeral-placar font-extrabold text-center text-lg focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <span class="block text-xs font-bold text-[#b5a898] mb-1.5">
            Atalhos extras no quadrado
          </span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="v in opcoesAtalhos"
              :key="v"
              type="button"
              @click="alternarAtalho(v)"
              :class="[
                'min-h-[36px] px-3 py-1 rounded-full numeral-placar text-xs font-extrabold transition cursor-pointer',
                atalhos.includes(v)
                  ? 'bg-amber-400 text-amber-950'
                  : 'bg-[#12100e] border border-[#332c27] text-[#b5a898]',
              ]"
            >
              +{{ v }}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        @click="salvar"
        class="w-full min-h-[50px] py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 fonte-display font-extrabold text-base cursor-pointer"
      >
        SALVAR
      </button>
    </div>
  </div>
</template>
