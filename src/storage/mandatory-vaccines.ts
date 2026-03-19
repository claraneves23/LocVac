import AsyncStorage from '@react-native-async-storage/async-storage';
import { MandatoryVaccineRecord } from '../../app/types/vaccination';

const MANDATORY_VACCINES_KEY = 'mandatoryVaccines';

export const getMandatoryVaccineRecords = async (): Promise<MandatoryVaccineRecord[]> => {
  try {
    const data = await AsyncStorage.getItem(MANDATORY_VACCINES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar registros de vacinas obrigatórias:', error);
    return [];
  }
};

export const saveMandatoryVaccineRecords = async (records: MandatoryVaccineRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MANDATORY_VACCINES_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Erro ao salvar registros de vacinas obrigatórias:', error);
  }
};

export const updateMandatoryVaccineRecord = async (record: MandatoryVaccineRecord): Promise<void> => {
  const records = await getMandatoryVaccineRecords();
  const index = records.findIndex((r) => r.id === record.id);
  
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  
  await saveMandatoryVaccineRecords(records);
};

export const getMandatoryVaccineRecordsByProfile = async (profileId: string): Promise<MandatoryVaccineRecord[]> => {
  const records = await getMandatoryVaccineRecords();
  return records.filter((r) => r.profileId === profileId);
};
