import axios from 'axios';
import { FamilyMember } from '../types/vaccination';

const API_URL = 'http://192.168.0.10:8080'; // mesmo padrão dos outros services

export async function addDependentAndLink(usuarioId: string, dependent: Omit<FamilyMember, 'id' | 'userId' | 'kind'> & { cpf?: string }): Promise<void> {
  // 1. Cria a pessoa
  const pessoaResponse = await axios.post(`${API_URL}/pessoas`, {
    nome: dependent.name,
    dataNascimento: dependent.birthDate,
    cpf: dependent.cpf || null, // ou gere um fake/placeholder se não for obrigatório
    sexoBiologico: dependent.sex === 'M' ? 'MASCULINO' : dependent.sex === 'F' ? 'FEMININO' : 'OUTRO',
    cns: null,
    cep: dependent.zipCode || '',
    telefone: dependent.phone || '',
    fotoUrl: dependent.photoUri || '',
    nomeResponsavel: dependent.guardianName || '',
    ativo: true
  });
  const pessoaId = pessoaResponse.data.id;

  // 2. Vincula ao usuário
  const vinculoPayload = {
    idUsuario: usuarioId,
    idPessoa: pessoaId,
    tipoVinculo: 'DEPENDENTE',
    podeVisualizar: true,
    podeEditar: true,
    dataVinculo: new Date().toISOString().split('T')[0],
    dscParentesco: dependent.relationship || ''
  };
  console.log('DEBUG payload novaVinculacao:', vinculoPayload);
  await axios.post(`${API_URL}/usuarioPessoa/novaVinculacao`, vinculoPayload);
}

type PessoaResponseDTO = {
  id: number;
  nome: string;
  dataNascimento: string;
  sexoBiologico: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  cep?: string;
  telefone?: string;
  fotoUrl?: string;
  nomeResponsavel?: string;
  dscParentesco?: string;
};

const mapSexo = (sexo: string): 'M' | 'F' | 'Outro' => {
  if (sexo === 'MASCULINO') return 'M';
  if (sexo === 'FEMININO') return 'F';
  return 'Outro';
};

export async function getDependents(usuarioId: string): Promise<FamilyMember[]> {
  const response = await axios.get<PessoaResponseDTO[]>(
    `${API_URL}/pessoas/dependentes`,
    { params: { usuarioId } }
  );
  console.log('DEBUG getDependents backend response:', response.data);
  return response.data.map(d => ({
    id: String(d.id),
    userId: usuarioId,
    name: d.nome,
    birthDate: d.dataNascimento,
    sex: mapSexo(d.sexoBiologico),
    kind: 'dependent',
    relationship: d.dscParentesco ?? '',
    zipCode: d.cep,
    phone: d.telefone,
    photoUri: d.fotoUrl || undefined,
    guardianName: d.nomeResponsavel,
  }));
}

// Busca o UUID do usuário titular associado a uma pessoa
export async function getUsuarioTitularIdByPessoaId(pessoaId: number): Promise<string | null> {
  const response = await axios.get(`${API_URL}/usuarioPessoa/por-pessoa`, { params: { idPessoa: pessoaId } });
  // Espera-se um array de vinculações, pega a do tipo TITULAR
  const vinculoTitular = response.data.find((v: any) => v.tipoVinculo === 'TITULAR');
  return vinculoTitular && vinculoTitular.idUsuario ? vinculoTitular.idUsuario : null;
}
