import { icons } from '@/constants/icons';
import useAuthBear from '@/store/auth.store';
import { TabBarIconProps } from "@/types/type";
import { BlurView } from 'expo-blur';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform, StatusBar, Text, View } from 'react-native';

const TabBarIcon = ({ focused, icon, title }: TabBarIconProps) => {
  if (focused) {
    return (
      <View className="flex items-center justify-center w-[80px]">
        <View
          className="flex items-center justify-center mt-8"
          style={{
            backgroundColor: 'rgba(255, 229, 174, 0.6)',
            paddingVertical: 20,
            paddingHorizontal: 12,
            borderRadius: 20,
            // shadowColor: '#FE8C00',
            // shadowOffset: { width: 0, height: 0 },
            // shadowOpacity: 0.4,
            // shadowRadius: 10,
            elevation: 8,
          }}
        >
          <Image 
            source={icon} 
            className="size-7 mb-1" 
            resizeMode="contain" 
            tintColor="#FE8C00"
          />
          <Text 
            className="text-sm text-center font-bold text-primary" 
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex items-center justify-center w-[80px]">
      <View className='items-center justify-center mt-10'>
        <Image 
          source={icon} 
          className="size-7 mb-1" 
          resizeMode="contain" 
          tintColor='#5D5F6D'
        />
        <Text 
          className="text-sm text-center font-bold text-gray-200" 
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

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
            height: 65,
            position: 'absolute',
            bottom: 40,
            backgroundColor: 'transparent',
            shadowColor: '#1a1a1a',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 55,
            elevation: 5,
            borderWidth: 0, 
          },
          tabBarBackground: () => (
            <BlurView
              intensity={70}
              tint="light"
              style={{
                borderRadius: 50,
                overflow: 'hidden',
                flex: 1,
                backgroundColor: Platform.OS === 'ios' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.7)',
              }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: 'Inicio',
            tabBarIcon: ({ focused }) => <TabBarIcon title="Inicio" icon={icons.home} focused={focused}/>
          }}
        />

        <Tabs.Screen
          name='alcancia'
          options={{
            title: 'Alcancía',
            tabBarIcon: ({ focused }) => <TabBarIcon title="Alcancía" icon={icons.llama} focused={focused}/>
          }}
        />

        <Tabs.Screen
          name='grupos'
          options={{
            title: 'Grupos',
            tabBarIcon: ({ focused }) => <TabBarIcon title="Grupos" icon={icons.grupos} focused={focused}/>
          }}
        />

        <Tabs.Screen
          name='perfil'
          options={{
            title: 'Perfil',
            tabBarIcon: ({ focused }) => <TabBarIcon title="Perfil" icon={icons.perfil} focused={focused}/>
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