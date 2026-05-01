import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { registrarPushToken, removerPushToken } from '../service/notificationService';

const STORED_TOKEN_KEY = 'locvac:push:token';

let handlerConfigured = false;

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
  if (!Device.isDevice) {
    return null;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;

    if (status !== 'granted') {
      const { status: requested } = await Notifications.requestPermissionsAsync();
      status = requested;
    }

    if (status !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#29442d',
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants.easConfig as any)?.projectId;

    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenResp.data;

    const armazenado = await AsyncStorage.getItem(STORED_TOKEN_KEY);
    if (armazenado === token) {
      return token;
    }

    await registrarPushToken(token, Platform.OS);
    await AsyncStorage.setItem(STORED_TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

export async function descadastrarTokenPush(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORED_TOKEN_KEY);
    if (token) {
      await removerPushToken(token).catch(() => {});
    }
  } finally {
    await AsyncStorage.removeItem(STORED_TOKEN_KEY);
  }
}
