// Re-export from types for backward compatibility and centralized schema management
export {
  conferenceRegistrationSchema,
  type ConferenceRegistrationFormData,
  defaultConferenceRegistrationValues as defaultValues,
  conferenceInterestAreasOptions,
  maritimeLeagueMembershipOptions,
  genderOptions,
  ageBracketOptions,
  conferenceFormSteps,
  calculateConferencePrice,
  BLUE_RUNWAY_PRICE,
  BOAT_SHOW_PRICE,
  type ConferenceFormStep
} from "@/types/conference/registration";