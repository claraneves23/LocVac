import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { redefinirSenha, reenviarCodigoRecuperacaoSenha } from '../../src/service/authService';
import LVMark from '../../components/redesign/LVMark';
import { colors } from '../../src/theme/tokens';
import styles from './styles';

const RESEND_COOLDOWN = 60;
const CELLS = [0, 1, 2, 3, 4, 5];

export default function RedefinirSenha() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const email = (params.email as string) || '';

  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const codigoInputRef = useRef<TextInput>(null);

  type RedefinirFieldKey = 'novaSenha' | 'confirmarSenha';
  const [errors, setErrors] = useState<Partial<Record<RedefinirFieldKey, string>>>({});
  const clearError = (field: RedefinirFieldKey) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleRedefinir = async () => {
    if (codigo.length !== 6) {
      Alert.alert('Código inválido', 'Digite os 6 dígitos enviados por e-mail.');
      return;
    }

    const novoErros: Partial<Record<RedefinirFieldKey, string>> = {};
    if (!novaSenha.trim()) novoErros.novaSenha = 'Campo obrigatório!';
    if (!confirmarSenha.trim()) novoErros.confirmarSenha = 'Campo obrigatório!';
    if (Object.keys(novoErros).length > 0) {
      setErrors(novoErros);
      return;
    }
    setErrors({});

    if (novaSenha.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await redefinirSenha({ email, codigo, novaSenha });
      Alert.alert('Senha redefinida', 'Use a nova senha para entrar.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 401
          ? 'Código inválido. Verifique e tente novamente.'
          : status === 410
            ? 'Código expirado. Solicite um novo.'
            : status === 429
              ? 'Tentativas excedidas. Solicite um novo código.'
              : status === 404
                ? 'E-mail não cadastrado.'
                : 'Erro ao redefinir senha. Tente novamente.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await reenviarCodigoRecuperacaoSenha(email);
      setCodigo('');
      setCooldown(RESEND_COOLDOWN);
      Alert.alert('Código reenviado', 'Verifique seu e-mail.');
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 429
          ? 'Aguarde antes de pedir um novo código.'
          : status === 404
            ? 'Solicite a recuperação novamente.'
            : 'Erro ao reenviar código.';
      Alert.alert('Erro', message);
    } finally {
      setResending(false);
    }
  };

  const focusCodigo = () => codigoInputRef.current?.focus();
  const canSubmit = codigo.length === 6 && !loading;

  return (
    <LinearGradient
      colors={[colors.brandSoft, colors.bgMuted]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCard}>
              <LVMark size={36} color={colors.brand} />
            </View>
            <Text style={styles.brandTitle}>Redefinir senha</Text>
            <Text style={styles.brandSub}>
              Código enviado para <Text style={styles.email}>{email}</Text>
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Código de 6 dígitos</Text>
            <Pressable onPress={focusCodigo} style={styles.cellsRow}>
              {CELLS.map((i) => {
                const ch = codigo[i];
                const focused = codigo.length === i;
                return (
                  <View
                    key={i}
                    style={[
                      styles.cell,
                      focused && styles.cellFocused,
                      ch !== undefined && styles.cellFilled,
                    ]}
                  >
                    <Text style={styles.cellText}>{ch ?? ''}</Text>
                  </View>
                );
              })}
            </Pressable>

            <TextInput
              ref={codigoInputRef}
              style={styles.hiddenInput}
              value={codigo}
              onChangeText={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              caretHidden
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nova senha</Text>
              <View style={[styles.inputWrap, errors.novaSenha && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.ink3} style={styles.leadingIcon} />
                <TextInput
                  style={styles.input}
                  value={novaSenha}
                  onChangeText={(v) => { setNovaSenha(v); clearError('novaSenha'); }}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.ink3}
                  maxLength={72}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.ink3}
                  />
                </Pressable>
              </View>
              {errors.novaSenha && <Text style={styles.errorText}>{errors.novaSenha}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar senha</Text>
              <View style={[styles.inputWrap, errors.confirmarSenha && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.ink3} style={styles.leadingIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmarSenha}
                  onChangeText={(v) => { setConfirmarSenha(v); clearError('confirmarSenha'); }}
                  placeholder="Repita a senha"
                  placeholderTextColor={colors.ink3}
                  maxLength={72}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.ink3}
                  />
                </Pressable>
              </View>
              {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha}</Text>}
            </View>

            <Pressable
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleRedefinir}
              disabled={!canSubmit}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Redefinir senha</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleReenviar}
              disabled={cooldown > 0 || resending}
              style={styles.resendButton}
            >
              <Text style={[styles.resendText, (cooldown > 0 || resending) && styles.resendTextDisabled]}>
                {resending
                  ? 'Reenviando...'
                  : cooldown > 0
                    ? `Reenviar código em ${cooldown}s`
                    : 'Reenviar código'}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.replace('/login')} style={styles.backButton}>
              <Ionicons name="chevron-back" size={14} color={colors.brand} />
              <Text style={styles.backText}>Voltar para o login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
