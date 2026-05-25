import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { type Colors, radii, spacing, typography } from '../../src/theme/tokens';
import { useTheme } from '../../src/context/ThemeContext';

type Props = {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  error?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
  editable?: boolean;
};

const formatTyping = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

const isoToBR = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
};

const brToIso = (br: string): string | null => {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = Number(dd);
  const mo = Number(mm);
  const y = Number(yyyy);
  if (mo < 1 || mo > 12) return null;
  const daysInMonth = new Date(y, mo, 0).getDate();
  if (d < 1 || d > daysInMonth) return null;
  if (y < 1900 || y > 2100) return null;
  return `${yyyy}-${mm}-${dd}`;
};

export default function DateField({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  error,
  maximumDate,
  minimumDate,
  editable = true,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [text, setText] = useState(isoToBR(value));
  const [show, setShow] = useState(false);

  useEffect(() => {
    setText(isoToBR(value));
  }, [value]);

  const isoWithinBounds = (iso: string): boolean => {
    const d = new Date(`${iso}T00:00:00`);
    if (isNaN(d.getTime())) return false;
    if (minimumDate) {
      const min = new Date(minimumDate);
      min.setHours(0, 0, 0, 0);
      if (d < min) return false;
    }
    if (maximumDate) {
      const max = new Date(maximumDate);
      max.setHours(23, 59, 59, 999);
      if (d > max) return false;
    }
    return true;
  };

  const handleChangeText = (raw: string) => {
    const formatted = formatTyping(raw);
    setText(formatted);
    if (formatted === '') {
      if (value) onChange('');
      return;
    }
    const iso = brToIso(formatted);
    if (iso && isoWithinBounds(iso)) onChange(iso);
  };

  const handleBlur = () => {
    if (text === '') return;
    const iso = brToIso(text);
    if (!iso || !isoWithinBounds(iso)) {
      setText(isoToBR(value));
    }
  };

  const pickerInitial = value ? new Date(`${value}T00:00:00`) : new Date();

  return (
    <View style={[styles.row, error && styles.rowError]}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.ink4}
        keyboardType="numeric"
        maxLength={10}
        editable={editable}
      />
      <Pressable
        style={styles.iconBtn}
        onPress={() => editable && setShow(true)}
        hitSlop={8}
        disabled={!editable}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.brandInk} />
      </Pressable>
      {show && (
        <DateTimePicker
          value={pickerInitial}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(_e, d) => {
            setShow(Platform.OS === 'ios');
            if (d) {
              const iso = d.toISOString().split('T')[0];
              setText(isoToBR(iso));
              onChange(iso);
            }
          }}
        />
      )}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: {
      backgroundColor: c.bgMuted,
      borderRadius: radii.sm + 3,
      borderWidth: 1,
      borderColor: c.line,
      paddingLeft: spacing.md,
      paddingRight: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowError: {
      borderColor: c.danger,
    },
    input: {
      flex: 1,
      paddingVertical: 11,
      ...typography.body,
      color: c.ink,
    },
    iconBtn: {
      padding: 8,
    },
  });
