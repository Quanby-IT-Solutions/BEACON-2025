import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { RegistrationFormData } from '@/types/visitor/registration';

interface RegistrationStore {
  // Form state
  formData: Partial<RegistrationFormData>;
  currentStep: number;
  isFormDirty: boolean;
  completedSteps: Set<number>;
  
  // Progress tracking
  progress: number;
  
  // Actions
  updateFormData: (data: Partial<RegistrationFormData>) => void;
  setCurrentStep: (step: number) => void;
  setFormDirty: (dirty: boolean) => void;
  markStepCompleted: (step: number) => void;
  clearFormData: () => void;
  updateProgress: (progress: number, currentStep: number, completedSteps: number) => void;

  // Draft management
  saveDraft: () => void;
  loadDraft: () => Partial<RegistrationFormData>;
  clearDraft: () => void;
  hasDraft: boolean;

  // Form validation helpers
  isStepValid: (step: number) => boolean;
  getProgress: () => number;
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      formData: {},
      currentStep: 0,
      isFormDirty: false,
      completedSteps: new Set(),
      hasDraft: false,
      progress: 0,

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isFormDirty: true,
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      setFormDirty: (dirty) => set({ isFormDirty: dirty }),

      markStepCompleted: (step) =>
        set((state) => ({
          completedSteps: new Set(state.completedSteps).add(step),
        })),

      updateProgress: (progress, currentStep, completedSteps) => 
        set({ progress, currentStep }),

      clearFormData: () =>
        set({
          formData: {},
          isFormDirty: false,
          hasDraft: false,
          currentStep: 0,
          completedSteps: new Set(),
          progress: 0,
        }),

      saveDraft: () => {
        const { formData } = get();
        if (Object.keys(formData).length > 0) {
          set({ hasDraft: true });
          // The persist middleware automatically saves to storage
        }
      },

      loadDraft: () => {
        const { formData } = get();
        return formData;
      },

      clearDraft: () =>
        set({
          formData: {},
          hasDraft: false,
          isFormDirty: false,
        }),

      isStepValid: (step) => {
        const { completedSteps } = get();
        return completedSteps.has(step);
      },

      getProgress: () => {
        const { completedSteps } = get();
        const totalSteps = 6; // Adjust based on your form steps
        return (completedSteps.size / totalSteps) * 100;
      },
    }),
    {
      name: 'beacon-registration-draft',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields for privacy and performance
      partialize: (state) => ({
        formData: state.formData,
        hasDraft: state.hasDraft,
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps), // Convert Set to Array for serialization
      }),
      // Handle Set serialization/deserialization
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.completedSteps)) {
          state.completedSteps = new Set(state.completedSteps);
        }
      },
    }
  )
);

// Hook for auto-saving form data with debouncing
export const useAutoSaveRegistration = () => {
  const { updateFormData, saveDraft } = useRegistrationStore();

  const autoSave = (data: Partial<RegistrationFormData>) => {
    updateFormData(data);

    // Debounced save to avoid too many localStorage writes
    const timeoutId = setTimeout(() => saveDraft(), 1000);

    return () => clearTimeout(timeoutId);
  };

  return { autoSave };
};