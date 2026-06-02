import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useKeyboardHeight } from '../../src/hooks/useKeyboardHeight';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { useTheme } from '../../src/context/ThemeContext';
import { useAccessibility, type FontScalePref } from '../../src/context/AccessibilityContext';
import { useAppContext } from '../../src/context/AppContext';
import { logout, excluirConta } from '../../src/service/authService';
import { radii, spacing, scaleTypography, type Colors } from '../../src/theme/tokens';

const FONT_OPTIONS: { pref: FontScalePref; label: string; short: string; size: number }[] = [
  { pref: 'P', label: 'Pequeno', short: 'P', size: 13 },
  { pref: 'M', label: 'Médio', short: 'M', size: 16 },
  { pref: 'G', label: 'Grande', short: 'G', size: 19 },
  { pref: 'GG', label: 'Muito grande', short: 'GG', size: 22 },
];

export default function Configuracoes() {
  const { isDark, colors, toggleTheme, highContrast, toggleHighContrast } = useTheme();
  const { reduceMotion, setReduceMotionPref, fontScalePref, setFontScalePref, fontScale } =
    useAccessibility();
  const { reset } = useAppContext();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colors, fontScale), [colors, fontScale]);
  const keyboardHeight = useKeyboardHeight();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    reset();
    router.replace('/login');
  };

  const abrirConfirmacaoExclusao = () => {
    Alert.alert(
      'Excluir conta',
      'Esta ação é irreversível. Todos os seus dados, registros de vacinação e dependentes vinculados apenas à sua conta serão permanentemente apagados. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => {
            setSenha('');
            setErro(null);
            setModalVisivel(true);
          },
        },
      ],
    );
  };

  const confirmarExclusao = async () => {
    if (!senha.trim()) {
      setErro('Informe sua senha.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await excluirConta(senha);
      setModalVisivel(false);
      reset();
      Alert.alert('Conta excluída', 'Sua conta e seus dados foram apagados.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        setErro('Senha incorreta.');
      } else {
        setErro('Não foi possível excluir a conta. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const fecharModal = () => {
    if (enviando) return;
    setModalVisivel(false);
    setSenha('');
    setErro(null);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ animation: 'slide_from_right', headerShown: false }} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Aparência</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={colors.brandInk} />
              <Text style={styles.rowLabel}>Modo escuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.line, true: colors.brand }}
              thumbColor={colors.white}
              accessibilityLabel="Modo escuro"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Acessibilidade</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="pulse-outline" size={20} color={colors.brandInk} />
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowLabel}>Reduzir movimento</Text>
                <Text style={styles.rowHint}>Diminui animações e transições</Text>
              </View>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={(v) => setReduceMotionPref(v ? 'on' : 'off')}
              trackColor={{ false: colors.line, true: colors.brand }}
              thumbColor={colors.white}
              accessibilityLabel="Reduzir movimento"
              accessibilityHint="Diminui animações e transições da interface"
            />
          </View>

          <View style={styles.fontCard}>
            <View style={styles.rowLeft}>
              <Ionicons name="text-outline" size={20} color={colors.brandInk} />
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowLabel}>Tamanho da fonte</Text>
                <Text style={styles.rowHint}>Multiplica sobre o ajuste do aparelho</Text>
              </View>
            </View>
            <View style={styles.segment}>
              {FONT_OPTIONS.map((opt) => {
                const active = fontScalePref === opt.pref;
                return (
                  <TouchableOpacity
                    key={opt.pref}
                    style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                    onPress={() => setFontScalePref(opt.pref)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Tamanho da fonte: ${opt.label}`}
                  >
                    <Text
                      style={[styles.segmentLetter, { fontSize: opt.size }, active && styles.segmentTextActive]}
                      allowFontScaling={false}
                    >
                      A
                    </Text>
                    <Text style={[styles.segmentCaption, active && styles.segmentTextActive]}>
                      {opt.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="contrast-outline" size={20} color={colors.brandInk} />
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowLabel}>Alto contraste</Text>
                <Text style={styles.rowHint}>Cores e bordas mais fortes</Text>
              </View>
            </View>
            <Switch
              value={highContrast}
              onValueChange={toggleHighContrast}
              trackColor={{ false: colors.line, true: colors.brand }}
              thumbColor={colors.white}
              accessibilityLabel="Alto contraste"
              accessibilityHint="Aumenta o contraste de cores e bordas"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Conta</Text>
          <TouchableOpacity
            style={styles.logoutRow}
            onPress={handleLogout}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.coralInk} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteRow}
            onPress={abrirConfirmacaoExclusao}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Excluir conta"
          >
            <Ionicons name="trash-outline" size={20} color={colors.coralInk} />
            <Text style={styles.deleteText}>Excluir conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={fecharModal}
      >
        <View style={[styles.modalBackdrop, { paddingBottom: keyboardHeight }]}>
          <View style={styles.modalCard} accessibilityViewIsModal accessibilityLabel="Confirmar exclusão de conta">
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.modalText}>
              Para confirmar, informe sua senha atual. Após esta etapa, sua conta será apagada
              imediatamente.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Senha atual"
              placeholderTextColor={colors.ink3}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={senha}
              onChangeText={(v) => {
                setSenha(v);
                if (erro) setErro(null);
              }}
              editable={!enviando}
            />
            {erro ? (
              <Text style={styles.erroText} accessibilityLiveRegion="polite" accessibilityRole="alert">
                {erro}
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={fecharModal}
                disabled={enviando}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cancelar"
                accessibilityState={{ disabled: enviando }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={confirmarExclusao}
                disabled={enviando}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Excluir conta"
                accessibilityState={{ disabled: enviando, busy: enviando }}
              >
                {enviando ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c: Colors, fontScale = 1, typography = scaleTypography(fontScale)) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
    paddingTop: '5%' as any,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.bgElev,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.labelCap,
    color: c.ink3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  rowTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowLabel: {
    ...typography.body,
    color: c.ink,
  },
  rowHint: {
    ...typography.small,
    color: c.ink3,
  },
  fontCard: {
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.bgMuted,
    gap: 2,
  },
  segmentBtnActive: {
    borderColor: c.brand,
    backgroundColor: c.brandSoft,
  },
  segmentLetter: {
    color: c.ink2,
    fontWeight: '700',
    lineHeight: 24,
  },
  segmentCaption: {
    ...typography.caption,
    color: c.ink3,
  },
  segmentTextActive: {
    color: c.brandInk,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: c.coralSoft,
    borderRadius: radii.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: c.coralSoft,
  },
  logoutText: {
    ...typography.body,
    color: c.coralInk,
    fontWeight: '600',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderRadius: radii.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: c.coralInk,
  },
  deleteText: {
    ...typography.body,
    color: c.coralInk,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: c.line,
  },
  modalTitle: {
    ...typography.h3,
    color: c.ink,
  },
  modalText: {
    ...typography.body,
    color: c.ink2,
  },
  input: {
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: c.ink,
    backgroundColor: c.bgMuted,
    fontSize: 16,
  },
  erroText: {
    color: c.coralInk,
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: {
    backgroundColor: c.bgMuted,
    borderWidth: 1,
    borderColor: c.line,
  },
  modalCancelText: {
    ...typography.body,
    color: c.ink,
    fontWeight: '600',
  },
  modalConfirm: {
    backgroundColor: c.coralInk,
  },
  modalConfirmText: {
    ...typography.body,
    color: c.white,
    fontWeight: '600',
  },
});
