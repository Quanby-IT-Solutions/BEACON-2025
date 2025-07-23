"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Import types and hooks
import {
  ConferenceRegistrationFormData,
  conferenceRegistrationSchema,
  defaultConferenceRegistrationValues,
  ConferenceFormStep,
  conferenceFormSteps,
} from "@/types/conference/registration";
import { useConferenceRegistrationMutation } from "@/hooks/tanstasck-query/useConferenceRegistrationMutation";
import {
  useConferenceRegistrationStore,
  useConferenceFormNavigation,
} from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";

// Import form step components
import MaritimeMembership from "./conference-components/MaritimeMembership";
import EventSelection from "./conference-components/EventSelection";
import PersonalInformation from "./conference-components/PersonalInformation";
import ContactDetails from "./conference-components/ContactDetails";
import ProfessionalInformation from "./conference-components/ProfessionalInformation";
import InterestsAndPreferences from "./conference-components/InterestsAndPreferences";
import PaymentDetails from "./conference-components/PaymentDetails";
import ConsentAndConfirmation from "./conference-components/ConsentAndConfirmation";
import RegistrationSummary from "./conference-components/RegistrationSummary";
import ConferenceRegistrationProgress from "./components/ConferenceRegistrationProgress";
import ConferenceDraftManager from "./components/ConferenceDraftManager";

export default function ConferenceRegistrationPage() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  // Form setup
  const form = useForm<ConferenceRegistrationFormData>({
    resolver: zodResolver(conferenceRegistrationSchema) as any,
    defaultValues: defaultConferenceRegistrationValues,
    mode: "onChange",
  });

  // Hooks
  const { mutate: registerForConference, isPending } =
    useConferenceRegistrationMutation();
  const {
    currentStep,
    currentStepIndex,
    steps,
    canGoNext,
    canGoPrev,
    goToNextStep,
    goToPrevStep,
    getStepProgress,
  } = useConferenceFormNavigation();
  const { clearFormData, requiresPayment } = useConferenceRegistrationStore();

  // Handle form submission
  const onSubmit = async (data: ConferenceRegistrationFormData) => {
    try {
      console.log("Submitting conference registration:", data);

      registerForConference(data, {
        onSuccess: (response) => {
          console.log("Registration successful:", response);
          setRegistrationData(response);

          // Handle PayMongo payment redirection
          if (response.data?.paymongoCheckoutUrl && requiresPayment) {
            // Redirect to PayMongo checkout for GCash/Card payments
            window.location.href = response.data.paymongoCheckoutUrl;
            return;
          }

          setIsSuccessOpen(true);

          // Clear form data after successful submission
          clearFormData();
          form.reset();

          toast.success("Conference Registration Successful!", {
            description: requiresPayment
              ? "Please proceed with payment to complete your registration."
              : "Your registration has been completed successfully.",
          });
        },
        onError: (error) => {
          console.error("Registration failed:", error);
          toast.error("Registration Failed", {
            description: "Please check your information and try again.",
          });
        },
      });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "membership":
        return <MaritimeMembership form={form} />;
      case "events":
        return <EventSelection form={form} />;
      case "personal":
        return <PersonalInformation form={form} />;
      case "contact":
        return <ContactDetails form={form} />;
      case "professional":
        return <ProfessionalInformation form={form} />;
      case "interests":
        return <InterestsAndPreferences form={form} />;
      case "payment":
        return <PaymentDetails form={form} />;
      case "consent":
        return <ConsentAndConfirmation form={form} />;
      case "review":
        return <RegistrationSummary form={form} />;
      default:
        return <MaritimeMembership form={form} />;
    }
  };

  // Get current step info
  const currentStepInfo = conferenceFormSteps.find(
    (step) => step.step === currentStep
  );
  const isLastStep = currentStep === "review";
  const isFirstStep = currentStep === "membership";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto py-4 px-4 max-w-4xl flex-1 flex flex-col mb-[35dvh]">
        <Card className="relative flex-1 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              BEACON 2025 Conference Registration
            </CardTitle>
            <CardDescription>
              {currentStepInfo?.title} - {currentStepInfo?.description}
            </CardDescription>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden flex flex-col">
            {/* Draft Manager */}
            <ConferenceDraftManager form={form} />

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto pb-32">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* Render Current Step */}
                  <div className="space-y-6">{renderCurrentStep()}</div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-8 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPrevStep}
                      disabled={isFirstStep || isPending}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-4">
                      {!isLastStep ? (
                        <Button
                          type="button"
                          onClick={goToNextStep}
                          disabled={!canGoNext || isPending}
                          className="flex items-center gap-2"
                        >
                          Next
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="flex items-center gap-2"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Complete Registration
                              <CheckCircle className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Progress Bar */}
      <ConferenceRegistrationProgress form={form} />

      {/* Success Dialog */}
      <AlertDialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Registration Successful!
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Thank you for registering for BEACON 2025 Conference.</p>

              {registrationData && (
                <div className="space-y-2 text-left">
                  <p>
                    <strong>Registration ID:</strong>{" "}
                    {registrationData.data?.conferenceId}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> ₱
                    {registrationData.data?.totalAmount?.toLocaleString() ||
                      "0"}
                  </p>

                  {registrationData.data?.requiresPayment ? (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Payment Required:</strong> Please proceed with
                        payment to complete your registration.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>TML Member:</strong> Your registration is
                        complete with no payment required.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your registered email
                address.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
