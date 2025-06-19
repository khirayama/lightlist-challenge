import { StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius, fontWeight, shadow } from './constants';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    minHeight: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  cardInner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[8],
    ...shadow.md,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing[2],
    color: colors['text-primary'],
  },
  description: {
    fontSize: fontSize.base,
    textAlign: 'center',
    marginBottom: spacing[6],
    color: colors['text-secondary'],
  },
  form: {
    gap: spacing[4],
  },
  inputGroup: {
    gap: spacing[1],
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors['text-primary'],
  },
  input: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    fontSize: fontSize.lg,
    backgroundColor: colors.surface,
    color: colors['text-primary'],
  },
  button: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginTop: spacing[2],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.surface,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    fontSize: fontSize.lg,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  linkText: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
  },
});