"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  registrationSchema,
  RegistrationFormData,
  defaultValues,
} from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { useRegistrationMutation } from "@/hooks/tanstasck-query/useRegistrationMutation";
import { useRegistrationStore } from "@/stores/registrationStore";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registrationMutation = useRegistrationMutation();
  const { setCurrentStep, markStepCompleted, clearFormData } =
    useRegistrationStore();

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

  const onSubmit = async (values: RegistrationFormData) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Prevent submission if email exists
    if (emailCheck?.exists) {
      form.setError("email", {
        type: "manual",
        message: "Email already exists. Please use a different email.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting registration submission...");
      const result = await registrationMutation.mutateAsync(values);

      if (result.success) {
        console.log("Registration successful!");
        form.reset();
        clearFormData(); // Clear Zustand store as well

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
                <div className="relative">
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
                    onSubmit={form.handleSubmit(onSubmit)}
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
    </div>
  );
}
