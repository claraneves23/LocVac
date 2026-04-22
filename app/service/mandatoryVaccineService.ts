import axios from 'axios';

const API_BASE = 'https://locvac-production.up.railway.app';

export type VacinaDTO = {
  id: number;
  nome: string;
  descricao: string;
  dose: string;
  codigoPNI: string;
  idadeMinimaMeses: number | null;
  idadeMaximaMeses: number | null;
};

export type DoseAplicadaDTO = {
  id: number;
  idPessoa: number;
  idVacina: number;
  nomeVacina: string;
  dataAplicacao: string;
  lote: string | null;
  observacao: string | null;
  nomeProfissional: string | null;
  registroProfissional: string | null;
  unidadeSaude: string | null;
};

export async function fetchMandatoryVaccines(): Promise<VacinaDTO[]> {
  const response = await axios.get(`${API_BASE}/vacinas`, {
    params: { tipo: 'OBRIGATORIAS_PRIMEIRO_ANO' },
  });
  return response.data;
}

export async function fetchDosesPorPessoa(idPessoa: number): Promise<DoseAplicadaDTO[]> {
  const response = await axios.get(
    `${API_BASE}/doses/por-pessoa/${idPessoa}/tipo/OBRIGATORIAS_PRIMEIRO_ANO`
  );
  return response.data;
}

export async function registrarDose(data: {
  idPessoa: number;
  idVacina: number;
  dataAplicacao: string;
  lote?: string;
  observacao?: string;
  nomeProfissional?: string;
  registroProfissional?: string;
  unidadeSaude?: string;
}): Promise<DoseAplicadaDTO> {
  const response = await axios.post(`${API_BASE}/doses/registrar`, data);
  return response.data;
}

export async function atualizarDose(
  idDose: number,
  data: {
    idPessoa: number;
    idVacina: number;
    dataAplicacao: string;
    lote?: string;
    observacao?: string;
    nomeProfissional?: string;
    registroProfissional?: string;
    unidadeSaude?: string;
  }
): Promise<DoseAplicadaDTO> {
  const response = await axios.put(`${API_BASE}/doses/${idDose}`, data);
  return response.data;
}

export async function deletarDose(idDose: number): Promise<void> {
  await axios.delete(`${API_BASE}/doses/${idDose}`);
}

export async function fetchOutrasVacinasPorPessoa(idPessoa: number): Promise<DoseAplicadaDTO[]> {
  const response = await axios.get(
    `${API_BASE}/doses/por-pessoa/${idPessoa}/tipo/OUTRAS_VACINAS`
  );
  return response.data;
}

export async function registrarOutraVacina(data: {
  idPessoa: number;
  nomeVacina: string;
  dataAplicacao?: string;
  lote?: string;
  observacao?: string;
  nomeProfissional?: string;
  registroProfissional?: string;
}): Promise<DoseAplicadaDTO> {
  const response = await axios.post(`${API_BASE}/doses/outras-vacinas`, data);
  return response.data;
}

export async function atualizarOutraVacina(
  idDose: number,
  data: {
    idPessoa: number;
    nomeVacina: string;
    dataAplicacao?: string;
    lote?: string;
    observacao?: string;
    nomeProfissional?: string;
    registroProfissional?: string;
  }
): Promise<DoseAplicadaDTO> {
  const response = await axios.put(`${API_BASE}/doses/outras-vacinas/${idDose}`, data);
  return response.data;
}
