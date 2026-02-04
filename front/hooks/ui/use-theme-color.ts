/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/ui/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  // Support both nested theme objects and flat color maps.
  const themedColors = (Colors as any)[theme];
  if (themedColors && colorName in themedColors) {
    return themedColors[colorName];
  }

  return (Colors as any)[colorName];
}
