import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuickActionButtonProps {
  icon: 'plus' | 'minus' | 'info';
  label: string;
  onPress?: () => void;
}

export default function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  const getIcon = () => {
    switch (icon) {
      case 'plus':
        return <AntDesign name="plus" size={24} color="#4CAF50" />;
      case 'minus':
        return <MaterialCommunityIcons name="minus" size={24} color="#FF6B9D" />;
      case 'info':
        return <MaterialCommunityIcons name="information-outline" size={24} color="#FFD700" />;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} className="flex-1 items-center justify-center mx-2">
      <View
        className="bg-white rounded-2xl p-6 w-full items-center justify-center"
        style={{
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        {getIcon()}
        <Text className="text-gray-700 font-semibold text-sm mt-2">{label}</Text>
      </View>
    </TouchableOpacity>
  );
}