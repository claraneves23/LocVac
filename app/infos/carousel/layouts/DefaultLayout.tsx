import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { CarrosselConteudoDTO } from '../../../../src/types/info';
import { type Colors, radii, shadows, spacing, typography } from '../../../../src/theme/tokens';
import { useTheme } from '../../../../src/context/ThemeContext';

type Props = { secoes: CarrosselConteudoDTO[] };

export default function DefaultLayout({ secoes }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentInner}
      showsVerticalScrollIndicator={false}
    >
      {secoes.map((secao) => (
        <View key={secao.id} style={styles.secaoCard}>
          <Text style={styles.secaoTitulo}>{secao.tituloSecao}</Text>
          {secao.conteudo ? <Text style={styles.secaoConteudo}>{secao.conteudo}</Text> : null}
          {secao.itens && secao.itens.length > 0 ? (
            <View style={styles.itensList}>
              {secao.itens.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemBullet} />
                  <Text style={styles.itemTexto}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    content: { flex: 1 },
    contentInner: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: 130,
    },
    secaoCard: {
      backgroundColor: c.bgElev,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    secaoTitulo: { ...typography.h3, color: c.ink, marginBottom: spacing.sm },
    secaoConteudo: { ...typography.body, color: c.ink2 },
    itensList: { marginTop: spacing.sm, gap: 10 },
    itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    itemBullet: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.brandInk,
      marginTop: 8,
    },
    itemTexto: { flex: 1, ...typography.body, color: c.ink2 },
  });
