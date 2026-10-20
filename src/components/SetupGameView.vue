<script setup lang="ts">
import { ref } from 'vue'
import { Play } from 'lucide-vue-next'
import SeletorPredefinicoes from './SeletorPredefinicoes.vue'
import ConfiguradorRegras from './ConfiguradorRegras.vue'
import GerenciadorGruposSetup, { type RascunhoGrupo } from './GerenciadorGruposSetup.vue'
import {
  PREDEFINICOES_JOGO,
  CORES_GRUPOS,
  obterNomePadraoGrupo,
  useGameStore,
} from '../composables/useGameStore'
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
      nome: obterNomePadraoGrupo(
        idx,
        grupos.value.map((g) => g.nome)
      ),
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
      nome: g.nome.trim() || obterNomePadraoGrupo(i),
      cor: g.cor,
    })),
  })

  emit('iniciado')
}
</script>

<template>
  <div class="w-full px-3 sm:px-6 lg:px-10 xl:px-14 pt-4 lg:pt-6 pb-28 lg:pb-32 space-y-5 lg:space-y-7">
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

    <!-- Botão Fixo na Base ocupando a largura total com padding responsivo -->
    <div class="fixed bottom-0 inset-x-0 z-20 bg-[#12100e]/95 border-t border-[#332c27] px-3 sm:px-6 lg:px-10 xl:px-14 py-3 lg:py-4">
      <button
        type="button"
        @click="iniciarJogo"
        class="w-full min-h-[52px] lg:min-h-[60px] py-3 lg:py-3.5 px-6 rounded-xl lg:rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-amber-950 fonte-display font-extrabold text-xl lg:text-2xl flex items-center justify-center gap-2 lg:gap-2.5 transition cursor-pointer"
      >
        <Play class="w-5 h-5 lg:w-6 lg:h-6 fill-current" />
        <span>COMEÇAR PARTIDA</span>
      </button>
    </div>
  </div>
</template>
