<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import {
  RotateCcw,
  ArrowLeftRight,
  Flag,
  Undo2,
  PlusCircle,
  Volume2,
  VolumeX,
  Timer,
} from 'lucide-vue-next'
import { useAudioVitoria } from '../composables/useAudioVitoria'
import {
  calcularSegundosDecorridos,
  formatarDuracaoHMS,
  obterIconeJogo,
} from '../composables/useGameStore'
import type { SessaoJogo } from '../types'

const props = defineProps<{
  sessao: SessaoJogo
  totalNaFila: number
}>()

const emit = defineEmits<{
  (e: 'abrir-regras'): void
  (e: 'abrir-troca'): void
  (e: 'desfazer'): void
  (e: 'zerar-placar'): void
  (e: 'fechar-partida'): void
  (e: 'ir-historico'): void
  (e: 'novo-jogo'): void
}>()

const { somAtivo, alternarSom } = useAudioVitoria()

const agoraMs = ref(Date.now())
let intervaloCronometro: ReturnType<typeof setInterval> | null = null

const refHeader = ref<HTMLElement | null>(null)
const refBotaoMesa = ref<HTMLElement | null>(null)
const refMedidorRegras = ref<HTMLElement | null>(null)
const refTimer = ref<HTMLElement | null>(null)
const cabeJogoERegras = ref(true)

let observadorTamanho: ResizeObserver | null = null

function verificarEspacoDisponivel() {
  if (!refHeader.value || !refBotaoMesa.value || !refMedidorRegras.value || !refTimer.value) {
    return
  }
  const estiloHeader = getComputedStyle(refHeader.value)
  const paddingHorizontal =
    (parseFloat(estiloHeader.paddingLeft) || 0) + (parseFloat(estiloHeader.paddingRight) || 0)
  const larguraDisponivel = refHeader.value.clientWidth - paddingHorizontal

  const larguraMesa = refBotaoMesa.value.offsetWidth
  const larguraRegras = refMedidorRegras.value.offsetWidth
  const larguraTimer = refTimer.value.offsetWidth
  const gaps = 14 // 2 gaps de 6px (gap-1.5) + folga de segurança

  cabeJogoERegras.value = larguraMesa + larguraRegras + larguraTimer + gaps <= larguraDisponivel
}

onMounted(() => {
  intervaloCronometro = setInterval(() => {
    agoraMs.value = Date.now()
  }, 1000)

  verificarEspacoDisponivel()
  if (typeof ResizeObserver !== 'undefined' && refHeader.value) {
    observadorTamanho = new ResizeObserver(() => {
      verificarEspacoDisponivel()
    })
    observadorTamanho.observe(refHeader.value)
  }
  window.addEventListener('resize', verificarEspacoDisponivel)
})

onUnmounted(() => {
  if (intervaloCronometro) {
    clearInterval(intervaloCronometro)
  }
  if (observadorTamanho) {
    observadorTamanho.disconnect()
  }
  window.removeEventListener('resize', verificarEspacoDisponivel)
})

watch(
  () => [props.sessao.titulo, props.sessao.pontosVitoria],
  async () => {
    await nextTick()
    verificarEspacoDisponivel()
  }
)

const tempoPartidaFormatado = computed(() => {
  const segs = calcularSegundosDecorridos(
    props.sessao.inicioPartidaAtualEm ?? props.sessao.criadaEm,
    agoraMs.value
  )
  return formatarDuracaoHMS(segs)
})

const iconeSessao = computed(() =>
  obterIconeJogo(props.sessao.titulo, props.sessao.icone)
)
</script>

