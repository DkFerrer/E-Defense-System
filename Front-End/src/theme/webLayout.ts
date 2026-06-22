import { Platform, type ViewStyle } from 'react-native';

/** Full viewport height on web (`100vh`); RN typings omit vh so we assert. */
export function webViewportHeight(): ViewStyle | undefined {
  if (Platform.OS !== 'web') return undefined;
  return {
    minHeight: '100vh' as unknown as ViewStyle['minHeight'],
    width: '100%',
  };
}
