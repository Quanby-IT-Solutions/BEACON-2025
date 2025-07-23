"use client";

import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { ConferenceRegistrationFormData } from "@/types/conference/registration";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";
import { toast } from "sonner";

interface DraftManagerProps {
  form: UseFormReturn<ConferenceRegistrationFormData>;
}

export function DraftManager({ form }: DraftManagerProps) {
  const {
    formData,
    updateFormData,
    hasDraft,
    saveDraft,
    loadDraft,
    clearFormData,
  } = useConferenceRegistrationStore();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const subscription = form.watch((data) => {
      // Save form data to store
      updateFormData(data as Partial<ConferenceRegistrationFormData>);

      // Auto-save every 10 seconds of changes
      const timeoutId = setTimeout(() => {
        saveDraft();
        setLastSaved(new Date());
      }, 10000);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, updateFormData, saveDraft, autoSaveEnabled]);

  // Load draft on component mount
  useEffect(() => {
    if (hasDraft) {
      const draftData = loadDraft();
      if (draftData && Object.keys(draftData).length > 0) {
        // Only load non-empty draft data
        Object.keys(draftData).forEach((key) => {
          const value = draftData[key as keyof ConferenceRegistrationFormData];
          if (value !== null && value !== undefined && value !== "") {
            form.setValue(
              key as keyof ConferenceRegistrationFormData,
              value as any
            );
          }
        });
        setLastSaved(new Date());
      }
    }
  }, [hasDraft, loadDraft, form]);

  const handleSaveDraft = () => {
    const currentData = form.getValues();
    updateFormData(currentData);
    saveDraft();
    setLastSaved(new Date());
    toast.success("Draft saved successfully!", {
      description:
        "Your progress has been saved and will be restored when you return.",
    });
  };

  const handleLoadDraft = () => {
    if (hasDraft) {
      const draftData = loadDraft();
      if (draftData) {
        // Load all draft data
        Object.keys(draftData).forEach((key) => {
          const value = draftData[key as keyof ConferenceRegistrationFormData];
          if (value !== null && value !== undefined) {
            form.setValue(
              key as keyof ConferenceRegistrationFormData,
              value as any
            );
          }
        });

        // Trigger validation after loading
        form.trigger();

        toast.success("Draft loaded successfully!", {
          description: "Your saved progress has been restored.",
        });
      }
    }
  };

  const handleClearDraft = () => {
    clearFormData();
    form.reset();
    setLastSaved(null);
    toast.success("Draft cleared!", {
      description: "Form has been reset to defaults.",
    });
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Draft Status */}
          <div className="flex items-center gap-2 text-sm">
            {hasDraft ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-700">
                  Draft available
                  {lastSaved && (
                    <span className="text-muted-foreground ml-1">
                      (saved {formatLastSaved(lastSaved)})
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600">No draft saved yet</span>
              </>
            )}
          </div>

          {/* Draft Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              Save Draft
            </Button>

            {hasDraft && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDraft}
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Load Draft
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearDraft}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Auto-save Toggle */}
        <div className="mt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="h-3 w-3"
            />
            Auto-save every 10 seconds
          </label>

          {/* Progress Indicator */}
          <div className="text-xs text-muted-foreground">
            {Object.keys(formData).length > 0 && (
              <span>{Object.keys(formData).length} fields filled</span>
            )}
          </div>
        </div>

        {/* Draft Warning for New Users */}
        {!hasDraft && (
          <Alert className="mt-3 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-xs">
              <strong>Tip:</strong> Your progress will be automatically saved as
              you fill out the form. You can also manually save using the "Save
              Draft" button above.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
