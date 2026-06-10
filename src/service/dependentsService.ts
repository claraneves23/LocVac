import axios from 'axios';
import { FamilyMember } from '../types/vaccination';
import logger from '../utils/logger';
import { mapSexo } from '../utils/format';
import { API_BASE } from './apiConfig';

const API_URL = API_BASE;

export async function addDependentAndLink(usuarioId: string, dependent: Omit<FamilyMember, 'id' | 'userId' | 'kind'> & { cpf?: string }): Promise<number> {
  const pessoaResponse = await axios.post(`${API_URL}/pessoas`, {
    nome: dependent.name,
    dataNascimento: dependent.birthDate,
    cpf: dependent.cpf || null,
    sexoBiologico: dependent.sex === 'M' ? 'MASCULINO' : dependent.sex === 'F' ? 'FEMININO' : 'OUTRO',
    cns: dependent.cns || null,
    cep: dependent.zipCode || '',
    rua: dependent.address || '',
    complemento: dependent.complement || '',
    bairro: dependent.neighborhood || '',
    municipio: dependent.city || '',
    estado: dependent.state || null,
    naturalidadeMunicipio: dependent.birthCity || null,
    naturalidadeEstado: dependent.birthState || null,
    telefone: (dependent.phone || '').replace(/\D/g, ''),
    fotoUrl: null,
    nomeResponsavel: dependent.guardianName || '',
    ativo: true
  });
  const pessoaId = pessoaResponse.data.id;

  const vinculoPayload = {
    idUsuario: usuarioId,
    idPessoa: pessoaId,
    tipoVinculo: 'DEPENDENTE',
    podeVisualizar: true,
    podeEditar: true,
    dataVinculo: new Date().toISOString().split('T')[0],
    dscParentesco: dependent.relationship || ''
  };
  logger.log('[dependents] vinculando pessoa ao usuário');
  await axios.post(`${API_URL}/usuarioPessoa/novaVinculacao`, vinculoPayload);
  return pessoaId;
}

type PessoaResponseDTO = {
  id: number;
  nome: string;
  dataNascimento: string;
  sexoBiologico: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  cpf?: string;
  cns?: string;
  cep?: string;
  rua?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  estado?: string;
  naturalidadeMunicipio?: string;
  naturalidadeEstado?: string;
  telefone?: string;
  fotoUrl?: string;
  nomeResponsavel?: string;
  dscParentesco?: string;
  ehDono?: boolean;
};

export async function getDependents(usuarioId: string): Promise<FamilyMember[]> {
  const response = await axios.get<PessoaResponseDTO[]>(
    `${API_URL}/pessoas/dependentes`,
    { params: { usuarioId } }
  );
  return response.data.map(d => ({
    id: String(d.id),
    userId: usuarioId,
    name: d.nome,
    birthDate: d.dataNascimento,
    sex: mapSexo(d.sexoBiologico),
    kind: 'dependent',
    relationship: d.dscParentesco ?? '',
    cpf: d.cpf,
    cns: d.cns,
    zipCode: d.cep,
    address: d.rua,
    complement: d.complemento,
    neighborhood: d.bairro,
    city: d.municipio,
    state: d.estado,
    birthCity: d.naturalidadeMunicipio,
    birthState: d.naturalidadeEstado,
    phone: d.telefone,
    photoUri: d.fotoUrl || undefined,
    guardianName: d.nomeResponsavel,
    isOwner: d.ehDono ?? false,
  }));
}

export async function updateDependent(id: string, dependent: Omit<FamilyMember, 'id' | 'userId' | 'kind'> & { cpf?: string }): Promise<void> {
  await axios.put(`${API_URL}/pessoas/${id}`, {
    nome: dependent.name,
    dataNascimento: dependent.birthDate,
    cpf: dependent.cpf || null,
    sexoBiologico: dependent.sex === 'M' ? 'MASCULINO' : dependent.sex === 'F' ? 'FEMININO' : 'OUTRO',
    cns: dependent.cns || null,
    cep: dependent.zipCode || '',
    rua: dependent.address || '',
    complemento: dependent.complement || '',
    bairro: dependent.neighborhood || '',
    municipio: dependent.city || '',
    estado: dependent.state || null,
    naturalidadeMunicipio: dependent.birthCity || null,
    naturalidadeEstado: dependent.birthState || null,
    telefone: (dependent.phone || '').replace(/\D/g, ''),
    fotoUrl: null,
    nomeResponsavel: dependent.guardianName || '',
    ativo: true,
  });
}

export async function deleteDependent(id: string): Promise<void> {
  // Vínculo-aware: se outro responsável compartilha este dependente, apenas
  // desvincula a conta atual; só exclui a pessoa quando é o último responsável.
  await axios.delete(`${API_URL}/compartilhamento/pessoa/${id}/meu-acesso`);
}

export async function getUsuarioTitularIdByPessoaId(pessoaId: number): Promise<string | null> {
  const response = await axios.get(`${API_URL}/usuarioPessoa/por-pessoa`, { params: { idPessoa: pessoaId } });
  const vinculoTitular = response.data.find((v: any) => v.tipoVinculo === 'TITULAR');
  return vinculoTitular && vinculoTitular.idUsuario ? vinculoTitular.idUsuario : null;
}
