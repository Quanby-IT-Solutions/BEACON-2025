"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfessionalInformationProps } from "@/types/conference/components";

export default function ProfessionalInformation({
  form,
}: ProfessionalInformationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Title */}
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    1. Job Title / Position
                  </FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="e.g., Marine Engineer, Captain, etc."
                    className="text-base"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Company Name */}
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    2. Company / Organization
                  </FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Your company or organization name"
                    className="text-base"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Industry */}
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>3. Industry / Sector</FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="e.g., Maritime, Shipping, Government, etc."
                    className="text-base"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Company Website */}
          <FormField
            control={form.control}
            name="companyWebsite"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    4. Company Website
                  </FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    type="url"
                    placeholder="https://www.company.com"
                    className="text-base"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Company Address */}
        <FormField
          control={form.control}
          name="companyAddress"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  5. Company Address
                </FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter your company's complete address..."
                  className="min-h-[80px] resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
