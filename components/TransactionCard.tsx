import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { Transaction } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface TransactionCardProps {
  transaction: Transaction;
  currencySymbol: string;
}

export default function TransactionCard({ transaction, currencySymbol }: TransactionCardProps) {
  const isIngreso = transaction.tipo === 'ingreso';
  
  // Encontrar la categoría para obtener el ícono
  const category = DEFAULT_CATEGORIES.find(cat => cat.name === transaction.categoria);
  const categoryIcon = category?.icon || (isIngreso ? 'plus-circle' : 'minus-circle');
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View
      className="bg-white rounded-xl p-4 mb-3 flex-row items-center"
      style={{
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
      }}
    >
      {/* Ícono de categoría */}
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${
          isIngreso ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        <MaterialCommunityIcons
          name={categoryIcon as any}
          size={24}
          color={isIngreso ? '#10B981' : '#EF4444'}
        />
      </View>

      {/* Información de la transacción */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-gray-800 font-semibold text-base">
            {transaction.categoria || (isIngreso ? 'Ingreso' : 'Gasto')}
          </Text>
          <Text
            className={`font-bold text-base ${
              isIngreso ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIngreso ? '+' : '-'} {currencySymbol} {transaction.monto.toFixed(2)}
          </Text>
        </View>
        
        <View className="flex-row items-center justify-between">
          {transaction.descripcion ? (
            <Text className="text-gray-500 text-xs flex-1" numberOfLines={1}>
              {transaction.descripcion}
            </Text>
          ) : (
            <View className="flex-1" />
          )}
          <Text className="text-gray-400 text-xs ml-2">
            {formatDate(transaction.fecha)}
          </Text>
        </View>
      </View>
    </View>
  );
}