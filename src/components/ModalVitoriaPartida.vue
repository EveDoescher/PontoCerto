<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Trophy, CheckCircle2, X, Volume2, ArrowRight, Timer } from 'lucide-vue-next'
import { useAudioVitoria } from '../composables/useAudioVitoria'
import {
  obterTemaCor,
  calcularSegundosDecorridos,
  formatarDuracaoHMS,
} from '../composables/useGameStore'
import type { SessaoJogo, Grupo } from '../types'

const props = defineProps<{
  aberto: boolean
  sessao: SessaoJogo
  gruposAtivos: Grupo[]
  gruposNaFila: Grupo[]
  vencedorInicialId: string
}>()

const emit = defineEmits<{
  (e: 'fechar'): void
  (
    e: 'confirmar',
    dados: {
      grupoVencedorId: string
      proximosGruposAtivosIds: string[]
      observacaoTroca: string
      encerrarSessao: boolean
    }
  ): void
  (e: 'criar-grupo-rapido', nome: string): Grupo | null
}>()

const { tocarSomVitoria, pararSomVitoria } = useAudioVitoria()

const vencedorSelecionadoId = ref<string>('')
const opcaoProximaPartida = ref<'manter' | 'rodizio' | 'manual'>('manter')
const idsPersonalizadosProxima = ref<string[]>([])
const nomeNovoGrupo = ref('')
const duracaoNoMomentoDaVitoria = ref('00:00:00')

watch(
  () => props.aberto,
  (estaAberto) => {
    if (estaAberto) {
      vencedorSelecionadoId.value = props.vencedorInicialId
      idsPersonalizadosProxima.value = [...props.sessao.gruposAtivosIds]
      opcaoProximaPartida.value = props.gruposNaFila.length > 0 ? 'rodizio' : 'manter'
      nomeNovoGrupo.value = ''
      const segs = calcularSegundosDecorridos(
        props.sessao.inicioPartidaAtualEm ?? props.sessao.criadaEm
      )
      duracaoNoMomentoDaVitoria.value = formatarDuracaoHMS(segs)
    } else {
      pararSomVitoria()
    }
  },
  { immediate: true }
)

const idsSugeridosRodizio = computed(() => {
  const s = props.sessao
  if (s.gruposFilaIds.length === 0) return s.gruposAtivosIds

  const idVencedor = vencedorSelecionadoId.value
  const ativosAtuais = [...s.gruposAtivosIds]
  const fila = [...s.gruposFilaIds]

  const perdedores = ativosAtuais.filter((id) => id !== idVencedor)
  if (perdedores.length === 0) return ativosAtuais

  const qtdTrocas = Math.min(perdedores.length, fila.length)
  const perdedoresSaindo = new Set(perdedores.slice(0, qtdTrocas))
  const entrandoDaFila = fila.slice(0, qtdTrocas)

  const permanecem = ativosAtuais.filter((id) => !perdedoresSaindo.has(id))
  return [...permanecem, ...entrandoDaFila]
})

const resumoTrocaRodizio = computed(() => {
  const s = props.sessao
  const conjuntoAntigo = new Set(s.gruposAtivosIds)
  const idsAlvo =
    opcaoProximaPartida.value === 'rodizio'
      ? idsSugeridosRodizio.value
      : opcaoProximaPartida.value === 'manual'
        ? idsPersonalizadosProxima.value
        : s.gruposAtivosIds

  const conjuntoNovo = new Set(idsAlvo)
  const nomesSairam = s.gruposAtivosIds
    .filter((id) => !conjuntoNovo.has(id))
    .map((id) => s.grupos.find((g) => g.id === id)?.nome ?? 'Grupo')
  const nomesEntraram = idsAlvo
    .filter((id) => !conjuntoAntigo.has(id))
    .map((id) => s.grupos.find((g) => g.id === id)?.nome ?? 'Grupo')

  return { nomesSairam, nomesEntraram }
})

