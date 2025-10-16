import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface BalanceCardProps {
  balance: string;
  percentageChange: string;
}

export default function BalanceCard({ balance, percentageChange }: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <View className="bg-gradient-to-r rounded-3xl p-5 overflow-hidden"
          style={{
            backgroundColor: '#4A90E2',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white text-sm font-semibold">Saldo Total</Text>
        <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
          <MaterialCommunityIcons
            name={isVisible ? 'eye' : 'eye-off'}
            size={18}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <Text className="text-white text-3xl font-bold mb-1">
        {isVisible ? balance : '••••••'}
      </Text>
      <Text className="text-blue-100 text-xs">↑ {percentageChange}</Text>
    </View>
  );
}