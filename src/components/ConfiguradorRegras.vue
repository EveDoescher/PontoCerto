<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'

const props = defineProps<{
  titulo: string
  passoPontos: number
  pontosVitoria: number
  atalhosExtras: number[]
}>()

const emit = defineEmits<{
  (e: 'update:titulo', valor: string): void
  (e: 'update:passoPontos', valor: number): void
  (e: 'update:pontosVitoria', valor: number): void
  (e: 'update:atalhosExtras', valor: number[]): void
}>()

const opcoesAtalhos = [3, 6, 9, 10, 12, 15, 20]

function alternarAtalho(valor: number) {
  const atual = [...props.atalhosExtras]
  const idx = atual.indexOf(valor)
  if (idx >= 0) {
    atual.splice(idx, 1)
  } else {
    atual.push(valor)
    atual.sort((a, b) => a - b)
  }
  emit('update:atalhosExtras', atual)
}

function ajustarPasso(delta: number) {
  emit('update:passoPontos', Math.max(1, props.passoPontos + delta))
}

function ajustarMeta(delta: number) {
  emit('update:pontosVitoria', Math.max(1, props.pontosVitoria + delta))
}
</script>

<template>
  <section class="space-y-4">
    <!-- Nome da Partida direto na linha -->
    <div>
      <label for="campo-titulo" class="block text-xs font-bold text-[#b5a898] mb-1">
        Nome da sessão
      </label>
      <input
        id="campo-titulo"
        :value="titulo"
        @input="emit('update:titulo', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Ex: Truco de Sexta, Pelada..."
        class="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1a17] border border-[#332c27] focus:border-amber-400 text-[#faf6f0] placeholder-[#b5a898]/60 fonte-display text-xl font-extrabold focus:outline-none"
      />
    </div>

    <!-- Controles de Passo e Meta (1 coluna no mobile compacto, 2 colunas em telas >= 480px) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- Soma por toque -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label for="campo-passo" class="text-xs font-bold text-[#b5a898]">
            De quantos em quantos?
          </label>
          <div class="flex gap-1">
            <button
              v-for="p in [1, 2, 3, 5]"
              :key="p"
              type="button"
              @click="emit('update:passoPontos', p)"
              :class="[
                'px-2 py-0.5 rounded-md numeral-placar text-xs font-extrabold cursor-pointer',
                passoPontos === p
                  ? 'bg-amber-400 text-amber-950'
                  : 'bg-[#1e1a17] text-[#b5a898]',
              ]"
            >
              +{{ p }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between bg-[#1e1a17] border border-[#332c27] rounded-xl p-1.5">
          <button
            type="button"
            @click="ajustarPasso(-1)"
            class="w-11 h-11 rounded-lg bg-[#2a2420] active:scale-95 text-[#faf6f0] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Diminuir passo"
          >
            <Minus class="w-4 h-4" />
          </button>
          <input
            id="campo-passo"
            :value="passoPontos"
            @input="emit('update:passoPontos', Math.max(1, Number(($event.target as HTMLInputElement).value) || 1))"
            type="number"
            min="1"
            class="flex-1 min-w-0 bg-transparent text-center numeral-placar text-2xl font-extrabold text-amber-400 focus:outline-none"
          />
          <button
            type="button"
            @click="ajustarPasso(1)"
            class="w-11 h-11 rounded-lg bg-[#2a2420] active:scale-95 text-[#faf6f0] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Aumentar passo"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Pontos para vencer -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label for="campo-meta" class="text-xs font-bold text-[#b5a898]">
            Quantos pontos vence?
          </label>
          <div class="flex gap-1">
            <button
              v-for="m in [12, 15, 21, 100]"
              :key="m"
              type="button"
              @click="emit('update:pontosVitoria', m)"
              :class="[
                'px-2 py-0.5 rounded-md numeral-placar text-xs font-extrabold cursor-pointer',
                pontosVitoria === m
                  ? 'bg-amber-400 text-amber-950'
                  : 'bg-[#1e1a17] text-[#b5a898]',
              ]"
            >
              {{ m }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between bg-[#1e1a17] border border-[#332c27] rounded-xl p-1.5">
          <button
            type="button"
            @click="ajustarMeta(-1)"
            class="w-11 h-11 rounded-lg bg-[#2a2420] active:scale-95 text-[#faf6f0] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Diminuir meta"
          >
            <Minus class="w-4 h-4" />
          </button>
          <input
            id="campo-meta"
            :value="pontosVitoria"
            @input="emit('update:pontosVitoria', Math.max(1, Number(($event.target as HTMLInputElement).value) || 1))"
            type="number"
            min="1"
            class="flex-1 min-w-0 bg-transparent text-center numeral-placar text-2xl font-extrabold text-[#faf6f0] focus:outline-none"
          />
          <button
            type="button"
            @click="ajustarMeta(1)"
            class="w-11 h-11 rounded-lg bg-[#2a2420] active:scale-95 text-[#faf6f0] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Aumentar meta"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Atalhos extras numa linha simples -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-[#b5a898]">
          Atalhos de pontos extras no quadrado
        </span>
        <button
          v-if="atalhosExtras.length > 0"
          type="button"
          @click="emit('update:atalhosExtras', [])"
          class="text-xs font-bold text-amber-400 cursor-pointer"
        >
          Desativar
        </button>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="valor in opcoesAtalhos"
          :key="valor"
          type="button"
          @click="alternarAtalho(valor)"
          :class="[
            'min-h-[36px] px-3 py-1 rounded-lg numeral-placar text-xs font-extrabold border transition cursor-pointer',
            atalhosExtras.includes(valor)
              ? 'bg-amber-400 text-amber-950 border-amber-300'
              : 'bg-[#1e1a17] text-[#b5a898] border-[#332c27]',
          ]"
        >
          +{{ valor }}
        </button>
      </div>
    </div>
  </section>
</template>
