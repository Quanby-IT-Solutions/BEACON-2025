"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Save, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ConferenceRegistrationFormData } from "@/types/conference/registration";
import { useConferenceRegistrationStore, useAutoSaveConferenceRegistration } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";
import { ConferenceDraftManagerProps } from "@/types/conference/components";

export default function ConferenceDraftManager({ form }: ConferenceDraftManagerProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  const { 
    formData, 
    hasDraft, 
    saveDraft, 
    loadDraft, 
    clearFormData,
    isFormDirty 
  } = useConferenceRegistrationStore();
  
  const { autoSave } = useAutoSaveConferenceRegistration();

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (isFormDirty && value) {
        autoSave(value as Partial<ConferenceRegistrationFormData>);
        setLastSavedTime(new Date());
      }
    });

    return () => subscription.unsubscribe();
  }, [form, autoSave, isFormDirty]);

  // Load draft on component mount
  useEffect(() => {
    if (hasDraft && formData && Object.keys(formData).length > 0) {
      form.reset(formData);
      toast.info("Draft loaded", {
        description: "Your previous form data has been restored.",
      });
    }
  }, [hasDraft, formData, form]);

  const handleSaveDraft = () => {
    const currentFormData = form.getValues();
    autoSave(currentFormData);
    saveDraft();
    setLastSavedTime(new Date());
    
    toast.success("Draft saved", {
      description: "Your form data has been saved locally.",
    });
  };

  const handleLoadDraft = () => {
    if (hasDraft && formData && Object.keys(formData).length > 0) {
      form.reset(formData);
      toast.success("Draft loaded", {
        description: "Your saved form data has been restored.",
      });
    } else {
      toast.error("No draft found", {
        description: "There is no saved form data to load.",
      });
    }
  };

  const handleClearDraft = () => {
    clearFormData();
    form.reset({
      // Reset to default values
      isMaritimeLeagueMember: 'NO' as const,
      selectedEventIds: [],
      interestAreas: [],
      dataUsageConsent: false,
      emailCertificate: false,
      photoVideoConsent: false,
      receiveEventInvites: false,
    });
    setLastSavedTime(null);
    setShowClearDialog(false);
    
    toast.success("Form cleared", {
      description: "All form data has been cleared.",
    });
  };

  const formatLastSaved = () => {
    if (!lastSavedTime) return null;
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSavedTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    return lastSavedTime.toLocaleTimeString();
  };

  if (!hasDraft && !isFormDirty) {
    return null;
  }

  return (
    <>
      <Card className="p-3 mb-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Save className="h-4 w-4 text-blue-600" />
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">
                  Draft Available
                </span>
                {isFormDirty && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              {lastSavedTime && (
                <span className="text-xs text-blue-700">
                  Last saved: {formatLastSaved()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            
            {hasDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadDraft}
                className="text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Load
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              className="text-red-700 border-red-200 hover:bg-red-100"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Clear Form Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all form data? This will permanently remove your saved draft and reset all fields. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearDraft}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}