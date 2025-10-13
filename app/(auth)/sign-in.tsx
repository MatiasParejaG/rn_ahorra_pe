import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { signIn } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: ''});

  const submit = async() => {
    const { email, password } = form;

    if(!email || !password) return Alert.alert('Error', 'Ingresa un correo y contraseña válido');

    setIsSubmitting(true)

    try {
      await signIn({ email, password });
      
      
      router.replace('/');
    } catch(error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <View className="gap-6 bg-white rounded-3xl p-8 m-5 mb-10" style={{backgroundColor: 'rgba(255, 255, 255, 0.08)'}}>
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