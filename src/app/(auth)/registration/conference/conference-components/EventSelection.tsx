"use client";

import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Info,
} from "lucide-react";
import { EventSelectionProps } from "@/types/conference/components";
import {
  useActiveEventsQuery,
  useEventSelection,
} from "@/hooks/tanstasck-query/useEventsQuery";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";

export default function EventSelection({ form }: EventSelectionProps) {
  const { updateSelectedEvents, selectedEvents, totalAmount, requiresPayment } =
    useConferenceRegistrationStore();

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
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Event Selection
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the events you'd like to attend at BEACON 2025. ( has discount
          if you select all 3 conference events )
        </p>
      </div>

      {/* Pricing Notice for Non-TML Members */}
      {requiresPayment && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <DollarSign className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Payment Required:</strong> As a non-TML member, you'll need
            to pay for selected events. TML members enjoy free access to all
            events.
          </AlertDescription>
        </Alert>
      )}

      {/* Free Events Notice for TML Members */}
      {!requiresPayment && (
        <Alert className="border-green-200 bg-green-50">
          <Users className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>TML Member Benefit:</strong> All events are free for
            verified TML members!
          </AlertDescription>
        </Alert>
      )}

      {/* Event Selection */}
      <FormField
        control={form.control}
        name="selectedEventIds"
        render={() => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="text-base font-medium">
                Select Events to Attend *
              </FormLabel>
              <FormMessage />
            </div>
            <FormDescription>
              Select one or more events you'd like to attend. You can modify
              your selection later.
            </FormDescription>
            <FormControl>
              <div className="grid grid-cols-1 gap-4">
                {events
                  .sort((a, b) => a.eventName.localeCompare(b.eventName))
                  .map((event) => (
                    <Card
                      key={event.id}
                      className="relative hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
                              name="selectedEventIds"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          event.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          const currentValues =
                                            field.value || [];
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
                                  </FormItem>
                                );
                              }}
                            />
                            <div className="flex-1">
                              <CardTitle className="text-base leading-tight">
                                {event.eventName}
                              </CardTitle>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getEventStatusColor(event.eventStatus)}
                              variant="secondary"
                            >
                              {event.eventStatus}
                            </Badge>
                            <Badge variant="outline" className="font-semibold">
                              {formatPrice(Number(event.eventPrice))}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(new Date(event.eventDate))}
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      {/* Selection Summary */}
      {selectedEventIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Selected Events ({selectedEventIds.length})
              </h4>

              <div className="space-y-2">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-blue-800">{event.name}</span>
                    <span className="font-medium text-blue-900">
                      {formatPrice(event.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-blue-200 pt-3">
                {/* Show discount breakdown if applicable */}
                {(() => {
                  const conferenceEvents = events.filter(
                    (event) => event.eventStatus === "CONFERENCE"
                  );
                  const selectedConferenceEvents = selectedEvents.filter(
                    (event) => {
                      const eventData = events.find((e) => e.id === event.id);
                      return eventData?.eventStatus === "CONFERENCE";
                    }
                  );
                  const hasConferenceDiscount =
                    conferenceEvents.length === 3 &&
                    selectedConferenceEvents.length === 3;
                  const subtotal = selectedEvents.reduce(
                    (sum, event) => sum + event.price,
                    0
                  );

                  if (hasConferenceDiscount && requiresPayment) {
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-800">Subtotal:</span>
                          <span className="text-blue-800">
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-800">
                            All Conference Events Discount:
                          </span>
                          <span className="text-green-800">-₱1,500</span>
                        </div>
                        <div className="border-t border-blue-200 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-blue-900">
                              Total Amount:
                            </span>
                            <span className="text-lg font-bold text-blue-900">
                              {formatPrice(totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-900">
                          Total Amount:
                        </span>
                        <span className="text-lg font-bold text-blue-900">
                          {requiresPayment
                            ? formatPrice(totalAmount)
                            : "FREE (TML Member)"}
                        </span>
                      </div>
                    );
                  }
                })()}
                {!requiresPayment && totalAmount > 0 && (
                  <p className="text-xs text-blue-700 mt-1">
                    Savings: {formatPrice(totalAmount)} (TML Member Benefit)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Selection Warning */}
      {selectedEventIds.length === 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Please select at least one event to proceed with your registration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
