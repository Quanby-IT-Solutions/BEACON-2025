// Zustand store for conference registration form state management
// Similar to visitor registration but adapted for conference specific needs

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConferenceRegistrationFormData, ConferenceFormStep } from '@/types/conference/registration';

interface ConferenceRegistrationStore {
  // Form state
  formData: Partial<ConferenceRegistrationFormData>;
  currentStep: ConferenceFormStep;
  completedSteps: ConferenceFormStep[];
  isFormDirty: boolean;

  // Selected events tracking
  selectedEvents: Array<{ id: string; name: string; price: number }>;
  totalAmount: number;

  // Actions
  updateFormData: (data: Partial<ConferenceRegistrationFormData>) => void;
  setCurrentStep: (step: ConferenceFormStep) => void;
  setCompletedSteps: (steps: ConferenceFormStep[]) => void;
  markStepCompleted: (step: ConferenceFormStep) => void;
  setFormDirty: (dirty: boolean) => void;
  clearFormData: () => void;

  // Event selection actions
  updateSelectedEvents: (events: Array<{ id: string; name: string; price: number }>) => void;
  calculateTotalAmount: () => void;

  // Draft saving for better UX
  saveDraft: () => void;
  loadDraft: () => Partial<ConferenceRegistrationFormData>;
  hasDraft: boolean;

  // Payment state
  requiresPayment: boolean;
  setRequiresPayment: (requires: boolean) => void;

  // TML Code validation state
  tmlCodeValidationState: {
    isValid: boolean;
    isRequired: boolean;
  };
  setTmlCodeValidationState: (state: { isValid: boolean; isRequired: boolean }) => void;
}

export const useConferenceRegistrationStore = create<ConferenceRegistrationStore>()(
  persist(
    (set, get) => ({
      formData: {},
      currentStep: 'membership',
      completedSteps: [],
      isFormDirty: false,
      hasDraft: false,
      selectedEvents: [],
      totalAmount: 0,
      requiresPayment: false,
      tmlCodeValidationState: {
        isValid: true,
        isRequired: false,
      },

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isFormDirty: true,
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      setCompletedSteps: (steps) => set({ completedSteps: steps }),

      markStepCompleted: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      setFormDirty: (dirty) => set({ isFormDirty: dirty }),

      clearFormData: () =>
        set({
          formData: {},
          isFormDirty: false,
          hasDraft: false,
          currentStep: 'membership',
          completedSteps: [],
          selectedEvents: [],
          totalAmount: 0,
          requiresPayment: false,
          tmlCodeValidationState: {
            isValid: true,
            isRequired: false,
          },
        }),

      updateSelectedEvents: (events) => {
        set({ selectedEvents: events });
        get().calculateTotalAmount();
      },

      calculateTotalAmount: () => {
        const { selectedEvents, formData } = get();
        let total = selectedEvents.reduce((sum, event) => sum + event.price, 0);

        // Apply conference discount if all 3 conference events are selected
        // Note: This assumes we need to check event types, but we don't have access to event status here
        // The discount will be applied in the EventSelection component and passed via updateSelectedEvents

        // Add custom payment amount if provided
        if (formData.customPaymentAmount) {
          const customAmount = parseFloat(formData.customPaymentAmount);
          if (!isNaN(customAmount)) {
            total += customAmount;
          }
        }

        set({
          totalAmount: total,
          formData: { ...formData, totalPaymentAmount: total }
        });
      },

      setRequiresPayment: (requires) => set({ requiresPayment: requires }),

      setTmlCodeValidationState: (state) => set({ tmlCodeValidationState: state }),

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
      name: 'conference-registration-draft',
      // Only persist certain fields for privacy
      partialize: (state) => ({
        formData: state.formData,
        hasDraft: state.hasDraft,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        selectedEvents: state.selectedEvents,
        totalAmount: state.totalAmount,
        tmlCodeValidationState: state.tmlCodeValidationState,
      }),
    }
  )
);

// Hook for auto-saving conference registration form data
export const useAutoSaveConferenceRegistration = () => {
  const { updateFormData, saveDraft } = useConferenceRegistrationStore();

  const autoSave = (data: Partial<ConferenceRegistrationFormData>) => {
    updateFormData(data);
    // Debounced save could be added here
    setTimeout(() => saveDraft(), 1000);
  };

  return { autoSave };
};

// Hook for step navigation helpers
export const useConferenceFormNavigation = () => {
  const {
    currentStep,
    setCurrentStep,
    completedSteps,
    markStepCompleted
  } = useConferenceRegistrationStore();

  const steps: ConferenceFormStep[] = [
    'membership',
    'events',
    'personal',
    'contact',
    'professional',
    'interests',
    'payment',
    'consent',
    'review'
  ];

  const currentStepIndex = steps.indexOf(currentStep);
  const canGoNext = currentStepIndex < steps.length - 1;
  const canGoPrev = currentStepIndex > 0;

  const goToNextStep = () => {
    if (canGoNext) {
      markStepCompleted(currentStep);
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const goToPrevStep = () => {
    if (canGoPrev) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const goToStep = (step: ConferenceFormStep) => {
    setCurrentStep(step);
  };

  const isStepCompleted = (step: ConferenceFormStep) => {
    return completedSteps.includes(step);
  };

  const getStepProgress = () => {
    return (completedSteps.length / steps.length) * 100;
  };

  return {
    currentStep,
    currentStepIndex,
    steps,
    canGoNext,
    canGoPrev,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isStepCompleted,
    getStepProgress,
    completedSteps,
  };
};