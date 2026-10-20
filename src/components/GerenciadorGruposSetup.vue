<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { Plus, Trash2, Palette, CircleAlert, X } from 'lucide-vue-next'
import { CORES_GRUPOS, obterTemaCor, obterNaipePorIndice } from '../composables/useGameStore'
import type { ModoSessao } from '../types'

export interface RascunhoGrupo {
  nome: string
  cor: string
}

const props = defineProps<{
  grupos: RascunhoGrupo[]
  modo: ModoSessao
  tamanhoMesa: number
}>()

const emit = defineEmits<{
  (e: 'update:grupos', valor: RascunhoGrupo[]): void
  (e: 'update:modo', valor: ModoSessao): void
  (e: 'update:tamanhoMesa', valor: number): void
}>()

const explicacaoFilaAberta = ref(false)

function adicionarGrupo() {
  const idx = props.grupos.length
  const novos = [
    ...props.grupos,
    {
      nome: `Grupo ${idx + 1}`,
      cor: CORES_GRUPOS[idx % CORES_GRUPOS.length]!.id,
    },
  ]
  emit('update:grupos', novos)
}

function removerGrupo(index: number) {
  if (props.grupos.length <= 1) return
  const novos = [...props.grupos]
  novos.splice(index, 1)
  emit('update:grupos', novos)
  if (props.tamanhoMesa > novos.length) {
    emit('update:tamanhoMesa', Math.max(2, novos.length))
  }
}

function atualizarNomeGrupo(index: number, nome: string) {
  const novos = props.grupos.map((g, i) => (i === index ? { ...g, nome } : g))
  emit('update:grupos', novos)
}

function alternarCorGrupo(index: number) {
  const atual = props.grupos[index]
  if (!atual) return
  const idxAtual = CORES_GRUPOS.findIndex((c) => c.id === atual.cor)
  const proxIdx = (idxAtual + 1) % CORES_GRUPOS.length
  const novos = props.grupos.map((g, i) =>
    i === index ? { ...g, cor: CORES_GRUPOS[proxIdx]!.id } : g
  )
  emit('update:grupos', novos)
}
</script>

