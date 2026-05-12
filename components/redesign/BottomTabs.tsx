import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { type Colors, shadows } from '../../src/theme/tokens';
import { useTheme } from '../../src/context/ThemeContext';
import { setNavigationDirection } from '../../src/navigation-direction';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Tab {
  id: string;
  label: string;
  icon: IconName;
  route: string;
}

const tabs: Tab[] = [
  { id: 'carteira',     label: 'Carteira',     icon: 'wallet-outline',           route: '/home' },
  { id: 'historico',    label: 'Histórico',    icon: 'time-outline',             route: '/hist' },
  { id: 'informacoes',  label: 'Informações',  icon: 'book-outline',             route: '/infos' },
  { id: 'usuario',      label: 'Perfil',       icon: 'person-outline',           route: '/user' },
];

export default function BottomTabs() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) => {
    return pathname === route || pathname.startsWith(route + '/');
  };

  const currentIdx = tabs.findIndex((t) => isActive(t.route));

  const progress = useRef(
    tabs.map((_, idx) => new Animated.Value(idx === currentIdx ? 1 : 0))
  ).current;
  const progressNative = useRef(
    tabs.map((_, idx) => new Animated.Value(idx === currentIdx ? 1 : 0))
  ).current;

  useEffect(() => {
    const duration = 220;
    const easing = Easing.out(Easing.quad);
    Animated.parallel([
      ...progress.map((value, idx) =>
        Animated.timing(value, {
          toValue: idx === currentIdx ? 1 : 0,
          duration,
          easing,
          useNativeDriver: false,
        })
      ),
      ...progressNative.map((value, idx) =>
        Animated.timing(value, {
          toValue: idx === currentIdx ? 1 : 0,
          duration,
          easing,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, [currentIdx, progress, progressNative]);

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <View style={styles.pill}>
        {tabs.map((tab, idx) => {
          const active = idx === currentIdx;
          const flex = progress[idx].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.6],
          });
          const backgroundColor = progress[idx].interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255,255,255,0)', colors.brand],
          });
          const iconInactiveOpacity = progressNative[idx].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          });
          const labelOpacity = progressNative[idx].interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          });
          const labelMaxWidth = progress[idx].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 120],
          });
          const labelMargin = progress[idx].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 6],
          });

          return (
            <AnimatedPressable
              key={tab.id}
              onPress={() => {
                if (active) return;
                if (currentIdx !== -1) {
                  setNavigationDirection(idx < currentIdx ? 'left' : 'right');
                }
                router.push(tab.route as any);
              }}
              style={[styles.tab, { flex, backgroundColor }]}
            >
              <View style={styles.iconBox}>
                <Animated.View style={[styles.iconLayer, { opacity: iconInactiveOpacity }]}>
                  <Ionicons name={tab.icon} size={18} color={colors.ink3} />
                </Animated.View>
                <Animated.View style={[styles.iconLayer, { opacity: progressNative[idx] }]}>
                  <Ionicons name={tab.icon} size={18} color="#ffffff" />
                </Animated.View>
              </View>
              <Animated.View style={{ maxWidth: labelMaxWidth, marginLeft: labelMargin, overflow: 'hidden' }}>
                <Animated.Text
                  style={[styles.tabLabel, { opacity: labelOpacity }]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Animated.Text>
              </Animated.View>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: c.bgElev,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 999,
    padding: 6,
    ...shadows.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 999,
    minWidth: 0,
  },
  tabLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  iconBox: {
    width: 18,
    height: 18,
  },
  iconLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
