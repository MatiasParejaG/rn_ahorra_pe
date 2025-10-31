import CustomButton from "@/components/CustomButton";
import DateInput from "@/components/DateInput";
import { createMeta, uploadMetaGrupalPhoto } from "@/lib/appwrite/index";
import useAuthBear from "@/store/auth.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateMeta() {
  const { user, userAccount, fetchAuthenticatedUser } = useAuthBear();
  const [nombre, setNombre] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState("");
  const [fechaObjetivo, setFechaObjetivo] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrencySymbol = () => {
    if (!userAccount) return "S/";

    const symbol =
      userAccount.divisa === "PEN"
        ? "S/"
        : userAccount.divisa === "USD"
          ? "$"
          : userAccount.divisa === "EUR"
            ? "€"
            : userAccount.divisa === "ARS"
              ? "$"
              : "S/";

    return symbol;
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permisos necesarios",
          "Necesitamos acceso a tus fotos para agregar una imagen a la meta"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log("Error picking image:", e);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert("Error", "Por favor ingresa un nombre para tu meta");
      return;
    }

    if (nombre.trim().length < 3) {
      Alert.alert("Error", "El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (nombre.trim().length > 50) {
      Alert.alert("Error", "El nombre no puede tener más de 50 caracteres");
      return;
    }

    const monto = parseFloat(montoObjetivo);

    if (!montoObjetivo || isNaN(monto)) {
      Alert.alert("Error", "Por favor ingresa un monto objetivo válido");
      return;
    }

    if (monto < 1) {
      Alert.alert("Error", "El monto objetivo debe ser mínimo 1");
      return;
    }

    if (monto > 1000000) {
      Alert.alert("Error", "El monto objetivo no puede ser mayor a 1,000,000");
      return;
    }

    if (!user?.$id) {
      Alert.alert("Error", "Usuario no encontrado");
      return;
    }

    setIsSubmitting(true);

    try {
      let fotoUrl: string | undefined = undefined;
      let fotoFileId: string | undefined = undefined;

      // Subir imagen si se seleccionó una
      if (selectedImage) {
        const tempMetaId = `temp_${Date.now()}`;
        const uploadResult = await uploadMetaGrupalPhoto(
          selectedImage,
          tempMetaId
        );
        fotoUrl = uploadResult.fileUrl;
        fotoFileId = uploadResult.fileId;
      }

      await createMeta({
        nombre: nombre.trim(),
        monto_objetivo: monto,
        fecha_objetivo: fechaObjetivo,
        userId: user.$id,
        ...(fotoUrl && { foto_meta: fotoUrl }),
        ...(fotoFileId && { foto_meta_file_id: fotoFileId }),
      });

      // Refrescar datos del usuario
      await fetchAuthenticatedUser();

      Alert.alert("Éxito", "Meta creada correctamente", [
        {
          text: "OK",
          onPress: () => router.push("/(metas)/metas-list"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear la meta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header */}
          <View className="bg-white px-6 pt-4 pb-6 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.push("/(metas)/metas-list")}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#374151"
                />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">
                Nueva Meta
              </Text>
              <View className="w-6" />
            </View>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-6">
              {/* Icono y descripción */}
              <View className="items-center mb-8">
                <View className="bg-primary/10 rounded-full p-6 mb-4">
                  <MaterialCommunityIcons
                    name="target"
                    size={64}
                    color="#FE8C00"
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-700 text-center">
                  Define tu meta de ahorro
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-2 px-4">
                  Establece un objetivo y comienza a ahorrar para alcanzarlo
                </Text>
              </View>

              {/* Selector de Imagen */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Imagen de la Meta (Opcional)
                </Text>

                {selectedImage ? (
                  <View className="relative items-center">
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-full h-48 rounded-xl aspect-square"
                      
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                      style={{
                        elevation: 3,
                        shadowColor: "#000",
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="relative items-center align-middle">
                  <TouchableOpacity
                    onPress={handlePickImage}
                    className="items-center align-middle bg-gray-50 w-2/3 aspect-square border-2 border-dashed border-gray-300 rounded-xl p-8 "
                  >
                    <MaterialCommunityIcons
                      name="image-plus"
                      size={48}
                      color="#9CA3AF"
                      className="mt-5"
                    />
                    <Text className="text-gray-600 font-semibold mt-3">
                      Agregar imagen
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1 text-center">
                      Toca para seleccionar una imagen representativa
                    </Text>
                  </TouchableOpacity>
                  </View>
                )}
                
              </View>

              {/* Nombre de la meta */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Nombre de la Meta
                </Text>
                <TextInput
                  placeholder="Ej: Bicicleta nueva, Laptop, Viaje"
                  placeholderTextColor="#999"
                  value={nombre}
                  onChangeText={setNombre}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                  maxLength={50}
                />
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  {nombre.length}/50 caracteres
                </Text>
              </View>

              {/* Monto Objetivo */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Monto Objetivo
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200">
                  <Text className="text-2xl font-bold text-gray-400 mr-2">
                    {getCurrencySymbol()}
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    value={montoObjetivo}
                    onChangeText={setMontoObjetivo}
                    keyboardType="decimal-pad"
                    className="flex-1 text-2xl font-bold text-gray-800"
                  />
                </View>
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  Monto mínimo: {getCurrencySymbol()} 1.00
                </Text>
              </View>

              {/* Fecha Objetivo (Opcional) */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Fecha Objetivo (Opcional)
                </Text>
                <DateInput
                  placeholder="Ingresa la fecha objetivo"
                  title="Fecha Objetivo"
                  onChangeText={(date) => setFechaObjetivo(date)}
                />
              </View>

              {/* Info */}
              <View className="bg-blue-50 rounded-xl p-4 flex-row">
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color="#3B82F6"
                  style={{ marginRight: 12 }}
                />
                <Text className="flex-1 text-sm text-blue-700">
                  Podrás agregar fondos a tu meta cuando quieras desde tu saldo
                  disponible
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botón de acción */}
          <View className="px-6 py-6 bg-white border-t border-gray-100">
            <CustomButton
              title="Crear Meta"
              onPress={handleSubmit}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
