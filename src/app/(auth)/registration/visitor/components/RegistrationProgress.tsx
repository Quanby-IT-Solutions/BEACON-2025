import { Progress } from "@/components/ui/progress";
import { UseFormReturn } from "react-hook-form";
import { RegistrationFormData } from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { useMemo } from "react";

interface RegistrationProgressProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function RegistrationProgress({ form }: RegistrationProgressProps) {
  const formValues = form.watch();
  const attendeeType = form.watch("attendeeType");
  const isStudent = attendeeType === "STUDENT_ACADEMIC";

  // Calculate progress directly using useMemo to prevent infinite loops
  const progressData = useMemo(() => {
    let completedStepsCount = 0;
    const totalSteps = 7; // Added face capture as required step
    let currentStepNumber = 0;

    // Step 1: Personal Info (including face capture)
    if (
      formValues.firstName &&
      formValues.lastName &&
      formValues.gender &&
      formValues.ageBracket &&
      formValues.nationality &&
      formValues.faceScannedUrl // Face capture is required
    ) {
      completedStepsCount++;
      currentStepNumber = Math.max(currentStepNumber, 1);
    }

    // Step 2: Contact Info
    if (formValues.email && formValues.mobileNumber) {
      completedStepsCount++;
      currentStepNumber = Math.max(currentStepNumber, 2);
    }

    // Step 3: Event Preferences
    if (
      formValues.attendeeType &&
      formValues.attendingDays?.length > 0 &&
      formValues.eventParts?.length > 0 &&
      formValues.interestAreas?.length > 0
    ) {
      completedStepsCount++;
      currentStepNumber = Math.max(currentStepNumber, 3);
    }

    // Step 4: Professional Info (skip for students)
    if (isStudent) {
      completedStepsCount++; // Auto-complete for students
      currentStepNumber = Math.max(currentStepNumber, 4);
    } else if (
      formValues.jobTitle &&
      formValues.companyName &&
      formValues.industry
    ) {
      completedStepsCount++;
      currentStepNumber = Math.max(currentStepNumber, 4);
    }

    // Step 5: Emergency & Safety
    if (
      formValues.emergencyContactPerson &&
      formValues.emergencyContactNumber
    ) {
      completedStepsCount++;
      currentStepNumber = Math.max(currentStepNumber, 5);
    }

    // Step 6: Additional Info
    if (formValues.hearAboutEvent && formValues.dataPrivacyConsent) {
      completedStepsCount++;
      currentStepNumber = Math.max(currentStepNumber, 6);
    }

    const progressPercent = (completedStepsCount / totalSteps) * 100;
    
    return {
      progress: progressPercent,
      currentStep: currentStepNumber,
      completedSteps: completedStepsCount
    };
  }, [
    formValues.firstName,
    formValues.lastName, 
    formValues.gender,
    formValues.ageBracket,
    formValues.nationality,
    formValues.faceScannedUrl, // Added face capture to dependencies
    formValues.email,
    formValues.mobileNumber,
    formValues.attendeeType,
    formValues.attendingDays,
    formValues.eventParts,
    formValues.interestAreas,
    formValues.jobTitle,
    formValues.companyName,
    formValues.industry,
    formValues.emergencyContactPerson,
    formValues.emergencyContactNumber,
    formValues.hearAboutEvent,
    formValues.dataPrivacyConsent,
    isStudent
  ]);

  const stepNames = [
    "Getting Started",
    "Personal Info",
    "Contact Info",
    "Event Preferences",
    isStudent ? "Professional Info (Skipped)" : "Professional Info",
    "Emergency & Safety",
    "Additional Info",
  ];

  const currentStepName = stepNames[progressData.currentStep] || "Getting Started";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Registration Progress</span>
          <span>{Math.round(progressData.progress)}% Complete</span>
        </div>
        <Progress
          value={progressData.progress}
          className="h-2 w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Current: {currentStepName}</span>
          <span>Step {progressData.currentStep} of {stepNames.length - 1}</span>
        </div>
      </div>
    </div>
  );
}
