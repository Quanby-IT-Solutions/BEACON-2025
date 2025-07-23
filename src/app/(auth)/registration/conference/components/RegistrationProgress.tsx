"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { ConferenceRegistrationFormData } from "@/types/conference/registration";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";

interface RegistrationProgressProps {
  form: UseFormReturn<ConferenceRegistrationFormData>;
}

export function RegistrationProgress({ form }: RegistrationProgressProps) {
  const { requiresPayment, totalAmount } = useConferenceRegistrationStore();

  // Get form values and errors
  const formValues = form.getValues();
  const formErrors = form.formState.errors;
  const totalErrors = Object.keys(formErrors).length;

  // Calculate completion based on required fields
  const calculateProgress = () => {
    let completed = 0;
    let total = 0;

    // Required fields for all users
    const requiredFields = [
      "isMaritimeLeagueMember",
      "selectedEventIds",
      "firstName",
      "lastName", 
      "gender",
      "ageBracket",
      "nationality",
      "email",
      "mobileNumber",
      "interestAreas",
      "faceScannedUrl",
      "dataUsageConsent"
    ];

    // Add TML member code if maritime league member
    if (formValues.isMaritimeLeagueMember === "YES") {
      requiredFields.push("tmlMemberCode");
    }

    // Add payment mode if payment required
    if (requiresPayment) {
      requiredFields.push("paymentMode");
    }

    total = requiredFields.length;

    // Count completed fields
    requiredFields.forEach(field => {
      const value = formValues[field as keyof ConferenceRegistrationFormData];
      if (field === "selectedEventIds") {
        if (Array.isArray(value) && value.length > 0) completed++;
      } else if (field === "interestAreas") {
        if (Array.isArray(value) && value.length > 0) completed++;
      } else if (field === "dataUsageConsent") {
        if (value === true) completed++;
      } else if (value && value !== "" && value !== null && value !== undefined) {
        completed++;
      }
    });

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  // Determine progress status
  const getProgressStatus = () => {
    if (totalErrors > 0) {
      return {
        color: "bg-red-500",
        icon: AlertCircle,
        text: "Please fix errors to continue",
        textColor: "text-red-600"
      };
    } else if (progress === 100) {
      return {
        color: "bg-green-500", 
        icon: CheckCircle,
        text: "Ready to submit!",
        textColor: "text-green-600"
      };
    } else {
      return {
        color: "bg-blue-500",
        icon: Info,
        text: "Complete all required fields",
        textColor: "text-blue-600"
      };
    }
  };

  const status = getProgressStatus();
  const StatusIcon = status.icon;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-30">
      <Card className="rounded-none border-0 border-t">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
            {/* Progress Section */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Registration Progress</span>
                <span className={`font-medium ${status.textColor}`}>
                  {progress}% Complete
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-2"
                style={{
                  backgroundColor: '#e5e7eb'
                }}
              />
            </div>

            {/* Status Section */}
            <div className="flex items-center gap-2 text-sm">
              <StatusIcon className={`h-4 w-4 ${status.textColor}`} />
              <span className={status.textColor}>
                {status.text}
              </span>
            </div>

            {/* Payment Info */}
            {requiresPayment && totalAmount > 0 && (
              <div className="text-right text-sm">
                <div className="font-medium text-orange-600">
                  Payment Required
                </div>
                <div className="text-orange-700">
                  ₱{totalAmount.toLocaleString()}
                </div>
              </div>
            )}

            {/* TML Member Badge */}
            {!requiresPayment && formValues.isMaritimeLeagueMember === "YES" && (
              <div className="text-right text-sm">
                <div className="font-medium text-green-600">
                  TML Member
                </div>
                <div className="text-green-700 text-xs">
                  FREE Registration
                </div>
              </div>
            )}
          </div>

          {/* Errors Summary */}
          {totalErrors > 0 && (
            <div className="mt-2 text-xs text-red-600 max-w-4xl mx-auto">
              {totalErrors} field{totalErrors !== 1 ? 's' : ''} need{totalErrors === 1 ? 's' : ''} attention
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}