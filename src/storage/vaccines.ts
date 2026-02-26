import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaccineApplication } from '../../app/types/vaccination';
import { APPLICATIONS } from '../../app/data/family';

const STORAGE_KEY = 'locvac:vaccines:v1';

const seedVaccines = async () => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(APPLICATIONS));
  return APPLICATIONS;
};

export const getVaccines = async (): Promise<VaccineApplication[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return seedVaccines();
  }

  try {
    const parsed = JSON.parse(raw) as VaccineApplication[];
    if (!Array.isArray(parsed)) {
      return seedVaccines();
    }

    return parsed;
  } catch {
    return seedVaccines();
  }
};

export const saveVaccines = async (vaccines: VaccineApplication[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(vaccines));
};

export const addVaccine = async (vaccine: VaccineApplication) => {
  const current = await getVaccines();
  const updated = [...current, vaccine];
  await saveVaccines(updated);
  return updated;
};

export const updateVaccine = async (vaccine: VaccineApplication) => {
  const current = await getVaccines();
  const updated = current.map((item) => (item.id === vaccine.id ? vaccine : item));
  await saveVaccines(updated);
  return updated;
};

export const deleteVaccine = async (vaccineId: string) => {
  const current = await getVaccines();
  const updated = current.filter((item) => item.id !== vaccineId);
  await saveVaccines(updated);
  return updated;
};

export const getVaccinesByProfile = async (profileId: string): Promise<VaccineApplication[]> => {
  const vaccines = await getVaccines();
  return vaccines.filter((vaccine) => vaccine.profileId === profileId);
};