<template>
  <section class="space-y-3 pt-4 border-t border-[#332c27]">
    <div class="flex items-center justify-between gap-2">
      <h2 class="fonte-display text-xl font-extrabold text-[#faf6f0]">
        Grupos ({{ grupos.length }})
      </h2>

      <button
        type="button"
        @click="adicionarGrupo"
        class="min-h-[38px] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs cursor-pointer"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Adicionar Grupo</span>
      </button>
    </div>

    <!-- Lista de Grupos (1 coluna no celular, 2 no PC) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        v-for="(grupo, idx) in grupos"
        :key="idx"
        :class="[
          'flex items-center gap-2 px-3 py-2 rounded-xl text-white border',
          obterTemaCor(grupo.cor).gradiente,
          obterTemaCor(grupo.cor).borda,
        ]"
      >
        <button
          type="button"
          @click="alternarCorGrupo(idx)"
          title="Trocar cor do grupo"
          class="w-9 h-9 rounded-lg bg-black/25 hover:bg-black/40 flex items-center justify-center text-white shrink-0 cursor-pointer"
        >
          <Palette class="w-4 h-4" />
        </button>

        <Icon
          :icon="obterNaipePorIndice(idx)"
          class="w-4 h-4 text-white/75 shrink-0"
          aria-hidden="true"
        />

        <input
          :value="grupo.nome"
          @input="atualizarNomeGrupo(idx, ($event.target as HTMLInputElement).value)"
          type="text"
          :aria-label="`Nome do grupo ${idx + 1}`"
          :placeholder="`Grupo ${idx + 1}`"
          class="flex-1 min-w-0 bg-transparent text-white placeholder-white/60 fonte-display font-extrabold text-lg focus:outline-none"
        />

        <button
          v-if="grupos.length > 1"
          type="button"
          @click="removerGrupo(idx)"
          title="Remover grupo"
          class="w-9 h-9 rounded-lg bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80 hover:text-white shrink-0 cursor-pointer"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Chave Simples: Todos na tela vs Quem ganha fica -->
    <div class="space-y-2.5 pt-2">
      <div class="grid grid-cols-2 gap-1.5 bg-[#1e1a17] p-1 rounded-xl border border-[#332c27]">
        <button
          type="button"
          @click="emit('update:modo', 'todos')"
          :class="[
            'min-h-[40px] py-2 px-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer',
            modo === 'todos'
              ? 'bg-amber-400 text-amber-950'
              : 'text-[#b5a898] hover:text-[#faf6f0]',
          ]"
        >
          Todos jogam juntos
        </button>

        <button
          type="button"
          @click="emit('update:modo', 'fila')"
          :class="[
            'min-h-[40px] py-2 px-2.5 rounded-lg text-xs font-extrabold transition cursor-pointer',
            modo === 'fila'
              ? 'bg-amber-400 text-amber-950'
              : 'text-[#b5a898] hover:text-[#faf6f0]',
          ]"
        >
          Quem ganha fica
        </button>
      </div>

      <div v-if="modo === 'fila'" class="space-y-2 pt-1 text-xs">
        <!-- Botão Como Funciona (!) antes de quantos grupos na mesa por vez -->
        <div>
          <button
            type="button"
            @click="explicacaoFilaAberta = true"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1a17] hover:bg-[#2a2420] border border-[#332c27] text-amber-400 font-extrabold text-xs cursor-pointer transition"
          >
            <CircleAlert class="w-4 h-4 shrink-0" />
            <span>Como Funciona</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-[#b5a898] font-bold">Quantos grupos na mesa por vez?</span>
          <div class="flex gap-1.5">
            <button
              v-for="n in [2, 3, 4]"
              :key="n"
              type="button"
              @click="emit('update:tamanhoMesa', n)"
              :class="[
                'px-3 py-1.5 rounded-lg numeral-placar font-extrabold border cursor-pointer',
                tamanhoMesa === n
                  ? 'bg-amber-400 text-amber-950 border-amber-300'
                  : 'bg-[#1e1a17] text-[#b5a898] border-[#332c27]',
              ]"
            >
              {{ n }} na mesa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Explicação simples do Modo Fila ("Quem ganha fica") -->
    <div
      v-if="explicacaoFilaAberta"
      @click.self="explicacaoFilaAberta = false"
      class="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div class="animar-entrada-folha bg-[#1e1a17] border-t sm:border border-[#332c27] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[92dvh] overflow-y-auto">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <CircleAlert class="w-5 h-5 text-amber-400 shrink-0" />
            <h3 class="fonte-display text-xl font-extrabold text-[#faf6f0]">
              Como funciona o "Quem ganha fica"
            </h3>
          </div>
          <button
            type="button"
            @click="explicacaoFilaAberta = false"
            class="p-1.5 rounded-full text-[#b5a898] hover:text-[#faf6f0] cursor-pointer shrink-0"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-[#b5a898] leading-relaxed">
          Ideal para quando tem mais duplas ou times presentes do que cabem jogando ao mesmo tempo (ex: 3 ou mais duplas no Truco/Dominó ou times na Pelada/Vôlei).
        </p>

        <div class="space-y-3 text-xs">
          <div class="p-3 rounded-xl bg-[#12100e] border border-[#332c27] space-y-1">
            <strong class="block text-amber-400 font-extrabold text-sm">
              1. Quem joga e quem espera
            </strong>
            <p class="text-[#faf6f0] leading-relaxed">
              Você cadastra todos os grupos (3 ou mais) e escolhe quantos jogam na mesa por vez. Os primeiros começam jogando e os outros ficam aguardando na fila.
            </p>
          </div>

          <div class="p-3 rounded-xl bg-[#12100e] border border-[#332c27] space-y-1">
            <strong class="block text-amber-400 font-extrabold text-sm">
              2. Durante o jogo
            </strong>
            <p class="text-[#faf6f0] leading-relaxed">
              No placar aparecem apenas os grupos que estão jogando agora, e uma faixa no topo mostra a ordem de quem é o próximo da fila. Se chegar mais gente depois, você pode adicionar ou trocar os grupos a qualquer momento.
            </p>
          </div>

          <div class="p-3 rounded-xl bg-[#12100e] border border-[#332c27] space-y-1">
            <strong class="block text-amber-400 font-extrabold text-sm">
              3. Quem ganha fica na mesa
            </strong>
            <p class="text-[#faf6f0] leading-relaxed">
              Quando a partida acaba, quem venceu continua na mesa, quem perdeu vai para o fim da fila e o próximo grupo da fila entra para desafiar o vencedor! Se preferirem, também dá para repetir os mesmos grupos na hora.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="explicacaoFilaAberta = false"
          class="w-full min-h-[48px] py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 fonte-display font-extrabold text-base cursor-pointer"
        >
          ENTENDI
        </button>
      </div>
    </div>
  </section>
</template>
