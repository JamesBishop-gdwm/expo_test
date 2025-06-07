import { Picker } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface SelectProps {
  options: string[];
  value?: string;
  onValueChange: (value: string) => void;
  selectPrompt?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onValueChange,
  selectPrompt = "Select an option",
  style,
  disabled = false,
}: SelectProps) {
  const colorScheme = useColorScheme() ?? "light";
  const textColor = Colors[colorScheme].text;

  return (
    <View style={[styles.container, style]}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        enabled={!disabled}
        style={[styles.picker, { color: textColor }]}
        dropdownIconColor={textColor}
      >
        <Picker.Item label={selectPrompt} value="" />
        {options.map((option, index) => (
          <Picker.Item key={index} label={option} value={option} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#d1d5db", // border-gray-300 equivalent
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: "transparent",
  },
  picker: {
    height: 50,
    width: "100%",
  },
});
