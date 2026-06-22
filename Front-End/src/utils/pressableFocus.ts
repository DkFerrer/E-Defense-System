import type { PressableStateCallbackType } from 'react-native';

/** react-native-web adds `focused` for keyboard focus; union keeps TS happy. */
export function isPressableFocused(state: PressableStateCallbackType): boolean {
  return Boolean((state as PressableStateCallbackType & { focused?: boolean }).focused);
}
