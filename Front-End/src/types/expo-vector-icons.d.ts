declare module '@expo/vector-icons' {
  import type { ComponentType } from 'react';
  import type { TextProps } from 'react-native';

  type IoniconsGlyph = string;

  export const Ionicons: ComponentType<
    TextProps & {
      name: IoniconsGlyph;
      size?: number;
      color?: string;
    }
  >;
}
