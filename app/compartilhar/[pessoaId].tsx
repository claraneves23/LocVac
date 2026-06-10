import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppContext } from '../../src/context/AppContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import { ScreenTitle } from '../../components/redesign';
import { type Colors, radii, shadows, spacing, scaleTypography } from '../../src/theme/tokens';
import {
  Acesso,
  ConviteResponse,
  cancelarConvite,
  criarConvite,
  listarAcessos,
  revogarAcesso,
} from '../../src/service/sharingService';

const fmtExpira = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} às ${hh}:${mi}`;
};

export default function Compartilhar() {
  const { pessoaId } = useLocalSearchParams<{ pessoaId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fontScale } = useAccessibility();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const { dependents } = useAppContext();

  const [selecionados, setSelecionados] = useState<string[]>(() =>
    pessoaId && dependents.some((d) => d.id === pessoaId) ? [pessoaId] : []
  );
  const [convite, setConvite] = useState<ConviteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [acessos, setAcessos] = useState<Record<string, Acesso[]>>({});

  const nomeFor = useCallback(
    (id: string) => dependents.find((d) => d.id === id)?.name ?? 'dependente',
    [dependents]
  );

  const toggle = (id: string) => {
    setConvite(null); // a seleção mudou: invalida o convite atual
    setErro(null);
    setSelecionados((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  // Carrega "quem tem acesso" de cada dependente selecionado.
  useEffect(() => {
    let active = true;
    (async () => {
      const entries = await Promise.all(
        selecionados.map(async (id) => {
          try {
            return [id, await listarAcessos(id)] as const;
          } catch {
            return [id, [] as Acesso[]] as const;
          }
        })
      );
      if (active) setAcessos(Object.fromEntries(entries));
    })();
    return () => {
      active = false;
    };
  }, [selecionados]);

  const gerar = useCallback(async () => {
    if (selecionados.length === 0) return;
    if (convite) cancelarConvite(convite.token).catch(() => {});
    setLoading(true);
    setErro(null);
    try {
      setConvite(await criarConvite(selecionados));
    } catch (e: any) {
      const status = e?.response?.status;
      setErro(
        status === 403
          ? 'Você não tem permissão para compartilhar um dos dependentes.'
          : 'Não foi possível gerar o convite. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, [selecionados, convite]);

  const compartilharLink = async () => {
    if (!convite) return;
    const nomes = selecionados.map(nomeFor).join(', ');
    try {
      await Share.share({
        message:
          `Compartilhei no LocVac a carteira de vacinação de: ${nomes}.\n\n` +
          `Abra o link no app: ${convite.deepLink}\n` +
          `Ou use o código: ${convite.codigo}`,
      });
    } catch {
      // usuário cancelou
    }
  };

  const handleRevogar = (idPessoa: string, acesso: Acesso) => {
    Alert.alert(
      'Revogar acesso',
      `Remover o acesso de ${acesso.usuarioNome} a ${nomeFor(idPessoa)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revogar',
          style: 'destructive',
          onPress: async () => {
            try {
              await revogarAcesso(acesso.idUsuarioPessoa);
              const atualizada = await listarAcessos(idPessoa);
              setAcessos((cur) => ({ ...cur, [idPessoa]: atualizada }));
            } catch {
              Alert.alert('Erro', 'Não foi possível revogar o acesso.');
            }
          },
        },
      ]
    );
  };

  const n = selecionados.length;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScreenTitle title="Compartilhar" back={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Selecione os dependentes e gere um único QR/código. Quem receber terá{' '}
          <Text style={styles.bold}>acesso e controle</Text> da carteira deles.
        </Text>

        {/* Seleção */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dependentes</Text>
          {dependents.length === 0 ? (
            <Text style={styles.empty}>Você não tem dependentes para compartilhar.</Text>
          ) : (
            dependents.map((d) => {
              const sel = selecionados.includes(d.id);
              return (
                <Pressable key={d.id} style={styles.pickRow} onPress={() => toggle(d.id)}>
                  <View style={styles.pickAvatar}>
                    <Ionicons name="person" size={16} color={colors.brandInk} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.pickName} numberOfLines={1}>{d.name}</Text>
                    {d.relationship ? <Text style={styles.pickMeta}>{d.relationship}</Text> : null}
                  </View>
                  <Ionicons
                    name={sel ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={sel ? colors.brand : colors.ink4}
                  />
                </Pressable>
              );
            })
          )}
        </View>

        {/* QR gerado */}
        {convite && !loading ? (
          <View style={styles.qrCard}>
            <View style={styles.qrBox}>
              <QRCode value={convite.deepLink} size={208} backgroundColor="#FFFFFF" color="#000000" />
            </View>
            <Text style={styles.codeLabel}>Código</Text>
            <Text style={styles.code} selectable>{convite.codigo}</Text>
            <Text style={styles.validade}>
              {n} {n === 1 ? 'dependente' : 'dependentes'} · válido até {fmtExpira(convite.expiraEm)}
            </Text>
          </View>
        ) : null}

        {erro ? (
          <View style={styles.noteErr}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.dangerInk} />
            <Text style={styles.noteErrText}>{erro}</Text>
          </View>
        ) : null}

        {/* Ações */}
        <Pressable
          style={[styles.primaryBtn, (loading || n === 0) && styles.btnDisabled]}
          onPress={gerar}
          disabled={loading || n === 0}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name={convite ? 'refresh' : 'qr-code-outline'} size={18} color={colors.white} />
              <Text style={styles.primaryBtnText}>
                {convite ? 'Gerar novo convite' : `Gerar convite${n > 0 ? ` (${n})` : ''}`}
              </Text>
            </>
          )}
        </Pressable>

        {convite && !loading ? (
          <Pressable style={styles.ghostBtn} onPress={compartilharLink}>
            <Ionicons name="share-social-outline" size={16} color={colors.brandInk} />
            <Text style={styles.ghostBtnText}>Compartilhar link e código</Text>
          </Pressable>
        ) : null}

        {/* Quem tem acesso */}
        {selecionados.some((id) => (acessos[id]?.length ?? 0) > 0) ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Quem tem acesso</Text>
            {selecionados.map((id) => {
              const lista = acessos[id] ?? [];
              if (lista.length === 0) return null;
              // Só quem compartilhou (o dono) pode remover outros responsáveis.
              const souDono = lista.some((a) => a.ehVoce && a.ehDono);
              return (
                <View key={id} style={styles.accessGroup}>
                  {n > 1 ? <Text style={styles.accessGroupTitle}>{nomeFor(id)}</Text> : null}
                  {lista.map((a) => (
                    <View key={a.idUsuarioPessoa} style={styles.accessRow}>
                      <View style={styles.pickAvatar}>
                        <Ionicons name="person" size={16} color={colors.brandInk} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.pickName} numberOfLines={1}>
                          {a.usuarioNome}
                          {a.ehVoce ? <Text style={styles.youTag}>  · Você</Text> : null}
                          {a.ehDono ? <Text style={styles.youTag}>  · Compartilhou</Text> : null}
                        </Text>
                        <Text style={styles.pickMeta} numberOfLines={1}>{a.usuarioEmail}</Text>
                      </View>
                      {souDono && !a.ehVoce && !a.ehDono ? (
                        <Pressable onPress={() => handleRevogar(id, a)} hitSlop={8} style={{ padding: 4 }}>
                          <Ionicons name="close-circle-outline" size={20} color={colors.coral} />
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors, fontScale = 1, typography = scaleTypography(fontScale)) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bgMuted,
      paddingTop: '5%' as any,
    },
    scroll: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    intro: {
      ...typography.body,
      color: c.ink2,
    },
    bold: {
      fontWeight: '700',
      color: c.ink,
    },
    card: {
      backgroundColor: c.bgElev,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: c.brand,
      marginBottom: spacing.xs,
    },
    empty: {
      ...typography.body,
      color: c.ink3,
    },
    pickRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    pickAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pickName: {
      ...typography.body,
      fontWeight: '600',
      color: c.ink,
    },
    pickMeta: {
      ...typography.small,
      color: c.ink3,
    },
    qrCard: {
      backgroundColor: c.bgElev,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      padding: spacing.xl,
      alignItems: 'center',
      ...shadows.md,
    },
    qrBox: {
      padding: 12,
      backgroundColor: '#FFFFFF',
      borderRadius: radii.md,
    },
    codeLabel: {
      ...typography.caption,
      textTransform: 'uppercase',
      color: c.ink3,
      marginTop: spacing.lg,
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 28,
      letterSpacing: 4,
      fontWeight: '700',
      color: c.ink,
      marginTop: 2,
    },
    validade: {
      ...typography.small,
      color: c.ink3,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      height: 52,
      borderRadius: radii.lg,
      backgroundColor: c.brand,
      ...shadows.sm,
    },
    primaryBtnText: {
      color: c.white,
      fontSize: 15,
      fontWeight: '700',
    },
    btnDisabled: {
      opacity: 0.5,
    },
    ghostBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      height: 46,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.bgElev,
    },
    ghostBtnText: {
      color: c.brandInk,
      fontSize: 14,
      fontWeight: '600',
    },
    accessGroup: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    accessGroupTitle: {
      ...typography.small,
      fontWeight: '700',
      color: c.ink2,
    },
    accessRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    youTag: {
      fontWeight: '600',
      color: c.ink3,
    },
    noteErr: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.md,
      backgroundColor: c.dangerSoft,
    },
    noteErrText: {
      ...typography.small,
      color: c.dangerInk,
      flex: 1,
    },
  });
