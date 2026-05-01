import axios from 'axios';

const API_BASE = 'https://locvac-production.up.railway.app';

export type TipoNotificacao = 'PROXIMA_VACINA' | 'NOVA_CAMPANHA' | 'VACINA_ATRASADA';

export interface NotificacaoDTO {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  diasOffset: number | null;
  lida: boolean;
  persistente: boolean;
  dataCriacao: string;
  agendaId: number | null;
  pessoaId: number | null;
  campanhaId: number | null;
}

export async function fetchNotificacoes(): Promise<NotificacaoDTO[]> {
  const response = await axios.get<NotificacaoDTO[]>(`${API_BASE}/notificacoes`);
  return response.data;
}

export async function marcarNotificacaoComoLida(id: number): Promise<void> {
  await axios.patch(`${API_BASE}/notificacoes/${id}/lida`);
}

export async function registrarPushToken(token: string, plataforma: string): Promise<void> {
  await axios.post(`${API_BASE}/notificacoes/push-tokens`, { token, plataforma });
}

export async function removerPushToken(token: string): Promise<void> {
  await axios.delete(`${API_BASE}/notificacoes/push-tokens/${encodeURIComponent(token)}`);
}
