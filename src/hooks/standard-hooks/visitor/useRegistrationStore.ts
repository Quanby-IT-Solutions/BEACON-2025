// Example Zustand store for form state management (optional)
// You can use this alongside TanStack Query for client-side state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RegistrationFormData } from '@/types/visitor/registration';

interface RegistrationStore {
  // Form state
  formData: Partial<RegistrationFormData>;
  currentStep: number;
  isFormDirty: boolean;

  // Actions
  updateFormData: (data: Partial<RegistrationFormData>) => void;
  setCurrentStep: (step: number) => void;
  setFormDirty: (dirty: boolean) => void;
  clearFormData: () => void;

  // Draft saving for better UX
  saveDraft: () => void;
  loadDraft: () => void;
  hasDraft: boolean;
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      formData: {},
      currentStep: 0,
      isFormDirty: false,
      hasDraft: false,

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isFormDirty: true,
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      setFormDirty: (dirty) => set({ isFormDirty: dirty }),

      clearFormData: () =>
        set({
          formData: {},
          isFormDirty: false,
          hasDraft: false,
          currentStep: 0,
        }),

      saveDraft: () => {
        const { formData } = get();
        if (Object.keys(formData).length > 0) {
          set({ hasDraft: true });
          // The persist middleware will handle saving to localStorage
        }
      },

      loadDraft: () => {
        // Data is automatically loaded by persist middleware
        const { formData } = get();
        return formData;
      },
    }),
    {
      name: 'registration-draft',
      // Only persist certain fields for privacy
      partialize: (state) => ({
        formData: state.formData,
        hasDraft: state.hasDraft,
        currentStep: state.currentStep,
      }),
    }
  )
);

// Hook for auto-saving form data (optional enhancement)
export const useAutoSaveRegistration = () => {
  const { updateFormData, saveDraft } = useRegistrationStore();

  const autoSave = (data: Partial<RegistrationFormData>) => {
    updateFormData(data);
    // Debounced save could be added here
    setTimeout(() => saveDraft(), 1000);
  };

  return { autoSave };
};