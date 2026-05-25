import axios from 'axios';
import { API_BASE } from './apiConfig';

type FotoResponse = { dataUrl: string; fotoUrl: string };

export async function uploadPessoaFoto(pessoaId: string | number, dataUrl: string): Promise<FotoResponse> {
  const response = await axios.post<FotoResponse>(`${API_BASE}/pessoas/${pessoaId}/foto`, { dataUrl });
  return response.data;
}

export async function deletePessoaFoto(pessoaId: string | number): Promise<void> {
  await axios.delete(`${API_BASE}/pessoas/${pessoaId}/foto`);
}

export async function fetchPessoaFotoDataUrl(relativePath: string): Promise<string | null> {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  try {
    const response = await axios.get<FotoResponse>(`${API_BASE}${path}`);
    return response.data?.dataUrl || null;
  } catch {
    return null;
  }
}
