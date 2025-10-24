import { CreateTransactionParams } from '@/types/type';
import { ID, Query } from 'react-native-appwrite';
import { appWriteConfig, database } from './config';

/**
 * Crea una nueva transacción
 */
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

/**
 * Obtiene las transacciones de una cuenta
 */
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