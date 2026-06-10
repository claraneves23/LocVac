import axios from 'axios';
import { API_BASE } from './apiConfig';

const API_URL = API_BASE;

export type ConviteResponse = {
  token: string;
  codigo: string;
  deepLink: string;
  expiraEm: string;
  pessoasNomes: string[];
};

export type ConvitePreviewItem = {
  idPessoa: number;
  nome: string;
  jaTenhoAcesso: boolean;
};

export type ConvitePreview = {
  dependentes: ConvitePreviewItem[];
  compartilhadoPorNome: string;
  podeEditar: boolean;
  expiraEm: string;
};

export type Acesso = {
  idUsuarioPessoa: number;
  usuarioNome: string;
  usuarioEmail: string;
  tipoVinculo: string | null;
  podeEditar: boolean;
  dataVinculo: string | null;
  ehVoce: boolean;
  ehDono: boolean;
};

/** Gera um único convite cobrindo um ou mais dependentes do usuário. */
export async function criarConvite(
  idsPessoa: Array<number | string>
): Promise<ConviteResponse> {
  const { data } = await axios.post<ConviteResponse>(`${API_URL}/compartilhamento/convites`, {
    idsPessoa: idsPessoa.map(Number),
  });
  return data;
}

/** Lê os dados de um convite (por token do QR ou código digitado) sem aceitá-lo. */
export async function previewConvite(tokenOuCodigo: string): Promise<ConvitePreview> {
  const { data } = await axios.get<ConvitePreview>(
    `${API_URL}/compartilhamento/convites/${encodeURIComponent(tokenOuCodigo.trim())}`
  );
  return data;
}

/**
 * Aceita o convite: vincula o dependente à conta autenticada.
 * `parentescos` mapeia o id da pessoa ao parentesco escolhido por quem aceita
 * (cada responsável define o próprio parentesco).
 */
export async function aceitarConvite(
  tokenOuCodigo: string,
  parentescos?: Record<number, string>
): Promise<void> {
  await axios.post(
    `${API_URL}/compartilhamento/convites/${encodeURIComponent(tokenOuCodigo.trim())}/aceitar`,
    parentescos ? { parentescos } : undefined
  );
}

/** Cancela um convite pendente (somente quem gerou). */
export async function cancelarConvite(tokenOuCodigo: string): Promise<void> {
  await axios.delete(
    `${API_URL}/compartilhamento/convites/${encodeURIComponent(tokenOuCodigo.trim())}`
  );
}

/** Lista quem tem acesso a um dependente. */
export async function listarAcessos(idPessoa: number | string): Promise<Acesso[]> {
  const { data } = await axios.get<Acesso[]>(
    `${API_URL}/compartilhamento/pessoa/${Number(idPessoa)}/acessos`
  );
  return data;
}

/** Revoga o acesso de um responsável (pelo id do vínculo usuario_pessoa). */
export async function revogarAcesso(idUsuarioPessoa: number | string): Promise<void> {
  await axios.delete(`${API_URL}/compartilhamento/acessos/${Number(idUsuarioPessoa)}`);
}

/**
 * Remove o vínculo do usuário autenticado com o dependente.
 * Se houver outros responsáveis, apenas desvincula; se for o último, exclui o dependente.
 */
export async function removerMeuAcesso(idPessoa: number | string): Promise<void> {
  await axios.delete(`${API_URL}/compartilhamento/pessoa/${Number(idPessoa)}/meu-acesso`);
}

/** Extrai o token de um link colado (locvac://importar?token=...) ou retorna o próprio valor. */
export function extrairToken(entrada: string): string {
  const valor = entrada.trim();
  const match = valor.match(/[?&]token=([^&\s]+)/i);
  return match ? decodeURIComponent(match[1]) : valor;
}
