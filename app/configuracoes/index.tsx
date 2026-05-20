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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { useTheme } from '../../src/context/ThemeContext';
import { useAppContext } from '../../src/context/AppContext';
import { logout, excluirConta } from '../../src/service/authService';
import { radii, spacing, typography, type Colors } from '../../src/theme/tokens';

export default function Configuracoes() {
  const { isDark, colors, toggleTheme } = useTheme();
  const { reset } = useAppContext();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
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
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Conta</Text>
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={colors.coralInk} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteRow}
            onPress={abrirConfirmacaoExclusao}
            activeOpacity={0.8}
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
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
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
            {erro ? <Text style={styles.erroText}>{erro}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={fecharModal}
                disabled={enviando}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={confirmarExclusao}
                disabled={enviando}
                activeOpacity={0.8}
              >
                {enviando ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
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
  },
  rowLabel: {
    ...typography.body,
    color: c.ink,
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
