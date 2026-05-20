import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import Avatar from './Avatar';
import { type Colors, typography } from '../../src/theme/tokens';
import { useTheme } from '../../src/context/ThemeContext';
import { FamilyMember } from '../../src/types/vaccination';

type Props = {
  profile: FamilyMember | null;
  onSwitch?: () => void;
};

export default function AppHeader({ profile, onSwitch }: Props) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Image
          source={isDark ? require('../../assets/images/logodark.png') : require('../../assets/images/logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.brandTitle}>LocVac</Text>
          <Text style={styles.brandSub}>Carteira digital familiar</Text>
        </View>
      </View>

      <Pressable onPress={onSwitch} style={styles.profileBtn}>
        <Avatar
          name={profile?.name || 'L'}
          photoUri={profile?.photoUri}
          size={32}
          tone="brand"
        />
        <Ionicons name="chevron-down" size={14} color={colors.ink3} style={{ marginLeft: 6, marginRight: 6 }} />
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: c.bg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  brandLogo: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    ...typography.h2,
    fontSize: 22,
    lineHeight: 24,
    color: c.ink,
  },
  brandSub: {
    fontSize: 10,
    letterSpacing: 1,
    color: c.ink3,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.bgElev,
  },
});
