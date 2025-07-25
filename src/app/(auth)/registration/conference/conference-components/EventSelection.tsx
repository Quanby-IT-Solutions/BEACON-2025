"use client";

import { useEffect, useRef } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, Info } from "lucide-react";
import { EventSelectionProps } from "@/types/conference/components";
import { useEventSelection } from "@/hooks/tanstasck-query/useEventsQuery";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";

export default function EventSelection({ form }: EventSelectionProps) {
  const { updateSelectedEvents } = useConferenceRegistrationStore();

  const {
    events = [],
    isLoading,
    error,
    calculateTotalPrice,
    getEventsByIds,
  } = useEventSelection();

  // Watch selected event IDs
  const selectedEventIds = form.watch("selectedEventIds") || [];
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
          price: Number(event.eventPrice),
        }));

        updateSelectedEvents(eventsWithDetails);

        // Calculate total with conference discount logic
        const total = calculateTotalWithConferenceDiscount(
          selectedEventIds,
          events
        );
        form.setValue("totalPaymentAmount", total);

        // Check if conference discount is applied
        const conferenceEvents = events.filter(
          (event) => event.eventStatus === "CONFERENCE"
        );
        const selectedConferenceEvents = selected.filter(
          (event) =>
            events.find((e) => e.id === event.id)?.eventStatus === "CONFERENCE"
        );
        const hasDiscount =
          conferenceEvents.length === 3 &&
          selectedConferenceEvents.length === 3;

        // Set hasConferenceDiscount field for backend
        form.setValue("hasConferenceDiscount", hasDiscount);

        // Update the store's totalAmount directly with the discounted amount
        useConferenceRegistrationStore.setState({ totalAmount: total });
      } else {
        updateSelectedEvents([]);
        form.setValue("totalPaymentAmount", 0);
        useConferenceRegistrationStore.setState({ totalAmount: 0 });
      }
    }
  }, [selectedEventIds, events]); // Only depend on the actual data, not the functions

  // Calculate total with conference discount logic
  const calculateTotalWithConferenceDiscount = (
    selectedIds: string[],
    allEvents: any[]
  ) => {
    if (!selectedIds.length || !allEvents.length) return 0;

    const selectedEvents = getEventsByIds(selectedIds);

    // Get all CONFERENCE events
    const conferenceEvents = allEvents.filter(
      (event) => event.eventStatus === "CONFERENCE"
    );
    const selectedConferenceEvents = selectedEvents.filter(
      (event) => event.eventStatus === "CONFERENCE"
    );

    // Calculate base total
    let total = selectedEvents.reduce(
      (sum, event) => sum + Number(event.eventPrice),
      0
    );

    // Apply discount if ALL conference events are selected
    if (
      conferenceEvents.length === 3 &&
      selectedConferenceEvents.length === 3
    ) {
      total -= 1500; // Apply 1500 discount for selecting all 3 conference events
    }

    return total;
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "FREE" : `₱${price.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
        name="selectedEventIds"
        render={() => (
          <FormItem>
            <div className="flex items-center justify-between py-4">
              <FormLabel className="text-base font-medium">
                1. Select Events to Attend *
              </FormLabel>
              <FormMessage />
            </div>
            <FormDescription className="font-normal text-accent-foreground pb-4">
              Select one or more events you'd like to attend. Get a discount of
              ₱1,500 if you select all 3 conference events.
            </FormDescription>
            <FormControl>
              <div className="grid grid-cols-1 gap-6 overflow-hidden">
                {events
                  .sort((a, b) => a.eventName.localeCompare(b.eventName))
                  .map((event) => (
                    <FormField
                      key={`event-${event.id}`}
                      control={form.control}
                      name="selectedEventIds"
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
                                <Badge
                                  variant="outline"
                                  className="font-semibold"
                                >
                                  {formatPrice(Number(event.eventPrice))}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDate(new Date(event.eventDate))}
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
    </div>
  );
}
