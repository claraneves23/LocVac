import { View, Text, Pressable, Modal, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Campanha } from '../../../src/types/vaccination';
import { type Colors, radii, spacing, typography, shadows } from '../../../src/theme/tokens';
import { useTheme } from '../../../src/context/ThemeContext';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

type CampaignModalProps = {
  visible: boolean;
  isEditing: boolean;
  campaignName: string;
  participationDate: string;
  pickerDate: Date;
  showDatePicker: boolean;
  showCampaignPicker: boolean;
  availableCampaigns: Campanha[];
  onSelectCampaign: (name: string) => void;
  onToggleCampaignPicker: () => void;
  onShowDatePicker: () => void;
  onDateChange: (event: any, date?: Date) => void;
  onSave: () => void;
  onClose: () => void;
  saving?: boolean;
  campaignNameError?: string;
  participationDateError?: string;
};

export default function CampaignModal({
  visible,
  isEditing,
  campaignName,
  participationDate,
  pickerDate,
  showDatePicker,
  showCampaignPicker,
  availableCampaigns,
  onSelectCampaign,
  onToggleCampaignPicker,
  onShowDatePicker,
  onDateChange,
  onSave,
  onClose,
  saving = false,
  campaignNameError,
  participationDateError,
}: CampaignModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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
              <Text style={styles.modalKicker}>Campanha</Text>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Editar campanha' : 'Adicionar campanha'}
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.ink2} />
            </Pressable>
          </View>

          <Text style={styles.legend}>
            Campos com <Text style={styles.required}>*</Text> são obrigatórios
          </Text>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>
                Nome da campanha <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[styles.dateButton, campaignNameError && styles.inputError]}
                onPress={onToggleCampaignPicker}
              >
                <Text style={campaignName ? styles.dateTextFilled : styles.dateText} numberOfLines={1}>
                  {campaignName || 'Selecione uma campanha'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.brand} />
              </Pressable>
              {campaignNameError && <Text style={styles.errorText}>{campaignNameError}</Text>}

              {showCampaignPicker && (
                <View style={styles.pickerDropdown}>
                  <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                    {availableCampaigns.map((c) => (
                      <Pressable
                        key={c.id}
                        style={[
                          styles.pickerOption,
                          campaignName === c.nome && styles.pickerOptionActive,
                        ]}
                        onPress={() => onSelectCampaign(c.nome)}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            campaignName === c.nome && styles.pickerOptionTextActive,
                          ]}
                        >
                          {c.nome}
                        </Text>
                        {campaignName === c.nome && (
                          <Ionicons name="checkmark" size={18} color={colors.brand} />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>
                Data de participação <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[styles.dateButton, participationDateError && styles.inputError]}
                onPress={onShowDatePicker}
              >
                <Text style={participationDate ? styles.dateTextFilled : styles.dateText}>
                  {participationDate ? formatDateToBR(participationDate) : 'Selecione a data'}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={colors.brand} />
              </Pressable>
              {participationDateError && <Text style={styles.errorText}>{participationDateError}</Text>}
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

const makeStyles = (c: Colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: c.dimDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: c.bgElev,
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
    color: c.ochreInk,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  modalTitle: {
    ...typography.h3,
    color: c.ink,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    marginVertical: spacing.md,
  },
  legend: {
    ...typography.caption,
    color: c.ink3,
    marginTop: 6,
    fontStyle: 'italic',
  },
  required: {
    color: c.coral,
    fontWeight: '700',
  },
  formField: {
    marginBottom: spacing.md,
    gap: 4,
  },
  formLabel: {
    ...typography.small,
    fontWeight: '600',
    color: c.ink,
  },
  dateButton: {
    backgroundColor: c.bgMuted,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    ...typography.body,
    color: c.ink4,
    flex: 1,
  },
  dateTextFilled: {
    ...typography.body,
    color: c.ink,
    flex: 1,
  },
  inputError: {
    borderColor: c.danger,
    backgroundColor: c.dangerSoft,
  },
  errorText: {
    ...typography.caption,
    color: c.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  pickerDropdown: {
    marginTop: 6,
    backgroundColor: c.bgElev,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: c.line,
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  pickerOptionActive: {
    backgroundColor: c.brandSoft,
  },
  pickerOptionText: {
    ...typography.body,
    color: c.ink,
  },
  pickerOptionTextActive: {
    fontWeight: '600',
    color: c.brandInk,
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
    borderColor: c.line,
    backgroundColor: c.bgElev,
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: c.ink2,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    backgroundColor: c.brand,
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: c.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
