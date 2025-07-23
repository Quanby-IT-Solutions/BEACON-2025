"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageSquare, Mail } from "lucide-react";
import { conferenceInterestAreasOptions } from "@/types/conference/registration";
import { InterestsAndPreferencesProps } from "@/types/conference/components";

export default function InterestsAndPreferences({ form }: InterestsAndPreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-blue-600" />
          Areas of Interest & Preferences
        </h3>
        <p className="text-sm text-muted-foreground">
          Help us personalize your conference experience based on your interests.
        </p>
      </div>

      <div className="space-y-6">
        {/* Interest Areas */}
        <FormField
          control={form.control}
          name="interestAreas"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">
                  Areas of Interest *
                </FormLabel>
                <FormMessage />
              </div>
              <FormDescription>
                Select the topics and areas that interest you most. This helps us recommend relevant sessions.
              </FormDescription>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {conferenceInterestAreasOptions.map((item) => (
                    <FormField
                      key={item.value}
                      control={form.control}
                      name="interestAreas"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.value)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, item.value]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((value) => value !== item.value)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Other Interests */}
        <FormField
          control={form.control}
          name="otherInterests"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Other Interests or Comments
                </FormLabel>
                <FormMessage />
              </div>
              <FormDescription>
                Please specify any other areas of interest or additional comments about your conference expectations.
              </FormDescription>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value || ""}
                  placeholder="Tell us about other topics you're interested in or any specific expectations..."
                  className="min-h-[100px] resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Event Invites Preference */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="receiveEventInvites"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer">
                      <Mail className="h-4 w-4" />
                      Receive Future Event Invitations
                    </FormLabel>
                    <FormDescription className="text-sm text-blue-700">
                      I would like to receive invitations and updates about future maritime events and conferences organized by The Maritime League.
                    </FormDescription>
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