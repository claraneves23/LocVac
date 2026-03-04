import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { setNavigationDirection } from '../../app/navigation-direction';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Tab {
  name: string;
  route: string;
  icon: IconName;
  iconActive: IconName;
}

export const BottomBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs: Tab[] = [
    {
    name: 'Carteira',
    route: '/',
    icon: 'map-outline',
    iconActive: 'map',
  },
  {
    name: 'Histórico',
    route: '/search',
    icon: 'time-outline',
    iconActive: 'time',
  },
  {
    name: 'Informações',
    route: '/infos',
    icon: 'book-outline',
    iconActive: 'book',
  },
  {
    name: 'Usuário',
    route: '/user',
    icon: 'person-outline',
    iconActive: 'person',
  },
  ];

  const isActive = (route: string) => {
    return pathname === route || pathname.startsWith(route + '/');
  };

  const getCurrentTabIndex = () => {
    return tabs.findIndex((tab) => isActive(tab.route));
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          style={[
            styles.tab,
            isActive(tab.route) && styles.tabActive,
          ]}
          onPress={() => {
            if (isActive(tab.route)) {
              return;
            }

            const currentTabIndex = getCurrentTabIndex();
            const targetTabIndex = tabs.findIndex((item) => item.route === tab.route);

            if (currentTabIndex !== -1 && targetTabIndex < currentTabIndex) {
              setNavigationDirection('left');
            } else {
              setNavigationDirection('right');
            }

            router.push(tab.route);
          }}
        >
          <Ionicons
            name={isActive(tab.route) ? tab.iconActive : tab.icon}
            size={isActive(tab.route) ? 26 : 24}
            color={isActive(tab.route) ? '#29442dff' : '#00000040'}
          />
          <Text
            style={{
              fontSize: 8,
              color: isActive(tab.route) ? '#29442dff' : '#00000040',
            }}
          >{tab.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ACDAD8',
    boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.1)',
    paddingBottom: 40,
    paddingTop: 0,

    height: '12%',         
    width: '100%',       

    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabActive: {
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  iconActive: {
    fontSize: 26,
  },
});
