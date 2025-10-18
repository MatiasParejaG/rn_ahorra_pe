import CustomButton from '@/components/CustomButton';
import { addFundsToMeta } from '@/lib/appwrite';
import useAuthBear from '@/store/auth.store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function AddFunds() {
  const { metaId } = useLocalSearchParams<{ metaId: string }>();
  const { userMetas, userAccount, fetchAuthenticatedUser } = useAuthBear();
  const [monto, setMonto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const meta = userMetas.find(m => m.$id === metaId);

  useEffect(() => {
    if (!meta) {
      Alert.alert('Error', 'Meta no encontrada');
      router.push('/(metas)/metas-list');
    }
  }, [meta]);

  if (!meta || !userAccount) {
    return null;
  }

  const getCurrencySymbol = () => {
    const symbol = userAccount.divisa === 'PEN' ? 'S/' :
                   userAccount.divisa === 'USD' ? '$' :
                   userAccount.divisa === 'EUR' ? '€' :
                   userAccount.divisa === 'ARS' ? '$' : 'S/';
    
    return symbol;
  };

  const montoRestante = meta.monto_objetivo - meta.monto_actual;
  const progress = (meta.monto_actual / meta.monto_objetivo) * 100;

  const handleSubmit = async () => {
    const montoNumerico = parseFloat(monto);

    // Validaciones
    if (!monto || isNaN(montoNumerico)) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (montoNumerico < 0.1) {
      Alert.alert('Error', 'El monto debe ser mayor a 0.10');
      return;
    }

    if (montoNumerico > userAccount.saldo_actual) {
      Alert.alert(
        'Saldo Insuficiente',
        `No tienes suficiente saldo. Tu saldo actual es ${getCurrencySymbol()} ${userAccount.saldo_actual.toFixed(2)}`
      );
      return;
    }

    if (montoNumerico > montoRestante) {
      Alert.alert(
        'Monto Excedido',
        `Solo puedes agregar máximo ${getCurrencySymbol()} ${montoRestante.toFixed(2)} para completar esta meta`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addFundsToMeta({
        metaId: meta.$id,
        monto: montoNumerico,
        cuentaId: userAccount.$id,
      });

      // Refrescar datos del usuario
      await fetchAuthenticatedUser();

      if (result.metaCompletada) {
        Alert.alert(
          '🎉 ¡Meta Completada!',
          `¡Felicidades! Has alcanzado tu meta "${meta.nombre}"`,
          [
            {
              text: 'OK',
              onPress: () => router.push('/(metas)/metas-list'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Éxito',
          `Se agregaron ${getCurrencySymbol()} ${montoNumerico.toFixed(2)} a tu meta`,
          [
            {
              text: 'OK',
              onPress: () => router.push('/(metas)/metas-list'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron agregar los fondos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.min(
      montoRestante * (percentage / 100),
      userAccount.saldo_actual
    );
    setMonto(amount.toFixed(2));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header */}
          <View className="bg-white px-6 pt-4 pb-6 border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">Agregar Fondos</Text>
              <View className="w-6" />
            </View>

            {/* Saldo disponible */}
            <View className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Saldo disponible:</Text>
              <Text className="text-base font-bold text-gray-800">
                {getCurrencySymbol()} {userAccount.saldo_actual.toFixed(2)}
              </Text>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-6">
              {/* Meta Info Card */}
              <View className="bg-white rounded-2xl p-5 mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                  {meta.nombre}
                </Text>

                {/* Progress Bar */}
                <View className="mb-3">
                  <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <View
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </View>
                </View>

                {/* Amounts */}
                <View className="flex-row justify-between">
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
                    <Text className="text-xs text-gray-500 mb-1">Falta</Text>
                    <Text className="text-base font-bold text-gray-800">
                      {getCurrencySymbol()} {montoRestante.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Input de monto */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  ¿Cuánto deseas agregar?
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200">
                  <Text className="text-3xl font-bold text-gray-400 mr-2">
                    {getCurrencySymbol()}
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    value={monto}
                    onChangeText={setMonto}
                    keyboardType="decimal-pad"
                    className="flex-1 text-3xl font-bold text-gray-800"
                    autoFocus
                  />
                </View>
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  Máximo: {getCurrencySymbol()} {Math.min(montoRestante, userAccount.saldo_actual).toFixed(2)}
                </Text>
              </View>

              {/* Botones de monto rápido */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Montos Rápidos
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(25)}
                    className="flex-1 bg-blue-50 rounded-xl py-3 items-center"
                  >
                    <Text className="text-blue-700 font-semibold">25%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(50)}
                    className="flex-1 bg-blue-50 rounded-xl py-3 items-center"
                  >
                    <Text className="text-blue-700 font-semibold">50%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(75)}
                    className="flex-1 bg-blue-50 rounded-xl py-3 items-center"
                  >
                    <Text className="text-blue-700 font-semibold">75%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(100)}
                    className="flex-1 bg-blue-50 rounded-xl py-3 items-center"
                  >
                    <Text className="text-blue-700 font-semibold">100%</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Info */}
              <View className="bg-green-50 rounded-xl p-4 flex-row">
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color="#10B981"
                  style={{ marginRight: 12 }}
                />
                <Text className="flex-1 text-sm text-green-700">
                  El monto se restará de tu saldo y se agregará a tu meta
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botón de acción */}
          <View className="px-6 py-6 bg-white border-t border-gray-100">
            <CustomButton
              title="Agregar Fondos"
              onPress={handleSubmit}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}