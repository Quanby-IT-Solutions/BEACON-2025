"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { conferenceFormSteps } from "@/types/conference/registration";
import { useConferenceFormNavigation } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";
import { ConferenceRegistrationProgressProps } from "@/types/conference/components";

export default function ConferenceRegistrationProgress({
  form,
}: ConferenceRegistrationProgressProps) {
  const {
    currentStep,
    currentStepIndex,
    steps,
    getStepProgress,
    isStepCompleted,
    goToStep,
  } = useConferenceFormNavigation();

  const progressPercentage = getStepProgress();

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Registration Progress</div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </div>
          </div>

          <Progress value={progressPercentage} className="h-2" />

          {/* Step Indicators */}
          <div className="hidden md:flex items-center justify-between">
            {conferenceFormSteps.map((stepInfo, index) => {
              const isActive = stepInfo.step === currentStep;
              const isCompleted = isStepCompleted(stepInfo.step);
              const isPrevious = index < currentStepIndex;
              const isClickable = isCompleted || isPrevious || isActive;

              return (
                <div
                  key={stepInfo.step}
                  className={`flex flex-col items-center space-y-1 cursor-pointer transition-all ${
                    isClickable
                      ? "hover:scale-105"
                      : "cursor-not-allowed opacity-60"
                  }`}
                  onClick={() => isClickable && goToStep(stepInfo.step)}
                >
                  {/* Step Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-blue-500 text-white animate-pulse"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : isActive ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Step Title */}
                  <div
                    className={`text-xs text-center max-w-16 ${
                      isActive
                        ? "text-blue-600 font-medium"
                        : isCompleted
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stepInfo.title.split(" ").slice(0, 2).join(" ")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Step Indicator */}
          <div className="md:hidden flex items-center justify-center space-x-2">
            {conferenceFormSteps.map((stepInfo, index) => (
              <div
                key={stepInfo.step}
                className={`w-2 h-2 rounded-full transition-colors ${
                  isStepCompleted(stepInfo.step)
                    ? "bg-green-500"
                    : stepInfo.step === currentStep
                    ? "bg-blue-500"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Current Step Info */}
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="text-xs">
              {currentStepIndex + 1} of {steps.length}:{" "}
              {conferenceFormSteps.find((s) => s.step === currentStep)?.title}
            </Badge>
          </div>
        </div>

        {/* Form Errors Summary (if any) */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="text-xs text-red-800">
              Please fix the errors above to continue
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
