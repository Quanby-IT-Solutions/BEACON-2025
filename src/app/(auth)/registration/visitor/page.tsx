"use client";

import { useEffect, useCallback } from "react";
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
  registrationSchema,
  RegistrationFormData,
  defaultValues,
} from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { useRegistrationMutation } from "@/hooks/tanstasck-query/useRegistrationMutation";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useVisitorRegistrationStore } from "@/stores/visitorRegistrationStore";
import { useEmailValidation } from "@/hooks/tanstasck-query/useEmailValidation";

// Import all components
import { UserDetails } from "./visitor-components/UserDetails";
import { UserAccounts } from "./visitor-components/UserAccounts";
import { ProfessionalInfo } from "./visitor-components/ProfessionalInfo";
import { EventPreferences } from "./visitor-components/EventPreferences";
import { EmergencySafety } from "./visitor-components/EmergencySafety";
import { AdditionalInfo } from "./visitor-components/AdditionalInfo";
import { RegistrationProgress } from "./components/RegistrationProgress";
import { DraftManager } from "./components/DraftManager";

export default function VisitorRegistrationPage() {
  const {
    isSubmitting,
    setIsSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    registrationData,
    setRegistrationData,
    reset: resetVisitorStore,
  } = useVisitorRegistrationStore();

  const registrationMutation = useRegistrationMutation();
  const { clearFormData } = useRegistrationStore();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
    mode: "onChange",
  });

  const email = form.watch("email");
  const attendeeType = form.watch("attendeeType");
  const { data: emailCheck } = useEmailValidation(email);

  // Trigger validation when attendee type changes to clear/show professional field errors
  useEffect(() => {
    if (attendeeType) {
      form.trigger(["jobTitle", "companyName", "industry"]);
    }
  }, [attendeeType, form]);

  // Function to scroll to first error field
  const scrollToFirstError = useCallback(() => {
    // Get form errors
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

  const onSubmit = async (values: RegistrationFormData) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Prevent submission if email exists
    if (emailCheck?.exists) {
      form.setError("email", {
        type: "manual",
        message: "Email already exists. Please use a different email.",
      });
      setTimeout(scrollToFirstError, 100);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting registration submission...");
      const result = await registrationMutation.mutateAsync(values);

      if (result.success) {
        console.log("Registration successful!");

        // Store registration data for success dialog
        setRegistrationData({
          userId: result.data?.userId || "",
          visitorId: result.data?.visitorId || "",
        });

        // Show success toast
        toast.success("🎉 Registration Complete!", {
          description:
            "Your BEACON 2025 registration has been submitted successfully!",
          duration: 5000,
        });

        // Show success dialog
        setShowSuccessDialog(true);

        form.reset();
        clearFormData(); // Clear form draft store

        // Reset the submission state after successful registration
        setIsSubmitting(false);
      } else {
        console.log("Registration failed:", result.message);
        // Handle validation errors from server
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((error) => {
            if (error.path && error.path.length > 0) {
              form.setError(error.path[0] as keyof RegistrationFormData, {
                type: "server",
                message: error.message,
              });
            }
          });
          // Scroll to first error after server validation
          setTimeout(scrollToFirstError, 100);
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto py-4 px-4 max-w-4xl flex-1 flex flex-col">
        <Card className="relative flex-1 flex flex-col h-full">
          <CardHeader className="shrink-0">
            <CardTitle className="text-2xl text-center">
              BEACON 2025 Visitor Registration
            </CardTitle>
            <CardDescription className="text-center">
              Register for the maritime industry event of the year
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-4 shrink-0">
              <DraftManager form={form} />
            </div>
            <div className="flex-1 overflow-y-auto pb-32">
              <Form {...form}>
                <div className="relative p-2">
                  {isSubmitting && (
                    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm font-medium">
                          Submitting Registration...
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
                      // Scroll to first error when client-side validation fails
                      setTimeout(scrollToFirstError, 100);
                    })}
                    className="space-y-8"
                  >
                    {/* Personal Information */}
                    <UserDetails form={form} />

                    {/* Contact Information */}
                    <UserAccounts form={form} />

                    {/* Event Preferences (includes attendee type which affects professional info) */}
                    <EventPreferences form={form} />

                    {/* Professional Information - Only show for non-students */}
                    {attendeeType && attendeeType !== "STUDENT_ACADEMIC" && (
                      <ProfessionalInfo form={form} />
                    )}

                    {/* Emergency & Safety */}
                    <EmergencySafety form={form} />

                    {/* Additional Information */}
                    <AdditionalInfo form={form} />

                    <div className="space-y-4 pb-8">
                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        size="lg"
                        disabled={
                          isSubmitting ||
                          registrationMutation.isPending ||
                          emailCheck?.exists
                        }
                      >
                        {isSubmitting || registrationMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : emailCheck?.exists ? (
                          "Email Already Exists - Cannot Submit"
                        ) : (
                          "Complete Registration"
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
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Registration Successful!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              🎉 Welcome to BEACON 2025! Your registration has been completed successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="text-center space-y-3 px-6 pb-2">
            <div className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly with your registration
              details and event information.
            </div>
            {registrationData && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-left">
                <div>
                  <span className="font-medium">User ID:</span>{" "}
                  {registrationData.userId.slice(0, 8)}...
                </div>
                <div>
                  <span className="font-medium">Registration ID:</span>{" "}
                  {registrationData.visitorId.slice(0, 8)}...
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Save this information for your records.
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false);
                resetVisitorStore(); // Reset all Zustand state
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
