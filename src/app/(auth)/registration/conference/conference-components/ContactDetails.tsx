"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { ContactDetailsProps } from "@/types/conference/components";
import { useEmailValidation } from "@/hooks/tanstasck-query/useEmailValidation";

export default function ContactDetails({ form }: ContactDetailsProps) {
  const email = form.watch("email");
  const { data: emailCheck, isLoading: emailLoading } = useEmailValidation(email);

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
                <div className="space-y-2">
                  <div className="relative">
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        placeholder="your.email@example.com"
                        className={`text-base pr-10 ${
                          emailCheck?.exists ? 'border-red-500 focus-visible:ring-red-500' : 
                          email && email.includes('@') && !emailCheck?.exists && !emailLoading ? 'border-green-500 focus-visible:ring-green-500' : ''
                        }`}
                      />
                    </FormControl>
                    {email && email.includes('@') && email.length > 5 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {emailLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : emailCheck?.exists ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {emailCheck?.exists && (
                    <Alert variant="destructive" className="py-2">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        This email is already registered. Please use a different email address.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {email && email.includes('@') && email.length > 5 && !emailCheck?.exists && !emailLoading && (
                    <Alert className="py-2 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-sm text-green-600">
                        Email is available!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
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