import TransactionCard from '@/components/TransactionCard';
import { getAccountTransactions } from '@/lib/appwrite/index';
import useAuthBear from '@/store/auth.store';
import { Transaction } from '@/types/type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionsList() {
  const { userAccount } = useAuthBear();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'ingreso' | 'gasto'>('todos');

  const getCurrencySymbol = () => {
    if (!userAccount) return 'S/';
    
    const symbol = userAccount.divisa === 'PEN' ? 'S/' :
                   userAccount.divisa === 'USD' ? '$' :
                   userAccount.divisa === 'EUR' ? '€' :
                   userAccount.divisa === 'ARS' ? '$' : 'S/';
    
    return symbol;
  };

  const loadTransactions = async () => {
    if (!userAccount?.$id) return;
    
    try {
      // Cargar hasta 100 transacciones
      const fetchedTransactions = await getAccountTransactions(userAccount.$id, 100);
      setTransactions(fetchedTransactions as Transaction[]);
    } catch (error) {
      console.log('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [userAccount]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions();
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'todos') return true;
    return t.tipo === filter;
  });

  // Calcular estadísticas
  const totalIngresos = transactions
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);
  
  const totalGastos = transactions
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.monto, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Mis Transacciones</Text>
          <View className="w-6" />
        </View>

        {/* Resumen de transacciones */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-green-50 rounded-xl p-3">
            <Text className="text-green-700 text-xs font-semibold mb-1">Ingresos</Text>
            <Text className="text-green-800 font-bold text-base">
              {getCurrencySymbol()} {totalIngresos.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-xl p-3">
            <Text className="text-red-700 text-xs font-semibold mb-1">Gastos</Text>
            <Text className="text-red-800 font-bold text-base">
              {getCurrencySymbol()} {totalGastos.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <View className="bg-white px-6 py-3 border-b border-gray-100">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setFilter('todos')}
            className={`flex-1 py-2 rounded-lg ${
              filter === 'todos' ? 'bg-primary' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                filter === 'todos' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('ingreso')}
            className={`flex-1 py-2 rounded-lg ${
              filter === 'ingreso' ? 'bg-green-500' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                filter === 'ingreso' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Ingresos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('gasto')}
            className={`flex-1 py-2 rounded-lg ${
              filter === 'gasto' ? 'bg-red-500' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                filter === 'gasto' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Gastos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de transacciones */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FE8C00" />
          <Text className="text-gray-500 mt-4">Cargando transacciones...</Text>
        </View>
      ) : filteredTransactions.length > 0 ? (
        <ScrollView
          className="flex-1 px-5 py-4"
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
            {filteredTransactions.length} transacción{filteredTransactions.length !== 1 ? 'es' : ''}
          </Text>
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.$id}
              transaction={transaction}
              currencySymbol={getCurrencySymbol()}
            />
          ))}
          <View className="h-4" />
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-primary/10 rounded-full p-8 mb-6">
            <MaterialCommunityIcons
              name="cash-multiple"
              size={64}
              color="#FE8C00"
            />
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            {filter === 'todos' ? 'No hay transacciones' : `No hay ${filter}s`}
          </Text>
          <Text className="text-gray-500 text-center">
            {filter === 'todos'
              ? 'Comienza registrando tus ingresos y gastos'
              : `No tienes ${filter}s registrados aún`}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}