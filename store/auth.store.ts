import { getCurrentUser, getUserAccount, getUserGrupos, getUserMetas } from '@/lib/appwrite';
import { Grupo, Meta, User, UserAccount } from '@/types/type';
import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    userAccount: UserAccount | null;
    userMetas: Meta[];
    userGrupos: Grupo[];
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setUserAccount: (account: UserAccount | null) => void;
    setUserMetas: (metas: Meta[]) => void;
    setUserGrupos: (grupos: Grupo[]) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
    logout: () => void;
}

const useAuthBear = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  userAccount: null,
  userMetas: [],
  userGrupos: [],
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value}),
  setUser: (user) => set({ user }),
  setUserAccount: (account) => set({ userAccount: account }),
  setUserMetas: (metas) => set({ userMetas: metas }),
  setUserGrupos: (grupos) => set({ userGrupos: grupos }),
  setLoading: (value) => set({ isLoading: value}),

  fetchAuthenticatedUser: async() => {
    set({isLoading: true});

    try{
        const user = await getCurrentUser();

        if(user) {
          set({ isAuthenticated: true, user: user as User });
          
          // Si el usuario completó el setup, obtener su cuenta, metas y grupos
          if(user.initial_setup) {
            const account = await getUserAccount(user.$id);
            set({ userAccount: account as UserAccount });

            // Obtener las metas del usuario
            const metas = await getUserMetas(user.$id);
            set({ userMetas: metas as Meta[] });

            // Obtener los grupos del usuario
            const grupos = await getUserGrupos(user.$id);
            set({ userGrupos: grupos as Grupo[] });
          }
        } else {
          set( {isAuthenticated: false, user: null, userAccount: null, userMetas: [], userGrupos: []})
        }
    } catch (e) {
        console.log('fetchAuthenticatedUser error', e);
        set({ isAuthenticated: false, user: null, userAccount: null, userMetas: [], userGrupos: []})
    } finally {
        set({ isLoading: false });
    }
  },

  logout: () => {
    set({ isAuthenticated: false, user: null, userAccount: null, userMetas: [], userGrupos: [] });
  }
}))

export default useAuthBear;