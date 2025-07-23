"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Camera, Mail, AlertTriangle, FileText } from "lucide-react";
import { ConsentAndConfirmationProps } from "@/types/conference/components";

export default function ConsentAndConfirmation({ form }: ConsentAndConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Consent & Confirmation
        </h3>
        <p className="text-sm text-muted-foreground">
          Please review and provide your consent for the following items.
        </p>
      </div>

      <div className="space-y-6">
        {/* Data Usage Consent - Required */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="dataUsageConsent"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-red-400 data-[state=checked]:bg-red-600"
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none">
                      <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer text-red-900">
                        <AlertTriangle className="h-4 w-4" />
                        Data Privacy & Usage Consent *
                      </FormLabel>
                      <FormDescription className="text-sm text-red-800">
                        I consent to the collection, processing, and use of my personal data in accordance with the Data Privacy Act of 2012. 
                        This includes my registration information, captured photos, and contact details for the purpose of conference 
                        registration, identification, and event-related communications.
                      </FormDescription>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-red-700 font-medium">Required for registration</span>
                        <FormMessage />
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Photo/Video Consent */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="photoVideoConsent"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none">
                      <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer text-blue-900">
                        <Camera className="h-4 w-4" />
                        Photo & Video Consent
                      </FormLabel>
                      <FormDescription className="text-sm text-blue-700">
                        I consent to being photographed and/or recorded during the conference for promotional, 
                        documentation, and marketing purposes by The Maritime League. These materials may be used 
                        in future marketing materials, social media, and official publications.
                      </FormDescription>
                      <span className="text-xs text-blue-600">Optional - You can still attend without this consent</span>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Email Certificate */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="emailCertificate"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none">
                      <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer text-green-900">
                        <Mail className="h-4 w-4" />
                        Digital Certificate Request
                      </FormLabel>
                      <FormDescription className="text-sm text-green-700">
                        I would like to receive a digital certificate of attendance via email after the conference. 
                        This certificate will be sent to the email address provided in my registration.
                      </FormDescription>
                      <span className="text-xs text-green-600">Free digital certificate via email</span>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Terms and Conditions Notice */}
        <Alert className="border-gray-200 bg-gray-50">
          <FileText className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            <strong>Terms & Conditions:</strong> By submitting this registration, you agree to abide by the conference 
            terms and conditions, code of conduct, and event policies. You acknowledge that the organizers reserve 
            the right to refuse entry or remove participants who violate these terms.
          </AlertDescription>
        </Alert>

        {/* Required Field Notice */}
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Important:</strong> The Data Privacy & Usage Consent is required to proceed with registration. 
            Without this consent, we cannot process your registration for the conference.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}