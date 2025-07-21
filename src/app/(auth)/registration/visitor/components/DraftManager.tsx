import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SaveIcon, TrashIcon, DownloadIcon } from "lucide-react";
import { useRegistrationStore } from "@/stores/registrationStore";
import { RegistrationFormData } from "@/hooks/standard-hooks/visitor/useRegistrationSchema";

interface DraftManagerProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function DraftManager({ form }: DraftManagerProps) {
  const { 
    hasDraft, 
    loadDraft, 
    clearDraft, 
    saveDraft, 
    isFormDirty,
    updateFormData 
  } = useRegistrationStore();

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (isFormDirty) {
        updateFormData(values as Partial<RegistrationFormData>);
        saveDraft();
      }
    });

    return () => subscription.unsubscribe();
  }, [form, updateFormData, saveDraft, isFormDirty]);

  const handleLoadDraft = () => {
    const draftData = loadDraft();
    form.reset(draftData as RegistrationFormData);
  };

  const handleClearDraft = () => {
    clearDraft();
    form.reset();
  };

  const handleManualSave = () => {
    const currentValues = form.getValues();
    updateFormData(currentValues);
    saveDraft();
  };

  if (!hasDraft) return null;

  return (
    <Alert className="mb-4">
      <SaveIcon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>You have a saved draft from a previous session.</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadDraft}
          >
            <DownloadIcon className="h-3 w-3 mr-1" />
            Load Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualSave}
          >
            <SaveIcon className="h-3 w-3 mr-1" />
            Save Current
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleClearDraft}
          >
            <TrashIcon className="h-3 w-3 mr-1" />
            Clear Draft
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}