"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Building, Globe, MapPin } from "lucide-react";
import { ProfessionalInformationProps } from "@/types/conference/components";

export default function ProfessionalInformation({ form }: ProfessionalInformationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          Professional Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Share your professional background and organization details.
        </p>
      </div>

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
                    <Briefcase className="h-4 w-4" />
                    Job Title / Position
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
                    <Building className="h-4 w-4" />
                    Company / Organization
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
                  <FormLabel>Industry / Sector</FormLabel>
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
                    <Globe className="h-4 w-4" />
                    Company Website
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
                  <MapPin className="h-4 w-4" />
                  Company Address
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