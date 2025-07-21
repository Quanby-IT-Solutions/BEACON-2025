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
import { RegistrationFormData } from "@/hooks/standard-hooks/visitor/useRegistrationSchema";

interface EmergencySafetyProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function EmergencySafety({ form }: EmergencySafetyProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Emergency & Safety</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="specialAssistance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Assistance Needed</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="emergencyContactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Person *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Number *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
