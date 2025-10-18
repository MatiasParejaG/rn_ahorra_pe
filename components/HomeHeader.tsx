import { images } from '@/constants/images';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface HomeHeaderProps {
  userName: string;
  userAvatar?: string;
  onLogout?: () => void;
}

export default function HomeHeader({ userName, userAvatar, onLogout }: HomeHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-6">
      <View className="w-14 h-14 rounded-full bg-yellow-100 items-center justify-center">
        <Image source={images.logo} className="size-3/4 ml-1"/>
      </View>

      <View className="flex-1 ml-4 justify-start">
        <Image source={images.ahorrape} className='ml-0 -mt-8 size-20' resizeMode='contain'/>
        <Text className="-mt-6 text-l font-normal text-gray-500">Bienvenido, {userName}</Text>
      </View>

      <View className="flex-row items-center gap-3">
        {/* Botón de Logout */}
        {onLogout && (
          <TouchableOpacity
            onPress={onLogout}
            className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Avatar */}
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} className="w-12 h-12 rounded-full" />
        ) : (
          <View className="w-12 h-12 rounded-full bg-blue-400 items-center justify-center">
            <Text className="text-white font-bold text-lg">
              {userName?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}