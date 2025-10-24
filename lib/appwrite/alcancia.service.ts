import { Query } from 'react-native-appwrite';
import { appWriteConfig, database } from './config';

/**
 * Verifica si un usuario ya tiene una alcancía asociada
 */
export const getUserAlcancia = async (userId: string) => {
  try {
    const alcancias = await database.listRows({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.alcanciaTableId,
      queries: [
        Query.equal("owner_id", userId),
        Query.equal("is_claimed", true),
      ],
    });

    if (alcancias.rows.length === 0) return null;
    return alcancias.rows[0];
  } catch (e) {
    console.log('Error getting user alcancia:', e);
    return null;
  }
};

/**
 * Obtiene una alcancía por su ID
 */
export const getAlcanciaById = async (alcanciaId: string) => {
  try {
    const alcancia = await database.getRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.alcanciaTableId,
      rowId: alcanciaId,
    });

    return alcancia;
  } catch (e) {
    console.log('Error getting alcancia:', e);
    return null;
  }
};

/**
 * Asocia una alcancía a un usuario
 */
export const claimAlcancia = async ({
  alcanciaId,
  userId,
  name,
}: {
  alcanciaId: string;
  userId: string;
  name: string;
}) => {
  try {
    // Verificar que la alcancía existe
    const alcancia = await getAlcanciaById(alcanciaId);
    
    if (!alcancia) {
      throw new Error('Alcancía no encontrada');
    }

    // Verificar que no esté ya reclamada
    if (alcancia.is_claimed) {
      throw new Error('Esta alcancía ya fue reclamada por otro usuario');
    }

    // Verificar que el usuario no tenga ya una alcancía
    const userAlcancia = await getUserAlcancia(userId);
    
    if (userAlcancia) {
      throw new Error('Ya tienes una alcancía asociada');
    }

    // Actualizar la alcancía
    const fechaActivacion = new Date().toISOString();
    
    const updatedAlcancia = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.alcanciaTableId,
      rowId: alcanciaId,
      data: {
        is_claimed: true,
        name: name.trim(),
        fecha_activacion: fechaActivacion,
        owner_id: userId,
      },
    });

    return updatedAlcancia;
  } catch (e) {
    console.log('Error claiming alcancia:', e);
    throw new Error(e as string);
  }
};

/**
 * Actualiza el nombre de la alcancía
 */
export const updateAlcanciaName = async ({
  alcanciaId,
  userId,
  newName,
}: {
  alcanciaId: string;
  userId: string;
  newName: string;
}) => {
  try {
    // Verificar que la alcancía pertenece al usuario
    const alcancia = await getAlcanciaById(alcanciaId);
    
    if (!alcancia) {
      throw new Error('Alcancía no encontrada');
    }

    if (alcancia.owner_id !== userId) {
      throw new Error('No tienes permiso para modificar esta alcancía');
    }

    // Actualizar el nombre
    const updatedAlcancia = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.alcanciaTableId,
      rowId: alcanciaId,
      data: {
        name: newName.trim(),
      },
    });

    return updatedAlcancia;
  } catch (e) {
    console.log('Error updating alcancia name:', e);
    throw new Error(e as string);
  }
};

/**
 * Desvincula una alcancía de un usuario
 */
export const unclaimAlcancia = async ({
  alcanciaId,
  userId,
}: {
  alcanciaId: string;
  userId: string;
}) => {
  try {
    // Verificar que la alcancía pertenece al usuario
    const alcancia = await getAlcanciaById(alcanciaId);
    
    if (!alcancia) {
      throw new Error('Alcancía no encontrada');
    }

    if (alcancia.owner_id !== userId) {
      throw new Error('No tienes permiso para desvincular esta alcancía');
    }

    // Resetear la alcancía
    const updatedAlcancia = await database.updateRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.alcanciaTableId,
      rowId: alcanciaId,
      data: {
        is_claimed: false,
        name: '',
        fecha_activacion: null,
        owner_id: null,
      },
    });

    return updatedAlcancia;
  } catch (e) {
    console.log('Error unclaiming alcancia:', e);
    throw new Error(e as string);
  }
};