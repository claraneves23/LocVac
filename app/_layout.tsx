import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { Animated, BackHandler, Image, Platform, StyleSheet, ToastAndroid, View } from 'react-native';
import BottomTabs from '../components/redesign/BottomTabs';
import { getNavigationDirection } from '../src/navigation-direction';
import { AppProvider, useAppContext } from '../src/context/AppContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { setAuthErrorCallback } from '../src/service/authService';
import {
  configurarHandlerNotificacao,
  registrarTokenPushSeNecessario,
} from '../src/utils/pushNotifications';
import * as Notifications from 'expo-notifications';

configurarHandlerNotificacao();

const MAIN_TAB_ROUTES = ['home', 'hist', 'infos', 'user'];
const isMainTabRoute = (name: string) =>
  MAIN_TAB_ROUTES.some((r) => name === r || name === `${r}/index` || name.startsWith(`${r}/`));
const MAIN_TAB_PATHS = ['/home', '/hist', '/infos', '/user'];
const DOUBLE_BACK_DELAY_MS = 2000;
const HIDE_BOTTOM_BAR_ROUTES = [
  '/login',
  '/verificar-email',
  '/cadastro-titular',
  '/esqueci-senha',
  '/redefinir-senha',
  '/configuracoes',
];
const PUBLIC_ROUTES = ['/login', '/verificar-email', '/esqueci-senha', '/redefinir-senha'];

export default function Layout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <LayoutContent />
      </AppProvider>
    </ThemeProvider>
  );
}

function LayoutContent() {
  const { colors, isDark } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { isLoading: appLoading } = useAppContext();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.25, duration: 850, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 850, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    setAuthErrorCallback(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/hist');
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('locvac:auth:token');
      const pessoaId = await AsyncStorage.getItem('locvac:auth:pessoaId');
      setCheckingAuth(false);

      if (!token) {
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace('/login');
        }
        return;
      }

      if (!pessoaId) {
        if (pathname !== '/cadastro-titular') {
          router.replace('/cadastro-titular');
        }
        return;
      }

      if (PUBLIC_ROUTES.includes(pathname) || pathname === '/cadastro-titular') {
        router.replace('/home');
      }

      registrarTokenPushSeNecessario().catch(() => {});
    };
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark').catch(() => {});
    NavigationBar.setBackgroundColorAsync(isDark ? colors.bgElev : '#FFFFFF').catch(() => {});
  }, [isDark, colors.bgElev]);

  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let lastBackPress = 0;
    const onBack = () => {
      if (!MAIN_TAB_PATHS.includes(pathnameRef.current)) return false;
      const now = Date.now();
      if (now - lastBackPress < DOUBLE_BACK_DELAY_MS) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPress = now;
      ToastAndroid.show('Pressione novamente para sair', ToastAndroid.SHORT);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  const hideBottomBar = HIDE_BOTTOM_BAR_ROUTES.includes(pathname);
  const isOnPublicOrSetup = PUBLIC_ROUTES.includes(pathname) || pathname === '/cadastro-titular';

  if ((checkingAuth || appLoading) && !isOnPublicOrSetup) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bgMuted }]}>
        <Animated.Image
          source={isDark ? require('../assets/images/logodark.png') : require('../assets/images/logo.png')}
          style={[styles.loadingLogo, { opacity: pulseAnim }]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.contentContainer}>
        <Stack
          screenOptions={({ route }) => ({
            animation: isMainTabRoute(route.name)
              ? getNavigationDirection() === 'left'
                ? 'slide_from_left'
                : 'slide_from_right'
              : 'fade_from_bottom',
            headerShown: false,
            freezeOnBlur: true,
            contentStyle: {
              backgroundColor: colors.bg,
            }, // colors from useTheme() — reactive to dark mode
          })}
        />
      </View>
      {!hideBottomBar && <BottomTabs />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 110,
    height: 110,
  },
});
