import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from './Avatar';
import { colors, typography } from '../../app/theme/tokens';
import { FamilyMember } from '../../app/types/vaccination';

type Props = {
  profile: FamilyMember | null;
  onSwitch?: () => void;
};

export default function AppHeader({ profile, onSwitch }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Image
          source={require('../../assets/images/logo.png')}
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

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg,
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
    color: colors.ink,
  },
  brandSub: {
    fontSize: 10,
    letterSpacing: 1,
    color: colors.ink3,
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
    borderColor: colors.line,
    backgroundColor: colors.bgElev,
  },
});
