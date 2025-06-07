import React from "react";
import { StyleSheet, ViewProps } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CardProps extends ViewProps {}

export function Card({ children, style, ...props }: CardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const backgroundColor = useThemeColor({}, "background");
  const shadowColor = colorScheme === "dark" ? "rgba(0, 0, 0, 0.3)" : "#000";

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor,
          shadowColor,
          // Adjust elevation for Android in dark mode
          elevation: colorScheme === "dark" ? 5 : 3,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    padding: 16,
  },
});
