import { getMetaGrupalDetails } from "@/lib/appwrite/index";
import useAuthBear from "@/store/auth.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MetaGrupalDetail() {
  const { metaId } = useLocalSearchParams<{ metaId: string }>();
  const { userAccount } = useAuthBear();
  const [metaDetails, setMetaDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useEffect(() => {
    loadMetaDetails();
  }, [metaId]);

  const loadMetaDetails = async () => {
    try {
      const details = await getMetaGrupalDetails(metaId);
      setMetaDetails(details);
    } catch (error) {
      console.log("Error loading meta details:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMetaDetails();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
          <Text className="text-gray-500 mt-4">Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!metaDetails) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color="#EF4444"
          />
          <Text className="text-xl font-bold text-gray-800 mt-4">Error</Text>
          <Text className="text-gray-500 text-center mt-2">
            No se pudo cargar la información de la meta
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { meta, aportes, topContribuidores, totalAportes } = metaDetails;
  const progress = (meta.monto_actual / meta.monto_objetivo) * 100;
  const montoRestante = meta.monto_objetivo - meta.monto_actual;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#374151"
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            Detalle de Meta
          </Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#FE8C00"]}
          />
        }
      >
        <View className="px-5 py-6">
          {/* Card principal de la meta */}
          <View className="bg-white rounded-2xl overflow-hidden mb-6">
            {/* Imagen de la meta si existe */}
            {meta.foto_meta && (
              <View className="w-full h-56">
                <Image
                  source={{ uri: meta.foto_meta }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {/* Badge de estado sobre la imagen */}
                {meta.estado && (
                  <View className="absolute top-4 right-4">
                    <View className="bg-green-500 px-4 py-2 rounded-full">
                      <Text className="text-white font-bold text-sm">
                        ✓ Completada
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            <View className="p-6">
              {/* Header */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1 mr-3">
                  <Text className="text-2xl font-bold text-gray-800 mb-2">
                    {meta.nombre}
                  </Text>
                  {meta.descripcion && (
                    <Text className="text-sm text-gray-600 mb-3">
                      {meta.descripcion}
                    </Text>
                  )}
                  {meta.fecha_objetivo && (
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="calendar"
                        size={16}
                        color="#6B7280"
                      />
                      <Text className="text-xs text-gray-500 ml-1">
                        Meta: {formatDateOnly(meta.fecha_objetivo)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Badge de estado si NO hay imagen */}
                {!meta.foto_meta && meta.estado && (
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-700 font-bold text-xs">
                      ✓ Completada
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress Bar */}
              <View className="mb-4">
                <View className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: meta.estado ? "#10B981" : "#4A90E2",
                    }}
                  />
                </View>
              </View>

              {/* Estadísticas */}
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <View>
                  <Text className="text-xs text-gray-500 mb-1">Ahorrado</Text>
                  <Text className="text-lg font-bold text-gray-800">
                    {getCurrencySymbol()} {meta.monto_actual.toFixed(2)}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500 mb-1">Progreso</Text>
                  <Text className="text-lg font-bold text-blue-600">
                    {Math.round(progress)}%
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-500 mb-1">
                    {meta.estado ? "Meta" : "Falta"}
                  </Text>
                  <Text className="text-lg font-bold text-gray-800">
                    {getCurrencySymbol()}{" "}
                    {meta.estado
                      ? meta.monto_objetivo.toFixed(2)
                      : montoRestante.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Info adicional */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="account-group"
                    size={20}
                    color="#6B7280"
                  />
                  <Text className="text-sm text-gray-600 ml-2">
                    {totalAportes} aporte{totalAportes !== 1 ? "s" : ""}{" "}
                    registrado
                    {totalAportes !== 1 ? "s" : ""}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400">
                  Creada {formatDate(meta.$createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Top Contribuidores */}
          {topContribuidores.length > 0 && (
            <View className="bg-white rounded-2xl p-5 mb-6">
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons
                  name="trophy"
                  size={24}
                  color="#FE8C00"
                />
                <Text className="text-lg font-bold text-gray-800 ml-2">
                  Principales Aportadores
                </Text>
              </View>

              {topContribuidores
                .slice(0, 5)
                .map((contrib: any, index: number) => {
                  const contribution =
                    (contrib.totalAportado / meta.monto_actual) * 100;

                  return (
                    <View
                      key={index}
                      className="flex-row items-center justify-between py-3 border-b border-gray-100"
                    >
                      <View className="flex-row items-center flex-1">
                        {/* Badge de posición */}
                        <View
                          className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                            index === 0
                              ? "bg-yellow-100"
                              : index === 1
                                ? "bg-gray-200"
                                : index === 2
                                  ? "bg-orange-100"
                                  : "bg-blue-50"
                          }`}
                        >
                          <Text
                            className={`font-bold text-sm ${
                              index === 0
                                ? "text-yellow-700"
                                : index === 1
                                  ? "text-gray-600"
                                  : index === 2
                                    ? "text-orange-700"
                                    : "text-blue-600"
                            }`}
                          >
                            {index + 1}
                          </Text>
                        </View>

                        {/* Avatar y nombre */}
                        <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                          {contrib.usuario.avatar ? (
                            <Image
                              source={{ uri: contrib.usuario.avatar }}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <Text className="text-white font-bold text-sm">
                              {contrib.usuario.name?.charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>

                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-800">
                            {contrib.usuario.name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {contrib.cantidadAportes} aporte
                            {contrib.cantidadAportes !== 1 ? "s" : ""} •{" "}
                            {contribution.toFixed(1)}%
                          </Text>
                        </View>
                      </View>

                      <Text className="text-base font-bold text-primary">
                        {getCurrencySymbol()} {contrib.totalAportado.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
            </View>
          )}

          {/* Historial de Aportes */}
          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Historial de Aportes
            </Text>

            {aportes.length > 0 ? (
              aportes.map((aporte: any, index: number) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
                      {aporte.usuario.avatar ? (
                        <Image
                          source={{ uri: aporte.usuario.avatar }}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <Text className="text-white font-bold text-sm">
                          {aporte.usuario.name?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-800">
                        {aporte.usuario.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatDate(aporte.$createdAt)}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-base font-bold text-green-600">
                    +{getCurrencySymbol()} {aporte.monto.toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View className="items-center py-6">
                <MaterialCommunityIcons
                  name="history"
                  size={48}
                  color="#9CA3AF"
                />
                <Text className="text-gray-500 mt-2">
                  Aún no hay aportes registrados
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
