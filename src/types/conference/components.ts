// Component prop types for conference registration
import { UseFormReturn } from "react-hook-form";
import { ConferenceRegistrationFormData } from "./registration";

// Base interface for all conference form components
export interface ConferenceFormComponentProps {
  form: UseFormReturn<ConferenceRegistrationFormData>;
}

// Specific component prop interfaces
export interface MaritimeMembershipProps extends ConferenceFormComponentProps {}
export interface EventSelectionProps extends ConferenceFormComponentProps {}
export interface PersonalInformationProps extends ConferenceFormComponentProps {}
export interface ContactDetailsProps extends ConferenceFormComponentProps {}
export interface ProfessionalInformationProps extends ConferenceFormComponentProps {}
export interface InterestsAndPreferencesProps extends ConferenceFormComponentProps {}
export interface ConsentAndConfirmationProps extends ConferenceFormComponentProps {}
export interface RegistrationSummaryProps extends ConferenceFormComponentProps {}
export interface PaymentDetailsProps extends ConferenceFormComponentProps {}
export interface ConferenceRegistrationProgressProps extends ConferenceFormComponentProps {}
export interface ConferenceDraftManagerProps extends ConferenceFormComponentProps {}