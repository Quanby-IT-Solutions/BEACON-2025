"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  DollarSign,
  Info,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Building,
  Users,
} from "lucide-react";
import { PaymentDetailsProps } from "@/types/conference/components";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";

export default function PaymentDetails({ form }: PaymentDetailsProps) {
  const {
    selectedEvents,
    totalAmount,

    requiresPayment,
    updateFormData,
    calculateTotalAmount,
  } = useConferenceRegistrationStore();
  const [paymentMethod, setPaymentMethod] = useState<string>("GCASH");

  const formatPrice = (price: number) => {
    return price === 0 ? "FREE" : `₱${price.toLocaleString()}`;
  };

  // Update form when payment method changes
  useEffect(() => {
    if (paymentMethod) {
      form.setValue("paymentMode", paymentMethod as any);
    }
  }, [paymentMethod, form]);

  // Watch for custom payment amount changes and recalculate total
  const customPaymentAmount = form.watch("customPaymentAmount");
  useEffect(() => {
    updateFormData({ customPaymentAmount });
    calculateTotalAmount();
  }, [customPaymentAmount, updateFormData, calculateTotalAmount]);

  // If no payment required (TML member), show confirmation
  if (!requiresPayment) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Payment Information
          </h3>
          <p className="text-sm text-muted-foreground">
            Your payment information and TML member benefits.
          </p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-800">
              <Users className="h-4 w-4" />
              TML Member Benefits Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-800">Registration Status:</span>
                <Badge className="bg-green-600 text-white">
                  FREE - TML Member
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-800">Total Events Selected:</span>
                <span className="font-medium text-green-800">
                  {selectedEvents.length}
                </span>
              </div>
              {totalAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-green-800">Total Savings:</span>
                  <span className="font-bold text-green-800">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              )}
              <Alert className="border-green-300 bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  As a verified TML member, all conference events are
                  complimentary. No payment is required to complete your
                  registration.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}

      <FormField
        control={form.control}
        name="paymentMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              1. Select Payment Method
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => {
                  setPaymentMethod(value);
                  field.onChange(value);
                }}
                value={field.value || paymentMethod}
                className="flex flex-col space-y-3 mt-2"
              >
                <div className="flex-1 flex items-center gap-3">
                  <RadioGroupItem value="GCASH" id="gcash" />
                  <label htmlFor="gcash" className="font-medium cursor-pointer">
                    GCash
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Pay via GCash mobile app or online
                  </p>
                </div>

                <div className="flex-1 flex items-center gap-3">
                  <RadioGroupItem value="BANK_DEPOSIT_TRANSFER" id="bank" />
                  <label htmlFor="bank" className="font-medium cursor-pointer">
                    Bank Transfer
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Online banking or over-the-counter transfer
                  </p>
                </div>

                <div className="flex-1 flex items-center gap-3">
                  <RadioGroupItem value="WALK_IN_ON_SITE" id="walkin" />
                  <label
                    htmlFor="walkin"
                    className="font-medium cursor-pointer"
                  >
                    Walk-in Payment
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Pay on-site during the event
                  </p>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {paymentMethod === "BANK_DEPOSIT_TRANSFER" && (
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <strong>Bank Transfer:</strong> Bank details will be provided after
            registration. You'll need to upload proof of payment for
            verification.
          </AlertDescription>
        </Alert>
      )}

      {/* Custom Payment Amount (if needed) */}

      <FormField
        control={form.control}
        name="customPaymentAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              2. Additional Amount{" "}
              <span className="text-blue-800 font-medium">
                (Optional only if you want to Donate)
              </span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                placeholder="Enter additional amount (optional)"
                type="number"
                min="0"
                step="0.01"
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              Add any additional amount if you wish to make a donation or pay
              for extras.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Payment Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-800">
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Amount:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            {customPaymentAmount && parseFloat(customPaymentAmount) > 0 && (
              <div className="flex justify-between">
                <span>Additional Donation:</span>
                <span>₱{parseFloat(customPaymentAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold text-blue-800">
              <span>Total Amount:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden field for total payment amount */}
      <FormField
        control={form.control}
        name="totalPaymentAmount"
        render={({ field }) => {
          // Update form value with the store's calculated total
          useEffect(() => {
            field.onChange(totalAmount);
          }, [totalAmount, field]);

          return <input type="hidden" {...field} value={totalAmount} />;
        }}
      />
    </div>
  );
}
