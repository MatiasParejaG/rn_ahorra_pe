import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name:'', email: '', password: ''});

  const submit = async() => {
    const { name, email, password } = form;

    if(!name || !email || !password) return Alert.alert('Error', 'Ingresa un correo y contraseña válido');

    setIsSubmitting(true)

    try {
      // Llamar a la funcion de Registro de Appwrite
      await createUser({ 
        email,
        password,
        name
      })
      
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
            placeholder="Ingresa tu nombre"
            value={form.name}
            onChangeText={(text) => setForm((prev) => ({...prev, name: text}))}
            label="Nombre Completo"
            keyboardType="email-address"
            
      />
      
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
          title="Registrarse"
          isLoading={isSubmitting}
          onPress={submit}
        />
      </View>
      
      <View className="flex justify-center mt-8 flex-row gap-2">
        <Text className="text-base text-white-100">
          Ya tienes una cuenta?
        </Text>
        <Link href="/sign-in" className="text-base font-bold text-orange-200">
          Inicia Sesión
        </Link>
      </View>
    </View>
  );
};

export default SignUp;