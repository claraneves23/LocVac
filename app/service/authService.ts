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

interface IniciarCadastroRequest {
	email: string;
	senha: string;
}

interface ConfirmarCadastroRequest {
	email: string;
	codigo: string;
}

export interface CadastroTitularRequest {
	nome: string;
	dataNascimento: string;
	cpf: string;
	cns?: string;
	sexoBiologico: 'MASCULINO' | 'FEMININO';
	cep: string;
	rua?: string;
	complemento?: string;
	municipio?: string;
	estado?: string;
	telefone: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
	const payload = { email: data.email.trim().toLowerCase(), senha: data.senha };
	const response = await axios.post<AuthResponse>(`${API_BASE}/auth/login`, payload);
	await saveTokens(response.data);
	if (response.data.idPessoa) {
		await AsyncStorage.setItem('locvac:auth:pessoaId', String(response.data.idPessoa));
	}
	return response.data;
}

export async function iniciarCadastro(data: IniciarCadastroRequest): Promise<void> {
	const payload = { email: data.email.trim().toLowerCase(), senha: data.senha };
	await axios.post(`${API_BASE}/usuarios/cadastro/iniciar`, payload);
}

export async function confirmarCadastro(data: ConfirmarCadastroRequest): Promise<AuthResponse> {
	const payload = { email: data.email.trim().toLowerCase(), codigo: data.codigo };
	const response = await axios.post<AuthResponse>(`${API_BASE}/usuarios/cadastro/confirmar`, payload);
	await saveTokens(response.data);
	return response.data;
}

export async function reenviarCodigo(email: string): Promise<void> {
	await axios.post(`${API_BASE}/usuarios/cadastro/reenviar`, { email: email.trim().toLowerCase() });
}

export async function solicitarRecuperacaoSenha(email: string): Promise<void> {
	await axios.post(`${API_BASE}/usuarios/senha/esqueci`, { email: email.trim().toLowerCase() });
}

export async function reenviarCodigoRecuperacaoSenha(email: string): Promise<void> {
	await axios.post(`${API_BASE}/usuarios/senha/reenviar`, { email: email.trim().toLowerCase() });
}

export async function redefinirSenha(data: { email: string; codigo: string; novaSenha: string }): Promise<void> {
	const payload = {
		email: data.email.trim().toLowerCase(),
		codigo: data.codigo,
		novaSenha: data.novaSenha,
	};
	await axios.post(`${API_BASE}/usuarios/senha/redefinir`, payload);
}

export async function cadastrarTitular(data: CadastroTitularRequest): Promise<{ id: number }> {
	const payload = {
		nome: data.nome,
		dataNascimento: data.dataNascimento,
		cpf: data.cpf,
		sexoBiologico: data.sexoBiologico,
		cns: data.cns || null,
		cep: data.cep,
		rua: data.rua || '',
		complemento: data.complemento || '',
		municipio: data.municipio || '',
		estado: data.estado || null,
		telefone: data.telefone,
		fotoUrl: null,
		nomeResponsavel: null,
		ativo: true,
	};
	const response = await axios.post(`${API_BASE}/pessoas/titular`, payload);
	const idPessoa = response.data?.id;
	if (idPessoa) {
		await AsyncStorage.setItem(PESSOA_ID_KEY, String(idPessoa));
	}
	return { id: idPessoa };
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
		const { descadastrarTokenPush } = await import('../utils/pushNotifications');
		await descadastrarTokenPush().catch(() => {});
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

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];
let authErrorCallback: (() => void) | null = null;

export function setAuthErrorCallback(cb: () => void) {
	authErrorCallback = cb;
}

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
	failedQueue = [];
};

axios.interceptors.request.use(async (config) => {
	if (
		config.url?.includes('/auth/login') ||
		config.url?.includes('/auth/refresh') ||
		config.url?.includes('/usuarios/cadastro/iniciar') ||
		config.url?.includes('/usuarios/cadastro/confirmar') ||
		config.url?.includes('/usuarios/cadastro/reenviar') ||
		config.url?.includes('/usuarios/senha/esqueci') ||
		config.url?.includes('/usuarios/senha/reenviar') ||
		config.url?.includes('/usuarios/senha/redefinir')
	) {
		return config;
	}
	const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
	if (token) {
		if (typeof config.headers?.set === 'function') {
			config.headers.set('Authorization', `Bearer ${token}`);
		} else {
			(config.headers as any)['Authorization'] = `Bearer ${token}`;
		}
	}
	return config;
});

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const original = error.config;
		const status = error.response?.status;

		if (
			(status === 401 || status === 403) &&
			!original._retry &&
			!original.url?.includes('/auth/refresh') &&
			!original.url?.includes('/auth/login')
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then((token) => {
					(original.headers as any)['Authorization'] = `Bearer ${token}`;
					return axios(original);
				});
			}

			original._retry = true;
			isRefreshing = true;

			try {
				const auth = await refreshToken();
				processQueue(null, auth.accessToken);
				(original.headers as any)['Authorization'] = `Bearer ${auth.accessToken}`;
				return axios(original);
			} catch (refreshError) {
				processQueue(refreshError, null);
				await clearTokens();
				authErrorCallback?.();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);
