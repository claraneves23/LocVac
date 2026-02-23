export interface UserProfile {
  id: string;
  name: string;
  birthDate: string;
  sex: 'M' | 'F' | 'Outro';
  email: string;
}

export interface Dependent {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  sex: 'M' | 'F' | 'Outro';
  relationship: string;
  photoUri?: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  sex: 'M' | 'F' | 'Outro';
  kind: 'user' | 'dependent';
  relationship?: string;
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
