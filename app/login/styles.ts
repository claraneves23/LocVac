import { StyleSheet } from 'react-native';
import { colors, radii, shadows, typography } from '../theme/tokens';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 72,
    paddingBottom: 40,
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
  },
  brandSub: {
    fontSize: 12,
    color: colors.ink3,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: colors.bgElev,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    ...shadows.md,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgMuted,
    borderRadius: radii.md,
    padding: 4,
    marginBottom: 20,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: colors.brand,
    borderRadius: radii.sm + 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.sm + 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    ...typography.labelCap,
    color: colors.ink2,
    textTransform: 'none',
    letterSpacing: 0.2,
    fontSize: 12,
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
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  forgotText: {
    fontSize: 13,
    color: colors.brand,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
  },
  footerText: {
    fontSize: 13,
    color: colors.ink2,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
});
