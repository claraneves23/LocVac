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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { solicitarRecuperacaoSenha } from '../../src/service/authService';
import { colors } from '../../src/theme/tokens';
import styles from './styles';

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
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>LocVac</Text>
            <Text style={styles.brandSub}>Recuperação de acesso</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={[styles.inputWrap, emailError && styles.inputError]}>
                <Ionicons name="mail-outline" size={18} color={colors.ink3} style={styles.leadingIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(null); }}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.ink3}
                  maxLength={254}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleEnviar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar código</Text>
              )}
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
