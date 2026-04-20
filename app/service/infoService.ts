import axios from 'axios';
import { VacinaInformativoDTO, EfeitoColateralDTO } from '../types/info';
import { VacinaDTO } from './mandatoryVaccineService';

const API_BASE = 'https://locvac-production.up.railway.app';

export async function fetchTodasVacinas(): Promise<VacinaDTO[]> {
  const response = await axios.get(`${API_BASE}/vacinas`);
  return response.data;
}

export async function fetchInformativosPorVacina(idVacina: number): Promise<VacinaInformativoDTO[]> {
  const response = await axios.get(`${API_BASE}/api/vacina-informativos/vacina/${idVacina}`);
  return response.data;
}

export async function fetchEfeitosColateraisPorVacina(idVacina: number): Promise<EfeitoColateralDTO[]> {
  const response = await axios.get(`${API_BASE}/api/vacina-efeitos/vacina/${idVacina}`);
  return response.data;
}
