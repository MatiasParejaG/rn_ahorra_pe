import { CreateUserPrams, SignInParams } from '@/types/type';
import { ID } from 'react-native-appwrite';
import { account, appWriteConfig, avatars, database } from './config';
import { generateUserTag } from './user.service';


/**
 * Crea una nueva cuenta de usuario
 */
export const createUser = async ({
  email,
  password,
  name,
}: CreateUserPrams) => {
  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email: email,
      password: password,
      name: name,
    });
    console.log(newAccount);
    if (!newAccount) throw Error;

    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);
    const userTag = await generateUserTag(name);

    return await database.createRow({
      databaseId: appWriteConfig.databaseId,
      tableId: appWriteConfig.userTableId,
      rowId: ID.unique(),
      data: {
        accountId: newAccount.$id,
        email: email,
        name: name,
        avatar: avatarUrl,
        avatar_file_id: '', 
        tag: userTag,
        initial_setup: false,
      },
    });
  } catch (e) {
    throw new Error(e as string);
  }
};

/**
 * Inicia sesión con email y contraseña
 */
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    try {
      await account.deleteSession({
        sessionId: 'current'
      });
    } catch (e) {
      console.log('No existing session to delete');
    }

    const session = await account.createEmailPasswordSession({
      email: email,
      password: password,
    });
    return session;
  } catch (e) {
    throw new Error(e as string);
  }
};

/**
 * Obtiene la sesión actual
 */
export const getCurrentSession = async () => {
  try {
    const session = await account.getSession({
      sessionId: 'current'
    });
    return session;
  } catch (e) {
    console.log('No active session', e);
    return null;
  }
};

/**
 * Cierra la sesión actual
 */
export const logOut = async () => {
  try {
    await account.deleteSession({
      sessionId: 'current'
    });
  } catch (e) {
    console.log('Error deleting session:', e);
  }
};