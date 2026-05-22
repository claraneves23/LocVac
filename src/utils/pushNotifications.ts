import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { registrarPushToken, removerPushToken } from '../service/notificationService';
import logger from './logger';

const STORED_TOKEN_KEY = 'locvac:push:token';

let handlerConfigured = false;
let registrationInFlight: Promise<string | null> | null = null;
let registrationDoneToken: string | null = null;
let registrationFailedReason: string | null = null;

export function configurarHandlerNotificacao() {
  if (handlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  handlerConfigured = true;
}

export async function registrarTokenPushSeNecessario(): Promise<string | null> {
  if (registrationDoneToken) return registrationDoneToken;
  if (registrationFailedReason) return null;
  if (registrationInFlight) return registrationInFlight;

  registrationInFlight = (async () => {
    const result = await runRegistration();
    if (result) registrationDoneToken = result;
    registrationInFlight = null;
    return result;
  })();
  return registrationInFlight;
}

async function runRegistration(): Promise<string | null> {
  logger.log('[push] env:', {
    appOwnership: Constants.appOwnership,
    executionEnvironment: Constants.executionEnvironment,
    isDevice: Device.isDevice,
    platform: Platform.OS,
  });

  if (!Device.isDevice) {
    registrationFailedReason = 'not-physical-device';
    logger.warn('[push] dispositivo não é físico (emulador/web) — push token não disponível');
    return null;
  }

  let status: Notifications.PermissionStatus;
  try {
    const existing = await Notifications.getPermissionsAsync();
    status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
  } catch (e) {
    logger.error('[push] erro ao consultar/pedir permissão:', e);
    return null;
  }

  if (status !== 'granted') {
    registrationFailedReason = 'permission-denied';
    logger.warn('[push] permissão de notificação não concedida (status=' + status + ')');
    return null;
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#03394A',
      });
    } catch (e) {
      logger.warn('[push] falha ao configurar canal Android:', e);
    }
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.easConfig as any)?.projectId;

  if (!projectId) {
    registrationFailedReason = 'no-project-id';
    logger.error('[push] projectId do EAS ausente em app.json (extra.eas.projectId)');
    return null;
  }

  let token: string;
  try {
    const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
    token = tokenResp.data;
    logger.log('[push] expo push token obtido');
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.includes('FirebaseApp is not initialized') || msg.includes('fcm-credentials')) {
      registrationFailedReason = 'fcm-not-configured';
      logger.warn('[push] FCM não configurado nesta build — push remoto desativado');
    } else {
      registrationFailedReason = 'token-error';
      logger.warn('[push] falha em getExpoPushTokenAsync:', msg);
    }
    return null;
  }

  try {
    await registrarPushToken(token, Platform.OS);
    await AsyncStorage.setItem(STORED_TOKEN_KEY, token);
    logger.log('[push] token registrado no backend com sucesso');
    return token;
  } catch (e: any) {
    const httpStatus = e?.response?.status;
    logger.error('[push] falha ao registrar token no backend: status', httpStatus);
    return null;
  }
}

export async function notificarBoasVindasSeNecessario(email: string): Promise<void> {
  const key = `locvac:welcomed:${email.toLowerCase()}`;
  try {
    const already = await AsyncStorage.getItem(key);
    if (already) return;
  } catch (e) {
    logger.warn('[push] falha ao consultar flag de boas-vindas:', e);
    return;
  }

  let status: Notifications.PermissionStatus;
  try {
    const existing = await Notifications.getPermissionsAsync();
    status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
  } catch (e) {
    logger.error('[push] erro ao pedir permissão para boas-vindas:', e);
    return;
  }
  if (status !== 'granted') {
    logger.warn('[push] permissão negada — boas-vindas não exibida');
    return;
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#03394A',
      });
    } catch (e) {
      logger.warn('[push] falha ao configurar canal Android (boas-vindas):', e);
    }
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bem-vindo ao LocVac!',
        body: 'Obrigado por participar do teste fechado. Seu feedback será de extremo valor ;)',
      },
      trigger: null,
    });
    await AsyncStorage.setItem(key, '1');
  } catch (e) {
    logger.error('[push] falha ao exibir notificação de boas-vindas:', e);
  }
}

export async function descadastrarTokenPush(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORED_TOKEN_KEY);
    if (token) {
      await removerPushToken(token).catch((e) => {
        logger.warn('[push] falha ao remover token no backend:', e?.message);
      });
    }
  } finally {
    await AsyncStorage.removeItem(STORED_TOKEN_KEY);
    registrationDoneToken = null;
    registrationFailedReason = null;
  }
}
