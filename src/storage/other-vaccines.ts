import AsyncStorage from '@react-native-async-storage/async-storage';
import { OtherVaccine } from '../../app/types/vaccination';

const OTHER_VACCINES_KEY = 'otherVaccines';

export const getOtherVaccines = async (): Promise<OtherVaccine[]> => {
  try {
    const data = await AsyncStorage.getItem(OTHER_VACCINES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar outras vacinas:', error);
    return [];
  }
};

export const saveOtherVaccines = async (vaccines: OtherVaccine[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OTHER_VACCINES_KEY, JSON.stringify(vaccines));
  } catch (error) {
    console.error('Erro ao salvar outras vacinas:', error);
  }
};

export const addOtherVaccine = async (vaccine: OtherVaccine): Promise<void> => {
  const vaccines = await getOtherVaccines();
  vaccines.push(vaccine);
  await saveOtherVaccines(vaccines);
};

export const updateOtherVaccine = async (vaccine: OtherVaccine): Promise<void> => {
  const vaccines = await getOtherVaccines();
  const index = vaccines.findIndex((v) => v.id === vaccine.id);
  
  if (index >= 0) {
    vaccines[index] = vaccine;
    await saveOtherVaccines(vaccines);
  }
};

export const deleteOtherVaccine = async (vaccineId: string): Promise<void> => {
  const vaccines = await getOtherVaccines();
  const filtered = vaccines.filter((v) => v.id !== vaccineId);
  await saveOtherVaccines(filtered);
};

export const getOtherVaccinesByProfile = async (profileId: string): Promise<OtherVaccine[]> => {
  const vaccines = await getOtherVaccines();
  return vaccines.filter((v) => v.profileId === profileId);
};
