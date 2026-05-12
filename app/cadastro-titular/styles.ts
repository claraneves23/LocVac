import { StyleSheet } from 'react-native';
import { colors, radii, shadows, typography, spacing } from '../../src/theme/tokens';

export default StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 14,
  },
  brandTitle: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
  },
  brandSub: {
    ...typography.small,
    color: colors.ink3,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    ...shadows.md,
  },
  legend: {
    ...typography.caption,
    color: colors.ink3,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  required: { color: colors.coral, fontWeight: '700' },
  fieldGroup: { marginBottom: spacing.md },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink2,
    marginBottom: 6,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.bgMuted,
    borderRadius: radii.md - 1,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
  },
  sexChip: {
    flex: 1,
    backgroundColor: colors.bgMuted,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md - 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sexChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  sexChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  sexChipTextActive: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { fontSize: 15, fontWeight: '700', color: colors.white },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: { fontSize: 13, color: colors.brand, fontWeight: '600' },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerDropdown: {
    maxHeight: 200,
    backgroundColor: colors.bgElev,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 4,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  pickerOptionActive: {
    backgroundColor: colors.brandSoft,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.ink,
  },
  pickerOptionTextActive: {
    fontWeight: '700',
    color: colors.brandInk,
  },
});
