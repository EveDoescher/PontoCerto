<script setup lang="ts">
import { ref, computed } from 'vue'
import BarraTopoPlacar from './BarraTopoPlacar.vue'
import FilaEsperaBar from './FilaEsperaBar.vue'
import CartaoGrupo from './CartaoGrupo.vue'
import ModalVitoriaPartida from './ModalVitoriaPartida.vue'
import ModalTrocaGrupos from './ModalTrocaGrupos.vue'
import ModalEditarRegras from './ModalEditarRegras.vue'
import { useGameStore, CORES_GRUPOS } from '../composables/useGameStore'
import { useAudioVitoria } from '../composables/useAudioVitoria'

const emit = defineEmits<{
  (e: 'ir-historico'): void
  (e: 'novo-jogo'): void
}>()

const store = useGameStore()
const { tocarSomPonto, tocarSomVitoria } = useAudioVitoria()
const sessao = computed(() => store.sessaoAtual.value)

const idAnimandoToque = ref<string | null>(null)
let timeoutToque: ReturnType<typeof setTimeout> | null = null

const modalVitoriaAberto = ref(false)
const vencedorInicialModalId = ref<string>('')
const modalTrocaAberto = ref(false)
const modalRegrasAberto = ref(false)

const gruposAtivos = computed(() => {
  const s = sessao.value
  if (!s) return []
  return s.gruposAtivosIds
    .map((id) => s.grupos.find((g) => g.id === id))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
})

const gruposNaFila = computed(() => {
  const s = sessao.value
  if (!s) return []
  return s.gruposFilaIds
    .map((id) => s.grupos.find((g) => g.id === id))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
})

function dispararAnimacaoToque(grupoId: string) {
  idAnimandoToque.value = null
  if (timeoutToque) clearTimeout(timeoutToque)
  requestAnimationFrame(() => {
    idAnimandoToque.value = grupoId
    timeoutToque = setTimeout(() => {
      idAnimandoToque.value = null
    }, 240)
  })
}

function aoAdicionarPontos(grupoId: string, deltaPersonalizado?: number) {
  if (!sessao.value) return
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(20)
  }
  tocarSomPonto()
  dispararAnimacaoToque(grupoId)
  const { atingiuMeta } = store.alterarPontos(grupoId, deltaPersonalizado)
  if (atingiuMeta) {
    abrirModalVitoria(grupoId)
  }
}

function aoDiminuirPontos(grupoId: string) {
  if (!sessao.value) return
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(15)
  }
  store.alterarPontos(grupoId, -sessao.value.passoPontos)
}

function abrirModalVitoria(idVencedorPadrao?: string) {
  const s = sessao.value
  if (!s) return

  if (idVencedorPadrao) {
    vencedorInicialModalId.value = idVencedorPadrao
  } else {
    let melhorId = s.gruposAtivosIds[0] ?? ''
    let maiorPontuacao = -1
    for (const id of s.gruposAtivosIds) {
      const pts = s.pontuacoesAtuais[id] ?? 0
      if (pts > maiorPontuacao) {
        maiorPontuacao = pts
        melhorId = id
      }
    }
    vencedorInicialModalId.value = melhorId
  }

  tocarSomVitoria()
  modalVitoriaAberto.value = true
}

function confirmarVitoriaPartida(dados: {
  grupoVencedorId: string
  proximosGruposAtivosIds: string[]
  observacaoTroca: string
  encerrarSessao: boolean
}) {
  store.finalizarPartidaEPrepararProxima({
    grupoVencedorId: dados.grupoVencedorId,
    proximosGruposAtivosIds: dados.proximosGruposAtivosIds,
    observacaoTroca: dados.observacaoTroca,
    encerrarSessao: dados.encerrarSessao,
  })

  modalVitoriaAberto.value = false
  if (dados.encerrarSessao) {
    emit('ir-historico')
  }
}

