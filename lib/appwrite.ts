import { CreateTransactionParams, CreateUserPrams, SignInParams } from "@/types/type";
import {
  Account,
  Avatars,
  Client,
  ID,
  Query,
  TablesDB,
} from "react-native-appwrite";

export const appWriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  userTableId: process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID!,
  accountTableId: process.env.EXPO_PUBLIC_APPWRITE_CUENTAS_TABLE_ID!,
  transactionTableId: process.env.EXPO_PUBLIC_APPWRITE_TRANSACCION_TABLE_ID!,
  platform: "com.mapg.ahorrape",
};

export const client = new Client();
client
  .setEndpoint(appWriteConfig.endpoint)
  .setProject(appWriteConfig.projectId)
  .setPlatform(appWriteConfig.platform);

export const account = new Account(client);
export const database = new TablesDB(client);

const avatars = new Avatars(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserPrams) => {
  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email: email,
      password: password,
      name: name,
    });
    console.log(newAccount);
    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.userTableId,
      rowId: ID.unique(),
      data: {
        accountId: newAccount.$id,
        email: email,
        name: name,
        avatar: avatarUrl,
        initial_setup: false,
      },
    });
  } catch (e) {
    throw new Error(e as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    try {
      await account.deleteSession({
        sessionId: 'current'
      });
    } catch (e) {
      console.log('No existing session to delete');
    }

    const session = await account.createEmailPasswordSession({
      email: email,
      password: password,
    });
    return session;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentSession = async () => {
  try {
    const session = await account.getSession({
      sessionId: 'current'
    });
    return session;
  } catch (e) {
    console.log('No active session', e);
    return null;
  }
};

export const logOut = async () => {
  try {
    await account.deleteSession({
      sessionId: 'current'
    });
  } catch (e) {
    console.log('Error deleting session:', e);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.userTableId,
      queries: [Query.equal("accountId", currentAccount.$id)],
    });

    if (!currentUser) throw Error;

    return currentUser.rows[0];
  } catch (e) {
    console.log(e);
    throw new Error(e as string);
  }
};

// Crear cuenta financiera del usuario
export const createUserAccount = async ({
  userId,
  saldoInicial,
  divisa,
}: {
  userId: string;
  saldoInicial: number;
  divisa: string;
}) => {
  try {
    const cuentaId = ID.unique();
    
    // Crear la cuenta
    const newAccount = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.accountTableId,
      rowId: cuentaId,
      data: {
        cuenta_id: cuentaId,
        saldo_actual: saldoInicial,
        divisa: divisa,
        user_ref: userId,
      },
    });

    // Actualizar el flag initial_setup del usuario
    await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.userTableId,
      rowId: userId,
      data: {
        initial_setup: true,
      },
    });

    return newAccount;
  } catch (e) {
    console.log('Error creating account:', e);
    throw new Error(e as string);
  }
};

// Obtener cuenta del usuario
export const getUserAccount = async (userId: string) => {
  try {
    const accounts = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.accountTableId,
      queries: [Query.equal("user_ref", userId)],
    });

    if (!accounts || accounts.rows.length === 0) return null;

    return accounts.rows[0];
  } catch (e) {
    console.log('Error getting user account:', e);
    return null;
  }
};

// Crear transacción
export const createTransaction = async ({
  tipo,
  monto,
  descripcion,
  categoria,
  cuentaId,
}: CreateTransactionParams) => {
  try {
    const transaccionId = ID.unique();
    const fecha = new Date().toISOString();

    // Crear la transacción
    const newTransaction = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.transactionTableId,
      rowId: transaccionId,
      data: {
        transaccion_id: transaccionId,
        tipo,
        monto,
        descripcion: descripcion || '',
        fecha,
        categoria: categoria || '',
        cuenta_ref: cuentaId,
      },
    });

    // Obtener la cuenta actual
    const cuenta = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.accountTableId,
      rowId: cuentaId,
    });

    // Calcular el nuevo saldo
    const saldoActual = cuenta.saldo_actual;
    const nuevoSaldo = tipo === 'ingreso' 
      ? saldoActual + monto 
      : saldoActual - monto;

    // Actualizar el saldo de la cuenta
    await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.accountTableId,
      rowId: cuentaId,
      data: {
        saldo_actual: nuevoSaldo,
      },
    });

    return newTransaction;
  } catch (e) {
    console.log('Error creating transaction:', e);
    throw new Error(e as string);
  }
};

// Obtener transacciones de una cuenta
export const getAccountTransactions = async (cuentaId: string, limit: number = 10) => {
  try {
    const transactions = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.transactionTableId,
      queries: [
        Query.equal("cuenta_ref", cuentaId),
        Query.orderDesc("fecha"),
        Query.limit(limit),
      ],
    });

    return transactions.rows;
  } catch (e) {
    console.log('Error getting transactions:', e);
    return [];
  }
};