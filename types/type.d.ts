
export interface Category {
    name: string;
    description: string;
}

// Tipos existentes
export interface User {
  $id: string;
  name: string;
  email: string;
  accountId: string;
  avatar: string;
  initial_setup: boolean;
}

export interface UserAccount {
  $id: string;
  cuenta_id: string;
  saldo_actual: number;
  divisa: string;
  user_ref: string;
}


export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
}


interface CustomButtonProps {
    onPress?: () => void;
    title?: string;
    style?: string;
    leftIcon?: React.ReactNode;
    textStyle?: string;
    isLoading?: boolean;
}

interface CustomHeaderProps {
    title?: string;
}

interface CustomInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    label?: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
}

interface CreateUserPrams {
    email: string;
    password: string;
    name: string;
}

interface SignInParams {
    email: string;
    password: string;
}
