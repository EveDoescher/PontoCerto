import { ref, computed, watch } from 'vue'
import type {
  SessaoJogo,
  Grupo,
  PredefinicaoJogo,
  ModoSessao,
  RegistroTrocaGrupo,
  AcaoPontuacaoHistorico,
  TemaCorGrupo,
} from '../types'

const CHAVE_STORAGE_SESSOES = 'contador_pontos_sessoes_ptbr_v1'
const CHAVE_STORAGE_SESSAO_ATUAL = 'contador_pontos_sessao_atual_ptbr_v1'

export const NAIPES_BARALHO = [
  'mdi:cards-spade',
  'mdi:cards-heart',
  'mdi:cards-club',
  'mdi:cards-diamond',
] as const

export const NOMES_PADRAO_GRUPOS = [
  'Nós',
  'Eles',
  'Vós',
  'Elas',
  'Vocês',
  'Outros',
  'Aqueles',
  'Estes',
] as const

export function obterNomePadraoGrupo(
  indice: number,
  nomesExistentes: string[] = []
): string {
  if (nomesExistentes.length > 0) {
    const usados = new Set(nomesExistentes.map((n) => n.trim().toLowerCase()))
    const disponivel = NOMES_PADRAO_GRUPOS.find(
      (nome) => !usados.has(nome.toLowerCase())
    )
    if (disponivel) return disponivel
  }
  return NOMES_PADRAO_GRUPOS[indice] ?? `Grupo ${indice + 1}`
}

export function obterNaipePorIndice(indice: number): string {
  return NAIPES_BARALHO[Math.abs(indice) % NAIPES_BARALHO.length]!
}

export function obterIconeJogo(tituloOuId?: string, iconeSalvo?: string): string {
  if (iconeSalvo) return iconeSalvo
  const t = (tituloOuId ?? '').toLowerCase()
  if (t.includes('domin')) return 'game-icons:domino-tiles'
  if (t.includes('vôlei') || t.includes('volei') || t.includes('pelada')) return 'mdi:volleyball'
  if (t.includes('sinuca') || t.includes('bilhar') || t.includes('livre')) return 'mdi:billiards-rack'
  return 'mdi:cards-playing-spade-multiple'
}

