import { ID, Query } from 'react-native-appwrite';
import { appWriteConfig, database, storage } from './config';

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
 * Sube una foto de un grupo 
 */
export const uploadGrupoPhoto = async (fileUri: string, groupID: string) => {
  try {
    const fileName = `grupo_${groupID}_${Date.now()}.jpg`;

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
      file as any,
    )
    
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
}

/**
 * Actualiza la foto de un grupo
 */
export const updateGrupoPhoto = async ({
  groupId,
  fotoUrl,
  fotoFileId,
  oldFotoFileId,
  userId,  
}: {
  groupId: string;
  fotoUrl: string;
  fotoFileId: string;
  oldFotoFileId?: string;
  userId: string;
}) => {
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
      throw new Error('Solo los administradores pueden actualizar la foto');
    }

    // Actualizar el grupo con la nueva foto
    const updatedGrupo = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.grupoTableId,
      rowId: groupId,
      data: {
        foto_grupo: fotoUrl,
        foto_grupo_file_id: fotoFileId,
      },
    });

    // Eliminar la foto anterior si existe
    if (oldFotoFileId) {
      await deletePhoto(oldFotoFileId);
    }

    return updatedGrupo;
  } catch (e) {
    console.log('Error updating group photo:', e);
    throw new Error(e as string);
  }
}

/**
 * Sube una foto de meta (grupal o personal) 
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
 * Elimina una foto 
 */
export const deletePhoto = async (fileId: string) => {
  try {
    await storage.deleteFile({
      bucketId: appWriteConfig.storageBucketId,
      fileId: fileId,
    });
    return true;
  } catch (e) {
    console.log('Error deleting photo:', e);
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
      await deletePhoto(oldFotoFileId);
    }

    return updatedMeta;
  } catch (e) {
    console.log('Error updating meta photo:', e);
    throw new Error(e as string);
  }
};

/**
 * Actualiza la foto de una meta personal
 */

export const updateMetaPhoto = async ({
  metaId,
  fotoUrl,
  fotoFileId,
  oldFotoFileId,
  userId,
}: {
  metaId: string;
  fotoUrl: string;
  fotoFileId: string;
  oldFotoFileId?: string;
  userId: string;
}) => {
  try {
     
    // Actualizar la meta con la nueva foto
    const updatedMeta = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.metaTableId,
      rowId: metaId,
      data: {
        foto_meta: fotoUrl,
        foto_meta_file_id: fotoFileId,
      },
    });

    // Eliminar foto anterior si esxiste

    if (oldFotoFileId) {
      await deletePhoto(oldFotoFileId)
    }

    return updatedMeta;
  } catch (e) {
    console.log('Error updating meta photo:', e);
    throw new Error(e as string);
  }
};