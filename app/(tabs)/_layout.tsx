import { icons } from '@/constants/icons';
import useAuthBear from '@/store/auth.store';
import { TabBarIconProps } from "@/types/type";
import cn from "clsx";
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Image, StatusBar, Text, View } from 'react-native';

const TabBarIcon = ({ focused, icon , title }: TabBarIconProps) => (
  <View className="flex items-center justify-center w-[60px]">
    <Image source={icon} className="size-7 mb-1 mt-12" resizeMode="contain" tintColor={ focused ? '#FE8C00' : '#5D5F6D'}/>
    <Text className={cn('text-sm text-center font-bold', focused ? 'text-primary' : 'text-gray-200')} numberOfLines={1}>
      {title}
    </Text>
  </View>
)

export default function TabLayout() {
  const { isAuthenticated, user } = useAuthBear();

  if(!isAuthenticated) return <Redirect href={"/sign-in"} />
  
  // Si no ha completado el setup inicial, redirigir
  if(user && !user.initial_setup) {
    return <Redirect href="/initial-setup" />
  }
  
    return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          marginHorizontal: 20,
          height: 80,
          position: 'absolute',
          bottom: 40,
          backgroundColor: '#rgba(255, 255, 255, 0.70)',
          shadowColor: '#1a1a1a',
          shadowOffset: { width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 55,
          elevation: 5,
        }
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Inicio" icon={icons.home} focused = {focused}/>
        }}
      />

      <Tabs.Screen
        name='aprender'
        options={{
          title: 'Aprender',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Aprender" icon={icons.aprender} focused = {focused}/>
        }}
      />

      <Tabs.Screen
        name='grupos'
        options={{
          title: 'Grupos',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Grupos" icon={icons.grupos} focused = {focused}/>
        }}
      />

      <Tabs.Screen
        name='perfil'
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabBarIcon title="Perfil" icon={icons.perfil} focused = {focused}/>
        }}
      />

      <Tabs.Screen
        name='add-transaction'
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name='transaction-list'
        options={{
          href: null,
        }}
      />
    </Tabs>
    <StatusBar barStyle="dark-content"/>
    </>
  )
}