import { ID } from 'react-native-appwrite';
import { appWriteConfig, storage } from './config';

/**
 * Sube un avatar de usuario
 */
export const uploadAvatar = async (fileUri: string, userId: string) => {
  try {
    const fileName = `avatar_${userId}_${Date.now()}.jpg`;
    
    const fileInfo = await fetch(fileUri);
    const blob = await fileInfo.blob();
    
    const file = {
      name: fileName,
      type: blob.type || 'image/jpeg',
      size: blob.size,
      uri: fileUri,
    };
    
    console.log('Uploading file:', file);
    
    const uploadedFile = await storage.createFile(
      appWriteConfig.storageBucketId,
      ID.unique(),
      file as any
    );
    
    console.log('File uploaded:', uploadedFile); 
    
    const fileUrl = `${appWriteConfig.endpoint}/storage/buckets/${appWriteConfig.storageBucketId}/files/${uploadedFile.$id}/view?project=${appWriteConfig.projectId}`;
    
    return {
      fileId: uploadedFile.$id,
      fileUrl: fileUrl,
    };
  } catch (e) {
    console.log('Error uploading avatar:', e);
    throw new Error(e as string);
  }
};

/**
 * Elimina un avatar
 */
export const deleteAvatar = async (fileId: string) => {
  try {
    await storage.deleteFile({
      bucketId: appWriteConfig.storageBucketId,
      fileId: fileId,
    });
    return true;
  } catch (e) {
    console.log('Error deleting avatar:', e);
    return false;
  }
};

/**
 * Sube una foto de meta grupal
 */
export const uploadMetaGrupalPhoto = async (fileUri: string, metaId: string) => {
  try {
    const fileName = `meta_${metaId}_${Date.now()}.jpg`;
    
    const fileInfo = await fetch(fileUri);
    const blob = await fileInfo.blob();
    
    const file = {
      name: fileName,
      type: blob.type || 'image/jpeg',
      size: blob.size,
      uri: fileUri,
    };
    
    console.log('Uploading meta photo:', file);
    
    const uploadedFile = await storage.createFile(
      appWriteConfig.storageBucketId,
      ID.unique(),
      file as any
    );
    
    console.log('Meta photo uploaded:', uploadedFile); 
    
    const fileUrl = `${appWriteConfig.endpoint}/storage/buckets/${appWriteConfig.storageBucketId}/files/${uploadedFile.$id}/view?project=${appWriteConfig.projectId}`;
    
    return {
      fileId: uploadedFile.$id,
      fileUrl: fileUrl,
    };
  } catch (e) {
    console.log('Error uploading meta photo:', e);
    throw new Error(e as string);
  }
};

/**
 * Elimina una foto de meta grupal
 */
export const deleteMetaGrupalPhoto = async (fileId: string) => {
  try {
    await storage.deleteFile({
      bucketId: appWriteConfig.storageBucketId,
      fileId: fileId,
    });
    return true;
  } catch (e) {
    console.log('Error deleting meta photo:', e);
    return false;
  }
};

/**
 * Actualiza la foto de una meta grupal
 */
export const updateMetaGrupalPhoto = async ({
  metaId,
  fotoUrl,
  fotoFileId,
  oldFotoFileId,
  userId,
  groupId,
}: {
  metaId: string;
  fotoUrl: string;
  fotoFileId: string;
  oldFotoFileId?: string;
  userId: string;
  groupId: string;
}) => {
  try {
    const { database, appWriteConfig } = await import('./config');
    const { Query } = await import('react-native-appwrite');
    
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
      throw new Error('Solo los administradores pueden actualizar la foto');
    }

    // Actualizar la meta con la nueva foto
    const updatedMeta = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaGrupoTableId,
      rowId: metaId,
      data: {
        foto_meta: fotoUrl,
        foto_meta_file_id: fotoFileId,
      },
    });

    // Eliminar la foto anterior si existe
    if (oldFotoFileId) {
      await deleteMetaGrupalPhoto(oldFotoFileId);
    }

    return updatedMeta;
  } catch (e) {
    console.log('Error updating meta photo:', e);
    throw new Error(e as string);
  }
};