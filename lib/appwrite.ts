import { AddFundsToMetaParams, CreateGrupoParams, CreateMetaParams, CreateTransactionParams, CreateUserPrams, JoinGrupoParams, SignInParams, UpdateGrupoParams, UpdateMemberRoleParams } from "@/types/type";
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
  grupoTableId: process.env.EXPO_PUBLIC_APPWRITE_GRUPO_TABLE_ID!,
  grupoMiembroTableId: process.env.EXPO_PUBLIC_APPWRITE_GRUPO_MIEMBRO_TABLE_ID!,
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

// =============================================
// FUNCIONES DE GRUPOS
// =============================================

// Generar un tag único de 6 caracteres
const generateUniqueTag = async (): Promise<string> => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let tag = '';
  let isUnique = false;

  while (!isUnique) {
    tag = '';
    for (let i = 0; i < 6; i++) {
      tag += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Verificar si el tag ya existe
    try {
      const existingGroups = await database.listRows({
        databaseId: appWriteConfig.databaseId,
        tableId: appWriteConfig.grupoTableId,
        queries: [Query.equal("tag", tag)],
      });

      if (existingGroups.rows.length === 0) {
        isUnique = true;
      }
    } catch (e) {
      console.log('Error checking tag uniqueness:', e);
    }
  }

  return tag;
};

// Crear un nuevo grupo
export const createGrupo = async ({
  nombre,
  descripcion,
  userId,
}: CreateGrupoParams) => {
  try {
    const groupId = ID.unique();
    const tag = await generateUniqueTag();

    // Crear el grupo
    const newGrupo = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoTableId,
      rowId: groupId,
      data: {
        group_Id: groupId,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || '',
        tag: tag,
        created_by: userId,
      },
    });

    // Agregar al creador como miembro con rol admin
    const membershipId = ID.unique();
    await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      rowId: membershipId,
      data: {
        group_ref: groupId,
        user_ref: userId,
        rol: 'admin',
        fecha_union: new Date().toISOString(),
      },
    });

    return { grupo: newGrupo, tag };
  } catch (e) {
    console.log('Error creating grupo:', e);
    throw new Error(e as string);
  }
};

// Buscar grupo por tag
export const findGrupoByTag = async (tag: string) => {
  try {
    const grupos = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoTableId,
      queries: [Query.equal("tag", tag.toUpperCase().replace('#', ''))],
    });

    if (grupos.rows.length === 0) {
      return null;
    }

    return grupos.rows[0];
  } catch (e) {
    console.log('Error finding grupo by tag:', e);
    return null;
  }
};

// Unirse a un grupo
export const joinGrupo = async ({ tag, userId }: JoinGrupoParams) => {
  try {
    // Buscar el grupo
    const grupo = await findGrupoByTag(tag);

    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }

    // Verificar si el usuario ya es miembro
    const existingMembership = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      queries: [
        Query.equal("group_ref", grupo.$id),
        Query.equal("user_ref", userId),
      ],
    });

    if (existingMembership.rows.length > 0) {
      throw new Error('Ya eres miembro de este grupo');
    }

    // Agregar al usuario como miembro
    const membershipId = ID.unique();
    const newMembership = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      rowId: membershipId,
      data: {
        group_ref: grupo.$id,
        user_ref: userId,
        rol: 'miembro',
        fecha_union: new Date().toISOString(),
      },
    });

    return { grupo, membership: newMembership };
  } catch (e) {
    console.log('Error joining grupo:', e);
    throw new Error(e as string);
  }
};

