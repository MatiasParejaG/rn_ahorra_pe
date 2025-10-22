import InviteUserModal from "@/components/InviteUserModal";
import { getGrupoMembers, leaveGrupo } from "@/lib/appwrite";
import useAuthBear from "@/store/auth.store";
import { Grupo } from "@/types/type";
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
  const { user, userGrupos, fetchAuthenticatedUser } = useAuthBear();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

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
  }, [grupo]);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMembers();
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
    </SafeAreaView>
  );
}
