import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Solicitando permisos de cámara...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 px-6 justify-center items-center">
          {/* Header */}
          <View className="absolute top-4 left-6 right-6 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Escanear QR</Text>
            <View className="w-6" />
          </View>

          {/* Content */}
          <View className="bg-primary/10 rounded-full p-8 mb-6">
            <MaterialCommunityIcons name="camera-off" size={64} color="#FE8C00" />
          </View>
          
          <Text className="text-xl font-bold text-gray-800 mb-3 text-center">
            Permiso de cámara necesario
          </Text>
          <Text className="text-gray-500 text-center px-8 mb-8">
            Para escanear el código QR de tu alcancía, necesitamos acceso a tu cámara
          </Text>

          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={requestPermission}
              className="bg-primary rounded-xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Permitir acceso a la cámara
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openSettings()}
              className="bg-gray-200 rounded-xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold text-base">
                Abrir configuración
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);

    try {
      // Verificar si es un deep link válido
      // Formato esperado: ahorrape://alcancia/{alcanciaId}
      if (data.startsWith('ahorrape://alcancia/')) {
        const alcanciaId = data.replace('ahorrape://alcancia/', '');
        
        if (alcanciaId && alcanciaId.length > 0) {
          // Navegar a la pantalla de reclamar alcancía
          router.push({
            pathname: '/(alcancia)/claim-alcancia',
            params: { alcanciaId },
          });
        } else {
          Alert.alert('Error', 'Código QR inválido', [
            {
              text: 'Reintentar',
              onPress: () => setScanned(false),
            },
          ]);
        }
      } else {
        Alert.alert(
          'Código QR no válido',
          'Este no es un código QR de alcancía válido. Asegúrate de escanear el código correcto.',
          [
            {
              text: 'Reintentar',
              onPress: () => setScanned(false),
            },
          ]
        );
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo procesar el código QR', [
        {
          text: 'Reintentar',
          onPress: () => setScanned(false),
        },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="absolute top-12 left-6 right-6 z-10 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-black/50 rounded-full p-2"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <View className="bg-black/50 rounded-full px-4 py-2">
          <Text className="text-white font-semibold">Escanear QR</Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay con marco */}
        <View className="flex-1 justify-center items-center">
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50" />
          
          {/* Marco de escaneo */}
          <View
            className="w-72 h-72 border-4 border-white rounded-3xl"
            style={{
              shadowColor: '#FFF',
              shadowOpacity: 0.5,
              shadowRadius: 20,
            }}
          >
            {/* Esquinas decorativas */}
            <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
            <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
            <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
            <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
          </View>

          {/* Instrucciones */}
          <View className="absolute bottom-32 px-8">
            <View className="bg-black/70 rounded-2xl p-6">
              <Text className="text-white text-center font-semibold text-base mb-2">
                Coloca el código QR dentro del marco
              </Text>
              <Text className="text-white/70 text-center text-sm">
                El escaneo se realizará automáticamente
              </Text>
            </View>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}