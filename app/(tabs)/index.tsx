import BalanceCard from '@/components/BalanceCard';
import CustomButton from '@/components/CustomButton';
import HomeHeader from '@/components/HomeHeader';
import MetaCard from '@/components/MetaCard';
import QuickActionButton from '@/components/QuickActionButton';
import { logOut } from '@/lib/appwrite';
import useAuthBear from '@/store/auth.store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { user, userAccount, userMetas, setIsAuthenticated, setUser, setUserAccount, setUserMetas } = useAuthBear();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logOut();

      // Clear auth state
      setIsAuthenticated(false);
      setUser(null);
      setUserAccount(null);
      setUserMetas([]);

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

  const getCurrencySymbol = () => {
    if (!userAccount) return 'S/';
    
    const symbol = userAccount.divisa === 'PEN' ? 'S/' :
                   userAccount.divisa === 'USD' ? '$' :
                   userAccount.divisa === 'EUR' ? '€' :
                   userAccount.divisa === 'ARS' ? '$' : 'S/';
    
    return symbol;
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

  const handleNavigateToMetas = () => {
    router.push('/(metas)/metas-list');
  };

  // Mostrar solo las primeras 2 metas activas
  const displayedMetas = userMetas.filter(m => !m.estado).slice(0, 2);

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
            <QuickActionButton 
              icon="info" 
              label="Meta" 
              onPress={handleNavigateToMetas}
            />
          </View>
        </View>

        {/* Mis Metas Section */}
        <View className="px-5 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-800">Mis Metas</Text>
            <TouchableOpacity onPress={handleNavigateToMetas}>
              <Text className="text-blue-500 font-semibold text-sm">
                {userMetas.length > 0 ? 'Ver todas' : 'Crear Meta'}
              </Text>
            </TouchableOpacity>
          </View>

          {displayedMetas.length > 0 ? (
            displayedMetas.map((meta) => {
              const progress = (meta.monto_actual / meta.monto_objetivo) * 100;
              const remaining = meta.monto_objetivo - meta.monto_actual;
              
              return (
                <MetaCard
                  key={meta.$id}
                  icon="gamepad"
                  title={meta.nombre}
                  progress={Math.round(progress)}
                  saved={meta.monto_actual}
                  total={meta.monto_objetivo}
                  progressColor="#4A90E2"
                  currencySymbol={getCurrencySymbol()}
                />
              );
            })
          ) : (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-gray-500 text-center mb-4">
                Aún no tienes metas de ahorro
              </Text>
              <TouchableOpacity 
                onPress={handleNavigateToMetas}
                className="bg-primary/10 px-6 py-3 rounded-xl"
              >
                <Text className="text-primary font-semibold">
                  Crear mi primera meta
                </Text>
              </TouchableOpacity>
            </View>
          )}
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