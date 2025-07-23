import { AgeBracket, ConferenceInterestArea, Gender, MaritimeLeagueMembership } from "@prisma/client";
import { z } from "zod";

// Base schema that matches the corrected Prisma schema structure
export const baseConferenceSchema = z.object({
  // Form-only fields (not stored in any model directly)
  selectedEventIds: z.array(z.string()).default([]),
  faceScannedUrl: z.string().default(""),

  // UserDetails fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().nullable(),
  suffix: z.string().optional().nullable(),
  preferredName: z.string().optional().nullable(),
  gender: z.nativeEnum(Gender),
  genderOthers: z.string().optional().nullable(),
  ageBracket: z.nativeEnum(AgeBracket),
  nationality: z.string().min(1, "Nationality is required"),

  // UserAccounts fields
  email: z.string().email("Invalid email format"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  mailingAddress: z.string().optional().nullable(),

  // Conference model fields
  isMaritimeLeagueMember: z.nativeEnum(MaritimeLeagueMembership),
  tmlMemberCode: z.string().optional().nullable(),

  // Section 4: Professional Information
  jobTitle: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  companyWebsite: z.string().url("Invalid website URL").optional().nullable().or(z.literal("")),

  // Section 5: Areas of Interest (matches Prisma schema)
  interestAreas: z.array(z.nativeEnum(ConferenceInterestArea)).min(1, "Select at least one interest area"),
  otherInterests: z.string().optional().nullable(),
  receiveEventInvites: z.boolean().default(false),

  // Section 6: Payment Details
  totalPaymentAmount: z.number().optional().nullable(),
  customPaymentAmount: z.string().optional().nullable(),
  paymentMode: z.enum(['BANK_DEPOSIT_TRANSFER', 'GCASH', 'WALK_IN_ON_SITE']).optional().nullable(),

  // Section 7: Consent & Confirmation
  emailCertificate: z.boolean().default(false),
  photoVideoConsent: z.boolean().default(false),
  dataUsageConsent: z.boolean().refine(val => val === true, "Data usage consent is required"),
});

// Conference registration schema with conditional validation
export const conferenceRegistrationSchema = baseConferenceSchema
  .refine((data) => {
    // Validate selected events
    if (!data.selectedEventIds || data.selectedEventIds.length === 0) {
      return false;
    }
    return true;
  }, {
    message: "Select at least one event to attend",
    path: ["selectedEventIds"],
  })
  .refine((data) => {
    // If maritime league member is YES, TML member code is required
    if (data.isMaritimeLeagueMember === MaritimeLeagueMembership.YES) {
      return data.tmlMemberCode && data.tmlMemberCode.trim().length > 0;
    }
    return true;
  }, {
    message: "TML Member Code is required for existing members",
    path: ["tmlMemberCode"],
  })
  .refine((data) => {
    // Face capture is required
    if (!data.faceScannedUrl || data.faceScannedUrl.trim().length === 0) {
      return false;
    }
    return true;
  }, {
    message: "Face capture is required for registration",
    path: ["faceScannedUrl"],
  })
  .refine((data) => {
    // If custom payment amount is provided, validate it's a valid number
    if (data.customPaymentAmount) {
      const amount = parseFloat(data.customPaymentAmount);
      return !isNaN(amount) && amount > 0;
    }
    return true;
  }, {
    message: "Custom payment amount must be a valid positive number",
    path: ["customPaymentAmount"],
  })
  .refine((data) => {
    // If website is provided, validate URL format
    if (data.companyWebsite && data.companyWebsite.trim() !== "") {
      try {
        new URL(data.companyWebsite);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }, {
    message: "Please provide a valid website URL",
    path: ["companyWebsite"],
  });

export type ConferenceRegistrationFormData = z.infer<typeof conferenceRegistrationSchema>;

// Default values for conference registration form
export const defaultConferenceRegistrationValues: ConferenceRegistrationFormData = {
  // Form-only fields
  selectedEventIds: [],
  faceScannedUrl: "",

  // UserDetails fields
  firstName: "Aj",
  lastName: "Comahes",
  middleName: null,
  suffix: null,
  preferredName: null,
  gender: Gender.MALE,
  genderOthers: null,
  ageBracket: AgeBracket.AGE_25_34,
  nationality: "Filipino",

  // UserAccounts fields
  email: "ajcomahes@gmail.com",
  mobileNumber: "09999999999",
  mailingAddress: '123 Main St, City, Country',

  // Conference fields
  isMaritimeLeagueMember: MaritimeLeagueMembership.NO,
  tmlMemberCode: null,

  // Professional Information
  jobTitle: "Software Engineer",
  companyName: "Tech Solutions Inc.",
  industry: "Information Technology",
  companyAddress: "456 Tech Park, Silicon Valley, CA",
  companyWebsite: "https://www.techsolutions.com",

  // Areas of Interest
  interestAreas: ["SHIPBUILDING_SHIP_REPAIR", "MARINE_TECHNOLOGY"],
  otherInterests: null,
  receiveEventInvites: false,

  // Payment Details
  totalPaymentAmount: null,
  customPaymentAmount: null,
  paymentMode: null,

  // Consent & Confirmation
  emailCertificate: false,
  photoVideoConsent: false,
  dataUsageConsent: false,

};

// Conference Interest Areas options for UI
export const conferenceInterestAreasOptions = [
  { value: ConferenceInterestArea.SHIPBUILDING_SHIP_REPAIR, label: "Shipbuilding & Ship Repair" },
  { value: ConferenceInterestArea.BOATBUILDING_YACHT_BUILDING, label: "Boatbuilding & Yacht Building" },
  { value: ConferenceInterestArea.MARINE_TECHNOLOGY, label: "Marine Technology" },
  { value: ConferenceInterestArea.NAVAL_DEFENSE_SECURITY, label: "Naval Defense & Security" },
  { value: ConferenceInterestArea.MARITIME_TOURISM, label: "Maritime Tourism" },
  { value: ConferenceInterestArea.INNOVATION_SUSTAINABILITY, label: "Innovation & Sustainability" },
  { value: ConferenceInterestArea.BLUE_ECONOMY, label: "Blue Economy" },
  { value: ConferenceInterestArea.LIFESTYLE_FASHION, label: "Lifestyle & Fashion" },
  { value: ConferenceInterestArea.WOMEN_YOUTH_IN_MARITIME, label: "Women & Youth in Maritime" },
  { value: ConferenceInterestArea.OTHERS, label: "Others" },
] as const;

// Maritime League Membership options for UI
export const maritimeLeagueMembershipOptions = [
  { value: MaritimeLeagueMembership.YES, label: "Yes, I'm already a member" },
  { value: MaritimeLeagueMembership.NO, label: "No" },

] as const;

// Gender options for UI
export const genderOptions = [
  { value: Gender.MALE, label: "Male" },
  { value: Gender.FEMALE, label: "Female" },
  { value: Gender.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
  { value: Gender.OTHERS, label: "Others" },
] as const;

// Age Bracket options for UI
export const ageBracketOptions = [
  { value: AgeBracket.UNDER_18, label: "Under 18" },
  { value: AgeBracket.AGE_18_24, label: "18-24" },
  { value: AgeBracket.AGE_25_34, label: "25-34" },
  { value: AgeBracket.AGE_35_44, label: "35-44" },
  { value: AgeBracket.AGE_45_54, label: "45-54" },
  { value: AgeBracket.AGE_55_ABOVE, label: "55 and above" },
] as const;

// Payment calculation helpers
export const calculateConferencePrice = (duration: 'ONE_DAY' | 'TWO_DAYS' | 'THREE_DAYS'): number => {
  switch (duration) {
    case 'ONE_DAY': return 3000;
    case 'TWO_DAYS': return 6000;
    case 'THREE_DAYS': return 7500;
    default: return 0;
  }
};

export const BLUE_RUNWAY_PRICE = 2000;
export const BOAT_SHOW_PRICE = 0; // FREE

// Form step types for multi-step form
export type ConferenceFormStep =
  | 'membership'
  | 'events'
  | 'personal'
  | 'contact'
  | 'professional'
  | 'interests'
  | 'payment'
  | 'consent'
  | 'review';

export const conferenceFormSteps: { step: ConferenceFormStep; title: string; description: string }[] = [
  { step: 'membership', title: 'Maritime League Membership', description: 'Membership information' },
  { step: 'events', title: 'Event Selection', description: 'Select events to attend' },
  { step: 'personal', title: 'Personal Information', description: 'Basic personal details' },
  { step: 'contact', title: 'Contact Details', description: 'Email and contact information' },
  { step: 'professional', title: 'Professional Information', description: 'Work and company details' },
  { step: 'interests', title: 'Areas of Interest', description: 'Conference topics of interest' },
  { step: 'payment', title: 'Payment Details', description: 'Payment information and amounts' },
  { step: 'consent', title: 'Consent & Confirmation', description: 'Terms and agreements' },
  { step: 'review', title: 'Review & Submit', description: 'Review your information' },
];