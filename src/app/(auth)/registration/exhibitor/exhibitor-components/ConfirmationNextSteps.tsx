import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ExhibitorRegistrationFormData, 
  confirmIntentOptions 
} from "@/types/exhibitor/registration";

interface ConfirmationNextStepsProps {
  form: UseFormReturn<ExhibitorRegistrationFormData>;
}

export function ConfirmationNextSteps({ form }: ConfirmationNextStepsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Confirmation Intent */}
        <FormField
          control={form.control}
          name="confirmIntent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmation of Intent *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Please confirm your participation intent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {confirmIntentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Letter of Intent Upload */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Letter of Intent</h3>
              <p className="text-xs text-muted-foreground">
                Upload a formal letter of intent - supports documents (PDF, DOC, DOCX) and images (JPG, PNG, etc.)
              </p>
              <FormField
                control={form.control}
                name="letterOfIntentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Store the file object for later upload
                            field.onChange(file);
                          }
                        }}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Comments */}
        <FormField
          control={form.control}
          name="additionalComments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Comments</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information, special requests, or questions you'd like to share with the organizing team"
                  className="min-h-[100px]"
                  maxLength={1000}
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0}/1000 characters
              </div>
            </FormItem>
          )}
        />

        {/* Information Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-blue-900">Next Steps</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <p>• You will receive a confirmation email within 24 hours</p>
                <p>• Our team will contact you for booth allocation and payment details</p>
                <p>• Technical requirements and setup guidelines will be provided</p>
                <p>• Marketing collaboration opportunities will be discussed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}