export function formatarDuracaoHMS(totalSegundos: number): string {
  const segs = Math.max(0, Math.floor(totalSegundos))
  const horas = Math.floor(segs / 3600)
  const minutos = Math.floor((segs % 3600) / 60)
  const segundos = segs % 60
  const hh = String(horas).padStart(2, '0')
  const mm = String(minutos).padStart(2, '0')
  const ss = String(segundos).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function calcularSegundosDecorridos(inicioIso?: string, fimMs = Date.now()): number {
  if (!inicioIso) return 0
  const inicioMs = new Date(inicioIso).getTime()
  if (Number.isNaN(inicioMs)) return 0
  return Math.max(0, Math.floor((fimMs - inicioMs) / 1000))
}

export const CORES_GRUPOS: TemaCorGrupo[] = [
  {
    id: 'emerald',
    nome: 'Verde Pano',
    gradiente: 'bg-[#156d45]',
    borda: 'border-[#2ea36c]',
    emblema: 'bg-[#134e35] text-[#b4f5d3] border-[#29855a]',
    textoSecundario: 'text-[#c3f7dc]',
  },
  {
    id: 'rose',
    nome: 'Carmim',
    gradiente: 'bg-[#b92b27]',
    borda: 'border-[#e45c58]',
    emblema: 'bg-[#6e1b19] text-[#ffd1cf] border-[#b92b27]',
    textoSecundario: 'text-[#ffd8d6]',
  },
  {
    id: 'blue',
    nome: 'Azul Real',
    gradiente: 'bg-[#1c4f9c]',
    borda: 'border-[#4a82d9]',
    emblema: 'bg-[#153466] text-[#cfe2ff] border-[#2c64b8]',
    textoSecundario: 'text-[#d4e5ff]',
  },
  {
    id: 'amber',
    nome: 'Ouro Velho',
    gradiente: 'bg-[#b86514]',
    borda: 'border-[#e89538]',
    emblema: 'bg-[#63370c] text-[#ffe5bf] border-[#a85c12]',
    textoSecundario: 'text-[#ffebcc]',
  },
  {
    id: 'purple',
    nome: 'Violeta',
    gradiente: 'bg-[#5c258c]',
    borda: 'border-[#9155c7]',
    emblema: 'bg-[#3b1859] text-[#ead6ff] border-[#6f30a6]',
    textoSecundario: 'text-[#eedcff]',
  },
  {
    id: 'cyan',
    nome: 'Turquesa',
    gradiente: 'bg-[#126878]',
    borda: 'border-[#339db0]',
    emblema: 'bg-[#0d434d] text-[#c4f4fc] border-[#1f7d8f]',
    textoSecundario: 'text-[#ccf6fd]',
  },
  {
    id: 'pink',
    nome: 'Magenta',
    gradiente: 'bg-[#9c225d]',
    borda: 'border-[#d44e8f]',
    emblema: 'bg-[#591335] text-[#ffd4e9] border-[#a82866]',
    textoSecundario: 'text-[#ffd9ec]',
  },
  {
    id: 'lime',
    nome: 'Folha',
    gradiente: 'bg-[#3f6e18]',
    borda: 'border-[#6da838]',
    emblema: 'bg-[#294710] text-[#dcf7c3] border-[#4e851f]',
    textoSecundario: 'text-[#e3f9ce]',
  },
]

export const PREDEFINICOES_JOGO: PredefinicaoJogo[] = [
  {
    id: 'truco',
    nome: 'Truco',
    icone: 'mdi:cards-playing-spade-multiple',
    descricao: 'Até 12 pts (1 em 1) com atalhos +3, +6, +9 e +12',
    passoPontos: 1,
    pontosVitoria: 12,
    atalhosExtras: [3, 6, 9, 12],
    gruposPadrao: 2,
    modo: 'todos',
  },
  {
    id: 'domino',
    nome: 'Dominó',
    icone: 'game-icons:domino-tiles',
    descricao: 'Até 100 pontos, somando de 5 em 5 (atalhos +10, +20)',
    passoPontos: 5,
    pontosVitoria: 100,
    atalhosExtras: [10, 15, 20],
    gruposPadrao: 2,
    modo: 'todos',
  },
  {
    id: 'volei-pelada',
    nome: 'Vôlei / Pelada',
    icone: 'mdi:volleyball',
    descricao: 'Até 15 pts, somando de 1 em 1',
    passoPontos: 1,
    pontosVitoria: 15,
    atalhosExtras: [],
    gruposPadrao: 2,
    modo: 'todos',
  },
  {
    id: 'livre',
    nome: 'Livre / Personalizado',
    icone: 'mdi:billiards-rack',
    descricao: 'Configure os pontos, atalhos e grupos como preferir',
    passoPontos: 1,
    pontosVitoria: 21,
    atalhosExtras: [2, 3, 5],
    gruposPadrao: 2,
    modo: 'todos',
  },
]

function carregarSessoes(): SessaoJogo[] {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE_SESSOES)
    if (!bruto) return []
    return JSON.parse(bruto) as SessaoJogo[]
  } catch (e) {
    console.error('Erro ao carregar sessões do localStorage:', e)
    return []
  }
}

function carregarIdSessaoAtual(): string | null {
  try {
    return localStorage.getItem(CHAVE_STORAGE_SESSAO_ATUAL)
  } catch {
    return null
  }
}

const sessoes = ref<SessaoJogo[]>(carregarSessoes())
const sessaoAtualId = ref<string | null>(carregarIdSessaoAtual())

watch(
  sessoes,
  (valor) => {
    try {
      localStorage.setItem(CHAVE_STORAGE_SESSOES, JSON.stringify(valor))
    } catch (e) {
      console.error('Erro ao salvar sessões no localStorage:', e)
    }
  },
  { deep: true }
)

watch(sessaoAtualId, (valor) => {
  try {
    if (valor) {
      localStorage.setItem(CHAVE_STORAGE_SESSAO_ATUAL, valor)
    } else {
      localStorage.removeItem(CHAVE_STORAGE_SESSAO_ATUAL)
    }
  } catch (e) {
    console.error('Erro ao salvar ID da sessão atual:', e)
  }
})

