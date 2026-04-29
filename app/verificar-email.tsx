import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
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
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmarCadastro, reenviarCodigo } from './service/authService';

const RESEND_COOLDOWN = 60;

export default function VerificarEmail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const email = (params.email as string) || '';

  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRef = useRef<TextInput>(null);

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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/locvaclogo-trim.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Confirme seu e-mail</Text>
            <Text style={styles.subtitle}>
              Enviamos um código de 6 dígitos para{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>

            <Pressable onPress={() => inputRef.current?.focus()} style={styles.codeBox}>
              <Text style={styles.codeText}>
                {codigo.padEnd(6, '•').split('').join(' ')}
              </Text>
            </Pressable>

            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={codigo}
              onChangeText={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <Pressable
              style={[styles.submitButton, (loading || codigo.length !== 6) && styles.submitButtonDisabled]}
              onPress={handleVerificar}
              disabled={loading || codigo.length !== 6}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE3E2',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 80,
  },
  card: {
    backgroundColor: '#ffffffcc',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f3322',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#4d5c53',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  email: {
    fontWeight: '700',
    color: '#29442d',
  },
  codeBox: {
    backgroundColor: '#F2F7F6',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#29442d',
    letterSpacing: 4,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  submitButton: {
    backgroundColor: '#29442dff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#29442dff',
  },
  resendTextDisabled: {
    color: '#8a9a90',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  backText: {
    fontSize: 12,
    color: '#607367',
  },
});
