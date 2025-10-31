import CustomButton from '@/components/CustomButton';
import { createInvitacion, findUserByTag } from '@/lib/appwrite/index';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface InviteUserModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  currentUserId: string;
}

export default function InviteUserModal({
  visible,
  onClose,
  groupId,
  groupName,
  currentUserId,
}: InviteUserModalProps) {
  const [userTag, setUserTag] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [foundUser, setFoundUser] = useState<any | null>(null);

  const handleSearch = async () => {
    if (!userTag.trim()) {
      Alert.alert('Error', 'Por favor ingresa un tag de usuario');
      return;
    }

    setIsSearching(true);
    setFoundUser(null);

    try {
      // Asegurar que el tag comience con @
      const searchTag = userTag.startsWith('@') ? userTag : `@${userTag}`;
      const user = await findUserByTag(searchTag);

      if (!user) {
        Alert.alert('Usuario no encontrado', 'No existe ningún usuario con ese tag');
        return;
      }

      // Verificar que no sea el mismo usuario
      if (user.$id === currentUserId) {
        Alert.alert('Error', 'No puedes invitarte a ti mismo');
        return;
      }

      setFoundUser(user);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo buscar el usuario');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!foundUser) return;

    setIsSending(true);

    try {
      await createInvitacion({
        groupId,
        invitedByUserId: currentUserId,
        invitedUserId: foundUser.$id,
      });

      Alert.alert(
        '¡Invitación Enviada!',
        `Se ha enviado una invitación a ${foundUser.name} para unirse a "${groupName}"`,
        [
          {
            text: 'OK',
            onPress: () => {
              setUserTag('');
              setFoundUser(null);
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la invitación');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setUserTag('');
    setFoundUser(null);
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
                Invitar Usuario
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View className="p-6">
              {/* Info del grupo */}
              <View className="bg-blue-50 rounded-xl p-4 mb-6 flex-row items-center">
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color="#3B82F6"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-sm text-gray-600">Grupo:</Text>
                  <Text className="text-base font-bold text-gray-800">
                    {groupName}
                  </Text>
                </View>
              </View>

              {/* Input de tag */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-600 mb-3">
                  Tag del Usuario
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200">
                    <Text className="text-lg font-bold text-gray-400 mr-2">@</Text>
                    <TextInput
                      placeholder="juanp1234"
                      placeholderTextColor="#999"
                      value={userTag}
                      onChangeText={(text) => setUserTag(text.toLowerCase())}
                      className="flex-1 text-lg font-semibold text-gray-800"
                      autoCapitalize="none"
                      maxLength={20}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleSearch}
                    className="bg-blue-500 rounded-xl p-3"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <MaterialCommunityIcons name="magnify" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-400 mt-2 ml-1">
                  Ej: @juanp1234
                </Text>
              </View>

              {/* Usuario encontrado */}
              {foundUser && (
                <View className="bg-green-50 rounded-xl p-5 mb-6">
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color="#10B981"
                    />
                    <Text className="text-green-700 font-semibold ml-2">
                      Usuario encontrado
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
                      {foundUser.avatar ? (
                        <Image
                          source={{ uri: foundUser.avatar }}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <Text className="text-white font-bold text-lg">
                          {foundUser.name?.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="text-base font-bold text-gray-800">
                        {foundUser.name}
                      </Text>
                      <Text className="text-sm text-gray-600">{foundUser.tag}</Text>
                      <Text className="text-xs text-gray-500">{foundUser.email}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Info */}
              <View className="bg-yellow-50 rounded-xl p-4 flex-row">
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color="#F59E0B"
                  style={{ marginRight: 12 }}
                />
                <Text className="flex-1 text-xs text-yellow-700">
                  La invitación expirará en 7 días si no es aceptada
                </Text>
              </View>
            </View>

            {/* Footer */}
            {foundUser && (
              <View className="p-6 border-t border-gray-100">
                <CustomButton
                  title="Enviar Invitación"
                  onPress={handleSendInvitation}
                  isLoading={isSending}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}