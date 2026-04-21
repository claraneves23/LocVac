export type SecaoInformativaDTO = {
  id: number;
  idInformativo: number;
  tituloSecao: string;
  conteudo: string;
  ordemExibicao: number;
};

export type CarrosselItemDTO = {
  id: number;
  titulo: string;
  descricao: string;
  imagemUrl: string;
  ordemExibicao: number;
  ativo: boolean;
};

export type CarrosselConteudoDTO = {
  id: number;
  idCarrosselItem: number;
  tituloSecao: string;
  conteudo: string | null;
  itens: string[];
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
