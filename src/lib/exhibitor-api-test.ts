// Test utility for exhibitor API - This file can be used for testing API endpoints
// Run this file with: npx ts-node -r tsconfig-paths/register src/lib/exhibitor-api-test.ts

import { ExhibitorRegistrationFormData } from '@/types/exhibitor/registration';
import { 
  IndustrySector, 
  ParticipationType, 
  BoothSize, 
  YesNoMaybe, 
  GoalType, 
  ConfirmIntent,
  Gender,
  AgeBracket 
} from '@prisma/client';

// Sample exhibitor registration data for testing
export const sampleExhibitorData: ExhibitorRegistrationFormData = {
  // Form-only fields
  faceScannedUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD...", // Sample base64

  // user_details fields
  firstName: "John",
  lastName: "Smith",
  middleName: "Michael",
  suffix: "Jr.",
  preferredName: "Johnny",
  gender: Gender.MALE,
  genderOthers: null,
  ageBracket: AgeBracket.AGE_35_44,
  nationality: "American",

  // user_accounts fields
  email: "john.smith@maritime-company.com",
  mobileNumber: "+1234567890",
  mailingAddress: "123 Maritime Street, Port City, USA",
  landline: "+1987654321",

  // Company Information
  companyName: "Maritime Solutions Inc.",
  businessRegistrationName: "Maritime Solutions Incorporated",
  industrySector: IndustrySector.MARITIME_EQUIPMENT_TECHNOLOGY,
  industrySectorOthers: null,
  companyAddress: "456 Ocean Drive, Maritime District, Port City",
  companyWebsite: "https://www.maritime-solutions.com",
  companyProfile: "Leading provider of maritime technology solutions with over 20 years of experience in the industry.",

  // Exhibition Package & Preferences
  participationTypes: [ParticipationType.INDOOR_BOOTH, ParticipationType.PRODUCT_LAUNCH],
  boothSize: BoothSize.SIZE_3X3,
  boothDescription: "Interactive display showcasing our latest maritime navigation systems with live demonstrations.",
  launchNewProduct: YesNoMaybe.YES,
  requireDemoArea: YesNoMaybe.YES,

  // Logistics & Marketing Coordination
  bringLargeEquipment: YesNoMaybe.NO,
  haveMarketingCollaterals: "yes_have_collaterals",
  logoUrl: null,

  // Company Objectives & Collaboration
  goals: [GoalType.SHOWCASE_PRODUCTS, GoalType.MEET_BUYERS, GoalType.PROMOTE_BRAND],
  goalsOthers: null,
  exploreSponsorship: YesNoMaybe.MAYBE,

  // Confirmation & Next Steps
  confirmIntent: ConfirmIntent.YES_RESERVE,
  letterOfIntentUrl: null,
  additionalComments: "Looking forward to participating in BEACON 2025 and showcasing our innovative maritime solutions.",
};

// Test function to validate exhibitor data structure
export const validateExhibitorData = (data: ExhibitorRegistrationFormData): boolean => {
  try {
    // Check required fields
    const requiredFields = [
      'firstName', 'lastName', 'nationality', 'email', 'mobileNumber',
      'companyName', 'industrySector', 'participationTypes', 'boothDescription',
      'goals', 'confirmIntent', 'faceScannedUrl'
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof ExhibitorRegistrationFormData]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Check array fields
    if (!Array.isArray(data.participationTypes) || data.participationTypes.length === 0) {
      console.error('participationTypes must be a non-empty array');
      return false;
    }

    if (!Array.isArray(data.goals) || data.goals.length === 0) {
      console.error('goals must be a non-empty array');
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.error('Invalid email format');
      return false;
    }

    // Check website URL if provided
    if (data.companyWebsite && data.companyWebsite.trim() !== "") {
      try {
        new URL(data.companyWebsite);
      } catch {
        console.error('Invalid website URL');
        return false;
      }
    }

    console.log('✅ Exhibitor data validation passed');
    return true;
  } catch (error) {
    console.error('❌ Exhibitor data validation failed:', error);
    return false;
  }
};

// Test function to simulate FormData creation
export const createFormDataFromExhibitorData = (data: ExhibitorRegistrationFormData): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Handle arrays (participationTypes, goals)
      formData.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      // Handle all other fields
      formData.append(key, String(value));
    }
  });

  return formData;
};

// Example usage function
export const testExhibitorAPI = async () => {
  console.log('🚀 Testing Exhibitor API...');
  
  // Validate sample data
  const isValid = validateExhibitorData(sampleExhibitorData);
  if (!isValid) {
    console.error('❌ Sample data validation failed');
    return;
  }

  // Create FormData
  const formData = createFormDataFromExhibitorData(sampleExhibitorData);
  console.log('📝 FormData created successfully');

  // Log FormData contents for debugging
  console.log('📋 FormData contents:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }

  console.log('✅ Exhibitor API test setup completed');
  console.log('💡 You can now use this data to test the actual API endpoint at /api/exhibitors');
};

// Run test if this file is executed directly
if (require.main === module) {
  testExhibitorAPI();
}