export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  birthCity?: string;
  birthState?: string;
  sex: 'M' | 'F' | 'Outro';
  kind: 'user' | 'dependent';
  relationship?: string;
  guardianName?: string;
  photoUri?: string;
  cpf?: string;
  cns?: string;
  zipCode?: string;
  address?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
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
