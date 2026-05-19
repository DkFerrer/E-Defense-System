declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }

  export const Ionicons: ComponentType<IconProps> & {
    glyphMap: Record<string, number>;
  };

  export const MaterialIcons: ComponentType<IconProps>;
  export const FontAwesome: ComponentType<IconProps>;
  export const Feather: ComponentType<IconProps>;
}
