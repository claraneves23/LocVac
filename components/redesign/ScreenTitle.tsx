import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { type Colors, scaleTypography } from '../../src/theme/tokens';
import { useTheme } from '../../src/context/ThemeContext';
import { useAccessibility } from '../../src/context/AccessibilityContext';

type Props = {
  title: string;
  back?: () => void;
  trailing?: React.ReactNode;
};

export default function ScreenTitle({ title, back, trailing }: Props) {
  const { colors } = useTheme();
  const { fontScale } = useAccessibility();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  return (
    <View style={styles.row}>
      {back && (
        <Pressable
          onPress={back}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink2} />
        </Pressable>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">{title}</Text>
      </View>
      {trailing}
    </View>
  );
}

const makeStyles = (c: Colors, fontScale = 1) => {
  const typography = scaleTypography(fontScale);
  return StyleSheet.create({
    row: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.bgElev,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...typography.h2,
      color: c.ink,
    },
  });
};
