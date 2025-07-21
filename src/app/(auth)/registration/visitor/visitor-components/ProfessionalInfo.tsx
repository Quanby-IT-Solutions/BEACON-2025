import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RegistrationFormData } from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { AttendeeType } from "@/generated/prisma";

interface ProfessionalInfoProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function ProfessionalInfo({ form }: ProfessionalInfoProps) {
  const attendeeType = form.watch("attendeeType");
  const isStudent = attendeeType === AttendeeType.STUDENT_ACADEMIC;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Professional Information</h3>
        {isStudent && (
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
            Optional for students
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title {!isStudent && "*"}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder={isStudent ? "Optional" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company/School Name {!isStudent && "*"}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder={isStudent ? "Optional" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry {!isStudent && "*"}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isStudent
                          ? "Optional - Select industry"
                          : "Select industry"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MARITIME">Maritime</SelectItem>
                  <SelectItem value="GOVERNMENT">Government</SelectItem>
                  <SelectItem value="TOURISM_HOSPITALITY">
                    Tourism & Hospitality
                  </SelectItem>
                  <SelectItem value="SHIPBUILDING_REPAIR">
                    Shipbuilding & Repair
                  </SelectItem>
                  <SelectItem value="ACADEME_STUDENT">
                    Academe/Student
                  </SelectItem>
                  <SelectItem value="NGO_DEVELOPMENT">
                    NGO/Development
                  </SelectItem>
                  <SelectItem value="MEDIA_PRESS">Media/Press</SelectItem>
                  <SelectItem value="OTHERS">Others</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("industry") === "OTHERS" && (
          <FormField
            control={form.control}
            name="industryOthers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please specify industry</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="companyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company/School Address</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder={isStudent ? "Optional" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company/School Website</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder={isStudent ? "Optional" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business/School Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  value={field.value || ""}
                  placeholder={isStudent ? "Optional" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {!isStudent && (
        <p className="text-sm text-muted-foreground">
          * Required fields for professional attendees
        </p>
      )}
    </div>
  );
}
