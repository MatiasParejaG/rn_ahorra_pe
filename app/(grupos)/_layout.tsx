import useAuthBear from '@/store/auth.store';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function GruposLayout() {
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
      <Stack.Screen name="create-grupo" />
      <Stack.Screen name="join-grupo" />
      <Stack.Screen name="grupo-detail" />
      <Stack.Screen name="manage-grupo" />
      <Stack.Screen name="invitations-list" />
      <Stack.Screen name="create-meta-grupal" />
      <Stack.Screen name="meta-grupal-detail" />
      <Stack.Screen name="metas-grupales-list" />
    </Stack>
  );
}