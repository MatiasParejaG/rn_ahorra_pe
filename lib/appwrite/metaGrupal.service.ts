import { CreateMetaGrupalParams, RegistrarAporteParams } from '@/types/type';
import { ID, Query } from 'react-native-appwrite';
import { appWriteConfig, database } from './config';

/**
 * Crea una nueva meta grupal
 */
export const createMetaGrupal = async ({
  nombre,
  descripcion,
  monto_objetivo,
  fecha_objetivo,
  groupId,
  userId,
  foto_meta,
  foto_meta_file_id,
}: CreateMetaGrupalParams ) => {
  try {
    // Verificar que el usuario sea admin del grupo
    const membership = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      queries: [
        Query.equal("group_ref", groupId),
        Query.equal("user_ref", userId),
        Query.equal("rol", "admin"),
      ],
    });

    if (membership.rows.length === 0) {
      throw new Error('Solo los administradores pueden crear metas grupales');
    }

    const metaId = ID.unique();

    // Preparar datos - solo incluir foto si existe
    const metaData: any = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      monto_objetivo,
      monto_actual: 0,
      fecha_objetivo: fecha_objetivo || null,
      estado: false,
      group_ref: groupId,
    };

    // Solo agregar campos de foto si existen
    if (foto_meta) {
      metaData.foto_meta = foto_meta;
    }
    if (foto_meta_file_id) {
      metaData.foto_meta_file_id = foto_meta_file_id;
    }

    const newMetaGrupal = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
      rowId: metaId,
      data: metaData,
    });

    return newMetaGrupal;
  } catch (e) {
    console.log('Error creating meta grupal:', e);
    throw new Error(e as string);
  }
};

/**
 * Obtiene las metas de un grupo
 */
export const getGrupoMetas = async (groupId: string) => {
  try {
    const metas = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
      queries: [
        Query.equal("group_ref", groupId),
        Query.orderDesc("$createdAt"),
      ],
    });

    return metas.rows;
  } catch (e) {
    console.log('Error getting grupo metas:', e);
    return [];
  }
};

/**
 * Obtiene los detalles de una meta grupal con aportes
 */
export const getMetaGrupalDetails = async (metaId: string) => {
  try {
    // Obtener la meta
    const meta = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
      rowId: metaId,
    });

    // Obtener todos los aportes
    const aportes = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.aporteGrupoTableId,
      queries: [
        Query.equal("meta_grupo_ref", metaId),
        Query.orderDesc("$createdAt"),
      ],
    });

    // Obtener detalles de cada usuario que aportó
    const aportesConUsuarios = await Promise.all(
      aportes.rows.map(async (aporte: any) => {
        try {
          const usuario = await database.getRow({
            databaseId: appWriteConfig.databaseId,
            tableId: appWriteConfig.userTableId,
            rowId: aporte.usuario_ref,
          });

          return {
            ...aporte,
            usuario,
          };
        } catch (e) {
          console.log('Error fetching user details for aporte:', e);
          return null;
        }
      })
    );

    // Calcular estadísticas
    const aportesValidos = aportesConUsuarios.filter(a => a !== null);
    
    // Agrupar aportes por usuario para top contributors
    const aportesPorUsuario = aportesValidos.reduce((acc: any, aporte: any) => {
      const userId = aporte.usuario.$id;
      if (!acc[userId]) {
        acc[userId] = {
          usuario: aporte.usuario,
          totalAportado: 0,
          cantidadAportes: 0,
        };
      }
      acc[userId].totalAportado += aporte.monto;
      acc[userId].cantidadAportes += 1;
      return acc;
    }, {});

    // Convertir a array y ordenar por total aportado
    const topContribuidores = Object.values(aportesPorUsuario)
      .sort((a: any, b: any) => b.totalAportado - a.totalAportado);

    return {
      meta,
      aportes: aportesValidos,
      topContribuidores,
      totalAportes: aportesValidos.length,
    };
  } catch (e) {
    console.log('Error getting meta grupal details:', e);
    throw new Error(e as string);
  }
};

/**
 * Registra un aporte a una meta grupal
 */
export const registrarAporteMetaGrupal = async ({
  metaId,
  userId,
  monto,
  cuentaId,
}: RegistrarAporteParams ) => {
  try {
    // Obtener la meta
    const meta = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
      rowId: metaId,
    });

    // Validar que la meta no esté completada
    if (meta.estado) {
      throw new Error('Esta meta ya está completada');
    }

    // Obtener la cuenta del usuario
    const cuenta = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.accountTableId,
      rowId: cuentaId,
    });

    // Validar saldo suficiente
    if (cuenta.saldo_actual < monto) {
      throw new Error('Saldo insuficiente');
    }

    // Calcular el monto restante para completar la meta
    const montoRestante = meta.monto_objetivo - meta.monto_actual;

    // Validar que el monto no exceda lo que falta
    if (monto > montoRestante) {
      throw new Error(`Solo se puede aportar máximo ${montoRestante.toFixed(2)}`);
    }

    // Crear el aporte
    const aporteId = ID.unique();
    const newAporte = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.aporteGrupoTableId,
      rowId: aporteId,
      data: {
        meta_grupo_ref: metaId,
        usuario_ref: userId,
        monto,
      },
    });

    // Actualizar el monto actual de la meta
    const nuevoMontoActual = meta.monto_actual + monto;
    const metaCompletada = nuevoMontoActual >= meta.monto_objetivo;

    await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
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

    return { aporte: newAporte, metaCompletada, nuevoMontoActual };
  } catch (e) {
    console.log('Error registrando aporte:', e);
    throw new Error(e as string);
  }
};

/**
 * Actualiza una meta grupal
 */
export const updateMetaGrupal = async ({
  metaId,
  nombre,
  descripcion,
  monto_objetivo,
  fecha_objetivo,
}: {
  metaId: string;
  nombre?: string;
  descripcion?: string;
  monto_objetivo?: number;
  fecha_objetivo?: string;
}) => {
  try {
    const updateData: any = {};

    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (descripcion !== undefined) updateData.descripcion = descripcion.trim();
    if (monto_objetivo !== undefined) updateData.monto_objetivo = monto_objetivo;
    if (fecha_objetivo !== undefined) updateData.fecha_objetivo = fecha_objetivo;

    const updatedMeta = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
      rowId: metaId,
      data: updateData,
    });

    return updatedMeta;
  } catch (e) {
    console.log('Error updating meta grupal:', e);
    throw new Error(e as string);
  }
};

/**
 * Elimina una meta grupal (solo si no tiene aportes)
 */
export const deleteMetaGrupal = async (metaId: string, userId: string, groupId: string) => {
  try {
    // Verificar que el usuario sea admin
    const membership = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      queries: [
        Query.equal("group_ref", groupId),
        Query.equal("user_ref", userId),
        Query.equal("rol", "admin"),
      ],
    });

    if (membership.rows.length === 0) {
      throw new Error('Solo los administradores pueden eliminar metas grupales');
    }

    // Obtener la meta
    const meta = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
      rowId: metaId,
    });

    // Validar que no tenga aportes
    if (meta.monto_actual > 0) {
      throw new Error('No se puede eliminar una meta con aportes registrados');
    }

    // Eliminar la meta
    await database.deleteRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
      rowId: metaId,
    });

    return true;
  } catch (e) {
    console.log('Error deleting meta grupal:', e);
    throw new Error(e as string);
  }
};