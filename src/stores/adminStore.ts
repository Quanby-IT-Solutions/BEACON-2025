import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminUser {
  id: string;
  username: string;
  status: 'SUPERADMIN' | 'ADMIN';
  isActive: boolean;
}

interface AdminStore {
  // Admin state
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  
  // Session management
  sessionToken: string | null;
  tokenExpiry: Date | null;
  
  // Actions
  setAdmin: (admin: AdminUser) => void;
  clearAdmin: () => void;
  setSession: (token: string, expiry: Date) => void;
  clearSession: () => void;
  isSessionValid: () => boolean;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentAdmin: null,
      isAuthenticated: false,
      sessionToken: null,
      tokenExpiry: null,
      
      // Actions
      setAdmin: (admin) =>
        set({
          currentAdmin: admin,
          isAuthenticated: true,
        }),
      
      clearAdmin: () =>
        set({
          currentAdmin: null,
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
          currentAdmin: null,
          isAuthenticated: false,
        }),
      
      isSessionValid: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return false;
        return new Date() < new Date(tokenExpiry);
      },
    }),
    {
      name: 'beacon-admin-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentAdmin: state.currentAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);