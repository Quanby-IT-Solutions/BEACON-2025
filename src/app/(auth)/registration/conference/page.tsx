"use client";

import React, { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import {
  ConferenceRegistrationFormData,
  conferenceRegistrationSchema,
  defaultConferenceRegistrationValues,
} from "@/types/conference/registration";
import { useConferenceRegistrationMutation } from "@/hooks/tanstasck-query/useConferenceRegistrationMutation";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";
import { useEmailValidation } from "@/hooks/tanstasck-query/useEmailValidation";

// Import all conference components (keeping the existing ones)
import MaritimeMembership from "./conference-components/MaritimeMembership";
import EventSelection from "./conference-components/EventSelection";
import PersonalInformation from "./conference-components/PersonalInformation";
import ContactDetails from "./conference-components/ContactDetails";
import ProfessionalInformation from "./conference-components/ProfessionalInformation";
import InterestsAndPreferences from "./conference-components/InterestsAndPreferences";
import PaymentDetails from "./conference-components/PaymentDetails";
import ConsentAndConfirmation from "./conference-components/ConsentAndConfirmation";
import { RegistrationProgress } from "./components/RegistrationProgress";
import { DraftManager } from "./components/DraftManager";

interface ConferenceRegistrationState {
  isSubmitting: boolean;
  showSuccessDialog: boolean;
  registrationData: {
    conferenceId: string;
    userId: string;
    requiresPayment: boolean;
    totalAmount: number;
    paymongoCheckoutUrl?: string;
  } | null;
}

export default function ConferenceRegistrationSinglePage() {
  const {
    clearFormData,
    requiresPayment,
    tmlCodeValidationState,
  } = useConferenceRegistrationStore();

  const { mutate: registerForConference, isPending } = useConferenceRegistrationMutation();

  // Local state for single page registration
  const [state, setState] = React.useState<ConferenceRegistrationState>({
    isSubmitting: false,
    showSuccessDialog: false,
    registrationData: null,
  });

  const form = useForm<ConferenceRegistrationFormData>({
    resolver: zodResolver(conferenceRegistrationSchema) as any,
    defaultValues: defaultConferenceRegistrationValues,
    mode: "onChange",
  });

  const email = form.watch("email");
  const isMaritimeLeagueMember = form.watch("isMaritimeLeagueMember");
  const { data: emailCheck } = useEmailValidation(email);

  // Trigger validation when maritime league membership changes
  useEffect(() => {
    if (isMaritimeLeagueMember) {
      form.trigger(["tmlMemberCode"]);
    }
  }, [isMaritimeLeagueMember, form]);

  // Function to scroll to first error field
  const scrollToFirstError = useCallback(() => {
    const errors = form.formState.errors;
    const errorFields = Object.keys(errors);

    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];

      // Find the input element by name attribute
      const inputElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );

      if (inputElement) {
        // Scroll to the element
        inputElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        // Focus the input if it's focusable
        if (typeof (inputElement as HTMLElement).focus === "function") {
          setTimeout(() => (inputElement as HTMLElement).focus(), 300);
        }

        // Show toast with error message
        const errorMessage =
          errors[firstErrorField as keyof typeof errors]?.message;
        toast.error("Please check required fields", {
          description: `${errorMessage || `${firstErrorField} is required`}`,
          duration: 4000,
        });
      } else {
        // Fallback: look for error message elements
        const errorMessage = document.querySelector(".text-destructive");
        if (errorMessage) {
          errorMessage.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });

          toast.error("Please check required fields", {
            description: "Some fields need your attention.",
            duration: 4000,
          });
        }
      }
    }
  }, [form.formState.errors]);

  const onSubmit = async (values: ConferenceRegistrationFormData) => {
    // Prevent multiple submissions
    if (state.isSubmitting || isPending) return;

    // Prevent submission if email exists
    if (emailCheck?.exists) {
      form.setError("email", {
        type: "manual",
        message: "Email already exists. Please use a different email.",
      });
      setTimeout(scrollToFirstError, 100);
      return;
    }

    // Prevent submission if TML code is required but invalid
    if (tmlCodeValidationState.isRequired && !tmlCodeValidationState.isValid) {
      form.setError("tmlMemberCode", {
        type: "manual",
        message: "Please enter a valid TML member code or change your membership selection.",
      });
      toast.error("Invalid TML Member Code", {
        description: "Please enter a valid TML member code to proceed, or select a different membership option.",
        duration: 5000,
      });
      setTimeout(scrollToFirstError, 100);
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      console.log("Starting conference registration submission...");
      
      registerForConference(values, {
        onSuccess: (result) => {
          console.log("Conference registration successful!", result);

          // Handle PayMongo payment redirection
          if (result.data?.paymongoCheckoutUrl && requiresPayment) {
            // Store data and redirect to PayMongo
            setState(prev => ({
              ...prev,
              registrationData: result.data,
              isSubmitting: false
            }));
            
            toast.success("Registration Created!", {
              description: "Redirecting to payment...",
              duration: 3000,
            });

            // Redirect to PayMongo checkout
            setTimeout(() => {
              window.location.href = result.data.paymongoCheckoutUrl!;
            }, 1500);
            return;
          }

          // Store registration data for success dialog
          setState(prev => ({
            ...prev,
            registrationData: result.data,
            showSuccessDialog: true,
            isSubmitting: false
          }));

          // Show success toast
          toast.success("🎉 Conference Registration Complete!", {
            description: requiresPayment
              ? "Payment completed successfully!"
              : "Your registration has been submitted successfully as a TML member!",
            duration: 5000,
          });

          form.reset();
          clearFormData();
        },
        onError: (error) => {
          console.error("Conference registration failed:", error);
          
          // Parse error message for better user feedback
          let errorMessage = "An unexpected error occurred. Please try again.";
          if (error.message.includes("already has a conference registration")) {
            errorMessage = "You have already registered for this conference.";
          } else if (error.message.includes("Validation failed")) {
            errorMessage = "Please check your form data and try again.";
          } else if (error.message.includes("payment")) {
            errorMessage = "There was an issue processing your payment information.";
          }

          toast.error("Conference Registration Error", {
            description: errorMessage,
            duration: 5000,
          });

          setTimeout(scrollToFirstError, 100);
          setState(prev => ({ ...prev, isSubmitting: false }));
        },
      });

    } catch (error) {
      console.error("Conference registration submission error:", error);
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto py-4 px-4 max-w-4xl flex-1 flex flex-col">
        <Card className="relative flex-1 flex flex-col h-full">
          <CardHeader className="shrink-0">
            <CardTitle className="text-2xl text-center">
              BEACON 2025 Conference Registration
            </CardTitle>
            <CardDescription className="text-center">
              Register for the premier maritime industry conference
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-4 shrink-0">
              <DraftManager form={form} />
            </div>
            <div className="flex-1 overflow-y-auto pb-32">
              <Form {...form}>
                <div className="relative p-2">
                  {(state.isSubmitting || isPending) && (
                    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm font-medium">
                          {state.registrationData?.paymongoCheckoutUrl 
                            ? "Redirecting to Payment..." 
                            : "Submitting Registration..."
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Please do not close this window
                        </p>
                      </div>
                    </div>
                  )}
                  <form
                    onSubmit={form.handleSubmit(onSubmit, (errors) => {
                      console.log("Form validation errors:", errors);
                      setTimeout(scrollToFirstError, 100);
                    })}
                    className="space-y-8"
                  >
                    {/* Maritime League Membership */}
                    <MaritimeMembership form={form} />

                    {/* Event Selection */}
                    <EventSelection form={form} />

                    {/* Personal Information */}
                    <PersonalInformation form={form} />

                    {/* Contact Details */}
                    <ContactDetails form={form} />

                    {/* Professional Information */}
                    <ProfessionalInformation form={form} />

                    {/* Areas of Interest */}
                    <InterestsAndPreferences form={form} />

                    {/* Payment Details - Only show if payment required */}
                    <PaymentDetails form={form} />

                    {/* Consent & Confirmation */}
                    <ConsentAndConfirmation form={form} />

                    <div className="space-y-4 pb-8">
                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        size="lg"
                        disabled={
                          state.isSubmitting ||
                          isPending ||
                          emailCheck?.exists ||
                          (tmlCodeValidationState.isRequired && !tmlCodeValidationState.isValid)
                        }
                      >
                        {state.isSubmitting || isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {requiresPayment ? "Processing Payment..." : "Registering..."}
                          </>
                        ) : emailCheck?.exists ? (
                          "Email Already Exists - Cannot Submit"
                        ) : (tmlCodeValidationState.isRequired && !tmlCodeValidationState.isValid) ? (
                          "Enter Valid TML Code to Continue"
                        ) : (
                          <>
                            {requiresPayment ? "Complete Registration & Pay" : "Complete Registration"}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
      <RegistrationProgress form={form} />

      {/* Success Dialog */}
      <AlertDialog 
        open={state.showSuccessDialog} 
        onOpenChange={(open) => setState(prev => ({ ...prev, showSuccessDialog: open }))}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Registration Successful!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              🎉 Welcome to BEACON 2025 Conference! Your registration has been completed successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="text-center space-y-3 px-6 pb-2">
            <div className="text-sm text-muted-foreground">
              {requiresPayment 
                ? "Your payment has been processed and you will receive a confirmation email shortly."
                : "As a TML member, your registration is complete with no payment required. You will receive a confirmation email shortly."
              }
            </div>
            {state.registrationData && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-left">
                <div>
                  <span className="font-medium">Conference ID:</span>{" "}
                  {state.registrationData.conferenceId.slice(0, 8)}...
                </div>
                <div>
                  <span className="font-medium">User ID:</span>{" "}
                  {state.registrationData.userId.slice(0, 8)}...
                </div>
                {state.registrationData.totalAmount > 0 && (
                  <div>
                    <span className="font-medium">Amount:</span>{" "}
                    ₱{state.registrationData.totalAmount.toLocaleString()}
                  </div>
                )}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Save this information for your records.
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setState({
                  isSubmitting: false,
                  showSuccessDialog: false,
                  registrationData: null,
                });
                // Optionally redirect to a thank you page or home
                window.location.href = "/";
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue to Homepage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}