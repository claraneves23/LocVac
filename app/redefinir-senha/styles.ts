import { StyleSheet } from 'react-native';
import { colors, radii, shadows, typography, spacing } from '../theme/tokens';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCard: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.bgElev,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...shadows.md,
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
  email: {
    fontWeight: '700',
    color: colors.brand,
  },
  card: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    ...shadows.md,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink2,
    marginBottom: 6,
  },
  cellsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  cell: {
    flex: 1,
    height: 50,
    borderRadius: radii.md,
    backgroundColor: colors.bgMuted,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFocused: {
    borderColor: colors.brand,
    backgroundColor: colors.bgElev,
  },
  cellFilled: {
    borderColor: colors.lineStrong,
    backgroundColor: colors.bgElev,
  },
  cellText: {
    ...typography.h2,
    fontSize: 22,
    color: colors.ink,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgMuted,
    borderRadius: radii.md - 1,
    borderWidth: 1,
    borderColor: colors.line,
  },
  leadingIcon: {
    marginLeft: 12,
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
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
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: {
    backgroundColor: colors.lineStrong,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand,
  },
  resendTextDisabled: {
    color: colors.ink3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
  },
  backText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '600',
  },
});
