import { View, Text, Pressable, Modal, ScrollView, StyleSheet, StyleSheet as RNStyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FamilyMember } from '../../../app/types/vaccination';
import { colors, radii, spacing, typography, shadows, Tone } from '../../../app/theme/tokens';
import { Avatar } from '../../redesign';

const TONES: Tone[] = ['brand', 'coral', 'ochre'];

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
      <StatusBar style="light" backgroundColor={colors.dimDark} translucent />
      <View style={styles.modalOverlay}>
        <Pressable style={RNStyleSheet.absoluteFill} onPress={onClose} />
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <View style={styles.headerText}>
              <Text style={styles.kicker}>Trocar perfil</Text>
              <Text style={styles.modalTitle}>Quem está vacinando?</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.ink2} />
            </Pressable>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {familyMembers.map((profile, idx) => {
              const isSelected = profile.id === selectedProfileId;
              const tone: Tone = profile.kind === 'user' ? 'brand' : TONES[idx % TONES.length];
              const label = profile.kind === 'user' ? 'Você' : profile.name;
              return (
                <Pressable
                  key={profile.id}
                  style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                  onPress={() => {
                    onSelectProfile(profile.id);
                    onClose();
                  }}
                >
                  <Avatar
                    name={profile.name}
                    photoUri={profile.photoUri}
                    size={40}
                    tone={tone}
                  />
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextActive]} numberOfLines={1}>
                      {label}
                    </Text>
                    {profile.kind !== 'user' && profile.relationship && (
                      <Text style={[styles.modalOptionSub, isSelected && styles.modalOptionSubActive]} numberOfLines={1}>
                        {profile.relationship}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color={colors.white} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
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
  modalCard: {
    width: '100%',
    maxWidth: 360,
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
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  kicker: {
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  modalOptionActive: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brand,
  },
  optionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  modalOptionText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.ink,
  },
  modalOptionTextActive: {
    color: colors.brandInk,
  },
  modalOptionSub: {
    ...typography.caption,
    color: colors.ink3,
  },
  modalOptionSubActive: {
    color: colors.brand,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
