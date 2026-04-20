export type SecaoInformativaDTO = {
  id: number;
  idInformativo: number;
  tituloSecao: string;
  conteudo: string;
  ordemExibicao: number;
};

export type VacinaInformativoDTO = {
  id: number;
  idVacina: number;
  nomeVacina: string;
  versao: number;
  dataPublicacao: string;
  orgaoEmissor: string;
  fonteReferencia: string;
  secoes: SecaoInformativaDTO[];
};

export type EfeitoColateralDTO = {
  id: number;
  idVacina: number;
  nomeVacina: string;
  descricao: string;
  severidade: 'LEVE' | 'MODERADA' | 'GRAVE';
  orientacao: string;
};
