import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { images } from "@/constants/images";
import { signIn } from "@/lib/appwrite/index";
import useAuthBear from "@/store/auth.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const { fetchAuthenticatedUser } = useAuthBear();

  const submit = async () => {
    const { email, password } = form;

    if (!email || !password)
      return Alert.alert("Error", "Ingresa un correo y contraseña válido");

    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      await fetchAuthenticatedUser();
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-primary/10 to-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header con botón de retroceso */}
          <View className="px-6 pt-4">
            <TouchableOpacity
              onPress={() => router.push('/(auth)/welcome')}
              className="w-10 h-10 rounded-full bg-white items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#374151"
              />
            </TouchableOpacity>
          </View>

          {/* Logo e ilustración */}
          <View className="items-center pt-8 pb-6">
            <View className="bg-primary/10 rounded-full p-6 mb-4">
              <Image
                source={images.logo}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
            <Image
              source={images.ahorrape}
              className="w-40 h-12 mb-2"
              resizeMode="contain"
            />
          </View>

          {/* Card de Login */}
          <View className="flex-1 px-6">
            <View
              className="bg-white rounded-3xl p-8"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 5,
              }}
            >
              {/* Título */}
              <View className="mb-8">
                <Text className="text-3xl font-black text-primary mb-2">
                  Inicia Sesión
                </Text>
                <Text className="text-base text-gray-600">
                  ¡Bienvenido de vuelta! Te extrañamos
                </Text>
              </View>

              {/* Formulario */}
              <View className="gap-5">
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico
                  </Text>
                  <CustomInput
                    placeholder="tucorreo@ejemplo.com"
                    value={form.email}
                    onChangeText={(text) =>
                      setForm((prev) => ({ ...prev, email: text }))
                    }
                    keyboardType="email-address"
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Contraseña
                  </Text>
                  <CustomInput
                    placeholder="••••••••"
                    value={form.password}
                    onChangeText={(text) =>
                      setForm((prev) => ({ ...prev, password: text }))
                    }
                    secureTextEntry={true}
                  />
                </View>

                {/* Olvidaste tu contraseña */}
                <TouchableOpacity className="self-end">
                  <Text className="text-sm font-semibold text-primary">
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>

                {/* Botón de inicio de sesión */}
                <View className="mt-4">
                  <CustomButton
                    title="Iniciar Sesión"
                    isLoading={isSubmitting}
                    onPress={submit}
                  />
                </View>

                {/* Link a registro */}
                <View className="flex-row justify-center items-center mt-6 gap-2">
                  <Text className="text-base text-gray-600">
                    ¿No tienes cuenta?
                  </Text>
                  <Link href="/sign-up" asChild>
                    <TouchableOpacity>
                      <Text className="text-base font-bold text-primary">
                        Regístrate
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>
          </View>

          <View className="h-8" />
        </ScrollView>

        {/* Loading Overlay */}
        {isSubmitting && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <View className="bg-white rounded-2xl p-6 items-center">
              <ActivityIndicator size="large" color="#FE8C00" />
              <Text className="text-gray-800 font-semibold mt-4">
                Iniciando Sesión...
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;