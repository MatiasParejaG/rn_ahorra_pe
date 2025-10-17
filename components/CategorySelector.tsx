import { LocalCategory } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import cn from 'clsx';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CategorySelectorProps {
  categories: LocalCategory[];
  selectedCategory: string | undefined;
  onSelect: (categoryId: string) => void;
  transactionType: 'ingreso' | 'gasto';
}

export default function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
  transactionType,
}: CategorySelectorProps) {
  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  return (
    <View className="w-full">
      <Text className="text-sm font-semibold text-gray-600 mb-3">
        Categoría
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {filteredCategories.map((category) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelect(category.id)}
              activeOpacity={0.7}
              className={cn(
                'mr-3 px-4 py-3 rounded-xl border-2 flex-row items-center',
                isSelected
                  ? 'bg-primary/10 border-primary'
                  : 'bg-white border-gray-200'
              )}
              style={{
                shadowColor: isSelected ? '#FE8C00' : '#000',
                shadowOpacity: isSelected ? 0.1 : 0.05,
                shadowRadius: 3,
                elevation: isSelected ? 2 : 1,
              }}
            >
              <MaterialCommunityIcons
                name={category.icon as any || 'tag'}
                size={20}
                color={isSelected ? '#FE8C00' : '#6B7280'}
              />
              <Text
                className={cn(
                  'ml-2 font-semibold text-sm',
                  isSelected ? 'text-primary' : 'text-gray-700'
                )}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}