function alternarGrupoManual(grupoId: string) {
  const idx = idsPersonalizadosProxima.value.indexOf(grupoId)
  if (idx >= 0) {
    if (idsPersonalizadosProxima.value.length > 1) {
      idsPersonalizadosProxima.value.splice(idx, 1)
    }
  } else {
    idsPersonalizadosProxima.value.push(grupoId)
  }
}

function adicionarGrupoRapido() {
  if (!nomeNovoGrupo.value.trim()) return
  emit('criar-grupo-rapido', nomeNovoGrupo.value.trim())
  const ultimoGrupo = props.sessao.grupos[props.sessao.grupos.length - 1]
  if (ultimoGrupo && !idsPersonalizadosProxima.value.includes(ultimoGrupo.id)) {
    idsPersonalizadosProxima.value.push(ultimoGrupo.id)
    opcaoProximaPartida.value = 'manual'
  }
  nomeNovoGrupo.value = ''
}

function confirmarResultado(encerrarSessao = false) {
  if (!vencedorSelecionadoId.value) return
  pararSomVitoria()

  let proximosIds = [...props.sessao.gruposAtivosIds]
  let observacaoTroca = ''

  if (opcaoProximaPartida.value === 'rodizio') {
    proximosIds = [...idsSugeridosRodizio.value]
    observacaoTroca = 'Rodízio (Quem ganha fica)'
  } else if (opcaoProximaPartida.value === 'manual') {
    proximosIds = [...idsPersonalizadosProxima.value]
    observacaoTroca = 'Troca de grupos entre partidas'
  }

  emit('confirmar', {
    grupoVencedorId: vencedorSelecionadoId.value,
    proximosGruposAtivosIds: proximosIds,
    observacaoTroca,
    encerrarSessao,
  })
}
</script>

