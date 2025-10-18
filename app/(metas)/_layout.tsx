import useAuthBear from '@/store/auth.store';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function MetasLayout() {
  const { isAuthenticated, user } = useAuthBear();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  // Si no completó el setup inicial, redirigir
  if (user && !user.initial_setup) {
    return <Redirect href="/initial-setup" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="metas-list" />
      <Stack.Screen name="create-meta" />
      <Stack.Screen name="add-funds" />
    </Stack>
  );
}