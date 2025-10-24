import AporteMetaModal from "@/components/AporteMetaModal";
import { getGrupoMetas } from "@/lib/appwrite/index";
import useAuthBear from "@/store/auth.store";
import { MetaGrupal } from "@/types/type";
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

export default function MetasGrupalesList() {
  const { grupoId, grupoNombre, userRole } = useLocalSearchParams<{
    grupoId: string;
    grupoNombre: string;
    userRole: string;
  }>();
  const { userAccount, user, fetchAuthenticatedUser } = useAuthBear();
  const [metas, setMetas] = useState<MetaGrupal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<MetaGrupal | null>(null);
  const [showAporteModal, setShowAporteModal] = useState(false);
  const [filter, setFilter] = useState<"todas" | "activas" | "completadas">("todas");

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
    loadMetas();
  }, [grupoId]);

  const loadMetas = async () => {
    try {
      const fetchedMetas = await getGrupoMetas(grupoId);
      setMetas(fetchedMetas as MetaGrupal[]);
    } catch (error) {
      console.log("Error loading metas:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMetas();
    fetchAuthenticatedUser();
  };

  const handleCreateMeta = () => {
    router.push({
      pathname: "/(grupos)/create-meta-grupal",
      params: {
        grupoId: grupoId,
        grupoNombre: grupoNombre,
      },
    });
  };

  const filteredMetas = metas.filter((meta) => {
    if (filter === "activas") return !meta.estado;
    if (filter === "completadas") return meta.estado;
    return true;
  });

  const renderMetaCard = (meta: MetaGrupal) => {
    const progress = (meta.monto_actual / meta.monto_objetivo) * 100;
    const montoRestante = meta.monto_objetivo - meta.monto_actual;

    return (
      <TouchableOpacity
        key={meta.$id}
        onPress={() =>
          router.push({
            pathname: "/(grupos)/meta-grupal-detail",
            params: { metaId: meta.$id },
          })
        }
        activeOpacity={0.8}
        className="bg-white rounded-xl overflow-hidden mb-4"
        style={{
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        {/* Imagen de la meta si existe */}
        {meta.foto_meta && (
          <View className="w-full h-40">
            <Image
              source={{ uri: meta.foto_meta }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Overlay con gradiente */}
            <View
              className="absolute bottom-0 left-0 right-0 h-20"
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            />
            {/* Badge de estado sobre la imagen */}
            <View className="absolute top-3 right-3">
              {meta.estado ? (
                <View className="bg-green-500 px-3 py-1.5 rounded-full">
                  <Text className="text-white font-bold text-xs">
                    ✓ Completada
                  </Text>
                </View>
              ) : (
                <View className="bg-blue-500 px-3 py-1.5 rounded-full">
                  <Text className="text-white font-bold text-xs">
                    {Math.round(progress)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-lg font-bold text-gray-800 mb-1">
                {meta.nombre}
              </Text>
              {meta.descripcion && (
                <Text className="text-xs text-gray-500" numberOfLines={2}>
                  {meta.descripcion}
                </Text>
              )}
              {meta.fecha_objetivo && (
                <View className="flex-row items-center mt-2">
                  <MaterialCommunityIcons name="calendar" size={14} color="#6B7280" />
                  <Text className="text-xs text-gray-500 ml-1">
                    Meta: {new Date(meta.fecha_objetivo).toLocaleDateString("es-PE")}
                  </Text>
                </View>
              )}
            </View>

            {/* Badge de estado si NO hay imagen */}
            {!meta.foto_meta && (
              meta.estado ? (
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-bold text-xs">
                    ✓ Completada
                  </Text>
                </View>
              ) : (
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 font-bold text-sm">
                    {Math.round(progress)}%
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Progress Bar */}
          <View className="mb-3">
            <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: meta.estado ? "#10B981" : "#4A90E2",
                }}
              />
            </View>
          </View>

          {/* Footer con montos */}
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-xs text-gray-500 mb-1">Ahorrado</Text>
              <Text className="text-base font-bold text-gray-800">
                {getCurrencySymbol()} {meta.monto_actual.toFixed(2)}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500 mb-1">Progreso</Text>
              <Text className="text-base font-bold text-blue-600">
                {Math.round(progress)}%
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-500 mb-1">
                {meta.estado ? "Meta" : "Falta"}
              </Text>
              <Text className="text-base font-bold text-gray-800">
                {getCurrencySymbol()}{" "}
                {meta.estado
                  ? meta.monto_objetivo.toFixed(2)
                  : montoRestante.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Botón de aportar */}
          {!meta.estado && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setSelectedMeta(meta);
                setShowAporteModal(true);
              }}
              className="bg-primary rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">Aportar a esta meta</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const isAdmin = userRole === "admin";
  const metasActivas = metas.filter((m) => !m.estado);
  const metasCompletadas = metas.filter((m) => m.estado);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 mx-3">
            <Text className="text-xl font-bold text-gray-800">Metas del Grupo</Text>
            <Text className="text-sm text-gray-500">{grupoNombre}</Text>
          </View>
          {isAdmin && (
            <TouchableOpacity
              onPress={handleCreateMeta}
              className="bg-primary rounded-full p-2"
            >
              <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Estadísticas */}
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 bg-blue-50 rounded-xl p-3">
            <Text className="text-blue-700 text-xs font-semibold mb-1">
              En Progreso
            </Text>
            <Text className="text-blue-800 font-bold text-xl">
              {metasActivas.length}
            </Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-xl p-3">
            <Text className="text-green-700 text-xs font-semibold mb-1">
              Completadas
            </Text>
            <Text className="text-green-800 font-bold text-xl">
              {metasCompletadas.length}
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setFilter("todas")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "todas" ? "bg-primary" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                filter === "todas" ? "text-white" : "text-gray-600"
              }`}
            >
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("activas")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "activas" ? "bg-blue-500" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                filter === "activas" ? "text-white" : "text-gray-600"
              }`}
            >
              Activas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("completadas")}
            className={`flex-1 py-2 rounded-lg ${
              filter === "completadas" ? "bg-green-500" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-semibold text-sm ${
                filter === "completadas" ? "text-white" : "text-gray-600"
              }`}
            >
              Completadas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de metas */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
          <Text className="text-gray-500 mt-4">Cargando metas...</Text>
        </View>
      ) : filteredMetas.length > 0 ? (
        <ScrollView
          className="flex-1 px-5 py-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#FE8C00"]}
            />
          }
        >
          <Text className="text-sm text-gray-500 mb-4">
            {filteredMetas.length} meta{filteredMetas.length !== 1 ? "s" : ""}
          </Text>
          {filteredMetas.map(renderMetaCard)}
          <View className="h-4" />
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-primary/10 rounded-full p-8 mb-6">
            <MaterialCommunityIcons
              name="target-account"
              size={64}
              color="#FE8C00"
            />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            {filter === "todas"
              ? "No hay metas"
              : filter === "activas"
                ? "No hay metas activas"
                : "No hay metas completadas"}
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            {isAdmin
              ? "Crea la primera meta grupal para este grupo"
              : "Los administradores pueden crear metas grupales"}
          </Text>
          {isAdmin && filter !== "completadas" && (
            <TouchableOpacity
              onPress={handleCreateMeta}
              className="bg-primary px-6 py-3 rounded-xl flex-row items-center"
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Crear Meta</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal de Aporte */}
      {selectedMeta && userAccount && (
        <AporteMetaModal
          visible={showAporteModal}
          onClose={() => {
            setShowAporteModal(false);
            setSelectedMeta(null);
          }}
          meta={selectedMeta}
          userId={user!.$id}
          cuentaId={userAccount.$id}
          saldoDisponible={userAccount.saldo_actual}
          currencySymbol={getCurrencySymbol()}
          onSuccess={() => {
            loadMetas();
            fetchAuthenticatedUser();
          }}
        />
      )}
    </SafeAreaView>
  );
}