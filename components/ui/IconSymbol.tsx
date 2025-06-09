// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SymbolWeight } from 'expo-symbols'
import { ComponentProps } from 'react'
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native'

type IconSymbolName = string

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'magnifyingglass.circle.fill': 'search',
}

// Default fallback mapping function
const getFallbackName = (
  name: string
): ComponentProps<typeof MaterialIcons>['name'] => {
  // Remove .fill suffix and convert dots to underscores
  return name.replace('.fill', '').replace(/\./g, '_') as any
}

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName
  size?: number
  color: string | OpaqueColorValue
  style?: StyleProp<TextStyle>
  weight?: SymbolWeight
}) {
  // Use mapping if available, otherwise try fallback conversion
  const materialName = MAPPING[name] || getFallbackName(name)
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={materialName}
      style={style}
    />
  )
}
