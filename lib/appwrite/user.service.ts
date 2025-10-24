import { Query } from 'react-native-appwrite';
import { getUserAccount } from './account.service';
import { account, appWriteConfig, database } from './config';
import { getUserGrupos } from './grupo.service';

/**
 * Genera un tag único para el usuario
 */
export const generateUserTag = async (name: string): Promise<string> => {
  const nameParts = name.trim().split(' ');
  let baseTag = nameParts[0].toLowerCase();
  
  if (nameParts.length > 1) {
    baseTag += nameParts[1].charAt(0).toLowerCase();
  }
  
  const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
  let randomSuffix = '';
  let isUnique = false;
  
  while (!isUnique) {
    randomSuffix = '';
    for (let i = 0; i < 4; i++) {
      randomSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const fullTag = `@${baseTag}${randomSuffix}`;
    
    try {
      const existingUsers = await database.listRows({
        databaseId: appWriteConfig.databaseId,
        tableId: appWriteConfig.userTableId,
        queries: [Query.equal("tag", fullTag)],
      });
      
      if (existingUsers.rows.length === 0) {
        isUnique = true;
      }
    } catch (e) {
      console.log('Error checking tag uniqueness:', e);
    }
  }
  
  return `@${baseTag}${randomSuffix}`;
};

/**
 * Busca un usuario por su tag
 */
export const findUserByTag = async (tag: string) => {
  try {
    const users = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.userTableId,
      queries: [Query.equal("tag", tag.toLowerCase())],
    });
    
    if (users.rows.length === 0) {
      return null;
    }
    
    return users.rows[0];
  } catch (e) {
    console.log('Error finding user by tag:', e);
    return null;
  }
};

/**
 * Obtiene el usuario autenticado actual
 */
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

/**
 * Actualiza el perfil de usuario
 */
export const updateUserProfile = async ({
  userId,
  name,
  tag,
  avatarUrl,
  avatarFileId, 
  oldAvatarFileId,
}: {
  userId: string;
  name?: string;
  tag?: string;
  avatarUrl?: string;
  avatarFileId?: string; 
  oldAvatarFileId?: string;
}) => {
  try {
    if (tag) {
      const existingUsers = await database.listRows({
        databaseId: appWriteConfig.databaseId,
        tableId: appWriteConfig.userTableId,
        queries: [Query.equal("tag", tag.toLowerCase())],
      });
      
      if (existingUsers.rows.length > 0 && existingUsers.rows[0].$id !== userId) {
        throw new Error('Este tag ya está en uso');
      }
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (tag !== undefined) updateData.tag = tag.toLowerCase();
    if (avatarUrl !== undefined) updateData.avatar = avatarUrl;
    if (avatarFileId !== undefined) updateData.avatar_file_id = avatarFileId;
    
    const updatedUser = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.userTableId,
      rowId: userId,
      data: updateData,
    });
    
    // Si se actualizó el avatar y hay uno anterior, eliminarlo
    if (avatarUrl && oldAvatarFileId) {
      const { deleteAvatar } = await import('./storage.service');
      await deleteAvatar(oldAvatarFileId);
    }
    
    return updatedUser;
  } catch (e) {
    console.log('Error updating user profile:', e);
    throw new Error(e as string);
  }
};

/**
 * Obtiene las estadísticas del usuario
 */
export const getUserStats = async (userId: string) => {
  try {
    // Obtener metas completadas
    const completedMetas = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      queries: [
        Query.equal("user_ref", userId),
        Query.equal("estado", true),
      ],
    });
    
    // Obtener grupos del usuario
    const grupos = await getUserGrupos(userId);
    
    // Obtener cuenta del usuario para contar transacciones de ingreso
    const account = await getUserAccount(userId);
    let ingresosCount = 0;
    
    if (account) {
      const ingresos = await database.listRows({
        databaseId: appWriteConfig.databaseId,
        tableId: appWriteConfig.transactionTableId,
        queries: [
          Query.equal("cuenta_ref", account.$id),
          Query.equal("tipo", "ingreso"),
        ],
      });
      ingresosCount = ingresos.rows.length;
    }
    
    return {
      metasCompletadas: completedMetas.rows.length,
      gruposCount: grupos.length,
      ingresosCount,
    };
  } catch (e) {
    console.log('Error getting user stats:', e);
    return {
      metasCompletadas: 0,
      gruposCount: 0,
      ingresosCount: 0,
    };
  }
};