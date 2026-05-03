export interface UserProfile {
  id: string;
  name: string;
  birthDate: string;
  birthPlace?: string;
  sex: 'M' | 'F' | 'Outro';
  email: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

export interface Dependent {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  birthPlace?: string;
  sex: 'M' | 'F' | 'Outro';
  relationship: string;
  guardianName?: string;
  photoUri?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  birthPlace?: string;
  sex: 'M' | 'F' | 'Outro';
  kind: 'user' | 'dependent';
  relationship?: string;
  guardianName?: string;
  photoUri?: string;
  cns?: string;
  zipCode?: string;
  address?: string;
  complement?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface Vaccine {
  id: string;
  name: string;
  recommendedAge: string;
  dose: string;
}

export interface VaccineApplication {
  id: string;
  profileId: string;
  vaccineId: string;
  vaccineName: string;
  applicationDate?: string;
  dueDate?: string;
  lot?: string;
  healthUnit?: string;
  notes?: string;
  status: 'applied' | 'pending' | 'overdue';
}

export interface MandatoryFirstYearVaccine {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface MandatoryVaccineRecord {
  id: string;
  profileId: string;
  vaccineId: string;
  isApplied: boolean;
  applicationDate?: string;
  lot?: string;
  code?: string;
  professionalName?: string;
  professionalId?: string;
}

export interface OtherVaccine {
  id: string;
  profileId: string;
  vaccineName: string;
  applicationDate?: string;
  lot?: string;
  code?: string;
  professionalName?: string;
  professionalId?: string;
}

export interface ParticipatingCampaign {
  id: string;
  profileId: string;
  campaignName: string;
  participationDate: string;
}

export interface Campanha {
  id: number;
  nome: string;
  dataInicio: string;
  dataFim: string;
  publicoAlvo: string;
  ativa: boolean;
}



