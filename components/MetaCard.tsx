import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

interface MetaCardProps {
  image?: string | undefined;
  title: string;
  progress: number;
  saved: number;
  total: number;
  progressColor: string;
  currencySymbol?: string;
}

export default function MetaCard({
  image,
  title,
  progress,
  saved,
  total,
  progressColor,
  currencySymbol = 'S/',
}: MetaCardProps) {
  const getPreview = () => {    
    if (image === null) {
      return (
        <View className="bg-blue-100 rounded-lg p-2">
          <MaterialCommunityIcons name="hand-coin" size={28} color="#2196F3" />
        </View>
      );
    }

    return (
      <View className="bg-pink-100 rounded-lg overflow-hidden" style={{ width: 44, height: 44 }}>
        <Image 
          source={{ uri: image }}
          style={{ width: 44, height: 44 }}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <View
      className="bg-white rounded-xl p-4 mb-4"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          {getPreview()}
          <View className="flex-1 ml-3">
            <Text className="text-gray-800 font-semibold text-base">{title}</Text>
            <Text className="text-gray-500 text-xs">Meta: {currencySymbol} {total.toFixed(2)}</Text>
          </View>
        </View>
        <Text className="text-gray-700 font-bold text-sm">{progress}%</Text>
      </View>

      <View className="mb-3">
        <View className="bg-green-100 rounded-full h-2 overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: progressColor }}
          />
        </View>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-gray-600 text-xs">{currencySymbol} {saved.toFixed(2)} ahorrados</Text>
        <Text className="text-gray-600 text-xs">Falta {currencySymbol} {(total - saved).toFixed(2)}</Text>
      </View>
    </View>
  );
}