import CategorySelector from '@/components/CategorySelector';
import CustomButton from '@/components/CustomButton';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { createTransaction } from '@/lib/appwrite/index';
import useAuthBear from '@/store/auth.store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
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

export default function AddTransaction() {
  const { type } = useLocalSearchParams<{ type: 'ingreso' | 'gasto' }>();
  const { userAccount, fetchAuthenticatedUser } = useAuthBear();
  const navigation = useNavigation();
  
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Ocultar el tab bar cuando se monta el componente
  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: 'none' }
    });
    
    // Restaurar el tab bar cuando se desmonta
    return () => {
      navigation.setOptions({
        tabBarStyle: {
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          marginHorizontal: 20,
          height: 80,
          position: 'absolute',
          bottom: 40,
          backgroundColor: '#rgba(255, 255, 255, 0.70)',
          shadowColor: '#1a1a1a',
          shadowOffset: { width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 55,
          elevation: 5,
        }
      });
    };
  }, [navigation]);

  useEffect(() => {
    if (!type || (type !== 'ingreso' && type !== 'gasto')) {
      Alert.alert('Error', 'Tipo de transacción inválido');
      router.back();
    }
  }, [type]);

  const getCurrencySymbol = () => {
    if (!userAccount) return 'S/';
    
    const symbol = userAccount.divisa === 'PEN' ? 'S/' :
                   userAccount.divisa === 'USD' ? '$' :
                   userAccount.divisa === 'EUR' ? '€' :
                   userAccount.divisa === 'ARS' ? '$' : 'S/';
    
    return symbol;
  };

  const handleSubmit = async () => {
    if (!userAccount) {
      Alert.alert('Error', 'No se encontró la cuenta del usuario');
      return;
    }

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

    if (montoNumerico > 4000) {
      Alert.alert('Error', 'El monto no puede ser mayor a 4000');
      return;
    }

    // Validación específica para gastos
    if (type === 'gasto') {
      if (montoNumerico > userAccount.saldo_actual) {
        Alert.alert(
          'Saldo Insuficiente',
          `No puedes registrar un gasto mayor a tu saldo actual (${getCurrencySymbol()} ${userAccount.saldo_actual.toFixed(2)})`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const categoryName = selectedCategory 
        ? DEFAULT_CATEGORIES.find(c => c.id === selectedCategory)?.name 
        : undefined;

      await createTransaction({
        tipo: type!,
        monto: montoNumerico,
        descripcion: descripcion.trim() || undefined,
        categoria: categoryName,
        cuentaId: userAccount.$id,
      });

      // Refrescar los datos del usuario
      await fetchAuthenticatedUser();

      Alert.alert(
        'Éxito',
        `${type === 'ingreso' ? 'Ingreso' : 'Gasto'} registrado correctamente`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo registrar la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIngreso = type === 'ingreso';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
              {isSubmitting ? 'Registrando...' : 'Actualizando...'}
            </Text>
          </View>
        </View>
      )}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header */}
          <View className="bg-white px-6 pt-4 pb-6 border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">
                {isIngreso ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
              </Text>
              <View className="w-6" />
            </View>

            {/* Saldo disponible */}
            {!isIngreso && userAccount && (
              <View className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">Saldo disponible:</Text>
                <Text className="text-base font-bold text-gray-800">
                  {getCurrencySymbol()} {userAccount.saldo_actual.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-6">
              {/* Icono y título */}
              <View className="items-center mb-6">
                <View
                  className={`rounded-full p-6 mb-4 ${
                    isIngreso ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <MaterialCommunityIcons
                    name={isIngreso ? 'plus-circle' : 'minus-circle'}
                    size={64}
                    color={isIngreso ? '#10B981' : '#EF4444'}
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-700">
                  ¿Cuánto {isIngreso ? 'ingresaste' : 'gastaste'}?
                </Text>
              </View>

              {/* Input de monto */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Monto
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
                  Monto entre 0.10 y 4,000
                </Text>
              </View>

              {/* Selector de categoría */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <CategorySelector
                  categories={DEFAULT_CATEGORIES}
                  selectedCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                  transactionType={type!}
                />
              </View>

              {/* Input de descripción */}
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Descripción (Opcional)
                </Text>
                <TextInput
                  placeholder="Ej: Almuerzo con amigos"
                  placeholderTextColor="#999"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 text-base text-gray-800"
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                  textAlignVertical="top"
                />
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  {descripcion.length}/100 caracteres
                </Text>
              </View>

              {/* Info */}
              <View
                className={`rounded-xl p-4 flex-row ${
                  isIngreso ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color={isIngreso ? '#10B981' : '#EF4444'}
                  style={{ marginRight: 12 }}
                />
                <Text
                  className={`flex-1 text-sm ${
                    isIngreso ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {isIngreso
                    ? 'Este monto se sumará a tu saldo actual'
                    : 'Este monto se restará de tu saldo actual'}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botón de acción */}
          <View className="px-6 py-6 bg-white border-t border-gray-100">
            <CustomButton
              title={`Registrar ${isIngreso ? 'Ingreso' : 'Gasto'}`}
              onPress={handleSubmit}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}