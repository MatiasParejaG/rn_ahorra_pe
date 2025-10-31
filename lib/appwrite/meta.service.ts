import { AddFundsToMetaParams, CreateMetaParams } from '@/types/type';
import { ID, Query } from 'react-native-appwrite';
import { appWriteConfig, database } from './config';

/**
 * Crea una nueva meta personal
 */
export const createMeta = async ({
  nombre,
  monto_objetivo,
  fecha_objetivo,
  userId,
  foto_meta,
  foto_meta_file_id,
}: CreateMetaParams) => {
  try {
    const metaId = ID.unique();

    const metaData: any = {
      meta_id: metaId,
      nombre: nombre.trim(),
      monto_objetivo: monto_objetivo,
      monto_actual: 0,
      fecha_objetivo: fecha_objetivo || null,
      estado: false,
      user_ref: userId,
    }

    if(foto_meta) {
      metaData.foto_meta = foto_meta;
    }
    if(foto_meta_file_id) {
      metaData.foto_meta_file_id = foto_meta_file_id;
    }

    const newMeta = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      rowId: metaId,
      data: metaData,
    });

    return newMeta;
  } catch (e) {
    console.log('Error creating meta:', e);
    throw new Error(e as string);
  }
};

/**
 * Obtiene todas las metas de un usuario
 */
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

/**
 * Agrega fondos a una meta
 */
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

/**
 * Elimina una meta (solo si no tiene progreso)
 */
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