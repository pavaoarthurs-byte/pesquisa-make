export interface SurveyData {
  cpfCnpj: string;
  nome: string;
  telefone: string;
  notaAtendimento: number | null;
  notaTempoEspera: number | null;
  notaRecomendacao: number | null;
  melhorCoisa: string;
  piorCoisa: string;
  sugestao: string;
}

export interface SheetPayload {
  id: string; // Unique ID
  tel: string;
  nome: string;
  cpfcnpj_autor: string;
  nota_atendimento: number;
  nota_comprando: number; // Mapping "Tempo de espera" to requested column "nota_comprando" or closest fit, strictly mapping logic in service
  nota_recomendar: number;
  melhor_: string;
  pior_: string;
  sugest: string;
  dtpesquisa: string;
}

export enum SurveyStep {
  INTRO = -1,
  CPF_CNPJ = 0,
  NOME = 1,
  TELEFONE = 2,
  NOTA_ATENDIMENTO = 3,
  NOTA_TEMPO = 4,
  NOTA_RECOMENDACAO = 5,
  MELHOR_COISA = 6,
  PIOR_COISA = 7,
  SUGESTAO = 8,
  FINAL = 9
}