// Obtener todos los grupos del usuario (como miembro o admin)
export const getUserGrupos = async (userId: string) => {
  try {
    // Obtener todas las membresías del usuario
    const memberships = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      queries: [
        Query.equal("user_ref", userId),
        Query.orderDesc("fecha_union"),
      ],
    });

    // Obtener los detalles de cada grupo
    const grupos = await Promise.all(
      memberships.rows.map(async (membership: any) => {
        const grupo = await database.getRow({
          databaseId: appWriteConfig.databaseId,
          tableId: appWriteConfig.grupoTableId,
          rowId: membership.group_ref,
        });

        return {
          ...grupo,
          userRole: membership.rol,
          membershipId: membership.$id,
          fecha_union: membership.fecha_union,
        };
      })
    );

    return grupos;
  } catch (e) {
    console.log('Error getting user grupos:', e);
    return [];
  }
};

// Obtener miembros de un grupo
export const getGrupoMembers = async (groupId: string) => {
  try {
    const memberships = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      queries: [
        Query.equal("group_ref", groupId),
        Query.orderDesc("fecha_union"),
      ],
    });

    // Obtener los detalles de cada usuario
    const members = await Promise.all(
      memberships.rows.map(async (membership: any) => {
        try {
          const user = await database.getRow({
            databaseId: appWriteConfig.databaseId,
            tableId: appWriteConfig.userTableId,
            rowId: membership.user_ref,
          });

          return {
            ...user,
            rol: membership.rol,
            membershipId: membership.$id,
            fecha_union: membership.fecha_union,
          };
        } catch (e) {
          console.log('Error fetching user details:', e);
          return null;
        }
      })
    );

    return members.filter(m => m !== null);
  } catch (e) {
    console.log('Error getting grupo members:', e);
    return [];
  }
};

// Actualizar información del grupo
export const updateGrupo = async ({
  groupId,
  nombre,
  descripcion,
  foto_bg,
}: UpdateGrupoParams) => {
  try {
    const updateData: any = {};

    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (descripcion !== undefined) updateData.descripcion = descripcion.trim();
    if (foto_bg !== undefined) updateData.foto_bg = foto_bg;

    const updatedGrupo = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoTableId,
      rowId: groupId,
      data: updateData,
    });

    return updatedGrupo;
  } catch (e) {
    console.log('Error updating grupo:', e);
    throw new Error(e as string);
  }
};

// Actualizar rol de un miembro
export const updateMemberRole = async ({
  membershipId,
  newRole,
}: UpdateMemberRoleParams) => {
  try {
    const updatedMembership = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      rowId: membershipId,
      data: {
        rol: newRole,
      },
    });

    return updatedMembership;
  } catch (e) {
    console.log('Error updating member role:', e);
    throw new Error(e as string);
  }
};

// Eliminar un grupo (solo el creador)
export const deleteGrupo = async (groupId: string, userId: string) => {
  try {
    // Verificar que el usuario sea el creador
    const grupo = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoTableId,
      rowId: groupId,
    });

    if (grupo.created_by !== userId) {
      throw new Error('Solo el creador puede eliminar el grupo');
    }

    // Eliminar todas las membresías del grupo
    const memberships = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      queries: [Query.equal("group_ref", groupId)],
    });

    await Promise.all(
      memberships.rows.map((membership: any) =>
        database.deleteRow({
          databaseId: appWriteConfig.databaseId,
          tableId: appWriteConfig.grupoMiembroTableId,
          rowId: membership.$id,
        })
      )
    );

    // Eliminar el grupo
    await database.deleteRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoTableId,
      rowId: groupId,
    });

    return true;
  } catch (e) {
    console.log('Error deleting grupo:', e);
    throw new Error(e as string);
  }
};

// Salir de un grupo
export const leaveGrupo = async (membershipId: string, userId: string, groupId: string) => {
  try {
    // Verificar que el usuario no sea el creador
    const grupo = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoTableId,
      rowId: groupId,
    });

    if (grupo.created_by === userId) {
      throw new Error('El creador no puede salir del grupo. Debes eliminarlo o transferir la propiedad.');
    }

    // Eliminar la membresía
    await database.deleteRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      rowId: membershipId,
    });

    return true;
  } catch (e) {
    console.log('Error leaving grupo:', e);
    throw new Error(e as string);
  }
};