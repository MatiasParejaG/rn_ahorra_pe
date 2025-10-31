import CustomButton from '@/components/CustomButton';
import { findGrupoByTag, getGrupoMembers, joinGrupo } from '@/lib/appwrite/index';
import useAuthBear from '@/store/auth.store';
import { Grupo } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JoinGrupo() {
  const { user, fetchAuthenticatedUser } = useAuthBear();
  const [tag, setTag] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [foundGrupo, setFoundGrupo] = useState<Grupo | null>(null);
  const [grupoMembers, setGrupoMembers] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!tag.trim()) {
      Alert.alert('Error', 'Por favor ingresa un TAG');
      return;
    }

    setIsSearching(true);
    setFoundGrupo(null);
    setGrupoMembers([]);

    try {
      const grupo = await findGrupoByTag(tag.trim());

      if (!grupo) {
        Alert.alert('Grupo no encontrado', 'No existe ningún grupo con ese TAG');
        return;
      }

      setFoundGrupo(grupo as Grupo);

      // Cargar miembros del grupo
      const members = await getGrupoMembers(grupo.$id);
      setGrupoMembers(members);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo buscar el grupo');
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!foundGrupo || !user?.$id) return;

    setIsJoining(true);

    try {
      await joinGrupo({
        tag: foundGrupo.tag,
        userId: user.$id,
      });

      // Refrescar datos del usuario
      await fetchAuthenticatedUser();

      Alert.alert(
        '¡Te has unido!',
        `Ahora eres miembro del grupo "${foundGrupo.nombre}"`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/grupos'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo unir al grupo');
    } finally {
      setIsJoining(false);
    }
  };

  const renderMemberAvatars = () => {
    const maxVisible = 5;
    const visibleMembers = grupoMembers.slice(0, maxVisible);
    const remainingCount = grupoMembers.length - maxVisible;

    return (
      <View className="flex-row flex-wrap gap-2">
        {visibleMembers.map((member, index) => (
          <View key={index} className="items-center">
            <View className="w-12 h-12 rounded-full bg-white items-center justify-center border-2 border-white">
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} className="w-full h-full rounded-full" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  {member.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text className="text-xs text-gray-600 mt-1" numberOfLines={1}>
              {member.name}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View className="items-center">
            <View className="w-12 h-12 rounded-full bg-gray-400 items-center justify-center border-2 border-white">
              <Text className="text-white font-bold text-sm">+{remainingCount}</Text>
            </View>
            <Text className="text-xs text-gray-600 mt-1">más</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header */}
          <View className="bg-white px-6 pt-4 pb-6 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">Unirse a Grupo</Text>
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
                <View className="bg-blue-100 rounded-full p-6 mb-4">
                  <MaterialCommunityIcons
                    name="account-plus"
                    size={64}
                    color="#3B82F6"
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-700 text-center">
                  Busca un grupo por su TAG
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-2 px-4">
                  Pídele el TAG del grupo a su creador para unirte
                </Text>
              </View>

              {/* Input de TAG */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  TAG del Grupo
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200">
                    <Text className="text-xl font-bold text-gray-400 mr-2">#</Text>
                    <TextInput
                      placeholder="ABC123"
                      placeholderTextColor="#999"
                      value={tag}
                      onChangeText={(text) => setTag(text.toUpperCase())}
                      className="flex-1 text-xl font-bold text-gray-800"
                      autoCapitalize="characters"
                      maxLength={6}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleSearch}
                    className="bg-blue-500 rounded-xl p-3"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <MaterialCommunityIcons name="magnify" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  Ingresa el código de 6 caracteres
                </Text>
              </View>

              {/* Grupo encontrado */}
              {foundGrupo && (
                <View className="bg-white rounded-2xl p-5 mb-6">
                  <View className="flex-row items-center mb-4">
                    <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                    <Text className="text-green-600 font-semibold ml-2">Grupo encontrado</Text>
                  </View>

                  {/* Header del grupo */}
                  <View
                    className={`${foundGrupo.foto_grupo ? 'h-32' : 'h-24'} rounded-xl mb-4 overflow-hidden`}
                    style={{
                      backgroundColor: foundGrupo.foto_grupo ? 'transparent' : '#4A90E2',
                    }}
                  >
                    {foundGrupo.foto_grupo ? (
                      <Image
                        source={{ uri: foundGrupo.foto_grupo }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <MaterialCommunityIcons name="account-group" size={40} color="white" />
                      </View>
                    )}
                  </View>

                  {/* Información */}
                  <Text className="text-xl font-bold text-gray-800 mb-2">
                    {foundGrupo.nombre}
                  </Text>
                  {foundGrupo.descripcion && (
                    <Text className="text-sm text-gray-600 mb-4">
                      {foundGrupo.descripcion}
                    </Text>
                  )}

                  {/* Miembros */}
                  {grupoMembers.length > 0 && (
                    <View className="pt-4 border-t border-gray-100">
                      <Text className="text-sm font-semibold text-gray-600 mb-3">
                        Miembros ({grupoMembers.length})
                      </Text>
                      {renderMemberAvatars()}
                    </View>
                  )}
                </View>
              )}

              {/* Info */}
              <View className="bg-yellow-50 rounded-xl p-4 flex-row">
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color="#F59E0B"
                  style={{ marginRight: 12 }}
                />
                <Text className="flex-1 text-sm text-yellow-700">
                  Al unirte podrás ver la información del grupo y participar en las actividades de ahorro
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botón de acción */}
          {foundGrupo && (
            <View className="px-6 py-6 bg-white border-t border-gray-100">
              <CustomButton
                title="Unirse al Grupo"
                onPress={handleJoin}
                isLoading={isJoining}
              />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}