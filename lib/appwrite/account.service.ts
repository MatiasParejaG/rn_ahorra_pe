import { ID, Query } from 'react-native-appwrite';
import { appWriteConfig, database } from './config';

/**
 * Crea la cuenta financiera del usuario
 */
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

/**
 * Obtiene la cuenta del usuario
 */
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