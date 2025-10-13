import useAuthBear from '@/store/auth.store';
import { Redirect, Slot } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const { isAuthenticated } = useAuthBear();

  if(!isAuthenticated) return <Redirect href={"/sign-in"} />
    return (
    <Slot></Slot>
  )
}
