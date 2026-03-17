
import axios from 'axios';
import { Campanha } from '../types/vaccination';

const API_URL = 'http://192.168.0.148:8080/campanhas'; // IP local para acesso via Expo Go

export async function fetchCampaigns(): Promise<Campanha[]> {
	const response = await axios.get(API_URL);
	return response.data;
}
