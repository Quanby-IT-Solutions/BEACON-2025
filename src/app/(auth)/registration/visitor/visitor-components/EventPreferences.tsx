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
import {
  RegistrationFormData,
  eventPartsOptions,
} from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { EventDay, InterestArea } from "@/generated/prisma";

interface EventPreferencesProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function EventPreferences({ form }: EventPreferencesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Event Preferences</h3>

      <FormField
        control={form.control}
        name="attendeeType"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Attendee Type *</FormLabel>
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

      <FormField
        control={form.control}
        name="attendingDays"
        render={() => (
          <FormItem>
            <div className="mb-4 flex items-center justify-between">
              <FormLabel className="text-base">
                Which days will you attend? *
              </FormLabel>
              <FormMessage />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="eventParts"
        render={() => (
          <FormItem>
            <div className="mb-4 flex items-center justify-between">
              <FormLabel className="text-base">
                Which event parts interest you? *
              </FormLabel>
              <FormMessage />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="interestAreas"
        render={() => (
          <FormItem>
            <div className="mb-4 flex items-center justify-between">
              <FormLabel className="text-base">Interest Areas *</FormLabel>
              <FormMessage />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </FormItem>
        )}
      />

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
                <FormLabel>Receive event updates</FormLabel>
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
                <FormLabel>Invite to future events</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
