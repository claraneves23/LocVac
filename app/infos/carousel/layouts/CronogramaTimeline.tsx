import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { useMemo, useState } from 'react';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import Ionicons from '@expo/vector-icons/Ionicons';
import { CarrosselConteudoDTO } from '../../../../src/types/info';
import { type Colors, radii, shadows, spacing, typography } from '../../../../src/theme/tokens';
import { useTheme } from '../../../../src/context/ThemeContext';

type Props = { secoes: CarrosselConteudoDTO[] };

const PUBLIC_GROUPS = ['criança', 'adolescente', 'adulto', 'idoso', 'gestante'] as const;
type PublicGroup = typeof PUBLIC_GROUPS[number];

const detectGroup = (titulo: string): PublicGroup => {
  const t = titulo.toLowerCase();
  if (t.includes('gestante')) return 'gestante';
  if (t.includes('idoso')) return 'idoso';
  if (t.includes('adulto')) return 'adulto';
  if (t.includes('adolescente')) return 'adolescente';
  return 'criança';
};

const GROUP_META: Record<PublicGroup, { label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  'criança':     { label: 'Criança',     icon: 'happy-outline' },
  adolescente:    { label: 'Adolescente', icon: 'school-outline' },
  adulto:         { label: 'Adulto',      icon: 'person-outline' },
  idoso:          { label: 'Idoso',       icon: 'walk-outline' },
  gestante:       { label: 'Gestante',    icon: 'heart-outline' },
};

export default function CronogramaTimeline({ secoes }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // agrupa as secoes por publico
  const grupos = useMemo(() => {
    const map = new Map<PublicGroup, CarrosselConteudoDTO[]>();
    PUBLIC_GROUPS.forEach((g) => map.set(g, []));
    secoes.forEach((s) => {
      const g = detectGroup(s.tituloSecao);
      map.get(g)!.push(s);
    });
    return PUBLIC_GROUPS
      .map((g) => ({ grupo: g, meta: GROUP_META[g], secoes: map.get(g)! }))
      .filter((x) => x.secoes.length > 0);
  }, [secoes]);

  // expansao por grupo — default: todos expandidos
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PUBLIC_GROUPS.map((g) => [g, true]))
  );

  const toggle = (grupo: PublicGroup) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => ({ ...e, [grupo]: !e[grupo] }));
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollInner}
      showsVerticalScrollIndicator={false}
    >
      {grupos.map(({ grupo, meta, secoes: secoesDoGrupo }) => {
        const isOpen = expanded[grupo];
        return (
          <View key={grupo} style={styles.groupBlock}>
            <Pressable style={styles.groupHeader} onPress={() => toggle(grupo)}>
              <View style={styles.groupIcon}>
                <Ionicons name={meta.icon} size={18} color={colors.brandInk} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupLabel}>{meta.label}</Text>
                <Text style={styles.groupCount}>
                  {secoesDoGrupo.length} {secoesDoGrupo.length === 1 ? 'faixa' : 'faixas'}
                </Text>
              </View>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.ink3}
              />
            </Pressable>

            {isOpen && (
              <View style={styles.timeline}>
                {secoesDoGrupo.map((secao, idx) => {
                  const isLast = idx === secoesDoGrupo.length - 1;
                  return (
                    <View key={secao.id} style={styles.timelineRow}>
                      <View style={styles.timelineLeft}>
                        <View style={styles.timelineDot}>
                          <View style={styles.timelineDotInner} />
                        </View>
                        {!isLast && <View style={styles.timelineLine} />}
                      </View>

                      <View style={styles.timelineRight}>
                        <Text style={styles.idadeLabel}>{secao.tituloSecao}</Text>
                        {secao.conteudo ? (
                          <Text style={styles.idadeSub}>{secao.conteudo}</Text>
                        ) : null}

                        {secao.itens && secao.itens.length > 0 ? (
                          <View style={styles.vacinasList}>
                            {secao.itens.map((item, i) => (
                              <View key={i} style={styles.vacinaChip}>
                                <Ionicons
                                  name="shield-checkmark-outline"
                                  size={14}
                                  color={colors.brandInk}
                                  style={{ marginRight: 6 }}
                                />
                                <Text style={styles.vacinaText}>{item}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const DOT_SIZE = 14;
const DOT_INNER = 6;
const LEFT_COL_WIDTH = 28;

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollInner: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: 130,
    },
    groupBlock: {
      marginBottom: spacing.xl,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: spacing.md,
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: c.bgElev,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: c.line,
    },
    groupIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupLabel: {
      ...typography.h3,
      color: c.ink,
    },
    groupCount: {
      ...typography.caption,
      color: c.ink3,
      marginTop: 2,
    },
    timeline: {
      paddingLeft: 4,
    },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    timelineLeft: {
      width: LEFT_COL_WIDTH,
      alignItems: 'center',
    },
    timelineDot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: c.brandSoft,
      borderWidth: 2,
      borderColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    timelineDotInner: {
      width: DOT_INNER,
      height: DOT_INNER,
      borderRadius: DOT_INNER / 2,
      backgroundColor: c.brand,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: c.line,
      marginTop: 2,
    },
    timelineRight: {
      flex: 1,
      paddingBottom: spacing.lg,
      paddingLeft: spacing.sm,
    },
    idadeLabel: {
      ...typography.bodyLg,
      fontWeight: '700',
      color: c.ink,
    },
    idadeSub: {
      ...typography.small,
      color: c.ink3,
      marginTop: 2,
    },
    vacinasList: {
      marginTop: spacing.sm,
      gap: 6,
    },
    vacinaChip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: c.bgElev,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: c.line,
      paddingVertical: 8,
      paddingHorizontal: 10,
      ...shadows.sm,
    },
    vacinaText: {
      flex: 1,
      ...typography.small,
      color: c.ink,
      lineHeight: 18,
    },
  });
