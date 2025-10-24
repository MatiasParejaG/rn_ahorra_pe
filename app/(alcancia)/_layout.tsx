import useAuthBear from '@/store/auth.store';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AlcanciaLayout() {
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
      <Stack.Screen name="scan-qr" />
      <Stack.Screen name="claim-alcancia" />
    </Stack>
  );
}