<script setup lang="ts">
import { ref } from 'vue'
import {
  Trash2,
  PlusCircle,
  Download,
  Upload,
  TriangleAlert,
  X,
} from 'lucide-vue-next'
import ItemHistoricoSessao from './ItemHistoricoSessao.vue'
import { useGameStore } from '../composables/useGameStore'
import type { SessaoJogo } from '../types'

const emit = defineEmits<{
  (e: 'retomar'): void
  (e: 'novo-jogo'): void
}>()

const store = useGameStore()
const idsExpandidos = ref<Record<string, boolean>>({})
const inputArquivoRef = ref<HTMLInputElement | null>(null)

// Estado dos modais e avisos
const modalExclusao = ref<{
  aberto: boolean
  tipo: 'tudo' | 'sessao'
  sessaoAlvo: SessaoJogo | null
}>({
  aberto: false,
  tipo: 'tudo',
  sessaoAlvo: null,
})

const sessoesPendentesImportacao = ref<SessaoJogo[] | null>(null)
const mensagemFeedback = ref<{ texto: string; erro?: boolean } | null>(null)

function exibirFeedback(texto: string, erro = false) {
  mensagemFeedback.value = { texto, erro }
  setTimeout(() => {
    if (mensagemFeedback.value?.texto === texto) {
      mensagemFeedback.value = null
    }
  }, 4000)
}

function alternarExpansao(sessaoId: string) {
  idsExpandidos.value[sessaoId] = !idsExpandidos.value[sessaoId]
}

function estaExpandido(sessaoId: string, index: number) {
  if (idsExpandidos.value[sessaoId] === undefined) {
    return index === 0
  }
  return idsExpandidos.value[sessaoId]
}

function aoRetomar(sessaoId: string) {
  store.retomarSessao(sessaoId)
  emit('retomar')
}

