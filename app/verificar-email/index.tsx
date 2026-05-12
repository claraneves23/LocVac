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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmarCadastro, reenviarCodigo } from '../../src/service/authService';
import { colors } from '../../src/theme/tokens';
import styles from './styles';

const RESEND_COOLDOWN = 60;
const CELLS = [0, 1, 2, 3, 4, 5];

export default function VerificarEmail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const email = (params.email as string) || '';

  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRef = useRef<TextInput>(null);
  const isFocused = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleVerificar = async () => {
    if (codigo.length !== 6) {
      Alert.alert('Código inválido', 'Digite os 6 dígitos enviados por e-mail.');
      return;
    }

    setLoading(true);
    try {
      await confirmarCadastro({ email, codigo });
      router.replace('/cadastro-titular');
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 401
          ? 'Código inválido. Verifique e tente novamente.'
          : status === 410
            ? 'Código expirado. Solicite um novo.'
            : status === 429
              ? 'Tentativas excedidas. Solicite um novo código.'
              : 'Erro ao confirmar. Tente novamente.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await reenviarCodigo(email);
      setCodigo('');
      setCooldown(RESEND_COOLDOWN);
      Alert.alert('Código reenviado', 'Verifique seu e-mail.');
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 429
          ? 'Aguarde antes de pedir um novo código.'
          : status === 404
            ? 'Cadastro não encontrado. Volte e inicie novamente.'
            : 'Erro ao reenviar código.';
      Alert.alert('Erro', message);
    } finally {
      setResending(false);
    }
  };

  const focusInput = () => {
    const input = inputRef.current;
    if (!input) return;
    if (isFocused.current) return;
    // No Android o teclado não reabre em .focus() se o campo ainda tem "foco fantasma".
    // Forçar blur antes garante que o OS trate como nova ativação do teclado.
    input.blur();
    setTimeout(() => input.focus(), 50);
  };
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
        <View style={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>LocVac</Text>
            <Text style={styles.brandSub}>Sua carteira de vacinação digital</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Confirme seu e-mail</Text>
            <Text style={styles.subtitle}>
              Enviamos um código de 6 dígitos para{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>

            <Pressable onPress={focusInput} style={styles.cellsRow}>
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
              ref={inputRef}
              style={styles.hiddenInput}
              value={codigo}
              onChangeText={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
              onFocus={() => { isFocused.current = true; }}
              onBlur={() => { isFocused.current = false; }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              caretHidden
            />

            <Pressable
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleVerificar}
              disabled={!canSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Verificar</Text>
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
              <Text style={styles.backText}>Voltar para o login</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
