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
import { Card, CardContent } from "@/components/ui/card";
import { 
  ExhibitorRegistrationFormData, 
  yesNoMaybeOptions, 
  marketingCollateralsOptions 
} from "@/types/exhibitor/registration";

interface LogisticsMarketingProps {
  form: UseFormReturn<ExhibitorRegistrationFormData>;
}

export function LogisticsMarketing({ form }: LogisticsMarketingProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Large Equipment */}
        <FormField
          control={form.control}
          name="bringLargeEquipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Will you bring large equipment or machinery?</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {yesNoMaybeOptions.map((option) => (
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

        {/* Marketing Collaterals */}
        <FormField
          control={form.control}
          name="haveMarketingCollaterals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marketing Collaterals Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your marketing materials status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {marketingCollateralsOptions.map((option) => (
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

        {/* Company Logo Upload */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Company Logo</h3>
              <p className="text-xs text-muted-foreground">
                Upload your company logo for marketing materials and event promotions (supports PNG, JPG, SVG, GIF, etc.)
              </p>
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
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
      </div>
    </div>
  );
}