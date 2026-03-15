import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParticipatingCampaign } from '../../app/types/vaccination';

const CAMPAIGNS_KEY = 'campaigns';

export const getCampaigns = async (): Promise<ParticipatingCampaign[]> => {
  try {
    const data = await AsyncStorage.getItem(CAMPAIGNS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar campanhas:', error);
    return [];
  }
};

export const saveCampaigns = async (campaigns: ParticipatingCampaign[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  } catch (error) {
    console.error('Erro ao salvar campanhas:', error);
  }
};

export const addCampaign = async (campaign: ParticipatingCampaign): Promise<void> => {
  const campaigns = await getCampaigns();
  campaigns.push(campaign);
  await saveCampaigns(campaigns);
};

export const updateCampaign = async (campaign: ParticipatingCampaign): Promise<void> => {
  const campaigns = await getCampaigns();
  const index = campaigns.findIndex((c) => c.id === campaign.id);
  
  if (index >= 0) {
    campaigns[index] = campaign;
    await saveCampaigns(campaigns);
  }
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  const campaigns = await getCampaigns();
  const filtered = campaigns.filter((c) => c.id !== campaignId);
  await saveCampaigns(filtered);
};

export const getCampaignsByProfile = async (profileId: string): Promise<ParticipatingCampaign[]> => {
  const campaigns = await getCampaigns();
  return campaigns.filter((c) => c.profileId === profileId);
};
