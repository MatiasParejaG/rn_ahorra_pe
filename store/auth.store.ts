import { getCurrentUser, getUserAccount, getUserAlcancia, getUserGrupos, getUserInvitaciones, getUserMetas } from '@/lib/appwrite/index';
import { Alcancia, Grupo, Invitacion, Meta, User, UserAccount } from '@/types/type';
import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    userAccount: UserAccount | null;
    userMetas: Meta[];
    userGrupos: Grupo[];
    userInvitaciones: Invitacion[];
    userAlcancia: Alcancia | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setUserAccount: (account: UserAccount | null) => void;
    setUserMetas: (metas: Meta[]) => void;
    setUserGrupos: (grupos: Grupo[]) => void;
    setUserInvitaciones: (invitaciones: Invitacion[]) => void;
    setUserAlcancia: (alcancia: Alcancia | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
    fetchUserInvitaciones: () => Promise<void>;
    fetchUserAlcancia: () => Promise<void>;
    logout: () => void;
}

const useAuthBear = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  userAccount: null,
  userMetas: [],
  userGrupos: [],
  userInvitaciones: [],
  userAlcancia: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value}),
  setUser: (user) => set({ user }),
  setUserAccount: (account) => set({ userAccount: account }),
  setUserMetas: (metas) => set({ userMetas: metas }),
  setUserGrupos: (grupos) => set({ userGrupos: grupos }),
  setUserInvitaciones: (invitaciones) => set({ userInvitaciones: invitaciones }),
  setUserAlcancia: (alcancia) => set({ userAlcancia: alcancia }),
  setLoading: (value) => set({ isLoading: value}),

  fetchUserInvitaciones: async () => {
    const { user } = get();
    if (!user?.$id) return;
    
    try {
      const invitaciones = await getUserInvitaciones(user.$id);
      set({ userInvitaciones: invitaciones as Invitacion[] });
    } catch (e) {
      console.log('Error fetching invitaciones:', e);
      set({ userInvitaciones: [] });
    }
  },

  fetchUserAlcancia: async () => {
    const { user } = get();
    if (!user?.$id) return;
    
    try {
      const alcancia = await getUserAlcancia(user.$id);
      set({ userAlcancia: alcancia as Alcancia | null });
    } catch (e) {
      console.log('Error fetching alcancia:', e);
      set({ userAlcancia: null });
    }
  },

  fetchAuthenticatedUser: async() => {
    set({isLoading: true});

    try{
        const user = await getCurrentUser();

        if(user) {
          set({ isAuthenticated: true, user: user as User });
          
          // Si el usuario completó el setup, obtener su cuenta, metas, grupos, invitaciones y alcancía
          if(user.initial_setup) {
            const account = await getUserAccount(user.$id);
            set({ userAccount: account as UserAccount });

            // Obtener las metas del usuario
            const metas = await getUserMetas(user.$id);
            set({ userMetas: metas as Meta[] });

            // Obtener los grupos del usuario
            const grupos = await getUserGrupos(user.$id);
            set({ userGrupos: grupos as Grupo[] });

            // Obtener las invitaciones del usuario
            const invitaciones = await getUserInvitaciones(user.$id);
            set({ userInvitaciones: invitaciones as Invitacion[] });

            // Obtener la alcancía del usuario
            const alcancia = await getUserAlcancia(user.$id);
            set({ userAlcancia: alcancia as Alcancia | null });
          }
        } else {
          set({ 
            isAuthenticated: false, 
            user: null, 
            userAccount: null, 
            userMetas: [], 
            userGrupos: [], 
            userInvitaciones: [],
            userAlcancia: null,
          });
        }
    } catch (e) {
        console.log('fetchAuthenticatedUser error', e);
        set({ 
          isAuthenticated: false, 
          user: null, 
          userAccount: null, 
          userMetas: [], 
          userGrupos: [], 
          userInvitaciones: [],
          userAlcancia: null,
        });
    } finally {
        set({ isLoading: false });
    }
  },

  logout: () => {
    set({ 
      isAuthenticated: false, 
      user: null, 
      userAccount: null, 
      userMetas: [], 
      userGrupos: [], 
      userInvitaciones: [],
      userAlcancia: null,
    });
  }
}))

export default useAuthBear;