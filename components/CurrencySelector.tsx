import { Currency } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import cn from 'clsx';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrency: string;
  onSelect: (currencyCode: string) => void;
}

export default function CurrencySelector({
  currencies,
  selectedCurrency,
  onSelect,
}: CurrencySelectorProps) {
  return (
    <View className="w-full gap-3">
      {currencies.map((currency) => {
        const isSelected = selectedCurrency === currency.code;
        
        return (
          <TouchableOpacity
            key={currency.code}
            onPress={() => onSelect(currency.code)}
            activeOpacity={0.7}
            className={cn(
              'w-full rounded-xl p-4 border-2 flex-row items-center justify-between',
              isSelected
                ? 'bg-primary/10 border-primary'
                : 'bg-white border-gray-200'
            )}
            style={{
              shadowColor: isSelected ? '#FE8C00' : '#000',
              shadowOpacity: isSelected ? 0.1 : 0.05,
              shadowRadius: 4,
              elevation: isSelected ? 3 : 1,
            }}
          >
            <View className="flex-row items-center flex-1">
              <View
                className={cn(
                  'w-12 h-12 rounded-full items-center justify-center',
                  isSelected ? 'bg-primary' : 'bg-gray-100'
                )}
              >
                <Text
                  className={cn(
                    'text-xl font-bold',
                    isSelected ? 'text-white' : 'text-gray-600'
                  )}
                >
                  {currency.symbol}
                </Text>
              </View>

              <View className="ml-4 flex-1">
                <Text
                  className={cn(
                    'text-base font-bold',
                    isSelected ? 'text-primary' : 'text-gray-800'
                  )}
                >
                  {currency.name}
                </Text>
                <Text className="text-sm text-gray-500">{currency.code}</Text>
              </View>
            </View>

            {isSelected && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#FE8C00"
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}