import useAuthBear from "@/store/auth.store";
import { Stack } from "expo-router";
import { useEffect } from "react";
import './globals.css';


export default function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthBear();
  
  useEffect(()=> {
    fetchAuthenticatedUser()
  }, []);

  if(isLoading) return null;
  
  return <Stack>
  
  <Stack.Screen
    name="(auth)"
    options={{ headerShown: false }}
  />

  <Stack.Screen
    name="(tabs)"
    options={{ headerShown: false }}
  />;

  <Stack.Screen
    name="(setup)"
    options={{ headerShown: false }}
  />;
  
  </Stack>
}
