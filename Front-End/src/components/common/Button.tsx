// E-Defense — Reusable Button Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSizes, FontWeights, Spacing, Shadows } from '../../styles/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles: any[] = [
    styles.base,
    styles[`${variant}Bg`],
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style || {},
  ];

  const textStyles: any[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle || {},
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },

  // Variants — backgrounds
  primaryBg: {
    backgroundColor: Colors.primary,
    ...Shadows.md,
  },
  secondaryBg: {
    backgroundColor: Colors.secondary,
    ...Shadows.md,
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghostBg: {
    backgroundColor: 'transparent',
  },
  dangerBg: {
    backgroundColor: Colors.danger,
    ...Shadows.md,
  },

  // Variants — text
  text: {
    fontWeight: FontWeights.semibold,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
  dangerText: {
    color: '#FFFFFF',
  },

  // Sizes
  smSize: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    minHeight: 34,
  },
  mdSize: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
  },
  lgSize: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 54,
  },
  smText: {
    fontSize: FontSizes.sm,
  },
  mdText: {
    fontSize: FontSizes.md,
  },
  lgText: {
    fontSize: FontSizes.lg,
  },
});
