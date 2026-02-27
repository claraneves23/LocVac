import AsyncStorage from '@react-native-async-storage/async-storage';
import { Campaign } from '../../app/types/vaccination';

const CAMPAIGNS_KEY = 'campaigns';

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const data = await AsyncStorage.getItem(CAMPAIGNS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar campanhas:', error);
    return [];
  }
};

export const saveCampaigns = async (campaigns: Campaign[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  } catch (error) {
    console.error('Erro ao salvar campanhas:', error);
  }
};

export const addCampaign = async (campaign: Campaign): Promise<void> => {
  const campaigns = await getCampaigns();
  campaigns.push(campaign);
  await saveCampaigns(campaigns);
};

export const updateCampaign = async (campaign: Campaign): Promise<void> => {
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

export const getCampaignsByProfile = async (profileId: string): Promise<Campaign[]> => {
  const campaigns = await getCampaigns();
  return campaigns.filter((c) => c.profileId === profileId);
};
