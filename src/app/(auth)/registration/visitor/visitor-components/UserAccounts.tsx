import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { RegistrationFormData } from "@/hooks/standard-hooks/visitor/useRegistrationSchema";
import { useEmailValidation } from "@/hooks/tanstasck-query/useEmailValidation";

interface UserAccountsProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function UserAccounts({ form }: UserAccountsProps) {
  const email = form.watch("email");
  const { data: emailCheck, isLoading: emailLoading } =
    useEmailValidation(email);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Email *</FormLabel>
                <FormMessage />
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      className={`pr-10 ${
                        emailCheck?.exists
                          ? "border-red-500 focus-visible:ring-red-500"
                          : email && email.includes("@") && !emailCheck?.exists
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                    />
                  </FormControl>
                  {email && email.includes("@") && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : emailCheck?.exists ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  )}
                </div>

                {emailCheck?.exists && (
                  <Alert variant="destructive" className="py-2">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      This email is already registered. Please use a different
                      email address.
                    </AlertDescription>
                  </Alert>
                )}

                {email &&
                  email.includes("@") &&
                  !emailCheck?.exists &&
                  !emailLoading && (
                    <Alert className="py-2 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-sm text-green-600">
                        Email is available!
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Phone *</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <div className="absolute left-3 z-10 bg-background px-1 ">
                    +63
                  </div>
                  <Input
                    placeholder="Enter your phone number"
                    {...field}
                    value={field.value?.replace("+63", "") || ""}
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/\D/g, "");
                      const truncated = numbersOnly.slice(0, 10);
                      field.onChange(`+63${truncated}`);
                    }}
                    className="pl-12 "
                    maxLength={10}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="landline"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Landline</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
