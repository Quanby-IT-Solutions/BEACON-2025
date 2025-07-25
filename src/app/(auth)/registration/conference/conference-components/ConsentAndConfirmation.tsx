"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, AlertTriangle } from "lucide-react";
import { ConsentAndConfirmationProps } from "@/types/conference/components";

export default function ConsentAndConfirmation({
  form,
}: ConsentAndConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Data Usage Consent - Required */}
        <Card className="border-red-200 bg-red-50">
          <CardContent>
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
                        className="border-red-400 data-[state=checked]:bg-red-600 mt-1"
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none">
                      <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer text-red-900">
                        <AlertTriangle className="h-4 w-4" />
                        Data Privacy & Usage Consent *
                      </FormLabel>
                      <FormDescription className="text-sm text-red-800">
                        I consent to the collection, processing, and use of my
                        personal data in accordance with the Data Privacy Act of
                        2012. This includes my registration information,
                        captured photos, and contact details for the purpose of
                        conference registration, identification, and
                        event-related communications.
                      </FormDescription>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-red-700 font-medium">
                          Required for registration
                        </span>
                        <FormMessage />
                      </div>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Email Certificate */}
        <Card className="border-green-200 bg-green-50">
          <CardContent>
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
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-2 leading-none">
                      <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer text-green-900">
                        <Mail className="h-4 w-4" />
                        Digital Certificate Request
                      </FormLabel>
                      <FormDescription className="text-sm text-green-700">
                        I would like to receive a digital certificate of
                        attendance via email after the conference. This
                        certificate will be sent to the email address provided
                        in my registration.
                      </FormDescription>
                      <span className="text-xs text-green-600">
                        Free digital certificate via email
                      </span>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
