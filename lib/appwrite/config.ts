import { Account, Avatars, Client, Storage, TablesDB } from "react-native-appwrite";

export const appWriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  userTableId: process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID!,
  accountTableId: process.env.EXPO_PUBLIC_APPWRITE_CUENTAS_TABLE_ID!,
  transactionTableId: process.env.EXPO_PUBLIC_APPWRITE_TRANSACCION_TABLE_ID!,
  metaTableId: process.env.EXPO_PUBLIC_APPWRITE_META_TABLE_ID!,
  grupoTableId: process.env.EXPO_PUBLIC_APPWRITE_GRUPO_TABLE_ID!,
  grupoMiembroTableId: process.env.EXPO_PUBLIC_APPWRITE_GRUPO_MIEMBRO_TABLE_ID!,
  invitacionTableId: process.env.EXPO_PUBLIC_APPWRITE_INVITACION_TABLE_ID!,
  storageBucketId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
  metaGrupoTableId: process.env.EXPO_PUBLIC_APPWRITE_META_GRUPO_TABLE_ID!,
  aporteGrupoTableId: process.env.EXPO_PUBLIC_APPWRITE_APORTE_GRUPO_TABLE_ID!,
  alcanciaTableId: process.env.EXPO_PUBLIC_APPWRITE_ALCANCIA_TABLE_ID!,
  platform: "com.mapg.ahorrape",
};

export const client = new Client();
client
  .setEndpoint(appWriteConfig.endpoint)
  .setProject(appWriteConfig.projectId)
  .setPlatform(appWriteConfig.platform);

export const account = new Account(client);
export const database = new TablesDB(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);