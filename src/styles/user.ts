import { StyleSheet } from 'react-native';
import { type Colors, radii, spacing, typography, shadows } from '../theme/tokens';

export const makeStyles = (c: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
    paddingTop: '5%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 130,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.line,
    marginVertical: spacing.xl,
    ...shadows.sm,
  },
  profileText: {
    flex: 1,
    gap: 4,
    marginTop: 8,
  },
  profileName: {
    ...typography.h3,
    color: c.ink,
  },
  profileTagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  profileTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.brandSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  profileTagText: {
    ...typography.caption,
    color: c.brandInk,
    fontWeight: '600',
  },
  profileEmail: {
    ...typography.small,
    color: c.ink3,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: c.ink,
    marginBottom: 2,
  },
  sectionSub: {
    ...typography.small,
    color: c.ink3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.brand,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  addButtonText: {
    ...typography.small,
    color: c.white,
    fontWeight: '600',
  },

  emptyCard: {
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.bodyLg,
    fontWeight: '600',
    color: c.ink,
  },
  emptySub: {
    ...typography.small,
    color: c.ink3,
    textAlign: 'center',
  },

  dependentsList: {
    gap: spacing.sm,
  },
  dependentCard: {
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: c.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dependentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  dependentInfo: {
    flex: 1,
  },
  dependentName: {
    ...typography.body,
    fontWeight: '600',
    color: c.ink,
  },
  dependentMeta: {
    ...typography.small,
    color: c.ink3,
    marginTop: 2,
  },
  dependentActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: c.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuCard: {
    backgroundColor: c.bgElev,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: c.line,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: c.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...typography.body,
    color: c.ink,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: c.line,
    marginLeft: spacing.md + 32 + spacing.md,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: c.coralSoft,
    borderRadius: radii.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: c.coralSoft,
  },
  logoutText: {
    ...typography.body,
    color: c.coralInk,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: c.dimDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: c.bgElev,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'column',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    ...typography.h3,
    color: c.ink,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    marginVertical: spacing.md,
  },
  legend: {
    ...typography.caption,
    color: c.ink3,
    marginTop: 4,
    fontStyle: 'italic',
  },
  required: {
    color: c.coral,
    fontWeight: '700',
  },
  inputError: {
    borderWidth: 1,
    borderColor: c.danger,
    backgroundColor: c.dangerSoft,
  },
  errorText: {
    ...typography.caption,
    color: c.danger,
    marginTop: 4,
    fontWeight: '500',
  },

  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  photoPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: c.brand,
  },
  photoButtonGhost: {
    backgroundColor: c.bgMuted,
    borderWidth: 1,
    borderColor: c.line,
  },
  photoButtonText: {
    ...typography.small,
    fontWeight: '600',
    color: c.white,
  },
  photoButtonTextGhost: {
    color: c.ink2,
  },

  fieldGroup: {
    gap: 4,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.small,
    fontWeight: '600',
    color: c.ink,
  },
  input: {
    backgroundColor: c.bgMuted,
    borderRadius: radii.sm + 3,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: c.ink,
  },
  sexRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sexChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.sm + 3,
    backgroundColor: c.bgMuted,
    borderWidth: 1,
    borderColor: c.line,
  },
  sexChipActive: {
    backgroundColor: c.brand,
    borderColor: c.brand,
  },
  sexChipText: {
    ...typography.small,
    fontWeight: '600',
    color: c.ink,
  },
  sexChipTextActive: {
    color: c.white,
  },
  dateButton: {
    backgroundColor: c.bgMuted,
    borderRadius: radii.sm + 3,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: {
    ...typography.body,
    color: c.ink4,
  },
  dateButtonTextFilled: {
    ...typography.body,
    color: c.ink,
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radii.md,
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
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radii.md,
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

  helpSection: {
    marginBottom: spacing.lg,
  },
  helpIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  helpSectionTitle: {
    ...typography.body,
    fontWeight: '600' as const,
    color: c.ink,
  },
  helpText: {
    ...typography.small,
    color: c.ink2,
    lineHeight: 20,
  },

  settingsLogoRow: {
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: spacing.lg,
  },
  settingsAppName: {
    ...typography.h3,
    fontSize: 22,
    color: c.ink,
  },
  settingsVersion: {
    ...typography.small,
    color: c.ink3,
  },
  settingsDescription: {
    ...typography.body,
    color: c.ink2,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: c.line,
    marginVertical: spacing.md,
  },
  settingsInfoRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'flex-start' as const,
  },
  settingsInfoText: {
    ...typography.small,
    color: c.ink3,
    flex: 1,
    lineHeight: 18,
  },
});
