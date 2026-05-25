import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useMemo, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CarrosselConteudoDTO } from '../../../../src/types/info';
import { type Colors, radii, shadows, spacing, typography } from '../../../../src/theme/tokens';
import { useTheme } from '../../../../src/context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = { secoes: CarrosselConteudoDTO[] };

export default function DuvidasFrequentesLayout({ secoes }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((cur) => (cur === id ? null : id));
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollInner}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Ionicons name="help-circle" size={22} color={colors.brandInk} />
        </View>
        <Text style={styles.introText}>
          Toque em uma pergunta para ver a resposta.
        </Text>
      </View>

      {secoes.map((secao) => {
        const isOpen = openId === secao.id;
        return (
          <View key={secao.id} style={[styles.faqCard, isOpen && styles.faqCardOpen]}>
            <Pressable style={styles.faqHeader} onPress={() => toggle(secao.id)}>
              <View style={styles.qBadge}>
                <Text style={styles.qBadgeText}>P</Text>
              </View>
              <Text style={styles.faqQuestion}>{secao.tituloSecao}</Text>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.ink3}
              />
            </Pressable>

            {isOpen && (
              <View style={styles.faqAnswer}>
                <View style={styles.answerRow}>
                  <View style={styles.aBadge}>
                    <Text style={styles.aBadgeText}>R</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    {secao.conteudo ? (
                      <Text style={styles.respostaTexto}>{secao.conteudo}</Text>
                    ) : null}
                    {secao.itens && secao.itens.length > 0 ? (
                      <View style={styles.itensList}>
                        {secao.itens.map((item, i) => (
                          <View key={i} style={styles.itemRow}>
                            <View style={styles.itemBullet} />
                            <Text style={styles.itemTexto}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollInner: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: 130,
    },
    intro: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.brandSoft,
      borderRadius: radii.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    introIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.bgElev,
      alignItems: 'center',
      justifyContent: 'center',
    },
    introText: {
      flex: 1,
      ...typography.small,
      color: c.brandInk,
      fontWeight: '500',
    },
    faqCard: {
      backgroundColor: c.bgElev,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: c.line,
      marginBottom: 10,
      overflow: 'hidden',
    },
    faqCardOpen: {
      borderColor: c.brandInk,
      ...shadows.sm,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.md,
    },
    qBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qBadgeText: {
      ...typography.body,
      fontWeight: '800',
      color: c.white,
    },
    faqQuestion: {
      flex: 1,
      ...typography.body,
      fontWeight: '600',
      color: c.ink,
      lineHeight: 20,
    },
    faqAnswer: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.line,
      paddingTop: spacing.md,
    },
    answerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    aBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.brandSoft,
      borderWidth: 1,
      borderColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aBadgeText: {
      ...typography.body,
      fontWeight: '800',
      color: c.brandInk,
    },
    respostaTexto: {
      ...typography.body,
      color: c.ink2,
      lineHeight: 20,
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
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.brandInk,
      marginTop: 8,
    },
    itemTexto: {
      flex: 1,
      ...typography.small,
      color: c.ink2,
      lineHeight: 18,
    },
  });
