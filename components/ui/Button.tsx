import React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native'

import { COLORS } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

interface ButtonProps extends TouchableOpacityProps {
  outline?: boolean
  loading?: boolean
}

export function Button({
  children,
  style,
  outline = false,
  loading = false,
  disabled = false,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'

  // Theme-based colors
  const backgroundColor = isDark ? COLORS.secondary : COLORS.primary

  return (
    <TouchableOpacity
      style={[
        styles.button,
        outline
          ? {
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: backgroundColor,
            }
          : {
              backgroundColor: backgroundColor,
            },
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={outline ? backgroundColor : COLORS.offWhite}
        />
      ) : (
        <Text
          style={[
            styles.text,
            outline ? { color: backgroundColor } : { color: COLORS.offWhite },
            disabled && styles.disabledText,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
})
