import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RegistrationFormData } from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { TermsModal } from "../components/TermsModal";

interface AdditionalInfoProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function AdditionalInfo({ form }: AdditionalInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Additional Information</h3>

      <FormField
        control={form.control}
        name="hearAboutEvent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How did you hear about this event? *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="FACEBOOK_SOCIAL_MEDIA">
                  Facebook/Social Media
                </SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="EMAIL_INVITATION">
                  Email Invitation
                </SelectItem>
                <SelectItem value="REFERRED_BY_FRIEND">
                  Referred by Friend
                </SelectItem>
                <SelectItem value="PARTICIPATED_LAST_YEAR">
                  Participated Last Year
                </SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("hearAboutEvent") === "OTHER" && (
        <FormField
          control={form.control}
          name="hearAboutOthers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold">Data Privacy Consent</h4>
          <TermsModal />
        </div>
        
        <FormField
          control={form.control}
          name="dataPrivacyConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I consent to the collection and processing of my personal data
                  in accordance with the Data Privacy Act and agree to the Terms & Conditions. *
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
