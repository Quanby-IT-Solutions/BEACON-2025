import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppStore {
  // UI State
  sidebarOpen: boolean;
  loading: boolean;
  
  // Notifications
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: Date;
  }>;
  
  // User preferences
  preferences: {
    language: 'en' | 'es' | 'fr';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timezone: string;
  };
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<AppStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updatePreferences: (preferences: Partial<AppStore['preferences']>) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      loading: false,
      notifications: [],
      preferences: {
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      
      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setLoading: (loading) => set({ loading }),
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
    }),
    {
      name: 'beacon-app-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences, not UI state
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);