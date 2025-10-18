import { AddFundsToMetaParams, CreateMetaParams, CreateTransactionParams, CreateUserPrams, SignInParams } from "@/types/type";
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
  metaTableId: process.env.EXPO_PUBLIC_APPWRITE_META_TABLE_ID!,
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

// FUNCIONES DE TRANSACCIONES

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

// FUNCIONES DE METAS 

// Crear una nueva meta
export const createMeta = async ({
  nombre,
  monto_objetivo,
  fecha_objetivo,
  userId,
}: CreateMetaParams) => {
  try {
    const metaId = ID.unique();

    const newMeta = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      rowId: metaId,
      data: {
        meta_id: metaId,
        nombre,
        monto_objetivo,
        monto_actual: 0,
        fecha_objetivo: fecha_objetivo || null,
        estado: false,
        user_ref: userId,
      },
    });

    return newMeta;
  } catch (e) {
    console.log('Error creating meta:', e);
    throw new Error(e as string);
  }
};

// Obtener todas las metas de un usuario
export const getUserMetas = async (userId: string) => {
  try {
    const metas = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      queries: [
        Query.equal("user_ref", userId),
        Query.orderDesc("$createdAt"),
      ],
    });

    return metas.rows;
  } catch (e) {
    console.log('Error getting user metas:', e);
    return [];
  }
};

// Agregar fondos a una meta
export const addFundsToMeta = async ({
  metaId,
  monto,
  cuentaId,
}: AddFundsToMetaParams) => {
  try {
    // Obtener la meta actual
    const meta = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      rowId: metaId,
    });

    // Obtener la cuenta del usuario
    const cuenta = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.accountTableId,
      rowId: cuentaId,
    });

    // Validar que el usuario tenga saldo suficiente
    if (cuenta.saldo_actual < monto) {
      throw new Error('Saldo insuficiente');
    }

    // Calcular el monto restante para completar la meta
    const montoRestante = meta.monto_objetivo - meta.monto_actual;

    // Validar que el monto no exceda lo que falta
    if (monto > montoRestante) {
      throw new Error(`Solo puedes agregar máximo ${montoRestante.toFixed(2)}`);
    }

    // Calcular el nuevo monto actual
    const nuevoMontoActual = meta.monto_actual + monto;
    const metaCompletada = nuevoMontoActual >= meta.monto_objetivo;

    // Actualizar la meta
    await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      rowId: metaId,
      data: {
        monto_actual: nuevoMontoActual,
        estado: metaCompletada,
      },
    });

    // Restar el monto del saldo de la cuenta
    const nuevoSaldo = cuenta.saldo_actual - monto;
    await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.accountTableId,
      rowId: cuentaId,
      data: {
        saldo_actual: nuevoSaldo,
      },
    });

    return { metaCompletada, nuevoMontoActual };
  } catch (e) {
    console.log('Error adding funds to meta:', e);
    throw new Error(e as string);
  }
};

// Eliminar una meta (solo si no tiene progreso)
export const deleteMeta = async (metaId: string) => {
  try {
    // Obtener la meta
    const meta = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      rowId: metaId,
    });

    // Validar que no tenga progreso
    if (meta.monto_actual > 0) {
      throw new Error('No puedes eliminar una meta con progreso');
    }

    // Eliminar la meta
    await database.deleteRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      rowId: metaId,
    });

    return true;
  } catch (e) {
    console.log('Error deleting meta:', e);
    throw new Error(e as string);
  }
};