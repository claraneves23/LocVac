// Busca participações de campanha por pessoa
export async function fetchParticipacoesByPessoa(idPessoa: number) {
  const response = await axios.get(`http://192.168.0.148:8080/participacaoCampanha/por-pessoa/${idPessoa}`);
  return response.data;
}
import axios from 'axios';
import { Campanha } from '../types/vaccination';

const API_URL = 'http://192.168.0.148:8080/campanhas'; // IP local para acesso via Expo Go

export async function fetchCampaigns(): Promise<Campanha[]> {
	const response = await axios.get(API_URL);
	return response.data;
}

// Envia uma participação de campanha para o backend
export async function addParticipacaoCampanha({ idPessoa, idCampanha, dataParticipacao }: { idPessoa: number, idCampanha: number, dataParticipacao: string }) {
  const API_URL = 'http://192.168.0.148:8080/participacaoCampanha/novaParticipacao';
  return axios.post(API_URL, {
    idPessoa,
    idCampanha,
    dataParticipacao
  });
}
