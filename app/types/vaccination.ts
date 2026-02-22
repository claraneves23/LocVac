export interface Dependent {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  sex: 'M' | 'F' | 'Outro';
  photoUri?: string;
}

export interface Vaccine {
  id: string;
  name: string;
  recommendedAge: string;
  dose: string;
}

export interface VaccineApplication {
  id: string;
  dependentId: string;
  vaccineId: string;
  vaccineName: string;
  applicationDate?: string;
  dueDate?: string;
  lot?: string;
  healthUnit?: string;
  notes?: string;
  status: 'applied' | 'pending' | 'overdue';
}
