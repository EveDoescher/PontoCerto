<script setup lang="ts">
import { ref } from 'vue'
import { Play } from 'lucide-vue-next'
import SeletorPredefinicoes from './SeletorPredefinicoes.vue'
import ConfiguradorRegras from './ConfiguradorRegras.vue'
import GerenciadorGruposSetup, { type RascunhoGrupo } from './GerenciadorGruposSetup.vue'
import { PREDEFINICOES_JOGO, CORES_GRUPOS, useGameStore } from '../composables/useGameStore'
import type { ModoSessao, PredefinicaoJogo } from '../types'

const emit = defineEmits<{
  (e: 'iniciado'): void
}>()

const store = useGameStore()

const titulo = ref('Truco')
const iconeJogo = ref('mdi:cards-playing-spade-multiple')
const passoPontos = ref<number>(1)
const pontosVitoria = ref<number>(12)
const atalhosExtras = ref<number[]>([3, 6, 9, 12])
const modo = ref<ModoSessao>('todos')
const tamanhoMesa = ref<number>(2)
const predefinicaoSelecionadaId = ref<string>('truco')

const grupos = ref<RascunhoGrupo[]>([
  { nome: 'Nós', cor: 'emerald' },
  { nome: 'Eles', cor: 'rose' },
])

function aplicarPredefinicao(predefinicao: PredefinicaoJogo) {
  predefinicaoSelecionadaId.value = predefinicao.id
  iconeJogo.value = predefinicao.icone
  passoPontos.value = predefinicao.passoPontos
  pontosVitoria.value = predefinicao.pontosVitoria
  atalhosExtras.value = [...predefinicao.atalhosExtras]
  modo.value = predefinicao.modo
  if (!titulo.value || PREDEFINICOES_JOGO.some((p) => p.nome === titulo.value)) {
    titulo.value = predefinicao.nome
  }

  while (grupos.value.length < predefinicao.gruposPadrao) {
    const idx = grupos.value.length
    grupos.value.push({
      nome: `Grupo ${idx + 1}`,
      cor: CORES_GRUPOS[idx % CORES_GRUPOS.length]!.id,
    })
  }
}

function iniciarJogo() {
  const passoValido = Math.max(1, Number(passoPontos.value) || 1)
  const metaValida = Math.max(1, Number(pontosVitoria.value) || 12)
  const modoFinal: ModoSessao =
    modo.value === 'fila' && grupos.value.length >= 3 ? 'fila' : 'todos'

  store.criarSessao({
    titulo: titulo.value.trim() || `Partida até ${metaValida}`,
    icone: iconeJogo.value,
    passoPontos: passoValido,
    pontosVitoria: metaValida,
    atalhosExtras: atalhosExtras.value,
    modo: modoFinal,
    tamanhoMesa: Math.min(Math.max(2, tamanhoMesa.value), grupos.value.length),
    grupos: grupos.value.map((g, i) => ({
      nome: g.nome.trim() || `Grupo ${i + 1}`,
      cor: g.cor,
    })),
  })

  emit('iniciado')
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto px-3 sm:px-5 pt-4 pb-28 space-y-5">
    <SeletorPredefinicoes
      :predefinicoes="PREDEFINICOES_JOGO"
      :predefinicao-selecionada-id="predefinicaoSelecionadaId"
      @selecionar="aplicarPredefinicao"
    />

    <ConfiguradorRegras
      v-model:titulo="titulo"
      v-model:passo-pontos="passoPontos"
      v-model:pontos-vitoria="pontosVitoria"
      v-model:atalhos-extras="atalhosExtras"
      @update:passo-pontos="predefinicaoSelecionadaId = 'livre'"
      @update:pontos-vitoria="predefinicaoSelecionadaId = 'livre'"
    />

    <GerenciadorGruposSetup
      v-model:grupos="grupos"
      v-model:modo="modo"
      v-model:tamanho-mesa="tamanhoMesa"
    />

    <!-- Botão Fixo na Base para Alcance do Polegar no Mobile -->
    <div class="fixed bottom-0 inset-x-0 z-20 bg-[#12100e]/95 border-t border-[#332c27] p-3">
      <div class="max-w-2xl mx-auto">
        <button
          type="button"
          @click="iniciarJogo"
          class="w-full min-h-[52px] py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-amber-950 fonte-display font-extrabold text-xl flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Play class="w-5 h-5 fill-current" />
          <span>COMEÇAR PARTIDA</span>
        </button>
      </div>
    </div>
  </div>
</template>
