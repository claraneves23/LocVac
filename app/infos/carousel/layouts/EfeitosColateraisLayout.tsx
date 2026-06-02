import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CarrosselConteudoDTO } from '../../../../src/types/info';
import { type Colors, makeTonePairs, radii, shadows, spacing, scaleTypography, Tone } from '../../../../src/theme/tokens';
import { useTheme } from '../../../../src/context/ThemeContext';
import { useAccessibility } from '../../../../src/context/AccessibilityContext';

type Props = { secoes: CarrosselConteudoDTO[] };

type SeverityKey = 'leve' | 'moderada' | 'grave' | 'orientacao';

const SEVERITY_META: Record<
  SeverityKey,
  { tone: Tone; icon: React.ComponentProps<typeof Ionicons>['name']; label: string }
> = {
  leve:       { tone: 'success', icon: 'checkmark-circle',   label: 'Leve' },
  moderada:   { tone: 'warn',    icon: 'alert-circle',       label: 'Moderada' },
  grave:      { tone: 'danger',  icon: 'warning',            label: 'Grave' },
  orientacao: { tone: 'brand',   icon: 'information-circle', label: 'Orientação' },
};

const detectSeverity = (titulo: string): SeverityKey => {
  const t = titulo.toLowerCase();
  if (t.includes('grave') || t.includes('emergência') || t.includes('emergencia') || t.includes('sério') || t.includes('serio')) return 'grave';
  if (t.includes('moderada') || t.includes('moderado')) return 'moderada';
  if (t.includes('leve') || t.includes('comum')) return 'leve';
  return 'orientacao';
};

export default function EfeitosColateraisLayout({ secoes }: Props) {
  const { colors } = useTheme();
  const { fontScale } = useAccessibility();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const tonePairs = useMemo(() => makeTonePairs(colors), [colors]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollInner}
      showsVerticalScrollIndicator={false}
    >
      {secoes.map((secao) => {
        const key = detectSeverity(secao.tituloSecao);
        const meta = SEVERITY_META[key];
        const tone = tonePairs[meta.tone];
        return (
          <View
            key={secao.id}
            style={[styles.card, { borderLeftColor: tone.solid }]}
          >
            <View style={styles.header}>
              <View style={[styles.iconWrap, { backgroundColor: tone.bg }]}>
                <Ionicons name={meta.icon} size={18} color={tone.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.severityBadge, { backgroundColor: tone.bg }]}>
                  <Text style={[styles.severityText, { color: tone.ink }]}>{meta.label}</Text>
                </View>
                <Text style={styles.titulo}>{secao.tituloSecao}</Text>
              </View>
            </View>

            {secao.conteudo ? (
              <Text style={styles.conteudo}>{secao.conteudo}</Text>
            ) : null}

            {secao.itens && secao.itens.length > 0 ? (
              <View style={styles.itensList}>
                {secao.itens.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={[styles.itemBullet, { backgroundColor: tone.solid }]} />
                    <Text style={styles.itemTexto}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (c: Colors, fontScale = 1, typography = scaleTypography(fontScale)) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollInner: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: 130,
    },
    card: {
      backgroundColor: c.bgElev,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      borderLeftWidth: 4,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    severityBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radii.pill,
      marginBottom: 4,
    },
    severityText: {
      ...typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    titulo: {
      ...typography.h3,
      color: c.ink,
    },
    conteudo: {
      ...typography.body,
      color: c.ink2,
      marginBottom: spacing.sm,
    },
    itensList: {
      marginTop: spacing.sm,
      gap: 8,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    itemBullet: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginTop: 8,
    },
    itemTexto: {
      flex: 1,
      ...typography.body,
      color: c.ink2,
    },
  });
