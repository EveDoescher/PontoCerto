<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  Trophy,
  ArrowLeftRight,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp,
  Timer,
} from 'lucide-vue-next'
import { obterTemaCor, obterIconeJogo } from '../composables/useGameStore'
import type { SessaoJogo } from '../types'

defineProps<{
  sessao: SessaoJogo
  ehSessaoAtual: boolean
  expandido: boolean
}>()

const emit = defineEmits<{
  (e: 'alternar-expansao'): void
  (e: 'retomar'): void
  (e: 'excluir'): void
}>()

function formatarData(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
</script>

<template>
  <article class="py-4 lg:py-6 space-y-3 lg:space-y-4">
    <!-- Linha Principal da Sessão -->
    <div
      @click="emit('alternar-expansao')"
      class="flex flex-wrap items-center justify-between gap-2 lg:gap-4 cursor-pointer"
    >
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2 lg:gap-3">
          <Icon
            :icon="obterIconeJogo(sessao.titulo, sessao.icone)"
            class="w-4 h-4 lg:w-6 lg:h-6 text-amber-400 shrink-0"
          />
          <h3 class="fonte-display text-xl lg:text-2xl font-extrabold text-[#faf6f0] break-words">
            {{ sessao.titulo }}
          </h3>
          <span class="numeral-placar text-xs lg:text-sm px-2 lg:px-3 py-0.5 lg:py-1 rounded-md lg:rounded-lg bg-[#1e1a17] border border-[#332c27] text-amber-400 font-extrabold shrink-0">
            +{{ sessao.passoPontos }} • Meta {{ sessao.pontosVitoria }}
          </span>
        </div>
        <p class="text-xs lg:text-sm text-[#b5a898] mt-0.5 lg:mt-1">
          {{ formatarData(sessao.atualizadaEm) }} • {{ sessao.partidas.length }}
          {{ sessao.partidas.length === 1 ? 'partida' : 'partidas' }}
        </p>
      </div>

      <div class="flex items-center gap-1.5 lg:gap-2 shrink-0" @click.stop>
        <button
          type="button"
          @click="emit('retomar')"
          class="min-h-[38px] lg:min-h-[44px] px-3.5 lg:px-5 py-1.5 lg:py-2 rounded-xl bg-amber-400 text-amber-950 font-black text-xs lg:text-sm flex items-center gap-1 lg:gap-1.5 cursor-pointer"
        >
          <Play class="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" />
          <span>{{ ehSessaoAtual ? 'Abrir' : 'Retomar' }}</span>
        </button>

        <button
          type="button"
          @click="emit('excluir')"
          title="Excluir sessão"
          class="min-h-[38px] lg:min-h-[44px] min-w-[38px] lg:min-w-[44px] p-2 lg:p-2.5 rounded-xl bg-[#1e1a17] border border-[#332c27] text-[#b5a898] hover:text-[#faf6f0] flex items-center justify-center cursor-pointer"
        >
          <Trash2 class="w-4 h-4 lg:w-5 lg:h-5" />
        </button>

        <button
          type="button"
          @click="emit('alternar-expansao')"
          aria-label="Ver detalhes"
          class="min-h-[38px] lg:min-h-[44px] min-w-[38px] lg:min-w-[44px] p-2 lg:p-2.5 rounded-xl bg-[#1e1a17] border border-[#332c27] text-[#b5a898] hover:text-[#faf6f0] flex items-center justify-center cursor-pointer"
        >
          <ChevronUp v-if="expandido" class="w-4 h-4 lg:w-5 lg:h-5" />
          <ChevronDown v-else class="w-4 h-4 lg:w-5 lg:h-5" />
        </button>
      </div>
    </div>

    <!-- Placar Geral de Vitórias dos Grupos -->
    <div class="flex flex-wrap gap-1.5 lg:gap-2.5">
      <span
        v-for="g in [...sessao.grupos].sort((a, b) => b.vitorias - a.vitorias)"
        :key="g.id"
        :class="[
          'inline-flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1 lg:py-1.5 rounded-xl text-xs lg:text-sm font-extrabold text-white border',
          obterTemaCor(g.cor).gradiente,
          obterTemaCor(g.cor).borda,
        ]"
      >
        <Trophy class="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        <span>{{ g.nome }}:</span>
        <span class="numeral-placar">{{ g.vitorias }}V</span>
      </span>
    </div>

    <!-- Lista de Partidas, Duração (HH:MM:SS) e Trocas de Grupos -->
    <div v-if="expandido" class="pt-2 space-y-2 lg:space-y-3 text-xs lg:text-sm">
      <div v-if="sessao.partidas.length === 0" class="text-[#b5a898]">
        Placar atual:
        {{
          sessao.gruposAtivosIds
            .map((id) => {
              const grp = sessao.grupos.find((g) => g.id === id)
              return `${grp?.nome ?? 'Grupo'} ${sessao.pontuacoesAtuais[id] ?? 0}`
            })
            .join(' × ')
        }}
      </div>

      <div
        v-for="p in sessao.partidas"
        :key="p.id"
        class="py-2.5 lg:py-3.5 border-t border-[#332c27]/60 space-y-1.5 lg:space-y-2"
      >
        <!-- Registro de Troca de Grupos -->
        <div
          v-for="(tr, tIdx) in p.trocas"
          :key="tIdx"
          class="flex flex-wrap items-center gap-1.5 text-xs lg:text-sm text-amber-400 font-bold"
        >
          <ArrowLeftRight class="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
          <span v-if="tr.gruposSairam.length > 0">
            Saiu: {{ tr.gruposSairam.join(', ') }}
          </span>
          <span v-if="tr.gruposSairam.length > 0 && tr.gruposEntraram.length > 0">→</span>
          <span v-if="tr.gruposEntraram.length > 0">
            Entrou: {{ tr.gruposEntraram.join(', ') }}
          </span>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 lg:gap-4">
          <div class="flex flex-wrap items-center gap-1.5 lg:gap-2.5">
            <span class="numeral-placar text-[#b5a898] font-extrabold">#{{ p.numeroPartida }}</span>
            <span
              v-if="p.duracaoFormatada"
              title="Duração da partida"
              class="inline-flex items-center gap-1 lg:gap-1.5 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-md lg:rounded-lg bg-[#1e1a17] border border-[#332c27] text-[#b5a898] numeral-placar text-[11px] lg:text-xs font-bold"
            >
              <Timer class="w-3 h-3 lg:w-3.5 lg:h-3.5 text-amber-400" />
              <span>{{ p.duracaoFormatada }}</span>
            </span>
            <span
              v-for="sc in p.pontuacoes"
              :key="sc.grupoId"
              :class="[
                'numeral-placar px-2.5 lg:px-3.5 py-0.5 lg:py-1 rounded-lg lg:rounded-xl text-xs lg:text-sm font-extrabold text-white border',
                obterTemaCor(sc.cor).gradiente,
                obterTemaCor(sc.cor).borda,
              ]"
            >
              {{ sc.nomeGrupo }}: {{ sc.pontos }}
            </span>
          </div>

          <span class="inline-flex items-center gap-1 lg:gap-1.5 font-extrabold text-amber-400 shrink-0">
            <Trophy class="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            <span>{{ p.nomeGrupoVencedor }}</span>
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
