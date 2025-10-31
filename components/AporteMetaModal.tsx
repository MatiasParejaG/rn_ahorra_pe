import CustomButton from '@/components/CustomButton';
import { registrarAporteMetaGrupal } from '@/lib/appwrite/index';
import { MetaGrupal } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface AporteMetaModalProps {
  visible: boolean;
  onClose: () => void;
  meta: MetaGrupal;
  userId: string;
  cuentaId: string;
  saldoDisponible: number;
  currencySymbol: string;
  onSuccess: () => void;
}

export default function AporteMetaModal({
  visible,
  onClose,
  meta,
  userId,
  cuentaId,
  saldoDisponible,
  currencySymbol,
  onSuccess,
}: AporteMetaModalProps) {
  const [monto, setMonto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const montoRestante = meta.monto_objetivo - meta.monto_actual;
  const progress = (meta.monto_actual / meta.monto_objetivo) * 100;

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.min(
      montoRestante * (percentage / 100),
      saldoDisponible
    );
    setMonto(amount.toFixed(2));
  };

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

    if (montoNumerico > saldoDisponible) {
      Alert.alert(
        'Saldo Insuficiente',
        `No tienes suficiente saldo. Tu saldo actual es ${currencySymbol} ${saldoDisponible.toFixed(2)}`
      );
      return;
    }

    if (montoNumerico > montoRestante) {
      Alert.alert(
        'Monto Excedido',
        `Solo puedes aportar máximo ${currencySymbol} ${montoRestante.toFixed(2)} para completar esta meta`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registrarAporteMetaGrupal({
        metaId: meta.$id,
        userId,
        monto: montoNumerico,
        cuentaId,
      });

      if (result.metaCompletada) {
        Alert.alert(
          '🎉 ¡Meta Completada!',
          `¡Felicidades! El grupo ha alcanzado la meta "${meta.nombre}"`,
          [
            {
              text: 'OK',
              onPress: () => {
                setMonto('');
                onSuccess();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Aporte Exitoso',
          `Has aportado ${currencySymbol} ${montoNumerico.toFixed(2)} a la meta`,
          [
            {
              text: 'OK',
              onPress: () => {
                setMonto('');
                onSuccess();
                onClose();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo registrar el aporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMonto('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full max-w-md">
            {/* Header */}
            <View className="border-b border-gray-100 p-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800">
                Aportar a Meta
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View className="p-6">
              {/* Info de la meta */}
              <View className="bg-gray-50 rounded-xl p-4 mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                  {meta.nombre}
                </Text>

                {/* Progress Bar */}
                <View className="mb-3">
                  <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <View
                      className="h-full rounded-full bg-green-400"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </View>
                </View>

                {/* Amounts */}
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-xs text-gray-500 mb-1">Ahorrado</Text>
                    <Text className="text-sm font-bold text-gray-800">
                      {currencySymbol} {meta.monto_actual.toFixed(2)}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xs text-gray-500 mb-1">Progreso</Text>
                    <Text className="text-sm font-bold text-blue-600">
                      {Math.round(progress)}%
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-gray-500 mb-1">Falta</Text>
                    <Text className="text-sm font-bold text-gray-800">
                      {currencySymbol} {montoRestante.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Saldo disponible */}
              <View className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between mb-4">
                <Text className="text-sm text-gray-600">Tu saldo disponible:</Text>
                <Text className="text-base font-bold text-gray-800">
                  {currencySymbol} {saldoDisponible.toFixed(2)}
                </Text>
              </View>

              {/* Input de monto */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  ¿Cuánto deseas aportar?
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200">
                  <Text className="text-2xl font-bold text-gray-400 mr-2">
                    {currencySymbol}
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    value={monto}
                    onChangeText={setMonto}
                    keyboardType="decimal-pad"
                    className="flex-1 text-2xl font-bold text-gray-800"
                    autoFocus
                  />
                </View>
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  Máximo: {currencySymbol} {Math.min(montoRestante, saldoDisponible).toFixed(2)}
                </Text>
              </View>

              {/* Botones de monto rápido */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Montos Rápidos
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(25)}
                    className="flex-1 bg-blue-50 rounded-xl py-2 items-center"
                  >
                    <Text className="text-blue-700 font-semibold text-sm">25%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(50)}
                    className="flex-1 bg-blue-50 rounded-xl py-2 items-center"
                  >
                    <Text className="text-blue-700 font-semibold text-sm">50%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(75)}
                    className="flex-1 bg-blue-50 rounded-xl py-2 items-center"
                  >
                    <Text className="text-blue-700 font-semibold text-sm">75%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(100)}
                    className="flex-1 bg-blue-50 rounded-xl py-2 items-center"
                  >
                    <Text className="text-blue-700 font-semibold text-sm">100%</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Info */}
              <View className="bg-green-50 rounded-xl p-3 flex-row">
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color="#10B981"
                  style={{ marginRight: 8 }}
                />
                <Text className="flex-1 text-xs text-green-700">
                  Tu aporte se restará de tu saldo y se sumará al progreso de la meta grupal
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View className="p-6 border-t border-gray-100">
              <CustomButton
                title="Registrar Aporte"
                onPress={handleSubmit}
                isLoading={isSubmitting}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}