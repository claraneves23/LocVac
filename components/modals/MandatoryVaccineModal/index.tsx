import { View, Text, Pressable, Modal, ScrollView, TextInput, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

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
      <StatusBar style="light" backgroundColor="rgba(0, 0, 0, 0.5)" translucent />
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={18} color="#29442dff" />
            </Pressable>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formField}>
              <View style={styles.checkboxField}>
                <Pressable style={styles.checkbox} onPress={onToggleApplied}>
                  {isApplied && <Ionicons name="checkmark" size={16} color="#09BEA5" />}
                </Pressable>
                <Text style={styles.checkboxLabel}>Vacina aplicada</Text>
              </View>
            </View>

            {isApplied && (
              <>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Data de Aplicação</Text>
                  <Pressable style={styles.datePickerButton} onPress={onShowDatePicker}>
                    <Ionicons name="calendar-outline" size={18} color="#1f3322" />
                    <Text style={styles.datePickerText}>
                      {date ? formatDateToBR(date) : 'Selecione a data'}
                    </Text>
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
                    placeholderTextColor="#9CA3AF"
                    value={lot}
                    onChangeText={onChangeLot}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Código</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Código"
                    placeholderTextColor="#9CA3AF"
                    value={code}
                    onChangeText={onChangeCode}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Nome do Profissional</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Nome completo"
                    placeholderTextColor="#9CA3AF"
                    value={profName}
                    onChangeText={onChangeProfName}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>RG do Profissional</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="RG"
                    placeholderTextColor="#9CA3AF"
                    value={profId}
                    onChangeText={onChangeProfId}
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.formActions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f3322',
  },
  formScroll: {
    maxHeight: '100%',
    marginVertical: 8,
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f3322',
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f3322',
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },
  datePickerButton: {
    backgroundColor: '#F2F7F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EEE8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePickerText: {
    fontSize: 14,
    color: '#1f3322',
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E8EEE8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f3322',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#09BEA5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  checkboxField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#09BEA5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F7F6',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f3322',
  },
});