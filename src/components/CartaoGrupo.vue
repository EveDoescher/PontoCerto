<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { Trophy, Minus, Plus, Flame } from 'lucide-vue-next'
import { obterTemaCor, obterNaipePorIndice } from '../composables/useGameStore'
import type { Grupo } from '../types'

const props = defineProps<{
  grupo: Grupo
  indice?: number
  pontuacao: number
  passoPontos: number
  pontosVitoria: number
  atalhosExtras: number[]
  animando: boolean
}>()

const emit = defineEmits<{
  (e: 'adicionar-pontos', delta?: number): void
  (e: 'diminuir-pontos'): void
}>()

interface ParticulaTento {
  id: number
  x: number
  y: number
  texto: string
}

const elementoPlaca = ref<HTMLElement | null>(null)
const particulas = ref<ParticulaTento[]>([])
let contadorParticula = 0

const tema = computed(() => obterTemaCor(props.grupo.cor))
const naipeGrupo = computed(() => obterNaipePorIndice(props.indice ?? 0))

const estaNoBico = computed(() => {
  return (
    props.pontuacao > 0 &&
    props.pontuacao < props.pontosVitoria &&
    props.pontuacao + props.passoPontos >= props.pontosVitoria
  )
})

const atalhosVisiveis = computed(() => {
  return props.atalhosExtras.filter((n) => n !== props.passoPontos && n > 0)
})

function criarParticula(evento?: MouseEvent | KeyboardEvent, delta?: number) {
  const valor = delta !== undefined ? delta : props.passoPontos
  const sinal = valor > 0 ? `+${valor}` : `${valor}`

  let x = 50
  let y = 45

  if (evento && 'clientX' in evento && elementoPlaca.value) {
    const retangulo = elementoPlaca.value.getBoundingClientRect()
    if (retangulo.width > 0 && retangulo.height > 0) {
      x = ((evento.clientX - retangulo.left) / retangulo.width) * 100
      y = ((evento.clientY - retangulo.top) / retangulo.height) * 100
    }
  }

  const id = ++contadorParticula
  particulas.value.push({ id, x, y, texto: sinal })

  setTimeout(() => {
    particulas.value = particulas.value.filter((p) => p.id !== id)
  }, 560)
}

function aoTocarNoQuadrado(evento: MouseEvent) {
  criarParticula(evento, props.passoPontos)
  emit('adicionar-pontos')
}

function aoTocarAtalhoExtra(evento: MouseEvent, extra: number) {
  criarParticula(evento, extra)
  emit('adicionar-pontos', extra)
}

function aoTocarMais(evento: MouseEvent) {
  criarParticula(evento, props.passoPontos)
  emit('adicionar-pontos')
}

function aoTocarMenos(evento: MouseEvent) {
  if (props.pontuacao <= 0) return
  criarParticula(evento, -props.passoPontos)
  emit('diminuir-pontos')
}
</script>

<template>
  <div class="quadrado-container relative flex-1 w-full flex min-h-[190px]">
    <div
      ref="elementoPlaca"
      @click="aoTocarNoQuadrado"
      role="button"
      tabindex="0"
      :aria-label="`${grupo.nome}: ${pontuacao} pontos. Toque para somar ${passoPontos}.`"
      @keydown.enter.space.prevent="emit('adicionar-pontos')"
      :class="[
        'quadrado-tactil relative flex-1 w-full rounded-2xl border-2 flex flex-col justify-between p-4 sm:p-5 cursor-pointer',
        tema.gradiente,
        estaNoBico ? 'border-amber-400' : tema.borda,
      ]"
    >
      <!-- Efeito de impacto e número flutuante contido em sua própria camada para nunca cortar o conteúdo -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20" aria-hidden="true">
        <template v-for="p in particulas" :key="p.id">
          <span
            class="animar-onda-toque-placa absolute w-20 h-20 rounded-full border-2 border-white/60"
            :style="{ left: `${p.x}%`, top: `${p.y}%` }"
          ></span>
          <span
            class="animar-flutuar-tento numeral-placar absolute text-4xl sm:text-5xl font-extrabold text-white"
            :style="{ left: `${p.x}%`, top: `${p.y}%` }"
          >
            {{ p.texto }}
          </span>
        </template>
      </div>

      <!-- Topo do Quadrado: Nome do Grupo + Naipe discreto + Vitórias -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 min-w-0">
          <Icon
            :icon="naipeGrupo"
            class="w-4 h-4 text-white/75 shrink-0"
            aria-hidden="true"
          />
          <h2 class="fonte-display nome-grupo-fluido font-extrabold uppercase text-white tracking-tight break-words min-w-0">
            {{ grupo.nome }}
          </h2>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <span
            v-if="estaNoBico"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400 text-amber-950 text-[11px] font-black uppercase"
          >
            <Flame class="w-3 h-3 fill-current" />
            <span>No bico</span>
          </span>

          <span
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/30 text-amber-300 text-xs font-extrabold numeral-placar"
            title="Vitórias na sessão"
          >
            <Trophy class="w-3.5 h-3.5" />
            <span>{{ grupo.vitorias }}V</span>
          </span>
        </div>
      </div>

      <!-- Centro do Quadrado: Numeração Gigante começando em 0 -->
      <div class="relative z-10 my-auto py-2 flex flex-col items-center justify-center">
        <div
          :class="[
            'numeral-placar numeral-gigante font-extrabold text-white select-none',
            animando ? 'animar-pulo-ponto' : '',
          ]"
        >
          {{ pontuacao }}
        </div>
      </div>

      <!-- Base do Quadrado: Controles responsivos que quebram linha se houver muitos atalhos -->
      <div class="relative z-10 space-y-2" @click.stop>
        <!-- Atalhos opcionais (+3, +6, +9, +12) -->
        <div
          v-if="atalhosVisiveis.length > 0"
          class="flex flex-wrap items-center justify-center gap-1.5"
        >
          <button
            v-for="extra in atalhosVisiveis"
            :key="extra"
            type="button"
            @click.stop="aoTocarAtalhoExtra($event, extra)"
            class="min-h-[36px] px-3 py-1 rounded-xl bg-black/35 hover:bg-black/50 active:scale-95 text-white numeral-placar font-extrabold text-xs border border-white/20 transition cursor-pointer"
          >
            +{{ extra }}
          </button>
        </div>

        <div class="flex items-center justify-between gap-2">
          <!-- Diminuir ponto caso toque sem querer -->
          <button
            type="button"
            @click.stop="aoTocarMenos($event)"
            :disabled="pontuacao <= 0"
            class="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-black/35 hover:bg-black/50 active:scale-95 disabled:opacity-25 text-white numeral-placar font-extrabold text-sm border border-white/15 flex items-center justify-center gap-1 transition cursor-pointer"
            title="Diminuir ponto"
          >
            <Minus class="w-4 h-4 stroke-[2.5]" />
            <span>{{ passoPontos }}</span>
          </button>

          <!-- Somar ponto explícito -->
          <button
            type="button"
            @click.stop="aoTocarMais($event)"
            class="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white numeral-placar font-extrabold text-sm border border-white/25 flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <Plus class="w-4 h-4 stroke-[3]" />
            <span>{{ passoPontos }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
