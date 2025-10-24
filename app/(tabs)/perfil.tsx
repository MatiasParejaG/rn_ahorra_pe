import { getUserStats, logOut, updateUserProfile, uploadAvatar } from '@/lib/appwrite';
import useAuthBear from '@/store/auth.store';
import { UserStats } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Perfil() {
  const { user, fetchAuthenticatedUser, setIsAuthenticated, setUser, setUserAccount, setUserMetas, setUserGrupos } = useAuthBear();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Datos editables
  const [editName, setEditName] = useState('');
  const [editTag, setEditTag] = useState('');
  
  // Estadísticas
  const [stats, setStats] = useState<UserStats>({
    metasCompletadas: 0,
    gruposCount: 0,
    ingresosCount: 0,
  });

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditTag(user.tag || '');
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user?.$id) return;
    
    try {
      const userStats = await getUserStats(user.$id);
      setStats(userStats);
    } catch (e) {
      console.log('Error loading stats:', e);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAuthenticatedUser();
    await loadStats();
    setIsRefreshing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateMemberSince = (dateString?: string) => {
    if (!dateString) return '';
    
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} mes${months !== 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Hace ${years} año${years !== 1 ? 's' : ''}`;
    }
  };

  const handleCopyTag = async () => {
    if (!user?.tag) return;
    await Clipboard.setStringAsync(user.tag);
    Alert.alert('Copiado', 'Tu tag ha sido copiado al portapapeles');
  };

  const handleShareTag = async () => {
    if (!user?.tag) return;
    
    try {
      await Share.share({
        message: `¡Agrega a ${user.name} en AhorraPe!\n\nTag: ${user.tag}\n\nÚsalo para enviarme invitaciones a grupos de ahorro.`,
      });
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  const handlePickImage = async () => {
    try {
      // Solicitar permisos
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tus fotos para cambiar tu avatar'
        );
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUploadAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Error picking image:', e);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleUploadAvatar = async (imageUri: string) => {
    if (!user?.$id) return;

    setIsUploadingImage(true);

    try {
      // Subir nueva imagen
      const { fileId, fileUrl } = await uploadAvatar(imageUri, user.$id);

      // Actualizar perfil con nueva URL
      await updateUserProfile({
        userId: user.$id,
        avatarUrl: fileUrl,
        oldAvatarFileId: user.avatar_file_id,
      });

      // Refrescar usuario
      await fetchAuthenticatedUser();

      Alert.alert('Éxito', 'Avatar actualizado correctamente');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el avatar');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.$id) return;

    // Validaciones
    if (!editName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (editName.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (!editTag.trim()) {
      Alert.alert('Error', 'El tag no puede estar vacío');
      return;
    }

    // Validar formato del tag
    const tagRegex = /^@[a-z0-9]+$/;
    if (!tagRegex.test(editTag.toLowerCase())) {
      Alert.alert(
        'Tag inválido',
        'El tag debe comenzar con @ y solo contener letras minúsculas y números'
      );
      return;
    }

    if (editTag.length < 5 || editTag.length > 20) {
      Alert.alert('Error', 'El tag debe tener entre 5 y 20 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await updateUserProfile({
        userId: user.$id,
        name: editName.trim(),
        tag: editTag.toLowerCase(),
      });

      await fetchAuthenticatedUser();

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditName(user.name);
      setEditTag(user.tag || '');
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logOut();
              setIsAuthenticated(false);
              setUser(null);
              setUserAccount(null);
              setUserMetas([]);
              setUserGrupos([]);
              router.replace('/sign-in');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo cerrar sesión');
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FE8C00']}
          />
        }
      >
        {/* Header con botones */}
        <View className="bg-white pt-4 pb-6 px-6">
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-transparent items-center justify-center"
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
              activeOpacity={0.7}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View className="items-center mb-8">
            <View className="relative">
              <View className="w-36 h-36 rounded-full bg-white items-center justify-center overflow-hidden">
                {isUploadingImage ? (
                  <ActivityIndicator size="large" color="white" />
                ) : user.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    className="w-full h-full"
                  />
                ) : (
                  <Text className="text-white font-bold text-5xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              {/* Botón para cambiar foto */}
              <TouchableOpacity
                onPress={handlePickImage}
                className="absolute bottom-0 right-0 bg-primary rounded-full p-3"
                disabled={isUploadingImage}
                style={{
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <MaterialCommunityIcons name="camera" size={22} color="white" />
              </TouchableOpacity>
            </View>

            {/* Miembro desde */}
            <Text className="text-sm text-gray-500 mt-4">
              {calculateMemberSince(user.$createdAt)}
            </Text>
          </View>

          {/* Información del perfil */}
          <View className="space-y-5">
            {/* Nombre */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-2">Nombre</Text>
              {isEditing ? (
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                  maxLength={50}
                />
              ) : (
                <View className="bg-gray-50 rounded-xl px-4 py-3">
                  <Text className="text-base text-gray-800">{user.name}</Text>
                </View>
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mt-2 mb-2">Email</Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-base text-gray-800">{user.email}</Text>
              </View>
            </View>

            {/* Tag */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mt-2 mb-2">Tag de Usuario</Text>
              {isEditing ? (
                <TextInput
                  value={editTag}
                  onChangeText={setEditTag}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800 font-mono"
                  maxLength={20}
                  autoCapitalize="none"
                />
              ) : (
                <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between">
                  <Text className="text-base text-gray-800 font-mono font-bold">
                    {user.tag}
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={handleCopyTag}
                      className="bg-white rounded-lg p-2"
                      style={{ elevation: 1 }}
                    >
                      <MaterialCommunityIcons
                        name="content-copy"
                        size={18}
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
                        size={18}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Fecha de creación */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mt-2 mb-2">
                Miembro desde
              </Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-base text-gray-800">
                  {formatDate(user.$createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View className="mt-6">
            {isEditing ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                  disabled={isLoading}
                >
                  <Text className="text-gray-700 font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  className="flex-1 bg-primary rounded-xl py-3 items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semibold">Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="bg-primary rounded-xl py-3 flex-row items-center justify-center"
              >
                <MaterialCommunityIcons name="pencil" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Editar Perfil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Estadísticas */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Estadísticas</Text>

          <View className="flex-row gap-3">
            {/* Metas completadas */}
            <View
              className="flex-1 bg-white rounded-2xl p-4"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 3,
              }}
            >
              <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <MaterialCommunityIcons name="target" size={24} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                {stats.metasCompletadas}
              </Text>
              <Text className="text-sm text-gray-500">Metas Completadas</Text>
            </View>

            {/* Grupos */}
            <View
              className="flex-1 bg-white rounded-2xl p-4"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 3,
              }}
            >
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-3">
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color="#3B82F6"
                />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                {stats.gruposCount}
              </Text>
              <Text className="text-sm text-gray-500">Grupos</Text>
            </View>
          </View>

          {/* Ingresos */}
          <View
            className="bg-white rounded-2xl p-4 mt-3"
            style={{
              elevation: 2,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 3,
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-primary/10 w-12 h-12 rounded-full items-center justify-center mr-4">
                <MaterialCommunityIcons
                  name="cash-plus"
                  size={24}
                  color="#FE8C00"
                />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {stats.ingresosCount}
                </Text>
                <Text className="text-sm text-gray-500">Ahorros Registrados</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}