import CustomButton from "@/components/CustomButton";
import { deleteMeta } from "@/lib/appwrite/index";
import useAuthBear from "@/store/auth.store";
import { Meta } from "@/types/type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MetasList() {
  const { userMetas, userAccount, fetchAuthenticatedUser } = useAuthBear();
  const [deletingMetaId, setDeletingMetaId] = useState<string | null>(null);

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

  const getPreview = async (meta: Meta) => {
    if (meta.foto_meta === null) {
      return (
        <View className="bg-blue-100 rounded-lg p-2">
          <MaterialCommunityIcons name="hand-coin" size={34} color="#2196F3" />
        </View>
      );
    }

    return (
      <View
        className="bg-pink-100 rounded-lg overflow-hidden"
        style={{ width: 54, height: 54 }}
      >
        <Image
          source={{ uri: meta.foto_meta }}
          style={{ width: 54, height: 54 }}
          resizeMode="cover"
        />
      </View>
    );
  };

  const handleDeleteMeta = async (meta: Meta) => {
    if (meta.monto_actual > 0) {
      Alert.alert(
        "No se puede eliminar",
        "Esta meta ya tiene progreso. Solo puedes eliminar metas sin progreso."
      );
      return;
    }

    Alert.alert(
      "Eliminar Meta",
      `¿Estás seguro que deseas eliminar "${meta.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeletingMetaId(meta.$id);
            try {
              await deleteMeta(meta.$id);
              await fetchAuthenticatedUser();
              Alert.alert("Éxito", "Meta eliminada correctamente");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No se pudo eliminar la meta"
              );
            } finally {
              setDeletingMetaId(null);
            }
          },
        },
      ]
    );
  };

  const handleAddFunds = (meta: Meta) => {
    router.push({
      pathname: "/(metas)/add-funds",
      params: { metaId: meta.$id },
    });
  };

  const handleCreateMeta = () => {
    router.push("/(metas)/create-meta");
  };

  const activeMetas = userMetas.filter((m) => !m.estado);
  const completedMetas = userMetas.filter((m) => m.estado);

  const renderMetaCard = (meta: Meta, isCompleted: boolean = false) => {
    const progress = (meta.monto_actual / meta.monto_objetivo) * 100;
    const remaining = meta.monto_objetivo - meta.monto_actual;
    const isDeleting = deletingMetaId === meta.$id;

    return (
      <View
        key={meta.$id}
        className={`bg-white rounded-2xl p-5 mb-4 ${isCompleted ? "opacity-75" : ""}`}
        style={{
          elevation: 3,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-4">
          {getPreview(meta)}
          <View className="flex-1 ml-3 mr-3">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {meta.nombre}
            </Text>
            {meta.fecha_objetivo && (
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color="#6B7280"
                />
                <Text className="text-xs text-gray-500 ml-1">
                  {new Date(meta.fecha_objetivo).toLocaleDateString("es-PE")}
                </Text>
              </View>
            )}
          </View>

          {isCompleted ? (
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-600 font-bold text-xs">
                ✓ Completada
              </Text>
            </View>
          ) : (
            <View className="bg-orange-100 px-3 py-1 rounded-full">
              <Text className="text-primary font-bold text-sm">
                {Math.round(progress)}%
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View className="mb-4">
          <View className="bg-green-100 rounded-full h-3 overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: "#29da00",
              }}
            />
          </View>
        </View>

        {/* Amount Info */}
        <View className="flex-row justify-between mb-4">
          <View>
            <Text className="text-xs text-gray-500 mb-1">Ahorrado</Text>
            <Text className="text-base font-bold text-gray-800">
              {getCurrencySymbol()} {meta.monto_actual.toFixed(2)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500 mb-1">
              {isCompleted ? "Meta alcanzada" : "Falta"}
            </Text>
            <Text className="text-base font-bold text-gray-800">
              {getCurrencySymbol()}{" "}
              {isCompleted
                ? meta.monto_objetivo.toFixed(2)
                : remaining.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {!isCompleted && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleAddFunds(meta)}
              className="flex-1 bg-primary rounded-xl py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Agregar Fondos</Text>
            </TouchableOpacity>

            {meta.monto_actual === 0 && (
              <TouchableOpacity
                onPress={() => handleDeleteMeta(meta)}
                className="bg-red-50 rounded-xl px-4 py-3 items-center justify-center"
                activeOpacity={0.8}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="#EF4444"
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#374151"
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Mis Metas</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Metas Activas */}
        {activeMetas.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              En Progreso ({activeMetas.length})
            </Text>
            {activeMetas.map((meta) => renderMetaCard(meta))}
          </View>
        )}

        {/* Metas Completadas */}
        {completedMetas.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Completadas ({completedMetas.length})
            </Text>
            {completedMetas.map((meta) => renderMetaCard(meta, true))}
          </View>
        )}

        {/* Empty State */}
        {userMetas.length === 0 && (
          <View className="flex-1 items-center justify-center py-12">
            <View className="bg-primary/10 rounded-full p-8 mb-6">
              <MaterialCommunityIcons name="target" size={64} color="#FE8C00" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
              Aún no tienes metas
            </Text>
            <Text className="text-gray-500 text-center px-8 mb-6">
              Crea tu primera meta de ahorro y comienza a alcanzar tus objetivos
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Meta Button */}
      <View className="px-6 py-6 bg-white border-t border-gray-100">
        <CustomButton
          title="Crear Nueva Meta"
          onPress={handleCreateMeta}
          leftIcon={
            <MaterialCommunityIcons
              name="plus-circle"
              size={20}
              color="white"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}
