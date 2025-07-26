"use client";

import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Info } from "lucide-react";
import {
  RegistrationFormData,
  eventPartsOptions,
} from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { InterestArea } from "@prisma/client";
import { useVisitorEventSelection } from "@/hooks/tanstasck-query/useVisitorEventsQuery";
import { useRegistrationStore } from "@/hooks/standard-hooks/visitor/useRegistrationStore";

interface EventPreferencesProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function EventPreferences({ form }: EventPreferencesProps) {
  const { updateSelectedEvents } = useRegistrationStore();

  const {
    events = [],
    isLoading,
    error,
    getEventsByIds,
    formatEventDateRange,
  } = useVisitorEventSelection();

  // Watch selected event IDs
  const selectedEventIds = form.watch("attendingDays") || [];
  const previousSelectionRef = useRef<string>("");

  // Update store when form selection changes
  useEffect(() => {
    // Create a string representation to compare
    const currentSelection = selectedEventIds.sort().join(",");

    // Only update if the selection actually changed
    if (currentSelection !== previousSelectionRef.current) {
      previousSelectionRef.current = currentSelection;

      if (selectedEventIds.length > 0 && events.length > 0) {
        const selected = getEventsByIds(selectedEventIds);
        const eventsWithDetails = selected.map((event) => ({
          id: event.id,
          name: event.eventName,
          price: 0, // VisitorEvents don't have pricing
        }));

        updateSelectedEvents(eventsWithDetails);
      } else {
        updateSelectedEvents([]);
      }
    }
  }, [selectedEventIds, events]);


  const getEventStatusColor = (status: string) => {
    switch (status) {
      case "CONFERENCE":
        return "bg-blue-100 text-blue-800";
      case "SHOW":
        return "bg-purple-100 text-purple-800";
      case "WORKSHOP":
        return "bg-green-100 text-green-800";
      case "SEMINAR":
        return "bg-yellow-100 text-yellow-800";
      case "EXHIBITION":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading available events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Info className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Unable to load events. Please refresh the page or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Selection */}
      <FormField
        control={form.control}
        name="attendingDays"
        render={() => (
          <FormItem>
            <div className="flex items-center justify-between py-4">
              <FormLabel className="text-base font-medium">
                1. Select Events to Attend *
              </FormLabel>
              <FormMessage />
            </div>
            <FormDescription className="font-normal text-accent-foreground pb-4">
              Select one or more events you'd like to attend.
            </FormDescription>
            <FormControl>
              <div className="grid grid-cols-1 gap-6 overflow-hidden">
                {events
                  .sort((a, b) => a.eventName.localeCompare(b.eventName))
                  .map((event) => (
                    <FormField
                      key={`event-${event.id}`}
                      control={form.control}
                      name="attendingDays"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={`item-${event.id}`}
                            className="flex flex-row items-start lg:items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(event.id)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...currentValues,
                                      event.id,
                                    ]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter(
                                        (value) => value !== event.id
                                      )
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-accent-foreground lg:items-center items-start flex lg:flex-row flex-col">
                              {event.eventName}
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getEventStatusColor(
                                    event.eventStatus
                                  )}
                                  variant="secondary"
                                >
                                  {event.eventStatus}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatEventDateRange(event)}
                              </div>
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

      <div className="space-y-6">
        {/* Attendee Type */}
        <FormField
          control={form.control}
          name="attendeeType"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>2. Attendee Type *</FormLabel>
                <FormMessage />
              </div>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select attendee type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="TRADE_VISITOR">Trade Visitor</SelectItem>
                  <SelectItem value="GOVERNMENT_OFFICIAL">
                    Government Official
                  </SelectItem>
                  <SelectItem value="STUDENT_ACADEMIC">
                    Student/Academic
                  </SelectItem>
                  <SelectItem value="MEDIA_PRESS">Media/Press</SelectItem>
                  <SelectItem value="EXHIBITOR">Exhibitor</SelectItem>
                  <SelectItem value="SPEAKER_PANELIST">
                    Speaker/Panelist
                  </SelectItem>
                  <SelectItem value="VIP_GUEST">VIP Guest</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Interest Areas */}

        <FormField
          control={form.control}
          name="interestAreas"
          render={() => (
            <FormItem className="flex flex-col gap-3">
              <FormLabel> 3. Interest Areas *</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(InterestArea).map((area) => (
                  <FormField
                    key={area}
                    control={form.control}
                    name="interestAreas"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={area}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(area)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, area])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== area
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {area
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferences */}
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="receiveUpdates"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base font-medium">
                    4. Do you want to receive event updates?
                  </FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="receiveUpdates-yes" />
                      <label
                        htmlFor="receiveUpdates-yes"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="receiveUpdates-no" />
                      <label
                        htmlFor="receiveUpdates-no"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        No
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inviteToFutureEvents"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base font-medium">
                    5. Do you want to be invited to future events?
                  </FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="true"
                        id="inviteToFutureEvents-yes"
                      />
                      <label
                        htmlFor="inviteToFutureEvents-yes"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="false"
                        id="inviteToFutureEvents-no"
                      />
                      <label
                        htmlFor="inviteToFutureEvents-no"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
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
    </div>
  );
}
