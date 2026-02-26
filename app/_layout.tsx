import { Stack } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BottomBar } from '../components/BottomBar';
import { getNavigationDirection } from './navigation-direction';

const MAIN_TAB_ROUTES = ['index', 'search', 'infos', 'user'];

export default function Layout() {
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
      <BottomBar />
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