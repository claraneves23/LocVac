import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dependent } from '../../app/types/vaccination';
import { DEFAULT_DEPENDENTS, MAIN_USER } from '../../app/data/family';

const STORAGE_KEY = 'locvac:dependents:v1';

const seedDependents = async () => {
  const seed = DEFAULT_DEPENDENTS.map((dependent) => ({
    ...dependent,
    userId: MAIN_USER.id,
  }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
};

export const getDependents = async (): Promise<Dependent[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return seedDependents();
  }

  try {
    const parsed = JSON.parse(raw) as Dependent[];
    if (!Array.isArray(parsed)) {
      return seedDependents();
    }

    return parsed;
  } catch {
    return seedDependents();
  }
};

export const saveDependents = async (dependents: Dependent[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dependents));
};

export const addDependent = async (dependent: Dependent) => {
  const current = await getDependents();
  const updated = [...current, dependent];
  await saveDependents(updated);
  return updated;
};

export const updateDependent = async (dependent: Dependent) => {
  const current = await getDependents();
  const updated = current.map((item) => (item.id === dependent.id ? dependent : item));
  await saveDependents(updated);
  return updated;
};

export const removeDependent = async (id: string) => {
  const current = await getDependents();
  const updated = current.filter((item) => item.id !== id);
  await saveDependents(updated);
  return updated;
};
