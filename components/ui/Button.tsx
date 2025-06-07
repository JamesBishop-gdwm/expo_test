import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
}

export function Button({
  children,
  style,
  variant = "primary",
  loading = false,
  disabled = false,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary"
          ? styles.primary
          : variant === "secondary"
          ? styles.secondary
          : styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#781f19" : "#f6f6f6"}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" ? styles.outlineText : styles.buttonText,
            disabled && styles.disabledText,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primary: {
    backgroundColor: "#781f19", // Primary color
  },
  secondary: {
    backgroundColor: "#224f4a", // Secondary color
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#781f19", // Primary color
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonText: {
    color: "#f6f6f6", // offWhite
  },
  outlineText: {
    color: "#781f19", // Primary color
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});
