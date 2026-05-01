import axios from 'axios';
import { Campanha } from '../types/vaccination';

const API_BASE = 'https://locvac-production.up.railway.app';

export async function fetchCampaigns(): Promise<Campanha[]> {
	const response = await axios.get(`${API_BASE}/campanhas`);
	return response.data;
}

export type ParticipacaoDTO = {
  id: number;
  idPessoa: number;
  idCampanha: number;
  dataParticipacao: string;
  nomeCampanha?: string;
};

export async function fetchParticipacoesByPessoa(idPessoa: number): Promise<ParticipacaoDTO[]> {
  const response = await axios.get(`${API_BASE}/participacaoCampanha/por-pessoa/${idPessoa}`);
  return response.data;
}

export async function addParticipacaoCampanha({ idPessoa, idCampanha, dataParticipacao }: { idPessoa: number, idCampanha: number, dataParticipacao: string }) {
  return axios.post(`${API_BASE}/participacaoCampanha/novaParticipacao`, {
    idPessoa,
    idCampanha,
    dataParticipacao
  });
}

export async function updateParticipacaoCampanha({ id, idPessoa, idCampanha, dataParticipacao }: { id: number, idPessoa: number, idCampanha: number, dataParticipacao: string }) {
  return axios.put(`${API_BASE}/participacaoCampanha/${id}`, {
    idPessoa,
    idCampanha,
    dataParticipacao
  });
}
