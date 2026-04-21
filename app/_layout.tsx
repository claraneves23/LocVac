import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { BottomBar } from '../components/BottomBar';
import { getNavigationDirection } from './navigation-direction';
import { AppProvider, useAppContext } from './context/AppContext';
import { setAuthErrorCallback } from './service/authService';

const MAIN_TAB_ROUTES = ['index', 'search', 'infos', 'user'];
const HIDE_BOTTOM_BAR_ROUTES = ['/login'];

export default function Layout() {
  return (
    <AppProvider>
      <LayoutContent />
    </AppProvider>
  );
}

function LayoutContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { isLoading: appLoading } = useAppContext();

  useEffect(() => {
    setAuthErrorCallback(() => router.replace('/login'));
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('locvac:auth:token');
      setCheckingAuth(false);
      if (!token && pathname !== '/login') {
        router.replace('/login');
      }
      if (token && pathname === '/login') {
        router.replace('/');
      }
    };
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync('#00000000');
        await NavigationBar.setButtonStyleAsync('dark');
      } catch {}
    };
    configureNavigationBar();
  }, []);

  const hideBottomBar = HIDE_BOTTOM_BAR_ROUTES.includes(pathname);
  const isOnLogin = pathname === '/login';

  if ((checkingAuth || appLoading) && !isOnLogin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#29442d" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Stack
          screenOptions={({ route }) => ({
            animation: MAIN_TAB_ROUTES.includes(route.name)
              ? getNavigationDirection() === 'left'
                ? 'slide_from_left'
                : 'slide_from_right'
              : 'fade_from_bottom',
            headerShown: false,
            freezeOnBlur: true,
            contentStyle: {
              backgroundColor: '#CAE3E2',
            },
          })}
        />
      </View>
      {!hideBottomBar && <BottomBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#CAE3E2',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#29442d',
  },
});
