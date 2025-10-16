import useAuthBear from '@/store/auth.store';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function SetupLayout() {
  const { isAuthenticated, user } = useAuthBear();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  // Si ya completó el setup, redirigir al inicio
  if (user?.initial_setup) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="initial-setup" />
    </Stack>
  );
}