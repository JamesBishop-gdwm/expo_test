import React from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface TextInputProps extends RNTextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
}

export function TextInput({
  value,
  onChangeText,
  style,
  placeholder,
  ...props
}: TextInputProps) {
  const colorScheme = useColorScheme() ?? "light";
  const textColor = Colors[colorScheme].text;
  const backgroundColor = Colors[colorScheme].background;
  const placeholderColor = colorScheme === "dark" ? "#9BA1A6" : "#a3a3a3";

  return (
    <View style={styles.container}>
      <RNTextInput
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor: backgroundColor,
          },
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db", // border-gray-300 equivalent
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});
