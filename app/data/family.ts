import { Dependent, FamilyMember, UserProfile, VaccineApplication } from '../types/vaccination';

// ATENÇÃO: O id do usuário principal (titular) deve ser preenchido dinamicamente com o UUID real do usuário logado.
// Não use valor fixo! Busque o UUID via serviço de autenticação (ex: getUserId() ou getUsuarioUuid()).
export const MAIN_USER: UserProfile = {
  id: '', // Preencher dinamicamente após login
  name: 'João da Silva',
  birthDate: '1992-06-18',
  birthPlace: 'São Paulo - SP',
  sex: 'M',
  email: 'joao@locvac.com',
  address: 'Rua das Flores, 123',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234-567',
  phone: '(11) 98765-4321',
};

export const DEFAULT_DEPENDENTS: Dependent[] = [
  {
    id: 'dep-1',
    userId: MAIN_USER.id,
    name: 'João Pedro',
    birthDate: '2019-03-12',
    birthPlace: 'São Paulo - SP',
    sex: 'M',
    relationship: 'Filho',
    guardianName: 'Maria da Silva',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    phone: '(11) 98765-4321',
  },
  {
    id: 'dep-2',
    userId: MAIN_USER.id,
    name: 'Ana Clara',
    birthDate: '2022-08-01',
    birthPlace: 'São Paulo - SP',
    sex: 'F',
    relationship: 'Filha',
    guardianName: 'Maria da Silva',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    phone: '(11) 98765-4321',
  },
];

export const DEPENDENTS: Dependent[] = DEFAULT_DEPENDENTS;

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: MAIN_USER.id,
    userId: MAIN_USER.id,
    name: MAIN_USER.name,
    birthDate: MAIN_USER.birthDate,
    birthPlace: MAIN_USER.birthPlace,
    sex: MAIN_USER.sex,
    kind: 'user',
    address: MAIN_USER.address,
    city: MAIN_USER.city,
    state: MAIN_USER.state,
    zipCode: MAIN_USER.zipCode,
    phone: MAIN_USER.phone,
  },
  ...DEPENDENTS.map((dependent) => ({
    id: dependent.id,
    userId: dependent.userId,
    name: dependent.name,
    birthDate: dependent.birthDate,
    birthPlace: dependent.birthPlace,
    sex: dependent.sex,
    kind: 'dependent' as const,
    relationship: dependent.relationship,
    guardianName: dependent.guardianName,
    photoUri: dependent.photoUri,
    address: dependent.address,
    city: dependent.city,
    state: dependent.state,
    zipCode: dependent.zipCode,
    phone: dependent.phone,
  })),
];

export const APPLICATIONS: VaccineApplication[] = [
  {
    id: 'app-user-1',
    profileId: MAIN_USER.id,
    vaccineId: 'vac-influenza-adulto',
    vaccineName: 'Influenza anual',
    applicationDate: '2025-04-20',
    dueDate: '2026-04-20',
    status: 'pending',
  },
  {
    id: 'app-user-2',
    profileId: MAIN_USER.id,
    vaccineId: 'vac-hepatite-b-adulto',
    vaccineName: 'Hepatite B (reforço)',
    applicationDate: '2024-10-02',
    status: 'applied',
  },
  {
    id: 'app-1',
    profileId: 'dep-1',
    vaccineId: 'vac-dtp',
    vaccineName: 'DTP - 1º reforço',
    applicationDate: '2025-02-10',
    dueDate: '2026-03-02',
    status: 'pending',
    notes: 'Agendar em unidade de referência.',
  },
  {
    id: 'app-2',
    profileId: 'dep-1',
    vaccineId: 'vac-influenza',
    vaccineName: 'Influenza anual',
    applicationDate: '2025-05-22',
    dueDate: '2026-02-27',
    status: 'pending',
  },
  {
    id: 'app-3',
    profileId: 'dep-1',
    vaccineId: 'vac-triplice-viral',
    vaccineName: 'Tríplice viral',
    applicationDate: '2024-03-15',
    lot: 'A37BC9',
    healthUnit: 'UBS Centro',
    status: 'applied',
  },
  {
    id: 'app-4',
    profileId: 'dep-2',
    vaccineId: 'vac-polio',
    vaccineName: 'Poliomielite - reforço',
    dueDate: '2026-04-03',
    status: 'pending',
  },
  {
    id: 'app-5',
    profileId: 'dep-2',
    vaccineId: 'vac-hepatite-b',
    vaccineName: 'Hepatite B',
    applicationDate: '2024-11-09',
    status: 'applied',
  },
];

export const ALERTS_BY_PROFILE: Record<string, string[]> = {
  [MAIN_USER.id]: ['Influenza anual prevista para o próximo mês.'],
  'dep-1': [
    'Reforço da DTP vence em 8 dias.',
    'Influenza anual prevista para esta semana.',
  ],
  'dep-2': ['Poliomielite entra em atraso em 12 dias.'],
};
