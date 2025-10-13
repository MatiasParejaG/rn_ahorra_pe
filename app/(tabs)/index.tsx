import useAuthBear from '@/store/auth.store';
import React from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  const { user } = useAuthBear();

  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-2xl font-bold text-blue-500 mb-4">
        Bienvenido, {user?.name}
      </Text>
      <Text className="text-base text-gray-600 mb-8">
        {user?.email}
      </Text>
      
    </View>
  )
}
