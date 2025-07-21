import { create } from 'zustand';

interface VisitorRegistrationState {
  // Submission state
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  
  // Success dialog state
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  
  // Registration data
  registrationData: {
    userId: string;
    visitorId: string;
  } | null;
  setRegistrationData: (data: { userId: string; visitorId: string } | null) => void;
  
  // Actions
  reset: () => void;
}

export const useVisitorRegistrationStore = create<VisitorRegistrationState>((set) => ({
  // Initial state
  isSubmitting: false,
  showSuccessDialog: false,
  registrationData: null,
  
  // Actions
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setShowSuccessDialog: (showSuccessDialog) => set({ showSuccessDialog }),
  setRegistrationData: (registrationData) => set({ registrationData }),
  
  // Reset all state
  reset: () => set({
    isSubmitting: false,
    showSuccessDialog: false,
    registrationData: null,
  }),
}));