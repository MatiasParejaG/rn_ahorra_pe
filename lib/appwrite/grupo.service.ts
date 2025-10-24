import {
    CreateGrupoParams,
    JoinGrupoParams,
    UpdateGrupoParams,
    UpdateMemberRoleParams,
} from '@/types/type';
import { ID, Query } from 'react-native-appwrite';
import { appWriteConfig, database } from './config';

/**
 * Genera un tag único de 6 caracteres para el grupo
 */
const generateUniqueTag = async (): Promise<string> => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let tag = '';
  let isUnique = false;

  while (!isUnique) {
    tag = '';
    for (let i = 0; i < 6; i++) {
      tag += characters.charAt(Math.floor(Math.random() * characters.length));
    }

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

/**
 * Crea un nuevo grupo
 */
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

/**
 * Busca un grupo por su tag
 */
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

/**
 * Une un usuario a un grupo
 */
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

/**
 * Obtiene todos los grupos del usuario
 */
export const getUserGrupos = async (userId: string) => {
  try {
    const memberships = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoMiembroTableId,
      queries: [
        Query.equal("user_ref", userId),
        Query.orderDesc("fecha_union"),
      ],
    });

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

/**
 * Obtiene los miembros de un grupo
 */
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

/**
 * Actualiza la información del grupo
 */
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

/**
 * Actualiza el rol de un miembro
 */
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

/**
 * Elimina un grupo (solo el creador)
 */
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

/**
 * Permite a un usuario salir de un grupo
 */
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
}