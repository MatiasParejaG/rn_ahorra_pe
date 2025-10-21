import CustomButton from '@/components/CustomButton';
import {
    deleteGrupo,
    getGrupoMembers,
    updateGrupo,
    updateMemberRole,
} from '@/lib/appwrite';
import useAuthBear from '@/store/auth.store';
import { Grupo } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function ManageGrupo() {
  const { grupoId } = useLocalSearchParams<{ grupoId: string }>();
  const { user, userGrupos, fetchAuthenticatedUser } = useAuthBear();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para edición
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingRoleForMember, setUpdatingRoleForMember] = useState<string | null>(null);

  const grupo = userGrupos.find((g: any) => g.$id === grupoId) as Grupo & {
    userRole: string;
  };

  useEffect(() => {
    if (!grupo) {
      Alert.alert('Error', 'Grupo no encontrado');
      router.back();
      return;
    }

    // Verificar que el usuario sea admin
    if (grupo.userRole !== 'admin') {
      Alert.alert('Error', 'No tienes permisos para administrar este grupo');
      router.back();
      return;
    }

    setNombre(grupo.nombre);
    setDescripcion(grupo.descripcion || '');
    loadMembers();
  }, [grupo]);

  const loadMembers = async () => {
    if (!grupo) return;

    try {
      const fetchedMembers = await getGrupoMembers(grupo.$id);
      setMembers(fetchedMembers);
    } catch (error) {
      console.log('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInfo = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (nombre.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (nombre.trim().length > 50) {
      Alert.alert('Error', 'El nombre no puede tener más de 50 caracteres');
      return;
    }

    if (descripcion.trim().length > 150) {
      Alert.alert('Error', 'La descripción no puede tener más de 150 caracteres');
      return;
    }

    setIsUpdating(true);

    try {
      await updateGrupo({
        groupId: grupo.$id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
      });

      await fetchAuthenticatedUser();

      Alert.alert('Éxito', 'Información del grupo actualizada');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el grupo');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRole = async (member: any) => {
    // No permitir cambiar el rol del creador
    if (member.$id === grupo.created_by) {
      Alert.alert('Error', 'No puedes cambiar el rol del creador del grupo');
      return;
    }

    const newRole = member.rol === 'admin' ? 'miembro' : 'admin';
    const actionText = newRole === 'admin' ? 'promover a administrador' : 'quitar como administrador';

    Alert.alert(
      'Cambiar Rol',
      `¿Deseas ${actionText} a ${member.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setUpdatingRoleForMember(member.membershipId);
            try {
              await updateMemberRole({
                membershipId: member.membershipId,
                newRole,
              });

              // Recargar miembros
              await loadMembers();
              Alert.alert('Éxito', `Rol actualizado para ${member.name}`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo actualizar el rol');
            } finally {
              setUpdatingRoleForMember(null);
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Eliminar Grupo',
      `¿Estás seguro que deseas eliminar el grupo "${grupo.nombre}"? Esta acción no se puede deshacer y todos los miembros serán removidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteGrupo(grupo.$id, user!.$id);
              await fetchAuthenticatedUser();
              Alert.alert('Grupo Eliminado', 'El grupo ha sido eliminado exitosamente', [
                { text: 'OK', onPress: () => router.push('/(tabs)/grupos') },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar el grupo');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!grupo) return null;
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
        </View>
      </SafeAreaView>
    );
  }

  const isCreator = grupo.created_by === user?.$id;

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
              <Text className="text-xl font-bold text-gray-800">Administrar Grupo</Text>
              <View className="w-6" />
            </View>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-6">
              {/* Editar información */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">
                  Información del Grupo
                </Text>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-600 mb-2">
                    Nombre del Grupo
                  </Text>
                  <TextInput
                    value={nombre}
                    onChangeText={setNombre}
                    className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                    maxLength={50}
                  />
                  <Text className="text-xs text-gray-400 mt-1 ml-1">
                    {nombre.length}/50 caracteres
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-600 mb-2">Descripción</Text>
                  <TextInput
                    value={descripcion}
                    onChangeText={setDescripcion}
                    className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                    multiline
                    numberOfLines={3}
                    maxLength={150}
                    textAlignVertical="top"
                  />
                  <Text className="text-xs text-gray-400 mt-1 ml-1">
                    {descripcion.length}/150 caracteres
                  </Text>
                </View>

                <CustomButton
                  title="Guardar Cambios"
                  onPress={handleUpdateInfo}
                  isLoading={isUpdating}
                />
              </View>

              {/* Gestión de miembros */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">
                  Gestionar Miembros ({members.length})
                </Text>

                {members.map((member, index) => {
                  const isMemberCreator = member.$id === grupo.created_by;
                  const isUpdatingThisMember = updatingRoleForMember === member.membershipId;

                  return (
                    <View
                      key={index}
                      className="flex-row items-center justify-between py-3 border-b border-gray-100"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 rounded-full bg-blue-400 items-center justify-center">
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
                            {isMemberCreator && (
                              <Text className="text-sm text-primary"> (Creador)</Text>
                            )}
                          </Text>
                          <Text className="text-xs text-gray-500">{member.email}</Text>
                        </View>
                      </View>

                      {!isMemberCreator && (
                        <TouchableOpacity
                          onPress={() => handleToggleRole(member)}
                          className={`px-3 py-2 rounded-lg ${
                            member.rol === 'admin' ? 'bg-primary/10' : 'bg-gray-100'
                          }`}
                          disabled={isUpdatingThisMember}
                        >
                          {isUpdatingThisMember ? (
                            <ActivityIndicator size="small" color="#FE8C00" />
                          ) : (
                            <Text
                              className={`text-xs font-semibold ${
                                member.rol === 'admin' ? 'text-primary' : 'text-gray-600'
                              }`}
                            >
                              {member.rol === 'admin' ? 'Admin' : 'Miembro'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}

                <View className="bg-yellow-50 rounded-xl p-3 flex-row mt-4">
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color="#F59E0B"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="flex-1 text-xs text-yellow-700">
                    Toca en el rol de un miembro para cambiar sus permisos
                  </Text>
                </View>
              </View>

              {/* Eliminar grupo (solo creador) */}
              {isCreator && (
                <View className="bg-red-50 rounded-2xl p-6">
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />
                    <Text className="text-lg font-bold text-red-600 ml-2">Zona Peligrosa</Text>
                  </View>
                  <Text className="text-sm text-red-600 mb-4">
                    Esta acción es permanente y no se puede deshacer. Todos los miembros serán
                    removidos del grupo.
                  </Text>
                  <TouchableOpacity
                    onPress={handleDeleteGroup}
                    className="bg-red-600 rounded-xl py-3 items-center"
                    disabled={isDeleting}
                    activeOpacity={0.8}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-semibold">Eliminar Grupo</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}