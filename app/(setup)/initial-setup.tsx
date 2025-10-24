import CurrencySelector from '@/components/CurrencySelector';
import CustomButton from '@/components/CustomButton';
import { CURRENCIES } from '@/constants/currencies';
import { createUserAccount } from '@/lib/appwrite/index';
import useAuthBear from '@/store/auth.store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

export default function InitialSetup() {
  const { user, fetchAuthenticatedUser } = useAuthBear();
  const [step, setStep] = useState(1);
  const [saldoInicial, setSaldoInicial] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('PEN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      const saldo = parseFloat(saldoInicial);
      
      if (!saldoInicial || isNaN(saldo)) {
        Alert.alert('Error', 'Por favor ingresa un saldo válido');
        return;
      }

      if (saldo <= 0) {
        Alert.alert('Error', 'El saldo inicial debe ser mayor a 0');
        return;
      }

      setStep(2);
    }
  };

  const handleFinish = async () => {
    if (!user?.$id) {
      Alert.alert('Error', 'Usuario no encontrado');
      return;
    }

    setIsSubmitting(true);

    try {
      await createUserAccount({
        userId: user.$id,
        saldoInicial: parseFloat(saldoInicial),
        divisa: selectedCurrency,
      });

      // Refrescar datos del usuario
      await fetchAuthenticatedUser();

      // Navegar al inicio
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrencySymbol = () => {
    const currency = CURRENCIES.find((c) => c.code === selectedCurrency);
    return currency?.symbol || '';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Loading Overlay */}
      {(isSubmitting || isNavigating) && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <View className="bg-white rounded-2xl p-6 items-center">
            <ActivityIndicator size="large" color="#FE8C00" />
            <Text className="text-gray-800 font-semibold mt-4">
              {isSubmitting ? 'Configurando...' : 'Actualizando...'}
            </Text>
          </View>
        </View>
      )}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header con progreso */}
          <View className="px-6 pt-4 pb-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-800">
                Configuración Inicial
              </Text>
              <View className="bg-primary/10 px-4 py-2 rounded-full">
                <Text className="text-primary font-bold">{step}/2</Text>
              </View>
            </View>

            {/* Barra de progreso */}
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </View>
          </View>

          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 ? (
              // Paso 1: Saldo Inicial
              <View className="flex-1 py-6">
                <View className="items-center mb-8">
                  <View className="bg-primary/10 rounded-full p-6 mb-4">
                    <MaterialCommunityIcons
                      name="wallet"
                      size={64}
                      color="#FE8C00"
                    />
                  </View>
                  <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                    ¿Cuál es tu saldo actual?
                  </Text>
                  <Text className="text-gray-500 text-center px-4">
                    Ingresa el dinero que tienes disponible para empezar a
                    administrar tus finanzas
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <Text className="text-sm font-semibold text-gray-600 mb-3">
                    Saldo Inicial
                  </Text>
                  <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border-2 border-gray-200">
                    <Text className="text-2xl font-bold text-gray-400 mr-2">
                      {getCurrencySymbol()}
                    </Text>
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor="#999"
                      value={saldoInicial}
                      onChangeText={setSaldoInicial}
                      keyboardType="decimal-pad"
                      className="flex-1 text-2xl font-bold text-gray-800"
                      autoFocus
                    />
                  </View>
                  <Text className="text-xs text-gray-400 mt-2 ml-1">
                    El saldo debe ser mayor a 0
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
                    Este será el punto de partida para realizar el seguimiento
                    de tus ahorros y gastos
                  </Text>
                </View>
              </View>
            ) : (
              // Paso 2: Selección de Divisa
              <View className="flex-1 py-6">
                <View className="items-center mb-8">
                  <View className="bg-primary/10 rounded-full p-6 mb-4">
                    <MaterialCommunityIcons
                      name="currency-usd"
                      size={64}
                      color="#FE8C00"
                    />
                  </View>
                  <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                    Selecciona tu moneda
                  </Text>
                  <Text className="text-gray-500 text-center px-4">
                    Elige la divisa con la que trabajarás en tu cuenta
                  </Text>
                </View>

                <CurrencySelector
                  currencies={CURRENCIES}
                  selectedCurrency={selectedCurrency}
                  onSelect={setSelectedCurrency}
                />
              </View>
            )}
          </ScrollView>

          {/* Botones de acción */}
          <View className="px-6 py-6 bg-white border-t border-gray-100">
            {step === 1 ? (
              <CustomButton title="Continuar" onPress={handleNext} />
            ) : (
              <View className="gap-3">
                <CustomButton
                  title="Finalizar Configuración"
                  onPress={handleFinish}
                  isLoading={isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  className="py-3 items-center"
                  disabled={isSubmitting}
                >
                  <Text className="text-gray-600 font-semibold">Atrás</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}