<template>
  <header
    ref="refHeader"
    class="relative w-full bg-[#1e1a17] border-b-2 border-[#332c27] px-2.5 sm:px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 z-30"
  >
    <!-- Medidor invisível para saber a largura real sem truncar do botão de Jogo/Regras -->
    <div
      ref="refMedidorRegras"
      aria-hidden="true"
      class="pointer-events-none fixed -top-96 left-0 opacity-0 px-3 py-1.5 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap"
    >
      <Icon :icon="iconeSessao" class="w-4 h-4 shrink-0" />
      <span class="fonte-display text-sm font-extrabold whitespace-nowrap">
        {{ sessao.titulo }}
      </span>
      <span class="numeral-placar px-1.5 py-0.5 text-xs font-black shrink-0 whitespace-nowrap">
        {{ sessao.pontosVitoria }} pts
      </span>
    </div>

    <!-- Esquerda: Nova Mesa + Nome do Jogo/Regras (aparece sempre que couber ao lado sem "...") + Cronômetro HH:MM:SS -->
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        ref="refBotaoMesa"
        type="button"
        @click="emit('novo-jogo')"
        title="Configurar nova mesa"
        class="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#12100e] hover:bg-[#2a2420] border border-[#332c27] text-amber-400 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 transition"
      >
        <PlusCircle class="w-4 h-4 shrink-0" />
        <span class="whitespace-nowrap">Nova Mesa</span>
      </button>

      <button
        v-if="cabeJogoERegras"
        type="button"
        @click="emit('abrir-regras')"
        title="Ajustar meta e passo de pontos"
        class="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#12100e] hover:bg-[#2a2420] border border-[#332c27] text-xs font-extrabold text-[#faf6f0] flex items-center gap-1.5 shrink-0 cursor-pointer transition"
      >
        <Icon :icon="iconeSessao" class="w-4 h-4 text-amber-400 shrink-0" />
        <span class="fonte-display text-sm font-extrabold whitespace-nowrap">
          {{ sessao.titulo }}
        </span>
        <span class="numeral-placar px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black shrink-0 whitespace-nowrap">
          {{ sessao.pontosVitoria }} pts
        </span>
      </button>

      <!-- Timer da Partida (HH:MM:SS) ao lado (e desce para baixo de Nova Mesa apenas se a tela for muito pequena) -->
      <div
        ref="refTimer"
        title="Duração da partida atual"
        class="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#12100e] border border-[#332c27] text-[#faf6f0] text-xs font-extrabold flex items-center gap-1.5 shrink-0"
      >
        <Timer class="w-4 h-4 text-amber-400 shrink-0" />
        <span class="numeral-placar text-sm font-extrabold tracking-wide text-amber-400 whitespace-nowrap">
          {{ tempoPartidaFormatado }}
        </span>
      </div>
    </div>

    <!-- Direita: Controles da Partida -->
    <div class="flex flex-wrap items-center gap-1.5">
      <!-- Botão de Voltar -->
      <button
        type="button"
        @click="emit('ir-historico')"
        title="Voltar ao histórico e partidas"
        class="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#12100e] hover:bg-[#2a2420] border border-[#332c27] text-[#faf6f0] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition"
      >
        <Undo2 class="w-4 h-4 text-amber-400 shrink-0" />
        <span class="hidden sm:inline">Voltar</span>
        <span
          v-if="sessao.partidas.length > 0"
          class="numeral-placar px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black"
        >
          {{ sessao.partidas.length }}
        </span>
      </button>

      <!-- Trocar Grupos / Fila -->
      <button
        type="button"
        @click="emit('abrir-troca')"
        title="Trocar grupos na mesa ou ver fila"
        class="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#12100e] hover:bg-[#2a2420] border border-[#332c27] text-[#faf6f0] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition"
      >
        <ArrowLeftRight class="w-4 h-4 text-amber-400 shrink-0" />
        <span class="hidden sm:inline">Grupos</span>
        <span
          v-if="totalNaFila > 0"
          class="numeral-placar px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black"
        >
          {{ totalNaFila }}
        </span>
      </button>

      <!-- Resetar Pontos -->
      <button
        type="button"
        @click="emit('zerar-placar')"
        title="Resetar pontos e cronômetro da partida atual"
        class="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-[#12100e] hover:bg-[#2a2420] border border-[#332c27] text-amber-400 flex items-center justify-center cursor-pointer transition"
      >
        <RotateCcw class="w-4 h-4" />
      </button>

      <!-- Som -->
      <button
        type="button"
        @click="alternarSom"
        :title="somAtivo ? 'Som ativado' : 'Som silenciado'"
        class="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-[#12100e] hover:bg-[#2a2420] border border-[#332c27] text-[#faf6f0] flex items-center justify-center cursor-pointer transition"
      >
        <Volume2 v-if="somAtivo" class="w-4 h-4 text-amber-400" />
        <VolumeX v-else class="w-4 h-4 text-[#b5a898]" />
      </button>

      <!-- Finalizar Partida -->
      <button
        type="button"
        @click="emit('fechar-partida')"
        title="Encerrar partida e declarar vencedor"
        class="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 fonte-display text-sm font-extrabold flex items-center gap-1.5 cursor-pointer transition"
      >
        <Flag class="w-4 h-4 fill-current shrink-0" />
        <span>Fim</span>
      </button>
    </div>
  </header>
</template>