function criarGrupoRapidoNaSessao(nome: string) {
  const s = sessao.value
  const corIdx = s ? s.grupos.length : 0
  const cor = CORES_GRUPOS[corIdx % CORES_GRUPOS.length]!.id
  return store.adicionarNovoGrupoNaSessao(nome, cor, false)
}

function salvarTrocaGrupos(novosIds: string[]) {
  store.trocarGruposAtivos(novosIds, 'Troca manual de grupos')
  modalTrocaAberto.value = false
}

function salvarNovasRegras(dados: {
  titulo: string
  passoPontos: number
  pontosVitoria: number
  atalhosExtras: number[]
}) {
  store.atualizarRegrasSessao(
    dados.passoPontos,
    dados.pontosVitoria,
    dados.titulo,
    dados.atalhosExtras
  )
  modalRegrasAberto.value = false
}

const classeTabuleiro = computed(() => {
  const qtd = gruposAtivos.value.length
  if (qtd === 1) return 'grid grid-cols-1 flex-1 p-2 sm:p-3 gap-2'
  if (qtd === 2) return 'grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-2 flex-1 p-2 sm:p-3 gap-2 sm:gap-3'
  if (qtd === 3) return 'grid grid-cols-1 sm:grid-cols-3 flex-1 p-2 sm:p-3 gap-2 sm:gap-3'
  if (qtd === 4) return 'grid grid-cols-2 lg:grid-cols-4 flex-1 p-2 sm:p-3 gap-2 sm:gap-3'
  return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 flex-1 p-2 sm:p-3 gap-2 sm:gap-3'
})
</script>

<template>
  <div
    v-if="sessao"
    class="min-h-dvh w-full flex flex-col bg-[#12100e] select-none"
  >
    <BarraTopoPlacar
      :sessao="sessao"
      :total-na-fila="gruposNaFila.length"
      @abrir-regras="modalRegrasAberto = true"
      @abrir-troca="modalTrocaAberto = true"
      @desfazer="store.desfazerUltimaAcao()"
      @zerar-placar="store.zerarPlacarAtual()"
      @fechar-partida="abrirModalVitoria()"
      @ir-historico="emit('ir-historico')"
      @novo-jogo="emit('novo-jogo')"
    />

    <FilaEsperaBar
      :grupos-na-fila="gruposNaFila"
      @abrir-troca="modalTrocaAberto = true"
    />

    <div :class="classeTabuleiro">
      <CartaoGrupo
        v-for="(grupo, idx) in gruposAtivos"
        :key="grupo.id"
        :grupo="grupo"
        :indice="idx"
        :pontuacao="sessao.pontuacoesAtuais[grupo.id] ?? 0"
        :passo-pontos="sessao.passoPontos"
        :pontos-vitoria="sessao.pontosVitoria"
        :atalhos-extras="sessao.atalhosExtras"
        :animando="idAnimandoToque === grupo.id"
        @adicionar-pontos="(delta) => aoAdicionarPontos(grupo.id, delta)"
        @diminuir-pontos="aoDiminuirPontos(grupo.id)"
      />
    </div>

    <ModalVitoriaPartida
      :aberto="modalVitoriaAberto"
      :sessao="sessao"
      :grupos-ativos="gruposAtivos"
      :grupos-na-fila="gruposNaFila"
      :vencedor-inicial-id="vencedorInicialModalId"
      @fechar="modalVitoriaAberto = false"
      @confirmar="confirmarVitoriaPartida"
      @criar-grupo-rapido="criarGrupoRapidoNaSessao"
    />

    <ModalTrocaGrupos
      :aberto="modalTrocaAberto"
      :sessao="sessao"
      @fechar="modalTrocaAberto = false"
      @salvar-troca="salvarTrocaGrupos"
      @criar-grupo="criarGrupoRapidoNaSessao"
    />

    <ModalEditarRegras
      :aberto="modalRegrasAberto"
      :sessao="sessao"
      @fechar="modalRegrasAberto = false"
      @salvar="salvarNovasRegras"
    />
  </div>
</template>
