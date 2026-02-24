import { Dependent, FamilyMember, UserProfile, VaccineApplication } from '../types/vaccination';

export const MAIN_USER: UserProfile = {
  id: 'user-1',
  name: 'João da Silva',
  birthDate: '1992-06-18',
  sex: 'M',
  email: 'joao@locvac.com',
};

export const DEFAULT_DEPENDENTS: Dependent[] = [
  {
    id: 'dep-1',
    userId: MAIN_USER.id,
    name: 'João Pedro',
    birthDate: '2019-03-12',
    sex: 'M',
    relationship: 'Filho',
  },
  {
    id: 'dep-2',
    userId: MAIN_USER.id,
    name: 'Ana Clara',
    birthDate: '2022-08-01',
    sex: 'F',
    relationship: 'Filha',
  },
];

export const DEPENDENTS: Dependent[] = DEFAULT_DEPENDENTS;

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: MAIN_USER.id,
    userId: MAIN_USER.id,
    name: MAIN_USER.name,
    birthDate: MAIN_USER.birthDate,
    sex: MAIN_USER.sex,
    kind: 'user',
  },
  ...DEPENDENTS.map((dependent) => ({
    id: dependent.id,
    userId: dependent.userId,
    name: dependent.name,
    birthDate: dependent.birthDate,
    sex: dependent.sex,
    kind: 'dependent' as const,
    relationship: dependent.relationship,
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
