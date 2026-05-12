import { StyleSheet } from 'react-native';
import { colors, radii, shadows, typography, spacing } from '../../src/theme/tokens';

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
    marginBottom: 28,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 14,
  },
  brandTitle: {
    ...typography.h2,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  brandSub: {
    fontSize: 12,
    color: colors.ink3,
    marginTop: 4,
    letterSpacing: 0.2,
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
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink2,
    marginBottom: 6,
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
  submitButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  backText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '600',
  },
});