// Exportar (Baixar) Histórico
function baixarHistorico() {
  if (store.sessoes.value.length === 0) return
  const payload = {
    app: 'PlacarCerto',
    versao: 1,
    exportadoEm: new Date().toISOString(),
    sessoes: store.sessoes.value,
  }
  const conteudo = JSON.stringify(payload, null, 2)
  const blob = new Blob([conteudo], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const dataHoje = new Date().toISOString().slice(0, 10)
  const link = document.createElement('a')
  link.href = url
  link.download = `placarcerto-historico-${dataHoje}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Importar Histórico
function acionarSeletorArquivo() {
  inputArquivoRef.value?.click()
}

function extrairSessoesValidas(dados: unknown): SessaoJogo[] | null {
  const lista = Array.isArray(dados)
    ? dados
    : dados &&
        typeof dados === 'object' &&
        'sessoes' in dados &&
        Array.isArray((dados as { sessoes: unknown }).sessoes)
      ? (dados as { sessoes: unknown[] }).sessoes
      : null

  if (!lista) return null

  const validas = lista.filter(
    (item): item is SessaoJogo =>
      Boolean(
        item &&
          typeof item === 'object' &&
          'id' in item &&
          'titulo' in item &&
          'grupos' in item &&
          Array.isArray((item as SessaoJogo).grupos) &&
          'partidas' in item &&
          Array.isArray((item as SessaoJogo).partidas)
      )
  )

  return validas.length > 0 || lista.length === 0 ? validas : null
}

async function aoSelecionarArquivo(evento: Event) {
  const input = evento.target as HTMLInputElement
  const arquivo = input.files?.[0]
  input.value = ''
  if (!arquivo) return

  try {
    const texto = await arquivo.text()
    const json = JSON.parse(texto)
    const sessoesExtraidas = extrairSessoesValidas(json)

    if (!sessoesExtraidas || sessoesExtraidas.length === 0) {
      exibirFeedback('Arquivo inválido ou sem histórico compatível.', true)
      return
    }

    if (store.sessoes.value.length > 0) {
      sessoesPendentesImportacao.value = sessoesExtraidas
    } else {
      store.importarHistorico(sessoesExtraidas)
      exibirFeedback('Histórico importado com sucesso.')
    }
  } catch {
    exibirFeedback('Não foi possível ler o arquivo selecionado.', true)
  }
}

function confirmarImportacaoSobrescrevendo() {
  if (!sessoesPendentesImportacao.value) return
  store.importarHistorico(sessoesPendentesImportacao.value)
  sessoesPendentesImportacao.value = null
  exibirFeedback('Histórico substituído com sucesso.')
}

function cancelarImportacao() {
  sessoesPendentesImportacao.value = null
}

// Confirmação de Exclusão
function abrirModalExcluirTudo() {
  modalExclusao.value = {
    aberto: true,
    tipo: 'tudo',
    sessaoAlvo: null,
  }
}

function abrirModalExcluirSessao(sessao: SessaoJogo) {
  modalExclusao.value = {
    aberto: true,
    tipo: 'sessao',
    sessaoAlvo: sessao,
  }
}

function fecharModalExclusao() {
  modalExclusao.value.aberto = false
}

function confirmarExclusao() {
  if (modalExclusao.value.tipo === 'tudo') {
    store.limparTodoHistorico()
  } else if (modalExclusao.value.sessaoAlvo) {
    store.excluirSessao(modalExclusao.value.sessaoAlvo.id)
  }
  fecharModalExclusao()
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto px-3 sm:px-5 py-4 pb-20 space-y-4">
    <!-- Input oculto para importação de JSON -->
    <input
      ref="inputArquivoRef"
      type="file"
      accept=".json,application/json"
      class="hidden"
      @change="aoSelecionarArquivo"
    />

    <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#332c27]">
      <h2 class="fonte-display text-2xl font-extrabold text-[#faf6f0]">
        Histórico Local ({{ store.sessoes.value.length }})
      </h2>

      <div class="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          @click="acionarSeletorArquivo"
          title="Importar histórico salvo (.json)"
          class="min-h-[36px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1e1a17] hover:bg-[#2a2420] border border-[#332c27] text-[#b5a898] hover:text-[#faf6f0] text-xs font-bold cursor-pointer transition"
        >
          <Upload class="w-3.5 h-3.5 text-amber-400" />
          <span>Importar</span>
        </button>

        <button
          v-if="store.sessoes.value.length > 0"
          type="button"
          @click="baixarHistorico"
          title="Baixar cópia do histórico (.json)"
          class="min-h-[36px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1e1a17] hover:bg-[#2a2420] border border-[#332c27] text-[#b5a898] hover:text-[#faf6f0] text-xs font-bold cursor-pointer transition"
        >
          <Download class="w-3.5 h-3.5 text-amber-400" />
          <span>Baixar</span>
        </button>

        <button
          v-if="store.sessoes.value.length > 0"
          type="button"
          @click="abrirModalExcluirTudo"
          class="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1a17] hover:bg-[#2a2420] border border-[#332c27] text-amber-400 text-xs font-extrabold cursor-pointer transition"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Limpar histórico</span>
        </button>
      </div>
    </div>

    <!-- Aviso rápido de feedback (importação / erro) -->
    <div
      v-if="mensagemFeedback"
      class="px-3.5 py-2.5 rounded-xl bg-[#1e1a17] border border-[#332c27] text-xs font-bold flex items-center justify-between gap-2"
      :class="mensagemFeedback.erro ? 'text-amber-400' : 'text-[#faf6f0]'"
    >
      <span>{{ mensagemFeedback.texto }}</span>
      <button
        type="button"
        @click="mensagemFeedback = null"
        class="text-[#b5a898] hover:text-[#faf6f0] cursor-pointer"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <div
      v-if="store.sessoes.value.length === 0"
      class="py-12 text-center space-y-4"
    >
      <p class="text-sm text-[#b5a898]">
        Nenhuma partida salva neste aparelho ainda.
      </p>
      <button
        type="button"
        @click="emit('novo-jogo')"
        class="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-amber-950 font-black text-xs cursor-pointer"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Configurar Nova Mesa</span>
      </button>
    </div>

    <div class="divide-y divide-[#332c27]">
      <ItemHistoricoSessao
        v-for="(sess, idx) in store.sessoes.value"
        :key="sess.id"
        :sessao="sess"
        :eh-sessao-atual="sess.id === store.sessaoAtualId.value"
        :expandido="estaExpandido(sess.id, idx)"
        @alternar-expansao="alternarExpansao(sess.id)"
        @retomar="aoRetomar(sess.id)"
        @excluir="abrirModalExcluirSessao(sess)"
      />
    </div>

    <!-- Modal de Confirmação para Deletar Histórico -->
    <div
      v-if="modalExclusao.aberto"
      class="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
      @click.self="fecharModalExclusao"
    >
      <div class="animar-entrada-folha bg-[#1e1a17] border-t sm:border border-[#332c27] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <TriangleAlert class="w-5 h-5 text-amber-400 shrink-0" />
            <h3 class="fonte-display text-xl font-extrabold text-[#faf6f0]">
              {{
                modalExclusao.tipo === 'tudo'
                  ? 'Excluir todo o histórico?'
                  : 'Excluir esta sessão?'
              }}
            </h3>
          </div>
          <button
            type="button"
            @click="fecharModalExclusao"
            class="p-1 text-[#b5a898] hover:text-[#faf6f0] cursor-pointer shrink-0"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2 text-xs text-[#b5a898] leading-relaxed">
          <p v-if="modalExclusao.tipo === 'sessao' && modalExclusao.sessaoAlvo">
            Você está prestes a remover a sessão
            <strong class="text-[#faf6f0]">{{ modalExclusao.sessaoAlvo.titulo }}</strong>.
          </p>
          <p>
            <strong class="text-[#faf6f0]">Esta ação é permanente</strong> e não poderá ser desfeita.
            Recomendamos <strong class="text-amber-400">baixar o histórico antes de excluir</strong> caso queira guardá-lo ou restaurá-lo depois.
          </p>
        </div>

        <button
          type="button"
          @click="baixarHistorico"
          class="w-full min-h-[40px] px-3.5 py-2 rounded-xl bg-[#12100e] hover:bg-[#2a2420] border border-[#332c27] text-[#faf6f0] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <Download class="w-4 h-4 text-amber-400" />
          <span>Baixar histórico primeiro</span>
        </button>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            @click="fecharModalExclusao"
            class="min-h-[44px] py-2.5 rounded-xl bg-[#12100e] border border-[#332c27] text-[#b5a898] hover:text-[#faf6f0] text-xs font-extrabold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmarExclusao"
            class="min-h-[44px] py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black cursor-pointer"
          >
            Excluir agora
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação para Importar Sobrescrevendo Histórico Existente -->
    <div
      v-if="sessoesPendentesImportacao"
      class="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
      @click.self="cancelarImportacao"
    >
      <div class="animar-entrada-folha bg-[#1e1a17] border-t sm:border border-[#332c27] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <TriangleAlert class="w-5 h-5 text-amber-400 shrink-0" />
            <h3 class="fonte-display text-xl font-extrabold text-[#faf6f0]">
              Substituir histórico atual?
            </h3>
          </div>
          <button
            type="button"
            @click="cancelarImportacao"
            class="p-1 text-[#b5a898] hover:text-[#faf6f0] cursor-pointer shrink-0"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-[#b5a898] leading-relaxed">
          Você já possui partidas salvas neste aparelho. Ao confirmar a importação,
          <strong class="text-[#faf6f0]">o histórico atual será sobrescrito</strong>
          pelas
          <strong class="text-amber-400">{{ sessoesPendentesImportacao.length }}</strong>
          {{ sessoesPendentesImportacao.length === 1 ? 'sessão do arquivo' : 'sessões do arquivo' }}.
        </p>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            @click="cancelarImportacao"
            class="min-h-[44px] py-2.5 rounded-xl bg-[#12100e] border border-[#332c27] text-[#b5a898] hover:text-[#faf6f0] text-xs font-extrabold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmarImportacaoSobrescrevendo"
            class="min-h-[44px] py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black cursor-pointer"
          >
            Sobrescrever
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
