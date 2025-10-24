import { getGrupoMembers } from '@/lib/appwrite/index';
import useAuthBear from '@/store/auth.store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GruposScreen() {
  const { userGrupos, userInvitaciones, fetchAuthenticatedUser, fetchUserInvitaciones } = useAuthBear();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gruposWithMembers, setGruposWithMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchUserInvitaciones();
  }, []);
  
  useEffect(() => {
    loadGruposWithMembers();
  }, [userGrupos]);

  const loadGruposWithMembers = async () => {
    setIsLoading(true);
    try {
      const gruposData = await Promise.all(
        userGrupos.map(async (grupo: any) => {
          try {
            const members = await getGrupoMembers(grupo.$id);
            return { ...grupo, members };
          } catch (error) {
            console.log('Error loading members for grupo:', error);
            return { ...grupo, members: [] };
          }
        })
      );
      setGruposWithMembers(gruposData);
    } catch (error) {
      console.log('Error loading grupos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAuthenticatedUser();
    await loadGruposWithMembers();
    setIsRefreshing(false);
  };

  const handleCreateGroup = () => {
    router.push('/(grupos)/create-grupo');
  };

  const handleJoinGroup = () => {
    router.push('/(grupos)/join-grupo');
  };

  const handleGroupPress = (groupId: string) => {
    router.push({
      pathname: '/(grupos)/grupo-detail',
      params: { grupoId: groupId },
    });
  };

  const renderMemberAvatars = (members: any[]) => {
    const maxVisible = 3;
    const visibleMembers = members.slice(0, maxVisible);
    const remainingCount = members.length - maxVisible;

    return (
      <View className="flex-row -space-x-2">
        {visibleMembers.map((member, index) => (
          <View
            key={index}
            className="w-8 h-8 rounded-full bg-white-100 items-center justify-center border-2 border-white"
            style={{ zIndex: visibleMembers.length - index }}
          >
            {member.avatar ? (
              <Image source={{ uri: member.avatar }} className="w-full h-full rounded-full" />
            ) : (
              <Text className="text-white font-bold text-xs">
                {member.name?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        ))}
        {remainingCount > 0 && (
          <View
            className="w-8 h-8 rounded-full bg-gray-400 items-center justify-center border-2 border-white"
            style={{ zIndex: 0 }}
          >
            <Text className="text-white font-bold text-xs">+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderGroupCard = (grupo: any) => {
    const isAdmin = grupo.userRole === 'admin';

    return (
      <TouchableOpacity
        key={grupo.$id}
        onPress={() => handleGroupPress(grupo.$id)}
        activeOpacity={0.8}
        className="bg-white rounded-2xl p-5 mb-4"
        style={{
          elevation: 3,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {/* Header con foto o color de fondo */}
        <View
          className="h-24 rounded-xl mb-4 overflow-hidden"
          style={{
            backgroundColor: grupo.foto_bg ? 'transparent' : '#4A90E2',
          }}
        >
          {grupo.foto_bg ? (
            <Image source={{ uri: grupo.foto_bg }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <MaterialCommunityIcons name="account-group" size={40} color="white" />
            </View>
          )}
        </View>

        {/* Información del grupo */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {grupo.nombre}
            </Text>
            {grupo.descripcion && (
              <Text className="text-sm text-gray-500" numberOfLines={2}>
                {grupo.descripcion}
              </Text>
            )}
          </View>

          {isAdmin && (
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary font-bold text-xs">Admin</Text>
            </View>
          )}
        </View>

        {/* Footer con tag y miembros */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="pound" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 font-mono ml-1">{grupo.tag}</Text>
          </View>

          {grupo.members && grupo.members.length > 0 && renderMemberAvatars(grupo.members)}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-800">Mis Grupos</Text>
          <TouchableOpacity
            onPress={() => router.push('/(grupos)/invitations-list')}
            className="relative"
          >
            <View className="bg-primary/10 rounded-full p-2">
              <MaterialCommunityIcons name="email" size={24} color="#FE8C00" />
            </View>
            {userInvitaciones.length > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {userInvitaciones.length > 9 ? '9+' : userInvitaciones.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Botones de acción rápida */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleCreateGroup}
            className="flex-1 bg-primary rounded-xl py-3 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Crear Grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleJoinGroup}
            className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Unirse</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de grupos */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
          <Text className="text-gray-500 mt-4">Cargando grupos...</Text>
        </View>
      ) : gruposWithMembers.length > 0 ? (
        <ScrollView
          className="flex-1 px-5 py-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#FE8C00']} />
          }
        >
          <Text className="text-sm text-gray-500 mb-4">
            {gruposWithMembers.length} grupo{gruposWithMembers.length !== 1 ? 's' : ''}
          </Text>
          {gruposWithMembers.map(renderGroupCard)}
          <View className="h-4" />
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-primary/10 rounded-full p-8 mb-6">
            <MaterialCommunityIcons name="account-group-outline" size={64} color="#FE8C00" />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            Aún no tienes grupos
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Crea un grupo de ahorro o únete a uno existente para empezar
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCreateGroup}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Crear Grupo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleJoinGroup}
              className="bg-blue-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Unirse</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}