import { StyleSheet } from 'react-native';
import { colors, radii, shadows, typography } from '../../src/theme/tokens';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 22,
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
  },
  brandSub: {
    fontSize: 12,
    color: colors.ink3,
    marginTop: 4,
    letterSpacing: 0.2,
    marginBottom: 0,
  },
  card: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    ...shadows.md,
  },
  title: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  email: {
    fontWeight: '700',
    color: colors.brand,
  },
  cellsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  cell: {
    flex: 1,
    height: 52,
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
  submitButton: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.lineStrong,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
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
    alignItems: 'center',
    marginTop: 12,
  },
  backText: {
    fontSize: 12,
    color: colors.ink3,
  },
});
