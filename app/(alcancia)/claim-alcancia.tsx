import CustomButton from '@/components/CustomButton';
import { images } from '@/constants/images';
import { claimAlcancia, getAlcanciaById } from '@/lib/appwrite/index';
import useAuthBear from '@/store/auth.store';
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

export default function ClaimAlcanciaScreen() {
  const { alcanciaId } = useLocalSearchParams<{ alcanciaId: string }>();
  const { user, fetchUserAlcancia } = useAuthBear();
  const [alcanciaName, setAlcanciaName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [alcanciaExists, setAlcanciaExists] = useState(false);
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);

  useEffect(() => {
    checkAlcancia();
  }, [alcanciaId]);

  const checkAlcancia = async () => {
    if (!alcanciaId) {
      Alert.alert('Error', 'ID de alcancía no válido', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const alcancia = await getAlcanciaById(alcanciaId);

      if (!alcancia) {
        setAlcanciaExists(false);
        Alert.alert(
          'Alcancía no encontrada',
          'Esta alcancía no existe en el sistema. Verifica el código QR.',
          [
            {
              text: 'Volver',
              onPress: () => router.back(),
            },
          ]
        );
        return;
      }

      setAlcanciaExists(true);

      if (alcancia.is_claimed) {
        setIsAlreadyClaimed(true);
        Alert.alert(
          'Alcancía no disponible',
          'Esta alcancía ya fue reclamada por otro usuario.',
          [
            {
              text: 'Volver',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo verificar la alcancía', [
        {
          text: 'Volver',
          onPress: () => router.back(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user?.$id) {
      Alert.alert('Error', 'Usuario no encontrado');
      return;
    }

    if (!alcanciaName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para tu alcancía');
      return;
    }

    if (alcanciaName.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (alcanciaName.trim().length > 30) {
      Alert.alert('Error', 'El nombre no puede tener más de 30 caracteres');
      return;
    }

    setIsClaiming(true);

    try {
      await claimAlcancia({
        alcanciaId: alcanciaId,
        userId: user.$id,
        name: alcanciaName.trim(),
      });

      // Refrescar la alcancía del usuario
      await fetchUserAlcancia();

      Alert.alert(
        '¡Alcancía Vinculada!',
        `Tu alcancía "${alcanciaName}" ha sido vinculada exitosamente a tu cuenta.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/alcancia'),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo vincular la alcancía');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
          <Text className="text-gray-500 mt-4">Verificando alcancía...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!alcanciaExists || isAlreadyClaimed) {
    return null;
  }

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
              <Text className="text-xl font-bold text-gray-800">
                Vincular Alcancía
              </Text>
              <View className="w-6" />
            </View>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-8">
              {/* Imagen de alcancía */}
              <View className="items-center mb-8">
                <View className="bg-primary/10 rounded-full p-8 mb-4">
                  <Image 
                    source={images.logo} 
                    className="w-32 h-32"
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                  ¡Alcancía Encontrada!
                </Text>
                <Text className="text-gray-500 text-center px-4">
                  Dale un nombre a tu alcancía para identificarla fácilmente
                </Text>
              </View>

              {/* Input de nombre */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Nombre de tu alcancía
                </Text>
                <TextInput
                  placeholder="Ej: Mi Cochino, Ahorros 2025"
                  placeholderTextColor="#999"
                  value={alcanciaName}
                  onChangeText={setAlcanciaName}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                  maxLength={30}
                  autoFocus
                />
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  {alcanciaName.length}/30 caracteres
                </Text>
              </View>

              {/* Info sobre la alcancía */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-4">
                  Información de la alcancía
                </Text>

                <View className="space-y-3">
                  <View className="flex-row items-center justify-between py-2">
                    <Text className="text-sm text-gray-600">ID</Text>
                    <Text className="text-sm font-mono font-semibold text-gray-800">
                      {alcanciaId.slice(0, 8)}...
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between py-2">
                    <Text className="text-sm text-gray-600">Estado</Text>
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-700 font-semibold text-xs">
                        Disponible
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Advertencias */}
              <View className="space-y-3">
                <View className="bg-yellow-50 rounded-xl p-4 flex-row">
                  <MaterialCommunityIcons
                    name="alert"
                    size={24}
                    color="#F59E0B"
                    style={{ marginRight: 12 }}
                  />
                  <Text className="flex-1 text-sm text-yellow-700">
                    Solo puedes vincular una alcancía por cuenta. Esta acción no se puede deshacer.
                  </Text>
                </View>

                <View className="bg-blue-50 rounded-xl p-4 flex-row">
                  <MaterialCommunityIcons
                    name="information"
                    size={24}
                    color="#3B82F6"
                    style={{ marginRight: 12 }}
                  />
                  <Text className="flex-1 text-sm text-blue-700">
                    Podrás cambiar el nombre de tu alcancía en cualquier momento desde la sección "Aprender".
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Botón de acción */}
          <View className="px-6 py-6 bg-white border-t border-gray-100">
            <CustomButton
              title="Vincular Alcancía"
              onPress={handleClaim}
              isLoading={isClaiming}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}