<template>
  <div
    v-if="aberto"
    class="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
  >
    <div class="animar-entrada-folha bg-[#1e1a17] border-t sm:border border-[#332c27] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-5 max-h-[92dvh] overflow-y-auto">
      <div class="flex items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2 min-w-0">
          <Trophy class="w-6 h-6 text-amber-400 shrink-0" />
          <h2 class="fonte-display text-xl sm:text-2xl font-extrabold text-[#faf6f0] break-words">
            Fim da Partida #{{ sessao.partidas.length + 1 }}
          </h2>
          <span
            title="Tempo de duração da partida"
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#12100e] border border-[#332c27] text-amber-400 numeral-placar text-xs font-extrabold"
          >
            <Timer class="w-3.5 h-3.5" />
            <span>{{ duracaoNoMomentoDaVitoria }}</span>
          </span>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            @click="tocarSomVitoria"
            title="Tocar som de vitória"
            class="p-2 rounded-full text-amber-400 hover:bg-[#332c27] cursor-pointer"
          >
            <Volume2 class="w-5 h-5" />
          </button>
          <button
            type="button"
            @click="emit('fechar')"
            class="p-2 rounded-full text-[#b5a898] hover:text-[#faf6f0] cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Escolha do Vencedor usando as próprias cores dos grupos -->
      <div class="space-y-2">
        <span class="block text-xs font-bold text-[#b5a898]">Vencedor da partida</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            v-for="g in gruposAtivos"
            :key="g.id"
            type="button"
            @click="vencedorSelecionadoId = g.id"
            :class="[
              'min-h-[54px] p-3 rounded-2xl text-left flex items-center justify-between gap-2 transition cursor-pointer',
              vencedorSelecionadoId === g.id
                ? `${obterTemaCor(g.cor).gradiente} text-white ring-2 ring-amber-400`
                : 'bg-[#12100e] border border-[#332c27] text-[#b5a898]',
            ]"
          >
            <span class="fonte-display font-extrabold text-base break-words min-w-0">{{ g.nome }}</span>
            <span class="numeral-placar text-xl font-extrabold shrink-0">
              {{ sessao.pontuacoesAtuais[g.id] ?? 0 }}
            </span>
          </button>
        </div>
      </div>

      <!-- Próxima Partida -->
      <div class="space-y-2.5">
        <span class="block text-xs font-bold text-[#b5a898]">Próxima partida</span>

        <div class="flex flex-wrap gap-1.5">
          <button
            v-if="gruposNaFila.length > 0"
            type="button"
            @click="opcaoProximaPartida = 'rodizio'"
            :class="[
              'min-h-[40px] px-3.5 py-2 rounded-full text-xs font-extrabold cursor-pointer',
              opcaoProximaPartida === 'rodizio'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-[#12100e] border border-[#332c27] text-[#b5a898]',
            ]"
          >
            Quem ganha fica
          </button>

          <button
            type="button"
            @click="opcaoProximaPartida = 'manter'"
            :class="[
              'min-h-[40px] px-3.5 py-2 rounded-full text-xs font-extrabold cursor-pointer',
              opcaoProximaPartida === 'manter'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-[#12100e] border border-[#332c27] text-[#b5a898]',
            ]"
          >
            Mesmos grupos
          </button>

          <button
            type="button"
            @click="opcaoProximaPartida = 'manual'"
            :class="[
              'min-h-[40px] px-3.5 py-2 rounded-full text-xs font-extrabold cursor-pointer',
              opcaoProximaPartida === 'manual'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-[#12100e] border border-[#332c27] text-[#b5a898]',
            ]"
          >
            Trocar grupos
          </button>
        </div>

        <div
          v-if="opcaoProximaPartida === 'rodizio' && resumoTrocaRodizio.nomesSairam.length > 0"
          class="flex flex-wrap items-center gap-1.5 text-xs text-amber-300 font-bold pt-1"
        >
          <span>Sai {{ resumoTrocaRodizio.nomesSairam.join(', ') }}</span>
          <ArrowRight class="w-3.5 h-3.5 shrink-0" />
          <span>Entra {{ resumoTrocaRodizio.nomesEntraram.join(', ') }}</span>
        </div>

        <div v-if="opcaoProximaPartida === 'manual'" class="space-y-2.5 pt-1">
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="grp in sessao.grupos"
              :key="grp.id"
              type="button"
              @click="alternarGrupoManual(grp.id)"
              :class="[
                'min-h-[38px] px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 cursor-pointer',
                idsPersonalizadosProxima.includes(grp.id)
                  ? `${obterTemaCor(grp.cor).gradiente} text-white`
                  : 'bg-[#12100e] border border-[#332c27] text-[#b5a898]',
              ]"
            >
              <CheckCircle2 v-if="idsPersonalizadosProxima.includes(grp.id)" class="w-3.5 h-3.5 shrink-0" />
              <span>{{ grp.nome }}</span>
            </button>
          </div>

          <div class="flex gap-2">
            <input
              v-model="nomeNovoGrupo"
              type="text"
              placeholder="Novo grupo..."
              @keydown.enter.prevent="adicionarGrupoRapido"
              class="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#12100e] border border-[#332c27] text-[#faf6f0] text-xs font-bold focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              @click="adicionarGrupoRapido"
              class="px-3.5 py-2 rounded-xl bg-[#332c27] text-amber-400 font-extrabold text-xs cursor-pointer shrink-0"
            >
              + Grupo
            </button>
          </div>
        </div>
      </div>

      <!-- Botões Finais -->
      <div class="space-y-2 pt-2">
        <button
          type="button"
          @click="confirmarResultado(false)"
          class="w-full min-h-[52px] py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 fonte-display font-extrabold text-lg cursor-pointer"
        >
          PRÓXIMA PARTIDA
        </button>
        <button
          type="button"
          @click="confirmarResultado(true)"
          class="w-full min-h-[42px] py-2 rounded-xl text-[#b5a898] hover:text-[#faf6f0] font-bold text-xs cursor-pointer"
        >
          Salvar e encerrar sessão
        </button>
      </div>
    </div>
  </div>
</template>
