import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';

/**
 * Pressable with visible keyboard focus (WCAG 2.4.7).
 * @param {import('react-native').PressableProps & { accessibilityLabel: string }} props
 */
export default function AccessiblePressable({
  accessibilityLabel,
  accessibilityRole = 'button',
  children,
  style,
  onPress,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...(Platform.OS === 'web' ? { tabIndex: 0 } : {})}
      style={({ pressed }) => [
        typeof style === 'function' ? style({ pressed }) : style,
        focused && {
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineColor: '#2563EB',
          outlineOffset: 2,
        },
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
