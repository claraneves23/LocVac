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
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { solicitarRecuperacaoSenha } from './service/authService';

export default function EsqueciSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEnviar = async () => {
    if (!email.trim()) {
      setEmailError('Campo obrigatório!');
      return;
    }
    setEmailError(null);

    setLoading(true);
    try {
      await solicitarRecuperacaoSenha(email.trim());
      router.push({ pathname: '/redefinir-senha', params: { email: email.trim().toLowerCase() } });
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        status === 404
          ? 'E-mail não cadastrado.'
          : status === 429
            ? 'Aguarde antes de pedir um novo código.'
            : 'Erro ao solicitar recuperação. Verifique sua conexão.';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Esqueci minha senha</Text>
            <Text style={styles.subtitle}>
              Informe o e-mail cadastrado.{'\n'}
              Vamos enviar um código de 6 dígitos.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                value={email}
                onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(null); }}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleEnviar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar código</Text>
              )}
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
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3322',
    marginBottom: 6,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#e53935',
    backgroundColor: '#fdecea',
  },
  errorText: {
    fontSize: 11,
    color: '#e53935',
    marginTop: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f3322',
  },
  submitButton: {
    backgroundColor: '#29442dff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    fontSize: 12,
    color: '#607367',
  },
});
