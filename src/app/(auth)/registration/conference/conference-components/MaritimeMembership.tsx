"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
  Star,
  Gift,
  Users,
} from "lucide-react";
import { maritimeLeagueMembershipOptions } from "@/types/conference/registration";
import { MaritimeMembershipProps } from "@/types/conference/components";
import {
  useRealTimeTMLCodeValidation,
  useTMLMemberBenefits,
} from "@/hooks/tanstasck-query/useTMLCodeValidation";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";

export default function MaritimeMembership({ form }: MaritimeMembershipProps) {
  const [showCodeInput, setShowCodeInput] = useState(false);

  const { setRequiresPayment, setTmlCodeValidationState } =
    useConferenceRegistrationStore();
  const { defaultBenefits, getBenefitIcon } = useTMLMemberBenefits();

  // Watch the maritime league membership value
  const membership = form.watch("isMaritimeLeagueMember");

  // Real-time TML code validation
  const {
    code,
    setCode,
    validationResult,
    isValidating,
    isValid,
    hasError,
    isEmpty,
    showLoading,
    showSuccess,
    showError,
    errorMessage,
    benefits,
  } = useRealTimeTMLCodeValidation();

  // Update payment requirement and validation state based on membership and code validation
  useEffect(() => {
    if (membership === "YES" && isValid) {
      setRequiresPayment(false);
      setTmlCodeValidationState({ isValid: true, isRequired: true });
    } else if (membership === "YES" && showCodeInput) {
      setRequiresPayment(false);
      setTmlCodeValidationState({ isValid: false, isRequired: true });
    } else if (membership === "NO") {
      setRequiresPayment(true);
      setTmlCodeValidationState({ isValid: true, isRequired: false });
    } else {
      setRequiresPayment(false);
      setTmlCodeValidationState({ isValid: true, isRequired: false });
    }
  }, [
    membership,
    isValid,
    showCodeInput,
    setRequiresPayment,
    setTmlCodeValidationState,
  ]);

  // Handle membership selection
  const handleMembershipChange = (value: string) => {
    form.setValue("isMaritimeLeagueMember", value as any);

    if (value === "YES") {
      setShowCodeInput(true);
    } else {
      setShowCodeInput(false);
      setCode("");
      form.setValue("tmlMemberCode", "");
    }
  };

  // Handle code input change
  const handleCodeChange = (value: string) => {
    setCode(value);
    form.setValue("tmlMemberCode", value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Maritime League Membership
        </h3>
        <p className="text-sm text-muted-foreground">
          TML members enjoy exclusive benefits including free access to all
          conference events.
        </p>
      </div>

      {/* Membership Selection */}
      <FormField
        control={form.control}
        name="isMaritimeLeagueMember"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel className="text-base font-medium">
                Are you a member of The Maritime League (TML)?
              </FormLabel>
              <FormMessage />
            </div>
            <FormControl>
              <RadioGroup
                onValueChange={handleMembershipChange}
                value={field.value}
                className="grid grid-cols-1 gap-3"
              >
                {maritimeLeagueMembershipOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <label
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      {/* TML Member Code Input */}
      {showCodeInput && membership === "YES" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="tmlMemberCode"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-2">
                      TML Member Code *
                      {showLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      {showSuccess && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {showError && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      placeholder="Enter your TML member code"
                      className={`transition-colors ${
                        showSuccess
                          ? "border-green-500 bg-green-50"
                          : showError
                          ? "border-red-500 bg-red-50"
                          : "border-blue-300"
                      }`}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your unique TML member code to verify your membership
                    and access exclusive benefits.
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Validation Status */}
            {showLoading && (
              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Validating your TML member code...
                </AlertDescription>
              </Alert>
            )}

            {showSuccess && validationResult && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Code verified!</strong> {validationResult.message}
                </AlertDescription>
              </Alert>
            )}

            {showError && errorMessage && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* TML Benefits Display */}
      {((membership === "YES" && isValid) ||
        membership === "APPLY_FOR_MEMBERSHIP") && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <h4 className="font-semibold text-green-900">
                  {membership === "YES"
                    ? "TML Member Benefits"
                    : "TML Membership Benefits"}
                </h4>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {membership === "YES" ? "Active Member" : "Applying"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(benefits.length > 0 ? benefits : defaultBenefits).map(
                  (benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-green-800"
                    >
                      <span className="text-base">
                        {getBenefitIcon(benefit)}
                      </span>
                      <span>{benefit}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Non-member Notice */}
      {membership === "NO" && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">
                  Registration Information
                </h4>
              </div>
              <p className="text-sm text-gray-700">
                As a non-member, you'll need to pay for the events you select.
                Consider applying for TML membership to enjoy exclusive benefits
                and free access to future events.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
