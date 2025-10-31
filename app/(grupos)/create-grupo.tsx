import CustomButton from "@/components/CustomButton";
import { createGrupo, uploadGrupoPhoto } from "@/lib/appwrite/index";
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

export default function CreateGrupo() {
  const { user, fetchAuthenticatedUser } = useAuthBear();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        aspect: [16, 9],
        quality: 0.8,
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
      Alert.alert("Error", "Por favor ingresa un nombre para el grupo");
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

    if (descripcion.trim().length > 150) {
      Alert.alert(
        "Error",
        "La descripción no puede tener más de 150 caracteres"
      );
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
        const tempGroupId = `temp_${Date.now()}`;
        const uploadResult = await uploadGrupoPhoto(selectedImage, tempGroupId);
        fotoUrl = uploadResult.fileUrl;
        fotoFileId = uploadResult.fileId;
      }

      const result = await createGrupo({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        userId: user.$id,
        ...(fotoUrl && { foto_grupo: fotoUrl }),
        ...(fotoFileId && { foto_grupo_file_id: fotoFileId }),
      });

      // Refrescar datos del usuario
      await fetchAuthenticatedUser();

      Alert.alert(
        "¡Grupo Creado!",
        `Tu grupo "${nombre}" ha sido creado exitosamente.\n\nTAG: #${result.tag}\n\nComparte este TAG con tus amigos para que puedan unirse.`,
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/grupos"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo crear el grupo");
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
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#374151"
                />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">
                Crear Grupo
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
                    name="account-group"
                    size={64}
                    color="#FE8C00"
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-700 text-center">
                  Crea un grupo de ahorro
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-2 px-4">
                  Invita a tus amigos y ahorren juntos para alcanzar sus metas
                </Text>
              </View>

              {/* Selector de Imagen */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Imagen de la Meta (Opcional)
                </Text>

                {selectedImage ? (
                  <View className="relative">
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-full h-48 rounded-xl"
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
                  <TouchableOpacity
                    onPress={handlePickImage}
                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
                  >
                    <MaterialCommunityIcons
                      name="image-plus"
                      size={48}
                      color="#9CA3AF"
                    />
                    <Text className="text-gray-600 font-semibold mt-3">
                      Agregar imagen
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1 text-center">
                      Toca para seleccionar una imagen representativa
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Nombre del grupo */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Nombre del Grupo
                </Text>
                <TextInput
                  placeholder="Ej: Familia Perez, Amigos del cole"
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

              {/* Descripción */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Descripción (Opcional)
                </Text>
                <TextInput
                  placeholder="Describe el propósito de este grupo..."
                  placeholderTextColor="#999"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                  multiline
                  numberOfLines={4}
                  maxLength={150}
                  textAlignVertical="top"
                />
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  {descripcion.length}/150 caracteres
                </Text>
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
                  Se generará automáticamente un TAG único que podrás compartir
                  con tus amigos para que se unan al grupo
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botón de acción */}
          <View className="px-6 py-6 bg-white border-t border-gray-100">
            <CustomButton
              title="Crear Grupo"
              onPress={handleSubmit}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
