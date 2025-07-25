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
import { Textarea } from "@/components/ui/textarea";
import { conferenceInterestAreasOptions } from "@/types/conference/registration";
import { InterestsAndPreferencesProps } from "@/types/conference/components";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function InterestsAndPreferences({
  form,
}: InterestsAndPreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Interest Areas */}
        <FormField
          control={form.control}
          name="interestAreas"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">
                  1. Areas of Interest *
                </FormLabel>
                <FormMessage />
              </div>
              <FormDescription>
                Select the topics and areas that interest you most. This helps
                us recommend relevant sessions.
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
                                    field.onChange([
                                      ...currentValues,
                                      item.value,
                                    ]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter(
                                        (value) => value !== item.value
                                      )
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
                  2. Other Interests or Comments
                </FormLabel>
                <FormMessage />
              </div>
              <FormDescription>
                Please specify any other areas of interest or additional
                comments about your conference expectations.
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
        <FormField
          control={form.control}
          name="receiveEventInvites"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                3. Receive Future Event Invitations
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(val) => field.onChange(val === "yes")}
                  // Convert boolean to "yes"/"no" for controlled value
                  value={
                    field.value === true
                      ? "yes"
                      : field.value === false
                      ? "no"
                      : ""
                  }
                  className="flex flex-col space-x-4 mt-2 ml-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="receiveEventInvites-yes" />
                    <label
                      htmlFor="receiveEventInvites-yes"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Yes
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="receiveEventInvites-no" />
                    <label
                      htmlFor="receiveEventInvites-no"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      No
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
