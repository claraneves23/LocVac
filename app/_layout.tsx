import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { BottomBar } from '../components/BottomBar';
import { getNavigationDirection } from './navigation-direction';

const MAIN_TAB_ROUTES = ['index', 'search', 'infos', 'user'];
const HIDE_BOTTOM_BAR_ROUTES = ['/login'];

export default function Layout() {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('locvac:auth:token');
      setIsAuthenticated(!!token);
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

  const hideBottomBar = HIDE_BOTTOM_BAR_ROUTES.includes(pathname);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync('#00000000');
        await NavigationBar.setButtonStyleAsync('dark');
      } catch {
      }
    };

    configureNavigationBar();
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text>Carregando...</Text>
        </View>
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
});
