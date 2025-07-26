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
  forceLogout: () => void;
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
        const { tokenExpiry, sessionToken, isAuthenticated } = get();
        
        // If not authenticated or no token, return false
        if (!isAuthenticated || !sessionToken || !tokenExpiry) {
          return false;
        }
        
        // Check if token is expired
        const isExpired = new Date() >= new Date(tokenExpiry);
        
        // If expired, automatically clear the session
        if (isExpired) {
          console.log('🔒 Session expired, clearing authentication state');
          set({
            sessionToken: null,
            tokenExpiry: null,
            currentAdmin: null,
            isAuthenticated: false,
          });
          return false;
        }
        
        return true;
      },
      
      forceLogout: () => {
        console.log('🚪 Force logout: Clearing all authentication data');
        // Clear the store state
        set({
          sessionToken: null,
          tokenExpiry: null,
          currentAdmin: null,
          isAuthenticated: false,
        });
        
        // Clear localStorage manually as a backup
        try {
          localStorage.removeItem('beacon-admin-store');
          console.log('✅ Force logout: localStorage cleared');
        } catch (error) {
          console.error('❌ Error clearing localStorage:', error);
        }
      },
    }),
    {
      name: 'beacon-admin-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentAdmin: state.currentAdmin,
        isAuthenticated: state.isAuthenticated,
        sessionToken: state.sessionToken,
        tokenExpiry: state.tokenExpiry,
      }),
    }
  )
);