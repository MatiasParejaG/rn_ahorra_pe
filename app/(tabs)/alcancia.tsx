import { images } from '@/constants/images';
import { updateAlcanciaName } from '@/lib/appwrite/index';
import useAuthBear from '@/store/auth.store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlcanciaScreen() {
  const { userAlcancia, user, fetchUserAlcancia } = useAuthBear();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserAlcancia();
    setIsRefreshing(false);
  };

  const handleStartEdit = () => {
    setEditName(userAlcancia?.name || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditName('');
    setIsEditing(false);
  };

  const handleSaveName = async () => {
    if (!userAlcancia?.$id || !user?.$id) return;

    if (!editName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (editName.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (editName.trim().length > 30) {
      Alert.alert('Error', 'El nombre no puede tener más de 30 caracteres');
      return;
    }

    setIsSaving(true);

    try {
      await updateAlcanciaName({
        alcanciaId: userAlcancia.$id,
        userId: user.$id,
        newName: editName.trim(),
      });

      await fetchUserAlcancia();
      Alert.alert('Éxito', 'Nombre actualizado correctamente');
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el nombre');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanQR = () => {
    router.push('/(alcancia)/scan-qr');
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

  // Si no tiene alcancía asociada
  if (!userAlcancia) {
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
          <View className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                Mi Alcancía
              </Text>
              <Text className="text-sm text-gray-500">
                Conecta tu alcancía física con la app
              </Text>
            </View>

            {/* Empty State */}
            <View className="items-center py-12">
              <View className="bg-primary/10 rounded-full p-8 mb-6">
                <Image 
                  source={images.logo} 
                  className="w-24 h-24"
                  resizeMode="contain"
                />
              </View>
              
              <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
                Aún no tienes una alcancía
              </Text>
              <Text className="text-gray-500 text-center px-8 mb-8">
                Escanea el código QR pegado en tu alcancía física para vincularla con tu cuenta
              </Text>

              <TouchableOpacity
                onPress={handleScanQR}
                className="bg-primary rounded-xl px-8 py-4 flex-row items-center"
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
                <Text className="text-white font-semibold text-base ml-3">
                  Escanear Código QR
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info Cards */}
            <View className="mt-8 space-y-4">
              <View className="bg-blue-50 rounded-xl p-4 flex-row">
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color="#3B82F6"
                  style={{ marginRight: 12 }}
                />
                <Text className="flex-1 text-sm text-blue-700">
                  Cada alcancía tiene un código QR único. Solo puedes vincular una alcancía por cuenta.
                </Text>
              </View>

              <View className="bg-green-50 rounded-xl p-4 flex-row">
                <MaterialCommunityIcons
                  name="shield-check"
                  size={24}
                  color="#10B981"
                  style={{ marginRight: 12 }}
                />
                <Text className="flex-1 text-sm text-green-700">
                  Una vez vinculada, podrás personalizar el nombre de tu alcancía y hacer seguimiento de tus ahorros.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Si ya tiene alcancía asociada
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
        <View className="px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Mi Alcancía
            </Text>
            <Text className="text-sm text-gray-500">
              Vinculada desde {formatDate(userAlcancia.fecha_activacion)}
            </Text>
          </View>

          {/* Alcancía Card */}
          <View
            className="bg-white rounded-3xl p-6 mb-6"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }}
          >
            {/* Imagen de la alcancía */}
            <View className="items-center mb-6">
              <View className="bg-primary/10 rounded-full p-8">
                <Image 
                  source={images.logo} 
                  className="w-32 h-32"
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Nombre de la alcancía */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-600 mb-3">
                Nombre de tu alcancía
              </Text>
              
              {isEditing ? (
                <View>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-lg font-bold text-gray-800 mb-2"
                    maxLength={30}
                    autoFocus
                  />
                  <Text className="text-xs text-gray-400 ml-1 mb-4">
                    {editName.length}/30 caracteres
                  </Text>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                      disabled={isSaving}
                    >
                      <Text className="text-gray-700 font-semibold">
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveName}
                      className="flex-1 bg-primary rounded-xl py-3 items-center"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="text-white font-semibold">Guardar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleStartEdit}
                  className="bg-gray-50 rounded-xl px-4 py-4 flex-row items-center justify-between"
                  activeOpacity={0.7}
                >
                  <Text className="text-lg font-bold text-gray-800">
                    {userAlcancia.name || 'Mi Alcancía'}
                  </Text>
                  <MaterialCommunityIcons name="pencil" size={20} color="#FE8C00" />
                </TouchableOpacity>
              )}
            </View>

            {/* Info adicional */}
            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-gray-600">ID de Alcancía</Text>
                <Text className="text-sm font-mono font-semibold text-gray-800">
                  {userAlcancia.$id.slice(0, 8)}...
                </Text>
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-gray-600">Estado</Text>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-semibold text-xs">
                    ✓ Activa
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Cards */}
          <View className="space-y-3">
            <View className="bg-blue-50 rounded-xl p-4 flex-row">
              <MaterialCommunityIcons
                name="lightbulb"
                size={24}
                color="#3B82F6"
                style={{ marginRight: 12 }}
              />
              <Text className="flex-1 text-sm text-blue-700">
                Usa tu alcancía física para guardar tus ahorros. Recuerda registrar tus depósitos en la app para mantener tu saldo actualizado.
              </Text>
            </View>

            <View className="bg-yellow-50 rounded-xl p-4 flex-row">
              <MaterialCommunityIcons
                name="alert"
                size={24}
                color="#F59E0B"
                style={{ marginRight: 12 }}
              />
              <Text className="flex-1 text-sm text-yellow-700">
                No compartas el código QR de tu alcancía. Es único y personal.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}