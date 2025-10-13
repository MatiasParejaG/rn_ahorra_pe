import { CustomInputProps } from "@/types/type";
import cn from "clsx";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

const CustomInput = ({ 
    placeholder = "Ingresa texto",
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType = "default" 
}: CustomInputProps) => {
    
    const [isFocused, setIsFocused] = useState(false);

    return (
    <View className="w-full">
      <Text className="text-m font-bold text-white-100 mb-2">{label}</Text>
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
        placeholderTextColor="#999"
        className={cn(
          'w-full px-4 py-3 rounded-lg border-2 text-base text-gray-900',
          isFocused ? 'border-primary bg-orange-50' : 'border-gray-300 bg-gray-50'
        )}
      />
    </View>
  );
};

export default CustomInput;