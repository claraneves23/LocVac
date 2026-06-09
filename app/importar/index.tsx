import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppContext } from '../../src/context/AppContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import { ScreenTitle } from '../../components/redesign';
import { type Colors, radii, shadows, spacing, scaleTypography } from '../../src/theme/tokens';
import {
  ConvitePreview,
  aceitarConvite,
  extrairToken,
  previewConvite,
} from '../../src/service/sharingService';

type Mode = 'scan' | 'codigo';

const mensagemErro = (e: any): string => {
  const status = e?.response?.status;
  if (status === 404) return 'Convite não encontrado. Verifique o código.';
  if (status === 410) return 'Este convite expirou ou foi cancelado.';
  if (status === 409) return 'Este convite já foi utilizado.';
  if (status === 400) return 'Você não pode aceitar o próprio convite.';
  if (status === undefined) return 'Sem conexão. Verifique sua internet.';
  return 'Não foi possível ler o convite. Tente novamente.';
};

export default function Importar() {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fontScale } = useAccessibility();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const { refreshDependents } = useAppContext();

  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<Mode>('scan');
  const [codigo, setCodigo] = useState('');
  const [tokenAtual, setTokenAtual] = useState<string | null>(null);
  const [preview, setPreview] = useState<ConvitePreview | null>(null);
  const [processando, setProcessando] = useState(false);
  const [aceitando, setAceitando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const scannedRef = useRef(false);

  const novos = useMemo(
    () => (preview ? preview.dependentes.filter((d) => !d.jaTenhoAcesso) : []),
    [preview]
  );

  const processar = useCallback(async (raw: string) => {
    const token = extrairToken(raw);
    if (!token) return;
    setProcessando(true);
    setErro(null);
    try {
      const p = await previewConvite(token);
      setTokenAtual(token);
      setPreview(p);
    } catch (e) {
      setErro(mensagemErro(e));
      scannedRef.current = false;
    } finally {
      setProcessando(false);
    }
  }, []);

  // Deep link: locvac://importar?token=...
  useEffect(() => {
    if (tokenParam) {
      processar(String(tokenParam));
    }
  }, [tokenParam, processar]);

  const onBarcode = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    processar(data);
  };

  const aceitar = async () => {
    if (!tokenAtual || !preview) return;
    setAceitando(true);
    try {
      await aceitarConvite(tokenAtual);
      await refreshDependents();
      const nomes = novos.map((d) => d.nome).join(', ');
      Alert.alert(
        'Pronto!',
        `${nomes || 'Dependente(s)'} ${novos.length === 1 ? 'foi adicionado(a)' : 'foram adicionados'} aos seus dependentes.`,
        [{ text: 'OK', onPress: () => router.replace('/user') }]
      );
    } catch (e: any) {
      Alert.alert('Erro', mensagemErro(e));
    } finally {
      setAceitando(false);
    }
  };

  const recomecar = () => {
    setPreview(null);
    setTokenAtual(null);
    setErro(null);
    setCodigo('');
    scannedRef.current = false;
  };

  // ——— Tela de confirmação do convite ———
  if (preview) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <ScreenTitle title="Importar dependente" back={() => router.back()} />
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewBy}>
              Compartilhado por <Text style={styles.bold}>{preview.compartilhadoPorNome}</Text>
            </Text>
            <View style={styles.permRow}>
              <Ionicons
                name={preview.podeEditar ? 'create-outline' : 'eye-outline'}
                size={14}
                color={colors.brandInk}
              />
              <Text style={styles.permText}>
                {preview.podeEditar ? 'Acesso e controle total' : 'Apenas visualização'}
              </Text>
            </View>
          </View>

          <View style={styles.previewCard}>
            {preview.dependentes.map((d) => (
              <View key={d.idPessoa} style={styles.depRow}>
                <View style={styles.previewAvatar}>
                  <Ionicons name="person" size={18} color={colors.brandInk} />
                </View>
                <Text style={styles.depName} numberOfLines={1}>{d.nome}</Text>
                {d.jaTenhoAcesso ? (
                  <Text style={styles.depJaTag}>já vinculado</Text>
                ) : (
                  <Ionicons name="add-circle" size={20} color={colors.success} />
                )}
              </View>
            ))}
          </View>

          {novos.length === 0 ? (
            <View style={styles.noteWarn}>
              <Ionicons name="information-circle-outline" size={18} color={colors.warnInk} />
              <Text style={styles.noteWarnText}>
                Você já tem acesso a {preview.dependentes.length === 1 ? 'este dependente' : 'todos estes dependentes'}.
              </Text>
            </View>
          ) : (
            <Text style={styles.previewHint}>
              Ao importar, {novos.length === 1 ? 'este dependente passa' : 'estes dependentes passam'} a
              aparecer na sua conta. As alterações são compartilhadas entre os responsáveis.
            </Text>
          )}

          <Pressable
            style={[styles.primaryBtn, (aceitando || novos.length === 0) && styles.btnDisabled]}
            onPress={aceitar}
            disabled={aceitando || novos.length === 0}
          >
            {aceitando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {novos.length === 0
                  ? 'Já vinculados'
                  : `Importar ${novos.length > 1 ? `${novos.length} dependentes` : 'dependente'}`}
              </Text>
            )}
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={recomecar}>
            <Text style={styles.ghostBtnText}>Ler outro convite</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ——— Entrada: escanear ou digitar ———
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScreenTitle title="Importar dependente" back={() => router.back()} />

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, mode === 'scan' && styles.tabActive]}
            onPress={() => { setMode('scan'); setErro(null); }}
          >
            <Ionicons name="qr-code-outline" size={16} color={mode === 'scan' ? colors.white : colors.brandInk} />
            <Text style={[styles.tabText, mode === 'scan' && styles.tabTextActive]}>Escanear QR</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, mode === 'codigo' && styles.tabActive]}
            onPress={() => { setMode('codigo'); setErro(null); scannedRef.current = false; }}
          >
            <Ionicons name="keypad-outline" size={16} color={mode === 'codigo' ? colors.white : colors.brandInk} />
            <Text style={[styles.tabText, mode === 'codigo' && styles.tabTextActive]}>Inserir código</Text>
          </Pressable>
        </View>

        {mode === 'scan' ? (
          <View style={styles.scanCard}>
            {!permission ? (
              <View style={styles.scanPlaceholder}>
                <ActivityIndicator color={colors.brand} />
              </View>
            ) : !permission.granted ? (
              <View style={styles.scanPlaceholder}>
                <Ionicons name="camera-outline" size={32} color={colors.ink3} />
                <Text style={styles.scanHint}>Precisamos da câmera para ler o QR code.</Text>
                <Pressable style={styles.retryBtn} onPress={requestPermission}>
                  <Text style={styles.retryText}>Permitir câmera</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.cameraBox}>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={processando ? undefined : onBarcode}
                />
                <View style={styles.scanFrame} pointerEvents="none" />
                {processando ? (
                  <View style={styles.scanOverlay}>
                    <ActivityIndicator color={colors.white} />
                  </View>
                ) : null}
              </View>
            )}
            <Text style={styles.scanCaption}>Aponte para o QR code exibido no outro celular.</Text>
          </View>
        ) : (
          <View style={styles.codeCard}>
            <Text style={styles.label}>Código do convite</Text>
            <TextInput
              style={styles.codeInput}
              value={codigo}
              onChangeText={(v) => { setCodigo(v.toUpperCase()); setErro(null); }}
              placeholder="Ex.: ABCD2345"
              placeholderTextColor={colors.ink4}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={64}
            />
            <Pressable
              style={[styles.primaryBtn, (processando || !codigo.trim()) && styles.btnDisabled]}
              onPress={() => processar(codigo)}
              disabled={processando || !codigo.trim()}
            >
              {processando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Continuar</Text>
              )}
            </Pressable>
          </View>
        )}

        {erro ? (
          <View style={styles.noteErr}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.dangerInk} />
            <Text style={styles.noteErrText}>{erro}</Text>
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
    tabs: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      height: 44,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.bgElev,
    },
    tabActive: {
      backgroundColor: c.brand,
      borderColor: c.brand,
    },
    tabText: {
      ...typography.small,
      fontWeight: '700',
      color: c.brandInk,
    },
    tabTextActive: {
      color: c.white,
    },
    scanCard: {
      alignItems: 'center',
      gap: spacing.md,
    },
    cameraBox: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radii.lg,
      overflow: 'hidden',
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanFrame: {
      width: '70%',
      height: '70%',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.9)',
      borderRadius: radii.lg,
    },
    scanOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    scanPlaceholder: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.bgElev,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      padding: spacing.lg,
    },
    scanHint: {
      ...typography.body,
      color: c.ink2,
      textAlign: 'center',
    },
    scanCaption: {
      ...typography.small,
      color: c.ink3,
      textAlign: 'center',
    },
    codeCard: {
      backgroundColor: c.bgElev,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      padding: spacing.lg,
      gap: spacing.md,
    },
    label: {
      ...typography.caption,
      textTransform: 'uppercase',
      color: c.ink3,
      fontWeight: '600',
    },
    codeInput: {
      height: 52,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.bgMuted,
      paddingHorizontal: spacing.lg,
      fontFamily: 'monospace',
      fontSize: 20,
      letterSpacing: 3,
      color: c.ink,
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
      alignItems: 'center',
      justifyContent: 'center',
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
    retryBtn: {
      marginTop: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radii.pill,
      backgroundColor: c.brandSoft,
    },
    retryText: {
      ...typography.small,
      color: c.brandInk,
      fontWeight: '700',
    },
    previewHeader: {
      gap: spacing.sm,
      alignItems: 'flex-start',
    },
    bold: {
      fontWeight: '700',
      color: c.ink,
    },
    previewCard: {
      backgroundColor: c.bgElev,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: c.line,
      padding: spacing.lg,
      gap: spacing.sm,
      ...shadows.md,
    },
    depRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    previewAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    depName: {
      ...typography.body,
      fontWeight: '600',
      color: c.ink,
      flex: 1,
      minWidth: 0,
    },
    depJaTag: {
      ...typography.caption,
      color: c.ink3,
      fontStyle: 'italic',
    },
    previewBy: {
      ...typography.body,
      color: c.ink2,
    },
    permRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radii.pill,
      backgroundColor: c.brandSoft,
    },
    permText: {
      ...typography.small,
      color: c.brandInk,
      fontWeight: '600',
    },
    previewHint: {
      ...typography.body,
      color: c.ink2,
    },
    noteWarn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.md,
      backgroundColor: c.warnSoft,
    },
    noteWarnText: {
      ...typography.small,
      color: c.warnInk,
      flex: 1,
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
