import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RegistrationFormData,
  eventPartsOptions,
} from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { EventDay, InterestArea } from "@prisma/client";

interface EventPreferencesProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function EventPreferences({ form }: EventPreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Attendee Type */}
        <FormField
          control={form.control}
          name="attendeeType"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>1. Attendee Type *</FormLabel>
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

        {/* Event Days */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-blue-800">
              2. Attendance Days *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="attendingDays"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(EventDay).map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name="attendingDays"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day.replace("_", " ")}
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
          </CardContent>
        </Card>

        {/* Event Parts */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-800">
              3. Event Components *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="eventParts"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {eventPartsOptions.map((part) => (
                      <FormField
                        key={part}
                        control={form.control}
                        name="eventParts"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={part}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(part)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, part])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== part
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{part}</FormLabel>
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
          </CardContent>
        </Card>

        {/* Interest Areas */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-purple-800">
              4. Interest Areas *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="interestAreas"
              render={() => (
                <FormItem>
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
          </CardContent>
        </Card>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="receiveUpdates"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>5. Receive event updates</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inviteToFutureEvents"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>6. Invite to future events</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
