import { View, Text, Pressable, Modal, ScrollView, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Campanha } from '../../../app/types/vaccination';

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
}: CampaignModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
              {isEditing ? 'Editar Campanha' : 'Adicionar Campanha'}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={18} color="#29442dff" />
            </Pressable>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Nome da Campanha *</Text>
              <Pressable
                style={styles.datePickerButton}
                onPress={onToggleCampaignPicker}
              >
                <Text style={[styles.datePickerText, !campaignName && styles.placeholderText]}>
                  {campaignName || 'Selecione uma campanha'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#1f3322" />
              </Pressable>

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
                          {c.nome} {c.ativa ? '' : '(Inativa)'}
                        </Text>
                        {campaignName === c.nome && (
                          <Ionicons name="checkmark" size={18} color="#29442dff" />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Data de Participação *</Text>
              <Pressable style={styles.datePickerButton} onPress={onShowDatePicker}>
                <Ionicons name="calendar-outline" size={18} color="#1f3322" />
                <Text style={styles.datePickerText}>
                  {participationDate ? formatDateToBR(participationDate) : 'Selecione a data'}
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
  placeholderText: {
    color: '#9CA3AF',
  },
  pickerDropdown: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F7F6',
  },
  pickerOptionActive: {
    backgroundColor: '#E6F2F1',
  },
  pickerOptionText: {
    fontSize: 13,
    color: '#1f3322',
  },
  pickerOptionTextActive: {
    fontWeight: '600',
    color: '#29442dff',
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
});