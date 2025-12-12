import { images } from "@/constants/images";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

interface BalanceCardProps {
  balance: string;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View
      className="rounded-3xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        aspectRatio: 1.586,
      }}
    >
      <ImageBackground
        source={images.tarjeta}
        className="w-full h-full"
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-transparent" />

        {/* Contenido de la tarjeta */}
        <View className="flex-1 px-6 py-3">
          {/* Header con botón de visibilidad en la derecha */}
          <View className="flex-row items-center justify-end mb-4">
            <TouchableOpacity
              onPress={() => setIsVisible(!isVisible)}
              className="rounded-full p-2"
              style={{
                backgroundColor: "orange",
              }}
            >
              <MaterialCommunityIcons
                name={isVisible ? "eye" : "eye-off"}
                size={18}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Espaciador para empujar el saldo hacia abajo */}
          <View className="flex-1" />

          {/* Saldo en la esquina inferior izquierda */}
          <View className="items-start">
            <Text className="text-white text-4xl font-bold tracking-wider">
              {isVisible ? balance : "••••••••"}
            </Text>
            <Text className="text-white/90 text-lg font-bold">
              Saldo Actual
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
