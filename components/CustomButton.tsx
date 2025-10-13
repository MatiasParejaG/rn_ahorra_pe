import { CustomButtonProps } from "@/types/type";
import cn from "clsx";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const CustomButton = ({
    onPress,
    title = "Click Me",
    style,
    textStyle,
    leftIcon,
    isLoading = false
}: CustomButtonProps) => {
  
    return (
    <TouchableOpacity 
      className={cn('w-full bg-primary rounded-lg py-4 px-6 flex items-center justify-center', style)} 
      onPress={onPress}
      activeOpacity={0.8}
    >
        <View className="flex-row items-center justify-center gap-2">
            {isLoading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <>
                  {leftIcon}
                  <Text className={cn('text-white font-semibold text-base', textStyle)}>
                      {title}
                  </Text>
                </>
            )}
        </View>
    </TouchableOpacity>
  );
};

export default CustomButton;