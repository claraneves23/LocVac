import { View, Text, Pressable, Modal, ScrollView, TextInput, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, radii, spacing, typography, shadows } from '../../../app/theme/tokens';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

type MandatoryVaccineModalProps = {
  visible: boolean;
  vaccineId: string | null;
  vaccineName?: string;
  isApplied: boolean;
  date: string;
  lot: string;
  code: string;
  profName: string;
  profId: string;
  pickerDate: Date;
  showDatePicker: boolean;
  onToggleApplied: () => void;
  onShowDatePicker: () => void;
  onDateChange: (event: any, date?: Date) => void;
  onChangeLot: (value: string) => void;
  onChangeCode: (value: string) => void;
  onChangeProfName: (value: string) => void;
  onChangeProfId: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving?: boolean;
};

export default function MandatoryVaccineModal({
  visible,
  vaccineId,
  vaccineName,
  isApplied,
  date,
  lot,
  code,
  profName,
  profId,
  pickerDate,
  showDatePicker,
  onToggleApplied,
  onShowDatePicker,
  onDateChange,
  onChangeLot,
  onChangeCode,
  onChangeProfName,
  onChangeProfId,
  onSave,
  onClose,
  saving = false,
}: MandatoryVaccineModalProps) {
  const title = vaccineName ?? '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <StatusBar style="light" backgroundColor={colors.dimDark} translucent />
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalKicker}>Vacina obrigatória</Text>
              <Text style={styles.modalTitle} numberOfLines={2}>{title}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.ink2} />
            </Pressable>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Pressable style={styles.toggleRow} onPress={onToggleApplied}>
              <View style={[styles.toggleCheck, isApplied && styles.toggleCheckActive]}>
                {isApplied && <Ionicons name="checkmark" size={14} color={colors.white} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Vacina aplicada</Text>
                <Text style={styles.toggleSub}>Marque para registrar a dose</Text>
              </View>
            </Pressable>

            {isApplied && (
              <>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Data de aplicação</Text>
                  <Pressable style={styles.dateButton} onPress={onShowDatePicker}>
                    <Text style={date ? styles.dateTextFilled : styles.dateText}>
                      {date ? formatDateToBR(date) : 'Selecione a data'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color={colors.brand} />
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      value={pickerDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      locale="pt-BR"
                    />
                  )}
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Lote</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Número do lote"
                    placeholderTextColor={colors.ink4}
                    value={lot}
                    onChangeText={onChangeLot}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Código</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Código"
                    placeholderTextColor={colors.ink4}
                    value={code}
                    onChangeText={onChangeCode}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Nome do profissional</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nome completo"
                    placeholderTextColor={colors.ink4}
                    value={profName}
                    onChangeText={onChangeProfName}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>RG do profissional</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="RG"
                    placeholderTextColor={colors.ink4}
                    value={profId}
                    onChangeText={onChangeProfId}
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.formActions}>
            <Pressable
              style={[styles.cancelButton, saving && styles.buttonDisabled]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.dimDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: colors.bgElev,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalKicker: {
    ...typography.caption,
    color: colors.brand,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.ink,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    marginVertical: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.brandSoft,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  toggleCheck: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.brand,
    backgroundColor: colors.bgElev,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCheckActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.brandInk,
  },
  toggleSub: {
    ...typography.small,
    color: colors.ink2,
  },
  formField: {
    marginBottom: spacing.md,
    gap: 4,
  },
  formLabel: {
    ...typography.small,
    fontWeight: '600',
    color: colors.ink,
  },
  formInput: {
    backgroundColor: colors.bgMuted,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  dateButton: {
    backgroundColor: colors.bgMuted,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    ...typography.body,
    color: colors.ink4,
  },
  dateTextFilled: {
    ...typography.body,
    color: colors.ink,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgElev,
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.ink2,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: colors.brand,
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
