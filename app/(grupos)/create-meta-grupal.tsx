import CustomButton from '@/components/CustomButton';
import { createMetaGrupal } from '@/lib/appwrite';
import useAuthBear from '@/store/auth.store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateMetaGrupal() {
  const { grupoId, grupoNombre } = useLocalSearchParams<{ 
    grupoId: string; 
    grupoNombre: string;
  }>();
  const { user, userAccount } = useAuthBear();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [fechaObjetivo, setFechaObjetivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCurrencySymbol = () => {
    if (!userAccount) return 'S/';
    
    const symbol = userAccount.divisa === 'PEN' ? 'S/' :
                   userAccount.divisa === 'USD' ? '$' :
                   userAccount.divisa === 'EUR' ? '€' :
                   userAccount.divisa === 'ARS' ? '$' : 'S/';
    
    return symbol;
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la meta');
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

    const monto = parseFloat(montoObjetivo);

    if (!montoObjetivo || isNaN(monto)) {
      Alert.alert('Error', 'Por favor ingresa un monto objetivo válido');
      return;
    }

    if (monto < 1) {
      Alert.alert('Error', 'El monto objetivo debe ser mínimo 1');
      return;
    }

    if (monto > 1000000) {
      Alert.alert('Error', 'El monto objetivo no puede ser mayor a 1,000,000');
      return;
    }

    // Validar fecha si se proporcionó
    let fechaObjetivoISO: string | undefined = undefined;
    if (fechaObjetivo.trim()) {
      const fecha = new Date(fechaObjetivo);
      if (isNaN(fecha.getTime())) {
        Alert.alert('Error', 'Formato de fecha inválido');
        return;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fecha < hoy) {
        Alert.alert('Error', 'La fecha objetivo debe ser posterior a hoy');
        return;
      }

      fechaObjetivoISO = fecha.toISOString();
    }

    if (!user?.$id) {
      Alert.alert('Error', 'Usuario no encontrado');
      return;
    }

    setIsSubmitting(true);

    try {
      await createMetaGrupal({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        monto_objetivo: monto,
        fecha_objetivo: fechaObjetivoISO,
        groupId: grupoId,
        userId: user.$id,
      });

      Alert.alert(
        'Éxito',
        'Meta grupal creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la meta grupal');
    } finally {
      setIsSubmitting(false);
    }
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
              <Text className="text-xl font-bold text-gray-800">Nueva Meta Grupal</Text>
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
                <View className="bg-primary/10 rounded-full p-6 mb-4">
                  <MaterialCommunityIcons
                    name="target-account"
                    size={64}
                    color="#FE8C00"
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-700 text-center">
                  Crea una meta de ahorro grupal
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-2 px-4">
                  Todos los miembros de "{grupoNombre}" podrán aportar a esta meta
                </Text>
              </View>

              {/* Nombre de la meta */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Nombre de la Meta
                </Text>
                <TextInput
                  placeholder="Ej: Viaje a la playa, Equipos nuevos"
                  placeholderTextColor="#999"
                  value={nombre}
                  onChangeText={setNombre}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                  maxLength={50}
                />
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  {nombre.length}/50 caracteres
                </Text>
              </View>

              {/* Descripción */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Descripción (Opcional)
                </Text>
                <TextInput
                  placeholder="Describe el propósito de esta meta..."
                  placeholderTextColor="#999"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                  multiline
                  numberOfLines={4}
                  maxLength={150}
                  textAlignVertical="top"
                />
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  {descripcion.length}/150 caracteres
                </Text>
              </View>

              {/* Monto Objetivo */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Monto Objetivo
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200">
                  <Text className="text-2xl font-bold text-gray-400 mr-2">
                    {getCurrencySymbol()}
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    value={montoObjetivo}
                    onChangeText={setMontoObjetivo}
                    keyboardType="decimal-pad"
                    className="flex-1 text-2xl font-bold text-gray-800"
                  />
                </View>
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  Monto mínimo: {getCurrencySymbol()} 1.00
                </Text>
              </View>

              {/* Fecha Objetivo (Opcional) */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Fecha Objetivo (Opcional)
                </Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  value={fechaObjetivo}
                  onChangeText={setFechaObjetivo}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                />
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  Formato: AAAA-MM-DD (Ej: 2025-12-31)
                </Text>
              </View>

              {/* Info */}
              <View className="bg-blue-50 rounded-xl p-4 flex-row">
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color="#3B82F6"
                  style={{ marginRight: 12 }}
                />
                <Text className="flex-1 text-sm text-blue-700">
                  Todos los miembros del grupo podrán aportar a esta meta desde su saldo disponible
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botón de acción */}
          <View className="px-6 py-6 bg-white border-t border-gray-100">
            <CustomButton
              title="Crear Meta Grupal"
              onPress={handleSubmit}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}