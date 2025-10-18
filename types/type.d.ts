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

export interface Transaction {
  $id: string;
  transaccion_id: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  descripcion?: string;
  fecha: string;
  categoria?: string;
  cuenta_ref: string;
}

export interface Meta {
  $id: string;
  meta_id: string;
  nombre: string;
  monto_objetivo: number;
  monto_actual: number;
  fecha_objetivo?: string;
  estado: boolean;
  user_ref: string;
}

export interface LocalCategory {
  id: string;
  name: string;
  type: 'ingreso' | 'gasto';
  icon?: string;
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
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "decimal-pad";
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

interface CreateTransactionParams {
  tipo: 'ingreso' | 'gasto';
  monto: number;
  descripcion?: string;
  categoria?: string;
  cuentaId: string;
}

interface CreateMetaParams {
  nombre: string;
  monto_objetivo: number;
  fecha_objetivo?: string;
  userId: string;
}

interface AddFundsToMetaParams {
  metaId: string;
  monto: number;
  cuentaId: string;
}