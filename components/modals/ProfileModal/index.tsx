import { View, Text, Pressable, Modal, ScrollView, StyleSheet, StyleSheet as RNStyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { FamilyMember } from '../../../src/types/vaccination';
import { type Colors, radii, spacing, typography, shadows, Tone } from '../../../src/theme/tokens';
import { useTheme } from '../../../src/context/ThemeContext';
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

const makeStyles = (c: Colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: c.dimDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
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
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    ...typography.caption,
    color: c.brand,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  modalTitle: {
    ...typography.h3,
    color: c.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.bgMuted,
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
    backgroundColor: c.bgElev,
    borderWidth: 1,
    borderColor: c.line,
    marginBottom: 8,
  },
  modalOptionActive: {
    backgroundColor: c.brandSoft,
    borderColor: c.brand,
  },
  optionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  modalOptionText: {
    ...typography.body,
    fontWeight: '600',
    color: c.ink,
  },
  modalOptionTextActive: {
    color: c.brandInk,
  },
  modalOptionSub: {
    ...typography.caption,
    color: c.ink3,
  },
  modalOptionSubActive: {
    color: c.brand,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
