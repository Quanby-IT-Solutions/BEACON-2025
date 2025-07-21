import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  isVerified: boolean;
}

interface UserStore {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Session management
  sessionToken: string | null;
  tokenExpiry: Date | null;
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setSession: (token: string, expiry: Date) => void;
  clearSession: () => void;
  isSessionValid: () => boolean;
  
  // User profile actions
  updateProfile: (updates: Partial<Omit<User, 'id'>>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      sessionToken: null,
      tokenExpiry: null,
      
      // Actions
      setUser: (user) =>
        set({
          currentUser: user,
          isAuthenticated: true,
        }),
      
      clearUser: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
        }),
      
      setSession: (token, expiry) =>
        set({
          sessionToken: token,
          tokenExpiry: expiry,
        }),
      
      clearSession: () =>
        set({
          sessionToken: null,
          tokenExpiry: null,
          currentUser: null,
          isAuthenticated: false,
        }),
      
      isSessionValid: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return false;
        return new Date() < new Date(tokenExpiry);
      },
      
      updateProfile: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),
    }),
    {
      name: 'beacon-user-store',
      storage: createJSONStorage(() => localStorage),
      // Be careful with sensitive data - consider sessionStorage or not persisting tokens
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        // Note: In production, consider not persisting session tokens in localStorage
        // sessionToken: state.sessionToken,
        // tokenExpiry: state.tokenExpiry,
      }),
    }
  )
);