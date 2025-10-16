import { getCurrentUser, getUserAccount } from '@/lib/appwrite';
import { User, UserAccount } from '@/types/type';
import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    userAccount: UserAccount | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setUserAccount: (account: UserAccount | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
    logout: () => void;
}

const useAuthBear = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  userAccount: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value}),
  setUser: (user) => set({ user }),
  setUserAccount: (account) => set({ userAccount: account }),
  setLoading: (value) => set({ isLoading: value}),

  fetchAuthenticatedUser: async() => {
    set({isLoading: true});

    try{
        const user = await getCurrentUser();

        if(user) {
          set({ isAuthenticated: true, user: user as User });
          
          // Si el usuario completó el setup, obtener su cuenta
          if(user.initial_setup) {
            const account = await getUserAccount(user.$id);
            set({ userAccount: account as UserAccount });
          }
        } else {
          set( {isAuthenticated: false, user: null, userAccount: null})
        }
    } catch (e) {
        console.log('fetchAuthenticatedUser error', e);
        set({ isAuthenticated: false, user: null, userAccount: null})
    } finally {
        set({ isLoading: false });
    }
  },

  logout: () => {
    set({ isAuthenticated: false, user: null, userAccount: null });
  }
}))

export default useAuthBear;