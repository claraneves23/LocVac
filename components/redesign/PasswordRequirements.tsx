import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../src/context/ThemeContext';
import { type Colors } from '../../src/theme/tokens';
import { verificarRequisitosSenha } from '../../src/utils/passwordValidator';

type Props = {
  senha: string;
};

export default function PasswordRequirements({ senha }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const requisitos = verificarRequisitosSenha(senha);
  const vazio = senha.length === 0;

  return (
    <View style={styles.container}>
      {requisitos.map((r) => {
        const ativo = r.atendido;
        const pendente = vazio || !ativo;
        return (
          <View key={r.key} style={styles.row}>
            <Ionicons
              name={ativo ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              color={ativo ? colors.success : pendente && !vazio ? colors.ink3 : colors.ink4}
            />
            <Text
              style={[
                styles.text,
                ativo && styles.textOk,
                !ativo && !vazio && styles.textPendente,
              ]}
            >
              {r.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      marginTop: 6,
      gap: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    text: {
      fontSize: 11,
      color: colors.ink4,
    },
    textPendente: {
      color: colors.ink3,
    },
    textOk: {
      color: colors.success,
      fontWeight: '500',
    },
  });
