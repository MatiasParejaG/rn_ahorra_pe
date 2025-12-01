import { CustomInputProps } from "@/types/type";
import cn from "clsx";
import React, { useState } from "react";
import { TextInput, View } from "react-native";

const CustomInput = ({
  placeholder = "Ingresa texto",
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full">
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className={cn(
          "w-full px-4 py-4 rounded-xl text-base text-gray-900 bg-gray-50 border-2",
          isFocused ? "border-primary bg-orange-50" : "border-gray-200"
        )}
      />
    </View>
  );
};

export default CustomInput;