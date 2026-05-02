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
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { redefinirSenha, reenviarCodigoRecuperacaoSenha } from './service/authService';

const RESEND_COOLDOWN = 60;

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

  return (
    <View style={styles.container}>
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
            <Image
              source={require('../assets/images/locvaclogo-trim.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Redefinir senha</Text>
            <Text style={styles.subtitle}>
              Enviamos um código de 6 dígitos para{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Código</Text>
              <Pressable onPress={() => codigoInputRef.current?.focus()} style={styles.codeBox}>
                <Text style={styles.codeText}>
                  {codigo.padEnd(6, '•').split('').join(' ')}
                </Text>
              </Pressable>
              <TextInput
                ref={codigoInputRef}
                style={styles.hiddenInput}
                value={codigo}
                onChangeText={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nova senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#607367"
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar nova senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  placeholder="Repita a senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#607367"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[
                styles.submitButton,
                (loading || codigo.length !== 6) && styles.submitButtonDisabled,
              ]}
              onPress={handleRedefinir}
              disabled={loading || codigo.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
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
              <Text style={styles.backText}>Voltar para o login</Text>
            </Pressable>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
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
    marginBottom: 20,
  },
  email: {
    fontWeight: '700',
    color: '#29442d',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3322',
    marginBottom: 6,
  },
  codeBox: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f3322',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#29442dff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
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
    marginTop: 14,
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
