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
  avatar_file_id?: string;
  tag: string; 
  initial_setup: boolean;
  $createdAt?: string; 
}

export interface UserStats {
  metasCompletadas: number;
  gruposCount: number;
  ingresosCount: number;
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

// Tipos para Grupos
export interface Grupo {
  $id: string;
  group_Id: string;
  nombre: string;
  descripcion?: string;
  tag: string;
  created_by: string | User; // Relationship
  foto_bg?: string;
  $createdAt?: string;
}

export interface GrupoMiembro {
  $id: string;
  group_ref: string | Grupo; // Relationship
  user_ref: string | User; // Relationship
  rol: 'admin' | 'miembro';
  fecha_union: string;
}

// Params para crear grupo
export interface CreateGrupoParams {
  nombre: string;
  descripcion?: string;
  userId: string;
}

// Params para unirse a un grupo
export interface JoinGrupoParams {
  tag: string;
  userId: string;
}

// Params para actualizar grupo
export interface UpdateGrupoParams {
  groupId: string;
  nombre?: string;
  descripcion?: string;
  foto_bg?: string;
}

// Params para actualizar rol de miembro
export interface UpdateMemberRoleParams {
  membershipId: string;
  newRole: 'admin' | 'miembro';
}

export interface Invitacion {
  $id: string;
  group_ref: string | Grupo;
  invited_by_ref: string | User;
  invited_user_ref: string | User;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada';
  fecha_expiracion: string;
  $createdAt?: string;
}

// Metas Grupales
export interface MetaGrupal {
  $id: string;
  meta_grupo_Id: string;
  nombre: string;
  descripcion?: string;
  monto_objetivo: number;
  monto_actual: number;
  fecha_objetivo?: string;
  estado: boolean;
  group_ref: string | Grupo;
  $createdAt?: string;
}

export interface AporteGrupo {
  $id: string;
  meta_grupo_ref: string | MetaGrupal;
  usuario_ref: string | User;
  monto: number;
  $createdAt?: string;
}

export interface CreateMetaGrupalParams {
  nombre: string;
  descripcion?: string;
  monto_objetivo: number;
  fecha_objetivo?: string;
  groupId: string;
  userId: string;
}

export interface RegistrarAporteParams {
  metaId: string;
  userId: string;
  monto: number;
  cuentaId: string;
}