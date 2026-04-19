import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://locvac-production.up.railway.app';

const AUTH_TOKEN_KEY = 'locvac:auth:token';
const REFRESH_TOKEN_KEY = 'locvac:auth:refresh';
const PESSOA_ID_KEY = 'locvac:auth:pessoaId';

interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	nome: string;
	idPessoa: number;
}

interface LoginRequest {
	email: string;
	senha: string;
}

interface CadastroRequest {
	nome: string;
	email: string;
	senha: string;
	telefone: string;
	dataNascimento: string;
	cpf: string;
	sexoBiologico: 'MASCULINO' | 'FEMININO';
	cep: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
	const response = await axios.post<AuthResponse>(`${API_BASE}/auth/login`, data);
	await saveTokens(response.data);
	if (response.data.idPessoa) {
		await AsyncStorage.setItem('locvac:auth:pessoaId', String(response.data.idPessoa));
	}
	return response.data;
}

export async function cadastrar(data: CadastroRequest): Promise<void> {
	await axios.post(`${API_BASE}/usuarios/cadastro`, data);
}

export async function refreshToken(): Promise<AuthResponse> {
	const refresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
	const response = await axios.post<AuthResponse>(`${API_BASE}/auth/refresh`, {
		refreshToken: refresh,
	});
	await saveTokens(response.data);
	return response.data;
}

export async function logout(): Promise<void> {
	const refresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
	try {
		await axios.post(`${API_BASE}/auth/logout`, { refreshToken: refresh });
	} finally {
		await clearTokens();
	}
}

export async function getAccessToken(): Promise<string | null> {
	return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
	const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
	return !!token;
}

async function saveTokens(auth: AuthResponse): Promise<void> {
	await AsyncStorage.setItem(AUTH_TOKEN_KEY, auth.accessToken);
	await AsyncStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
	if (auth.idPessoa) {
		await AsyncStorage.setItem(PESSOA_ID_KEY, String(auth.idPessoa));
	}
}

export async function getPessoaId(): Promise<number | null> {
  const id = await AsyncStorage.getItem(PESSOA_ID_KEY);
  return id ? Number(id) : null;
}

export async function fetchPerfil(idPessoa: number) {
  const response = await axios.get(`${API_BASE}/pessoas/perfil`, {
    params: { idPessoa },
  });
  return response.data; // PessoaResponseDTO
}

async function clearTokens(): Promise<void> {
	await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, PESSOA_ID_KEY]);
}

// Interceptor para adicionar o token JWT em todas as requisições
axios.interceptors.request.use(async (config) => {
	// Não adiciona o token para login/cadastro
	if (
		config.url?.includes('/auth/login') ||
		config.url?.includes('/usuarios/cadastro')
	) {
		return config;
	}
	const token = await AsyncStorage.getItem('locvac:auth:token');
	if (token && config.headers && typeof config.headers.set === 'function') {
		config.headers.set('Authorization', `Bearer ${token}`);
	} else if (token) {
		// fallback para objetos simples
        // Garante que config.headers seja do tipo AxiosRequestHeaders
        (config.headers as any)["Authorization"] = `Bearer ${token}`;
	}
	return config;
});
