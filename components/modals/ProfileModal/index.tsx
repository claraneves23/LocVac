import { View, Text, Image, Pressable, Modal, StyleSheet, StyleSheet as RNStyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FamilyMember } from '../../../app/types/vaccination';

type ProfileModalProps = {
  visible: boolean;
  familyMembers: FamilyMember[];
  selectedProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onClose: () => void;
};

export default function ProfileModal({
  visible,
  familyMembers,
  selectedProfileId,
  onSelectProfile,
  onClose,
}: ProfileModalProps) {
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
        <Pressable style={RNStyleSheet.absoluteFill} onPress={onClose} />
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar perfil</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={18} color="#29442dff" />
            </Pressable>
          </View>

          {familyMembers.map((profile) => {
            const isSelected = profile.id === selectedProfileId;
            return (
              <Pressable
                key={profile.id}
                style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                onPress={() => {
                  onSelectProfile(profile.id);
                  onClose();
                }}
              >
                <View style={styles.modalOptionBadge}>
                  {profile.photoUri ? (
                    <Image
                      source={{ uri: profile.photoUri }}
                      style={styles.modalOptionBadgeImage}
                    />
                  ) : (
                    <Text style={styles.modalOptionBadgeText}>
                      {profile.name && profile.name.length > 0 ? profile.name.charAt(0) : '?'}
                    </Text>
                  )}
                </View>
                <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextActive]}>
                  {profile.kind === 'user' ? 'Você' : profile.name}
                </Text>
              </Pressable>
            );
          })}
        </Pressable>
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
  modalCard: {
    width: '100%',
    maxWidth: 280,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    gap: 8,
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
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F2F7F6',
  },
  modalOptionActive: {
    backgroundColor: '#29442dff',
  },
  modalOptionBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CAE3E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f3322',
  },
  modalOptionBadgeImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f3322',
  },
  modalOptionTextActive: {
    color: '#fff',
  },
});