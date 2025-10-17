import BalanceCard from '@/components/BalanceCard';
import CustomButton from '@/components/CustomButton';
import HomeHeader from '@/components/HomeHeader';
import MetaCard from '@/components/MetaCard';
import QuickActionButton from '@/components/QuickActionButton';
import { logOut } from '@/lib/appwrite';
import useAuthBear from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { user, userAccount, setIsAuthenticated, setUser, setUserAccount } = useAuthBear();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logOut();

      // Clear auth state
      setIsAuthenticated(false);
      setUser(null);
      setUserAccount(null);

      // Redirect to sign-in
      router.replace('/sign-in');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to log out');
      setIsLoggingOut(false);
    }
  };

  const formatBalance = () => {
    if (!userAccount) return 'S/ 0.00';
    
    const symbol = userAccount.divisa === 'PEN' ? 'S/' :
                   userAccount.divisa === 'USD' ? '$' :
                   userAccount.divisa === 'EUR' ? '€' :
                   userAccount.divisa === 'ARS' ? '$' : 'S/';
    
    return `${symbol} ${userAccount.saldo_actual.toFixed(2)}`;
  };

  const handleAddIngreso = () => {
    router.push({
      pathname: '/(tabs)/add-transaction',
      params: { type: 'ingreso' }
    });
  };

  const handleAddGasto = () => {
    router.push({
      pathname: '/(tabs)/add-transaction',
      params: { type: 'gasto' }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-5 pt-4 pb-4">
          <HomeHeader userName={user?.name || 'Usuario'} userAvatar={user?.avatar} />

          {/* Saldo Total Card with Gradient */}
          <BalanceCard balance={formatBalance()} percentageChange="+15% este mes" />
        </View>

        {/* Quick Actions */}
        <View className="px-4 py-6">
          <View className="flex-row">
            <QuickActionButton 
              icon="plus" 
              label="Ahorrar" 
              onPress={handleAddIngreso}
            />
            <QuickActionButton 
              icon="minus" 
              label="Gasto" 
              onPress={handleAddGasto}
            />
            <QuickActionButton icon="info" label="Meta" />
          </View>
        </View>

        {/* Mis Metas Section */}
        <View className="px-5 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-800">Mis Metas</Text>
            <Text className="text-blue-500 font-semibold text-sm">Ver todas</Text>
          </View>

          {/* Meta 1: Bicicleta */}
          <MetaCard
            icon="bike"
            title="Bicicleta nueva"
            progress={75}
            saved={600}
            total={800}
            progressColor="#2196F3"
          />

          {/* Meta 2: Nintendo Switch */}
          <MetaCard
            icon="gamepad"
            title="Nintendo Switch"
            progress={25}
            saved={300}
            total={1200}
            progressColor="#E91E63"
          />
        </View>

        {/* Logout Button */}
        <View className="px-5 pb-10">
          <CustomButton
            title="Cerrar Sesión"
            onPress={handleLogout}
            isLoading={isLoggingOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}