export function obterTemaCor(corId: string): TemaCorGrupo {
  return CORES_GRUPOS.find((c) => c.id === corId) ?? CORES_GRUPOS[0]!
}

export function useGameStore() {
  const sessaoAtual = computed<SessaoJogo | null>(() => {
    if (!sessaoAtualId.value) return null
    return sessoes.value.find((s) => s.id === sessaoAtualId.value) ?? null
  })

  function criarSessao(config: {
    titulo: string
    icone?: string
    passoPontos: number
    pontosVitoria: number
    atalhosExtras: number[]
    modo: ModoSessao
    tamanhoMesa: number
    grupos: { nome: string; cor: string }[]
  }): SessaoJogo {
    const agora = new Date().toISOString()
    const gruposCriados: Grupo[] = config.grupos.map((g, idx) => ({
      id: `grp_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      nome: g.nome.trim() || obterNomePadraoGrupo(idx),
      cor: g.cor || CORES_GRUPOS[idx % CORES_GRUPOS.length]!.id,
      vitorias: 0,
    }))

    const tamanhoEfetivoMesa =
      config.modo === 'fila'
        ? Math.min(Math.max(2, config.tamanhoMesa), gruposCriados.length)
        : gruposCriados.length

    const gruposAtivosIds = gruposCriados.slice(0, tamanhoEfetivoMesa).map((g) => g.id)
    const gruposFilaIds =
      config.modo === 'fila'
        ? gruposCriados.slice(tamanhoEfetivoMesa).map((g) => g.id)
        : []

    const pontuacoesAtuais: Record<string, number> = {}
    for (const g of gruposCriados) {
      pontuacoesAtuais[g.id] = 0
    }

    const tituloFinal =
      config.titulo.trim() ||
      `Partida (${config.passoPontos} em ${config.passoPontos} até ${config.pontosVitoria})`

    const novaSessao: SessaoJogo = {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      titulo: tituloFinal,
      icone: config.icone || obterIconeJogo(tituloFinal),
      criadaEm: agora,
      atualizadaEm: agora,
      inicioPartidaAtualEm: agora,
      passoPontos: Math.max(1, config.passoPontos),
      pontosVitoria: Math.max(1, config.pontosVitoria),
      atalhosExtras: [...config.atalhosExtras].filter((n) => n > 0),
      modo: config.modo,
      tamanhoMesa: tamanhoEfetivoMesa,
      grupos: gruposCriados,
      gruposAtivosIds,
      gruposFilaIds,
      pontuacoesAtuais,
      historicoAcoesPartida: [],
      trocasPendentes: [],
      partidas: [],
      status: 'ativa',
    }

    sessoes.value.unshift(novaSessao)
    sessaoAtualId.value = novaSessao.id
    return novaSessao
  }

  function alterarPontos(
    grupoId: string,
    deltaPersonalizado?: number
  ): { atingiuMeta: boolean; novaPontuacao: number } {
    const s = sessaoAtual.value
    if (!s) return { atingiuMeta: false, novaPontuacao: 0 }

    const delta = deltaPersonalizado !== undefined ? deltaPersonalizado : s.passoPontos
    const anterior = s.pontuacoesAtuais[grupoId] ?? 0
    const nova = Math.max(0, anterior + delta)

    if (nova !== anterior) {
      const grp = s.grupos.find((g) => g.id === grupoId)
      s.historicoAcoesPartida.push({
        grupoId,
        nomeGrupo: grp?.nome ?? 'Grupo',
        pontosAnteriores: anterior,
        pontosNovos: nova,
        delta: nova - anterior,
      })
    }

    s.pontuacoesAtuais[grupoId] = nova
    s.atualizadaEm = new Date().toISOString()

    return {
      atingiuMeta: nova >= s.pontosVitoria && delta > 0,
      novaPontuacao: nova,
    }
  }

  function desfazerUltimaAcao(): AcaoPontuacaoHistorico | null {
    const s = sessaoAtual.value
    if (!s || s.historicoAcoesPartida.length === 0) return null

    const ultima = s.historicoAcoesPartida.pop()!
    s.pontuacoesAtuais[ultima.grupoId] = ultima.pontosAnteriores
    s.atualizadaEm = new Date().toISOString()
    return ultima
  }

  function zerarPlacarAtual() {
    const s = sessaoAtual.value
    if (!s) return
    const agora = new Date().toISOString()
    for (const id of Object.keys(s.pontuacoesAtuais)) {
      s.pontuacoesAtuais[id] = 0
    }
    s.historicoAcoesPartida = []
    s.inicioPartidaAtualEm = agora
    s.atualizadaEm = agora
  }

  function atualizarRegrasSessao(
    passoPontos: number,
    pontosVitoria: number,
    titulo?: string,
    atalhosExtras?: number[]
  ) {
    const s = sessaoAtual.value
    if (!s) return
    s.passoPontos = Math.max(1, passoPontos)
    s.pontosVitoria = Math.max(1, pontosVitoria)
    if (titulo !== undefined && titulo.trim()) {
      s.titulo = titulo.trim()
      s.icone = obterIconeJogo(s.titulo, s.icone)
    }
    if (atalhosExtras !== undefined) {
      s.atalhosExtras = [...atalhosExtras].filter((n) => n > 0)
    }
    s.atualizadaEm = new Date().toISOString()
  }

  function adicionarNovoGrupoNaSessao(
    nome: string,
    cor?: string,
    colocarNaMesaImediatamente = false
  ): Grupo | null {
    const s = sessaoAtual.value
    if (!s) return null
    const idx = s.grupos.length
    const novoGrupo: Grupo = {
      id: `grp_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      nome:
        nome.trim() ||
        obterNomePadraoGrupo(
          idx,
          s.grupos.map((g) => g.nome)
        ),
      cor: cor || CORES_GRUPOS[idx % CORES_GRUPOS.length]!.id,
      vitorias: 0,
    }
    s.grupos.push(novoGrupo)
    s.pontuacoesAtuais[novoGrupo.id] = 0

    if (s.modo === 'todos' || colocarNaMesaImediatamente) {
      s.gruposAtivosIds.push(novoGrupo.id)
      s.trocasPendentes.push({
        horario: new Date().toISOString(),
        gruposSairam: [],
        gruposEntraram: [novoGrupo.nome],
        observacao: 'Novo grupo entrou na mesa',
      })
    } else {
      s.gruposFilaIds.push(novoGrupo.id)
    }

    s.atualizadaEm = new Date().toISOString()
    return novoGrupo
  }

  function trocarGruposAtivos(novosAtivosIds: string[], observacao = 'Troca de grupos') {
    const s = sessaoAtual.value
    if (!s || novosAtivosIds.length === 0) return

    const conjuntoAntigo = new Set(s.gruposAtivosIds)
    const conjuntoNovo = new Set(novosAtivosIds)

    const gruposSairam = s.gruposAtivosIds
      .filter((id) => !conjuntoNovo.has(id))
      .map((id) => s.grupos.find((g) => g.id === id)?.nome || 'Grupo')

    const gruposEntraram = novosAtivosIds
      .filter((id) => !conjuntoAntigo.has(id))
      .map((id) => s.grupos.find((g) => g.id === id)?.nome || 'Grupo')

    if (gruposSairam.length > 0 || gruposEntraram.length > 0) {
      const registroTroca: RegistroTrocaGrupo = {
        horario: new Date().toISOString(),
        gruposSairam,
        gruposEntraram,
        observacao,
      }
      s.trocasPendentes.push(registroTroca)
    }

    const restantesNaFila = s.gruposFilaIds.filter((id) => !conjuntoNovo.has(id))
    const idsQueSairam = s.gruposAtivosIds.filter((id) => !conjuntoNovo.has(id))

    s.gruposAtivosIds = [...novosAtivosIds]
    s.gruposFilaIds = [
      ...restantesNaFila,
      ...idsQueSairam.filter((id) => !restantesNaFila.includes(id)),
    ]

    for (const id of s.gruposAtivosIds) {
      if (s.pontuacoesAtuais[id] === undefined) {
        s.pontuacoesAtuais[id] = 0
      }
    }

    s.atualizadaEm = new Date().toISOString()
  }

  function finalizarPartidaEPrepararProxima(opcoes: {
    grupoVencedorId: string
    proximosGruposAtivosIds?: string[]
    observacaoTroca?: string
    encerrarSessao?: boolean
  }) {
    const s = sessaoAtual.value
    if (!s) return

    const agoraMs = Date.now()
    const agoraIso = new Date(agoraMs).toISOString()
    const duracaoSegundos = calcularSegundosDecorridos(
      s.inicioPartidaAtualEm ?? s.criadaEm,
      agoraMs
    )
    const duracaoFormatada = formatarDuracaoHMS(duracaoSegundos)

    const vencedor = s.grupos.find((g) => g.id === opcoes.grupoVencedorId)
    if (vencedor) {
      vencedor.vitorias += 1
    }

    const pontuacoes = s.gruposAtivosIds.map((id) => {
      const grp = s.grupos.find((g) => g.id === id)
      return {
        grupoId: id,
        nomeGrupo: grp?.nome ?? 'Grupo',
        cor: grp?.cor ?? 'emerald',
        pontos: s.pontuacoesAtuais[id] ?? 0,
      }
    })

    const registroPartida = {
      id: `part_${agoraMs}_${Math.random().toString(36).slice(2, 6)}`,
      numeroPartida: s.partidas.length + 1,
      finalizadaEm: agoraIso,
      duracaoSegundos,
      duracaoFormatada,
      pontuacoes,
      grupoVencedorId: opcoes.grupoVencedorId,
      nomeGrupoVencedor: vencedor?.nome ?? 'Vencedor',
      trocas: [...s.trocasPendentes],
    }

    s.partidas.unshift(registroPartida)
    s.trocasPendentes = []
    s.historicoAcoesPartida = []
    s.inicioPartidaAtualEm = agoraIso

    for (const g of s.grupos) {
      s.pontuacoesAtuais[g.id] = 0
    }

    if (opcoes.proximosGruposAtivosIds && opcoes.proximosGruposAtivosIds.length > 0) {
      trocarGruposAtivos(
        opcoes.proximosGruposAtivosIds,
        opcoes.observacaoTroca || 'Rodízio após partida'
      )
    }

    if (opcoes.encerrarSessao) {
      s.status = 'finalizada'
      sessaoAtualId.value = null
    }

    s.atualizadaEm = agoraIso
  }

  function retomarSessao(sessaoId: string) {
    const alvo = sessoes.value.find((s) => s.id === sessaoId)
    if (!alvo) return
    const agora = new Date().toISOString()
    alvo.status = 'ativa'
    if (!alvo.inicioPartidaAtualEm) {
      alvo.inicioPartidaAtualEm = agora
    }
    alvo.atualizadaEm = agora
    sessaoAtualId.value = alvo.id
  }

  function excluirSessao(sessaoId: string) {
    sessoes.value = sessoes.value.filter((s) => s.id !== sessaoId)
    if (sessaoAtualId.value === sessaoId) {
      sessaoAtualId.value = null
    }
  }

  function limparTodoHistorico() {
    sessoes.value = []
    sessaoAtualId.value = null
  }

  function importarHistorico(novasSessoes: SessaoJogo[]) {
    sessoes.value = novasSessoes
    if (
      !sessaoAtualId.value ||
      !novasSessoes.some((s) => s.id === sessaoAtualId.value)
    ) {
      const ativa = novasSessoes.find((s) => s.status === 'ativa')
      sessaoAtualId.value = ativa ? ativa.id : null
    }
  }

  return {
    sessoes,
    sessaoAtualId,
    sessaoAtual,
    criarSessao,
    alterarPontos,
    desfazerUltimaAcao,
    zerarPlacarAtual,
    atualizarRegrasSessao,
    adicionarNovoGrupoNaSessao,
    trocarGruposAtivos,
    finalizarPartidaEPrepararProxima,
    retomarSessao,
    excluirSessao,
    limparTodoHistorico,
    importarHistorico,
  }
}
