import { acceptInvitacion, rejectInvitacion } from '@/lib/appwrite/index';
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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InvitationsList() {
  const { userInvitaciones, fetchUserInvitaciones, fetchAuthenticatedUser, user } = useAuthBear();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserInvitaciones();
    setIsRefreshing(false);
  };

  const handleAccept = async (invitacionId: string, grupoNombre: string) => {
    Alert.alert(
      'Aceptar Invitación',
      `¿Deseas unirte al grupo "${grupoNombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            setProcessingInvitation(invitacionId);
            try {
              await acceptInvitacion(invitacionId, user!.$id);
              await fetchAuthenticatedUser();
              Alert.alert(
                '¡Te has unido!',
                `Ahora eres miembro del grupo "${grupoNombre}"`,
                [
                  {
                    text: 'OK',
                    onPress: () => fetchUserInvitaciones(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo aceptar la invitación');
            } finally {
              setProcessingInvitation(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (invitacionId: string, grupoNombre: string) => {
    Alert.alert(
      'Rechazar Invitación',
      `¿Estás seguro que deseas rechazar la invitación a "${grupoNombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setProcessingInvitation(invitacionId);
            try {
              await rejectInvitacion(invitacionId);
              await fetchUserInvitaciones();
              Alert.alert('Invitación rechazada', 'Has rechazado la invitación');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo rechazar la invitación');
            } finally {
              setProcessingInvitation(null);
            }
          },
        },
      ]
    );
  };

  const formatTimeRemaining = (fechaExpiracion: string) => {
    const now = new Date();
    const expDate = new Date(fechaExpiracion);
    const diffMs = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expirada';
    if (diffDays === 1) return 'Expira mañana';
    return `Expira en ${diffDays} días`;
  };

  const renderInvitationCard = (invitacion: any) => {
    const isProcessing = processingInvitation === invitacion.$id;
    const timeRemaining = formatTimeRemaining(invitacion.fecha_expiracion);
    const isExpiringSoon = timeRemaining.includes('1 días') || timeRemaining.includes('mañana');

    return (
      <View
        key={invitacion.$id}
        className="bg-white rounded-2xl p-5 mb-4"
        style={{
          elevation: 3,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {/* Header del grupo */}
        <View
          className={`${invitacion.grupo?.foto_grupo ? 'h-32' : 'h-24'} rounded-xl mb-4 overflow-hidden`}
          style={{
            backgroundColor: invitacion.grupo?.foto_grupo ? 'transparent' : '#4A90E2',
          }}
        >
          {invitacion.grupo?.foto_grupo ? (
            <Image
              source={{ uri: invitacion.grupo.foto_grupo }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <MaterialCommunityIcons name="account-group" size={32} color="white" />
            </View>
          )}
        </View>

        {/* Información */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-1">
            {invitacion.grupo?.nombre}
          </Text>
          {invitacion.grupo?.descripcion && (
            <Text className="text-sm text-gray-600 mb-2">
              {invitacion.grupo.descripcion}
            </Text>
          )}

          {/* Usuario que invitó */}
          <View className="flex-row items-center mt-2 mb-3">
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-2">
              {invitacion.invitedBy?.avatar ? (
                <Image
                  source={{ uri: invitacion.invitedBy.avatar }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Text className="text-white font-bold text-xs">
                  {invitacion.invitedBy?.name?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text className="text-sm text-gray-600">
              Invitado por{' '}
              <Text className="font-semibold">{invitacion.invitedBy?.name}</Text>
            </Text>
          </View>

          {/* Tiempo restante */}
          <View
            className={`px-3 py-1 rounded-full self-start ${
              isExpiringSoon ? 'bg-yellow-50' : 'bg-white-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isExpiringSoon ? 'text-yellow-700' : 'text-gray-600'
              }`}
            >
              ⏱ {timeRemaining}
            </Text>
          </View>
        </View>

        {/* Acciones */}
        {isProcessing ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#FE8C00" />
          </View>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleAccept(invitacion.$id, invitacion.grupo?.nombre)}
              className="flex-1 bg-green-500 rounded-xl py-3 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Aceptar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleReject(invitacion.$id, invitacion.grupo?.nombre)}
              className="flex-1 bg-red-500 rounded-xl py-3 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Invitaciones</Text>
          <View className="w-6" />
        </View>
      </View>

      {/* Lista de invitaciones */}
      {userInvitaciones.length > 0 ? (
        <ScrollView
          className="flex-1 px-5 py-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#FE8C00']}
            />
          }
        >
          <Text className="text-sm text-gray-500 mb-4">
            {userInvitaciones.length} invitación{userInvitaciones.length !== 1 ? 'es' : ''}{' '}
            pendiente{userInvitaciones.length !== 1 ? 's' : ''}
          </Text>
          {userInvitaciones.map(renderInvitationCard)}
          <View className="h-4" />
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-primary/10 rounded-full p-8 mb-6">
            <MaterialCommunityIcons
              name="email-open-outline"
              size={64}
              color="#FE8C00"
            />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            No tienes invitaciones
          </Text>
          <Text className="text-gray-500 text-center">
            Cuando alguien te invite a un grupo, las invitaciones aparecerán aquí
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}