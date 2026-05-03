import { View, Text, Pressable, Modal, ScrollView, TextInput, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const formatDateToBR = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

type OtherVaccineModalProps = {
  visible: boolean;
  isEditing: boolean;
  name: string;
  date: string;
  lot: string;
  code: string;
  profName: string;
  profId: string;
  pickerDate: Date;
  showDatePicker: boolean;
  onChangeName: (value: string) => void;
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

export default function OtherVaccineModal({
  visible,
  isEditing,
  name,
  date,
  lot,
  code,
  profName,
  profId,
  pickerDate,
  showDatePicker,
  onChangeName,
  onShowDatePicker,
  onDateChange,
  onChangeLot,
  onChangeCode,
  onChangeProfName,
  onChangeProfId,
  onSave,
  onClose,
  saving = false,
}: OtherVaccineModalProps) {
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
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar Vacina' : 'Adicionar Vacina'}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={18} color="#29442dff" />
            </Pressable>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Nome da Vacina *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Vacina da Gripe"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={onChangeName}
              />
            </View>

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
                <ActivityIndicator color="#fff" size="small" />
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
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});