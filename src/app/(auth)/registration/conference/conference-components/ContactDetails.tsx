"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactDetailsProps } from "@/types/conference/components";

export default function ContactDetails({ form }: ContactDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Contact Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Please provide your contact details for communication and updates.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="your.email@example.com"
                    className="text-base"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Mobile Number */}
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Number *
                  </FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="09XXXXXXXXX"
                    className="text-base"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Mailing Address */}
        <FormField
          control={form.control}
          name="mailingAddress"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Mailing Address
                </FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""}
                  placeholder="Enter your complete mailing address..."
                  className="min-h-[100px] resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}