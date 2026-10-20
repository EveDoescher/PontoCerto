export interface Grupo {
  id: string
  nome: string
  cor: string
  vitorias: number
}

export interface RegistroTrocaGrupo {
  horario: string
  gruposSairam: string[]
  gruposEntraram: string[]
  observacao?: string
}

export interface PontuacaoPartida {
  grupoId: string
  nomeGrupo: string
  cor: string
  pontos: number
}

export interface RegistroPartida {
  id: string
  numeroPartida: number
  finalizadaEm: string
  duracaoSegundos?: number
  duracaoFormatada?: string
  pontuacoes: PontuacaoPartida[]
  grupoVencedorId: string
  nomeGrupoVencedor: string
  trocas: RegistroTrocaGrupo[]
}

export interface AcaoPontuacaoHistorico {
  grupoId: string
  nomeGrupo: string
  pontosAnteriores: number
  pontosNovos: number
  delta: number
}

export type ModoSessao = 'todos' | 'fila'

export interface SessaoJogo {
  id: string
  titulo: string
  icone?: string
  criadaEm: string
  atualizadaEm: string
  inicioPartidaAtualEm?: string
  passoPontos: number
  pontosVitoria: number
  atalhosExtras: number[]
  modo: ModoSessao
  tamanhoMesa: number
  grupos: Grupo[]
  gruposAtivosIds: string[]
  gruposFilaIds: string[]
  pontuacoesAtuais: Record<string, number>
  historicoAcoesPartida: AcaoPontuacaoHistorico[]
  trocasPendentes: RegistroTrocaGrupo[]
  partidas: RegistroPartida[]
  status: 'ativa' | 'finalizada'
}

export interface PredefinicaoJogo {
  id: string
  nome: string
  icone: string
  descricao: string
  passoPontos: number
  pontosVitoria: number
  atalhosExtras: number[]
  gruposPadrao: number
  modo: ModoSessao
}

export interface TemaCorGrupo {
  id: string
  nome: string
  gradiente: string
  borda: string
  emblema: string
  textoSecundario: string
}
