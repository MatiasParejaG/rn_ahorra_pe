import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { signIn } from "@/lib/appwrite";
import useAuthBear from "@/store/auth.store";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: ''});
  const [isNavigating, setIsNavigating] = useState(false);
  
  const { setIsAuthenticated, setUser, fetchAuthenticatedUser } = useAuthBear();

  const submit = async() => {
    const { email, password } = form;

    if(!email || !password) return Alert.alert('Error', 'Ingresa un correo y contraseña válido');

    setIsSubmitting(true)

    try {
      await signIn({ email, password });
      
      // Fetch the authenticated user after successful sign in
      await fetchAuthenticatedUser();
      
      // Navigate to home
      router.replace('/');
    } catch(error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <View className="gap-6 bg-white rounded-3xl p-8 m-5 mb-10" style={{backgroundColor: 'rgba(255, 255, 255, 0.08)'}}>
      {/* Loading Overlay */}
      {(isSubmitting || isNavigating) && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <View className="bg-white rounded-2xl p-6 items-center">
            <ActivityIndicator size="large" color="#FE8C00" />
            <Text className="text-gray-800 font-semibold mt-4">
              {isSubmitting ? 'Iniciando Sesión...' : 'Actualizando...'}
            </Text>
          </View>
        </View>
      )}
      
      <CustomInput 
            placeholder="Ingresa tu correo"
            value={form.email}
            onChangeText={(text) => setForm((prev) => ({...prev, email: text}))}
            label="Correo Electrónico"
            keyboardType="email-address"
            
      />

      <CustomInput 
            placeholder="Ingresa tu contraseña"
            value={form.password}
            onChangeText={(text) => setForm((prev) => ({...prev, password: text}))}
            label="Contraseña"
            secureTextEntry={true}
      />
      
      <View className="mt-6">
        <CustomButton
          title="Iniciar Sesión"
          isLoading={isSubmitting}
          onPress={submit}
        />
      </View>
      
      <View className="flex justify-center mt-8 flex-row gap-2">
        <Text className="text-base text-white-100">
          No tienes una cuenta?
        </Text>
        <Link href="/sign-up" className="text-base font-bold text-orange-200">
          Registrate
        </Link>
      </View>
    </View>
  );
};

export default SignIn;