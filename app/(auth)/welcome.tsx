import CustomButton from "@/components/CustomButton";
import { images } from "@/constants/images";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-8">
          {/* Imagen de bienvenida */}
          <View className="flex-1 items-center justify-center pt-12 pb-8">
            <Image
              source={images.welcome}
              className="w-full h-96"
              resizeMode="contain"
            />
          </View>

          {/* Mensaje de bienvenida */}
          <View className="mb-8">
            <Text className="text-4xl text-gray-800 font-black leading-tight mb-4 text-center">
              Descubre Tu Sueño de Ahorro Aquí
            </Text>
            <Text className="text-lg text-gray-600 leading-relaxed text-center">
              Explora todas las funciones de ahorro basadas en tus intereses y
              objetivos financieros
            </Text>
          </View>

          {/* Botones de acción */}
          <View className="mb-10 gap-4">
            <CustomButton
              title="Iniciar Sesión"
              onPress={() => router.push("/sign-in")}
              style="bg-primary"
            />
            <CustomButton
              title="Registrarse"
              onPress={() => router.push("/sign-up")}
              style="bg-white border-2 border-primary"
              textStyle="text-orange-400"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}