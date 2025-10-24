/**
 * Punto de entrada centralizado para todos los servicios de Appwrite
 * Exporta todas las funciones organizadas por módulo
 */

// Config
export { account, appWriteConfig, avatars, client, database, storage } from './config';

// Auth Service
export {
    createUser, getCurrentSession,
    logOut, signIn
} from './auth.service';

// User Service
export {
    findUserByTag, generateUserTag, getCurrentUser, getUserStats, updateUserProfile
} from './user.service';

// Account Service
export {
    createUserAccount,
    getUserAccount
} from './account.service';

// Transaction Service
export {
    createTransaction,
    getAccountTransactions
} from './transaction.service';

// Meta Service
export {
    addFundsToMeta, createMeta, deleteMeta, getUserMetas
} from './meta.service';

// Grupo Service
export {
    createGrupo, deleteGrupo, findGrupoByTag, getGrupoMembers, getUserGrupos, joinGrupo, leaveGrupo, updateGrupo,
    updateMemberRole
} from './grupo.service';

// Meta Grupal Service
export {
    createMetaGrupal, deleteMetaGrupal, getGrupoMetas,
    getMetaGrupalDetails,
    registrarAporteMetaGrupal,
    updateMetaGrupal
} from './metaGrupal.service';

// Invitacion Service
export {
    acceptInvitacion, createInvitacion,
    getUserInvitaciones, rejectInvitacion
} from './invitacion.service';

// Storage Service
export {
    deleteAvatar, deleteMetaGrupalPhoto,
    updateMetaGrupalPhoto, uploadAvatar, uploadMetaGrupalPhoto
} from './storage.service';

