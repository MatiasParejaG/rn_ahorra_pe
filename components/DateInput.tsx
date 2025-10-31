import { DateInputProps } from "@/types/type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const DateInput = ({
  placeholder = "Ingresa la fecha",
  title,
  onChangeText,
}: DateInputProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const handleOpenPicker = () => {
    setTempDate(date || new Date());
    setShowDatePicker(true);
  };

  const handleConfirm = () => {
    setDate(tempDate);
    if (onChangeText) {
      onChangeText(tempDate.toISOString());
    }
    setShowDatePicker(false);
  };

  const handleCancel = () => {
    setShowDatePicker(false);
  };

  const onChange = (event: any, selectedDate: any) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setDate(selectedDate);
        if (onChangeText) {
          onChangeText(selectedDate.toISOString());
        }
      }
    } else {
      // En iOS solo actualizamos la fecha temporal
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  return (
    <View className="w-full">
      <TouchableOpacity onPress={handleOpenPicker}>
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200">
          <MaterialCommunityIcons 
            name="calendar-outline" 
            size={20} 
            color="#9CA3AF" 
            style={{ marginRight: 12 }}
          />
          <Text className={`flex-1 text-base ${date ? 'text-gray-800' : 'text-gray-400'}`}>
            {date 
              ? date.toLocaleDateString('es-PE', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
              : placeholder
            }
          </Text>
        </View>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl">
              {/* Header */}
              <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
                <Pressable onPress={handleCancel}>
                  <Text className="text-base text-gray-500">Cancelar</Text>
                </Pressable>
                <Text className="text-base font-semibold text-gray-800">
                  {title || "Seleccionar Fecha"}
                </Text>
                <Pressable onPress={handleConfirm}>
                  <Text className="text-base font-semibold text-primary">Confirmar</Text>
                </Pressable>
              </View>
              
              {/* Date Picker */}
              <View className="items-center py-4">
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  onChange={onChange}
                  display="spinner"
                  locale="es-PE"
                  textColor="#374151"
                  minimumDate={new Date()}
                />
              </View>
              
              {/* Espaciado inferior para seguridad en notch */}
              <View className="h-8" />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            onChange={onChange}
            display="default"
            minimumDate={new Date()}
          />
        )
      )}
    </View>
  );
};

export default DateInput;