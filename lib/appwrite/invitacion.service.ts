import { ID, Query } from 'react-native-appwrite';
import { appWriteConfig, database } from './config';

/**
 * Crea una invitación a un grupo
 */
export const createInvitacion = async ({
  groupId,
  invitedByUserId,
  invitedUserId,
}: {
  groupId: string;
  invitedByUserId: string;
  invitedUserId: string;
}) => {
  try {
    // Verificar que el usuario invitado no sea ya miembro
    const existingMembership = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      queries: [
        Query.equal("group_ref", groupId),
        Query.equal("user_ref", invitedUserId),
      ],
    });
    
    if (existingMembership.rows.length > 0) {
      throw new Error('Este usuario ya es miembro del grupo');
    }
    
    // Verificar que no exista una invitación pendiente
    const existingInvitation = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.invitacionTableId,
      queries: [
        Query.equal("group_ref", groupId),
        Query.equal("invited_user_ref", invitedUserId),
        Query.equal("estado", "pendiente"),
      ],
    });
    
    if (existingInvitation.rows.length > 0) {
      throw new Error('Ya existe una invitación pendiente para este usuario');
    }
    
    // Calcular fecha de expiración (7 días desde ahora)
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);
    
    const invitacionId = ID.unique();
    const newInvitacion = await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.invitacionTableId,
      rowId: invitacionId,
      data: {
        group_ref: groupId,
        invited_by_ref: invitedByUserId,
        invited_user_ref: invitedUserId,
        estado: 'pendiente',
        fecha_expiracion: fechaExpiracion.toISOString(),
      },
    });
    
    return newInvitacion;
  } catch (e) {
    console.log('Error creating invitacion:', e);
    throw new Error(e as string);
  }
};

/**
 * Obtiene las invitaciones de un usuario
 */
export const getUserInvitaciones = async (userId: string) => {
  try {
    const invitaciones = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.invitacionTableId,
      queries: [
        Query.equal("invited_user_ref", userId),
        Query.equal("estado", "pendiente"),
        Query.orderDesc("$createdAt"),
      ],
    });
    
    // Verificar y actualizar invitaciones expiradas
    const now = new Date();
    const validInvitaciones = await Promise.all(
      invitaciones.rows.map(async (inv: any) => {
        const fechaExp = new Date(inv.fecha_expiracion);
        
        if (fechaExp < now && inv.estado === 'pendiente') {
          // Marcar como expirada
          await database.updateRow({
            databaseId: appWriteConfig.databaseId,
            tableId: appWriteConfig.invitacionTableId,
            rowId: inv.$id,
            data: { estado: 'expirada' },
          });
          return null;
        }
        
        return inv;
      })
    );
    
    // Filtrar las invitaciones expiradas
    const activeInvitaciones = validInvitaciones.filter(inv => inv !== null);
    
    // Obtener detalles del grupo y del usuario que invitó
    const invitacionesConDetalles = await Promise.all(
      activeInvitaciones.map(async (inv: any) => {
        try {
          const grupo = await database.getRow({
            databaseId: appWriteConfig.databaseId,
            tableId: appWriteConfig.grupoTableId,
            rowId: inv.group_ref,
          });
          
          const invitedBy = await database.getRow({
            databaseId: appWriteConfig.databaseId,
            tableId: appWriteConfig.userTableId,
            rowId: inv.invited_by_ref,
          });
          
          return {
            ...inv,
            grupo,
            invitedBy,
          };
        } catch (e) {
          console.log('Error fetching invitation details:', e);
          return null;
        }
      })
    );
    
    return invitacionesConDetalles.filter(inv => inv !== null);
  } catch (e) {
    console.log('Error getting user invitaciones:', e);
    return [];
  }
};

/**
 * Acepta una invitación
 */
export const acceptInvitacion = async (invitacionId: string, userId: string) => {
  try {
    // Obtener la invitación
    const invitacion = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.invitacionTableId,
      rowId: invitacionId,
    });
    
    // Verificar que la invitación esté pendiente
    if (invitacion.estado !== 'pendiente') {
      throw new Error('Esta invitación ya no está disponible');
    }
    
    // Verificar que no haya expirado
    const fechaExp = new Date(invitacion.fecha_expiracion);
    const now = new Date();
    
    if (fechaExp < now) {
      // Marcar como expirada
      await database.updateRow({
        databaseId: appWriteConfig.databaseId,
        tableId: appWriteConfig.invitacionTableId,
        rowId: invitacionId,
        data: { estado: 'expirada' },
      });
      throw new Error('Esta invitación ha expirado');
    }
    
    // Agregar al usuario como miembro del grupo
    const membershipId = ID.unique();
    await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      rowId: membershipId,
      data: {
        group_ref: invitacion.group_ref,
        user_ref: userId,
        rol: 'miembro',
        fecha_union: new Date().toISOString(),
      },
    });
    
    // Actualizar estado de la invitación
    await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.invitacionTableId,
      rowId: invitacionId,
      data: { estado: 'aceptada' },
    });
    
    return true;
  } catch (e) {
    console.log('Error accepting invitacion:', e);
    throw new Error(e as string);
  }
};

/**
 * Rechaza una invitación
 */
export const rejectInvitacion = async (invitacionId: string) => {
  try {
    await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.invitacionTableId,
      rowId: invitacionId,
      data: { estado: 'rechazada' },
    });
    
    return true;
  } catch (e) {
    console.log('Error rejecting invitacion:', e);
    throw new Error(e as string);
  }
};