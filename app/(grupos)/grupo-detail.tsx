import AporteMetaModal from "@/components/AporteMetaModal";
import InviteUserModal from "@/components/InviteUserModal";
import { getGrupoMembers, getGrupoMetas, leaveGrupo } from "@/lib/appwrite";
import useAuthBear from "@/store/auth.store";
import { Grupo, MetaGrupal } from "@/types/type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GrupoDetail() {
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();
  const { user, userAccount, userGrupos, fetchAuthenticatedUser } =
    useAuthBear();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [metasGrupales, setMetasGrupales] = useState<MetaGrupal[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<MetaGrupal | null>(null);
  const [showAporteModal, setShowAporteModal] = useState(false);

  const grupo = userGrupos.find((g: any) => g.$id === grupoId) as Grupo & {
    userRole: string;
    membershipId: string;
  };

  useEffect(() => {
    if (!grupo) {
      Alert.alert("Error", "Grupo no encontrado");
      router.back();
      return;
    }

    loadMembers();
    loadMetasGrupales();
  }, [grupo]);

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

  const loadMembers = async () => {
    if (!grupo) return;

    try {
      const fetchedMembers = await getGrupoMembers(grupo.$id);
      setMembers(fetchedMembers);
    } catch (error) {
      console.log("Error loading members:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMetasGrupales = async () => {
    if (!grupo) return;

    try {
      const metas = await getGrupoMetas(grupo.$id);
      setMetasGrupales(metas as MetaGrupal[]);
    } catch (error) {
      console.log("Error loading metas grupales:", error);
    }
  };

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
        className="bg-white rounded-xl p-4 mb-3"
        style={{
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-base font-bold text-gray-800 mb-1">
              {meta.nombre}
            </Text>
            {meta.descripcion && (
              <Text className="text-xs text-gray-500" numberOfLines={2}>
                {meta.descripcion}
              </Text>
            )}
          </View>

          {meta.estado ? (
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-green-700 font-bold text-xs">
                ✓ Completada
              </Text>
            </View>
          ) : (
            <View className="bg-blue-100 px-2 py-1 rounded-full">
              <Text className="text-blue-700 font-bold text-xs">
                {Math.round(progress)}%
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: meta.estado ? "#10B981" : "#4A90E2",
              }}
            />
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-gray-500">
              {getCurrencySymbol()} {meta.monto_actual.toFixed(2)} de{" "}
              {getCurrencySymbol()} {meta.monto_objetivo.toFixed(2)}
            </Text>
          </View>

          {!meta.estado && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setSelectedMeta(meta);
                setShowAporteModal(true);
              }}
              className="bg-primary rounded-lg px-4 py-2"
            >
              <Text className="text-white font-semibold text-xs">Aportar</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMembers();
    loadMetasGrupales();
    fetchAuthenticatedUser();
  };

  const handleCopyTag = async () => {
    if (!grupo) return;
    await Clipboard.setStringAsync(grupo.tag);
    Alert.alert("Copiado", "TAG copiado al portapapeles");
  };

  const handleShareTag = async () => {
    if (!grupo) return;
    try {
      await Share.share({
        message: `¡Únete a mi grupo de ahorro "${grupo.nombre}"!\n\nTAG: #${grupo.tag}\n\nUsa este TAG para unirte al grupo en AhorraPe.`,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleManage = () => {
    router.push({
      pathname: "/(grupos)/manage-grupo",
      params: { grupoId: grupo.$id },
    });
  };

  const handleLeave = () => {
    Alert.alert(
      "Salir del Grupo",
      `¿Estás seguro que deseas salir de "${grupo.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            setIsLeaving(true);
            try {
              await leaveGrupo(grupo.membershipId, user!.$id, grupo.$id);
              await fetchAuthenticatedUser();
              Alert.alert("Has salido", "Has salido del grupo exitosamente", [
                { text: "OK", onPress: () => router.push("/(tabs)/grupos") },
              ]);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No se pudo salir del grupo"
              );
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  if (!grupo) return null;

  const isAdmin = grupo.userRole === "admin";
  const isCreator = grupo.created_by === user?.$id;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#374151"
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            Detalles del Grupo
          </Text>
          <View className="w-6" />
        </View>
      </View>

      {/* Modal de Invitación */}
      <InviteUserModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={grupo.$id}
        groupName={grupo.nombre}
        currentUserId={user!.$id}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
        </View>
      ) : (
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
            {/* Header del grupo */}
            <View className="bg-white rounded-2xl overflow-hidden mb-6">
              <View
                className="h-40"
                style={{
                  backgroundColor: grupo.foto_bg ? "transparent" : "#4A90E2",
                }}
              >
                {grupo.foto_bg ? (
                  <Image
                    source={{ uri: grupo.foto_bg }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <MaterialCommunityIcons
                      name="account-group"
                      size={64}
                      color="white"
                    />
                  </View>
                )}
              </View>

              <View className="p-5">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">
                      {grupo.nombre}
                    </Text>
                    {grupo.descripcion && (
                      <Text className="text-sm text-gray-600">
                        {grupo.descripcion}
                      </Text>
                    )}
                  </View>
                  {isAdmin && (
                    <View className="bg-primary/10 px-3 py-1 rounded-full ml-2">
                      <Text className="text-primary font-bold text-xs">
                        Admin
                      </Text>
                    </View>
                  )}
                </View>

                {/* TAG del grupo */}
                <View className="bg-gray-50 rounded-xl p-4 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <MaterialCommunityIcons
                      name="pound"
                      size={20}
                      color="#6B7280"
                    />
                    <Text className="text-lg font-mono font-bold text-gray-700 ml-2">
                      {grupo.tag}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={handleCopyTag}
                      className="bg-white rounded-lg p-2"
                      style={{ elevation: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="content-copy"
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleShareTag}
                      className="bg-white rounded-lg p-2"
                      style={{ elevation: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="share-variant"
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Metas Grupales */}

            <View className="bg-white rounded-2xl p-5 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">
                  Metas del Grupo ({metasGrupales.length})
                </Text>
              </View>

              {metasGrupales.length > 0 ? (
                <>
                  {metasGrupales.slice(0, 3).map(renderMetaCard)}

                  {metasGrupales.length > 3 && (
                    <TouchableOpacity
                      onPress={() => {
                        // Navegar a todas las metas TODO
                      }}
                      className="bg-gray-50 rounded-lg py-3 items-center mt-2"
                    >
                      <Text className="text-gray-600 font-semibold text-sm">
                        Ver todas las metas ({metasGrupales.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View className="items-center py-6">
                  <MaterialCommunityIcons
                    name="target-account"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text className="text-gray-500 mt-2 text-center">
                    Aún no hay metas grupales
                  </Text>
                  {isAdmin && (
                    <Text className="text-xs text-gray-400 text-center mt-1">
                      Los admins pueden crear metas desde "Administrar Grupo"
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Miembros */}
            <View className="bg-white rounded-2xl p-5 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">
                  Miembros ({members.length})
                </Text>

                {/* Botón de invitar (solo para admins) */}
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => setShowInviteModal(true)}
                    className="bg-blue-500 rounded-lg px-4 py-2 flex-row items-center"
                  >
                    <MaterialCommunityIcons
                      name="account-plus"
                      size={18}
                      color="white"
                    />
                    <Text className="text-white font-semibold ml-2 text-sm">
                      Invitar
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {members.map((member, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full bg-white-100 items-center justify-center">
                      {member.avatar ? (
                        <Image
                          source={{ uri: member.avatar }}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <Text className="text-white font-bold text-base">
                          {member.name?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-semibold text-gray-800">
                        {member.name}
                        {member.$id === user?.$id && (
                          <Text className="text-sm text-gray-500"> (Tú)</Text>
                        )}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(member.fecha_union).toLocaleDateString(
                          "es-PE",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`px-3 py-1 rounded-full ${
                      member.rol === "admin" ? "bg-primary/10" : "bg-sky-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        member.rol === "admin"
                          ? "text-primary"
                          : "text-blue-400"
                      }`}
                    >
                      {member.rol === "admin" ? "Admin" : "Miembro"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Acciones */}
            <View className="gap-3">
              {isAdmin && (
                <TouchableOpacity
                  onPress={handleManage}
                  className="bg-primary rounded-xl py-4 flex-row items-center justify-center"
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="cog" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Administrar Grupo
                  </Text>
                </TouchableOpacity>
              )}

              {!isCreator && (
                <TouchableOpacity
                  onPress={handleLeave}
                  className="bg-red-50 rounded-xl py-4 flex-row items-center justify-center"
                  activeOpacity={0.8}
                  disabled={isLeaving}
                >
                  {isLeaving ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="exit-to-app"
                        size={20}
                        color="#EF4444"
                      />
                      <Text className="text-red-600 font-semibold ml-2">
                        Salir del Grupo
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
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
            loadMetasGrupales();
            fetchAuthenticatedUser();
          }}
        />
      )}
    </SafeAreaView>
  );
}
