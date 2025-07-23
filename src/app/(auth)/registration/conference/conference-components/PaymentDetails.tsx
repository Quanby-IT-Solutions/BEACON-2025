"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
  Users
} from "lucide-react";
import { PaymentDetailsProps } from "@/types/conference/components";
import { useConferenceRegistrationStore } from "@/hooks/standard-hooks/conference/useConferenceRegistrationStore";

export default function PaymentDetails({ form }: PaymentDetailsProps) {
  const { selectedEvents, totalAmount, requiresPayment } = useConferenceRegistrationStore();
  const [paymentMethod, setPaymentMethod] = useState<string>("GCASH");

  const formatPrice = (price: number) => {
    return price === 0 ? 'FREE' : `₱${price.toLocaleString()}`;
  };

  // Update form when payment method changes
  useEffect(() => {
    if (paymentMethod) {
      form.setValue("paymentMode", paymentMethod as any);
    }
  }, [paymentMethod, form]);

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
                <Badge className="bg-green-600 text-white">FREE - TML Member</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-800">Total Events Selected:</span>
                <span className="font-medium text-green-800">{selectedEvents.length}</span>
              </div>
              {totalAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-green-800">Total Savings:</span>
                  <span className="font-bold text-green-800">{formatPrice(totalAmount)}</span>
                </div>
              )}
              <Alert className="border-green-300 bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  As a verified TML member, all conference events are complimentary. 
                  No payment is required to complete your registration.
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
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Payment Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose your payment method and review the total amount.
        </p>
      </div>

      {/* Payment Required Notice */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Payment Required:</strong> As a non-TML member, payment is required to complete your registration.
        </AlertDescription>
      </Alert>

      {/* Payment Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-blue-800">
            <DollarSign className="h-4 w-4" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">{event.name}</span>
                  <span className="font-medium text-blue-900">{formatPrice(event.price)}</span>
                </div>
              ))}
            </div>
            
            {/* Show discount if applicable */}
            {(() => {
              const subtotal = selectedEvents.reduce((sum, event) => sum + event.price, 0);
              const hasDiscount = subtotal > totalAmount;
              
              if (hasDiscount) {
                return (
                  <div className="border-t border-blue-200 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">Subtotal:</span>
                      <span className="text-blue-800">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-800">All Conference Events Discount:</span>
                      <span className="text-green-800">-₱{(subtotal - totalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="border-t border-blue-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900">Total Amount:</span>
                <span className="text-xl font-bold text-blue-900">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="paymentMode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => {
                      setPaymentMethod(value);
                      field.onChange(value);
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="GCASH" id="gcash" />
                      <div className="flex-1 flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        <div>
                          <FormLabel htmlFor="gcash" className="font-medium cursor-pointer">
                            GCash
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Pay using your GCash wallet
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Instant
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="BANK_DEPOSIT_TRANSFER" id="bank" />
                      <div className="flex-1 flex items-center gap-3">
                        <Building className="h-5 w-5 text-gray-600" />
                        <div>
                          <FormLabel htmlFor="bank" className="font-medium cursor-pointer">
                            Bank Transfer
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Online banking or over-the-counter transfer
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Manual
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="WALK_IN_ON_SITE" id="walkin" />
                      <div className="flex-1 flex items-center gap-3">
                        <Users className="h-5 w-5 text-orange-600" />
                        <div>
                          <FormLabel htmlFor="walkin" className="font-medium cursor-pointer">
                            Walk-in Payment
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Pay on-site during the event
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        On-site
                      </Badge>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      {paymentMethod === "GCASH" && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>GCash Payment:</strong> You will be redirected to PayMongo's secure payment page to complete your GCash payment after registration.
          </AlertDescription>
        </Alert>
      )}

      {paymentMethod === "BANK_DEPOSIT_TRANSFER" && (
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <strong>Bank Transfer:</strong> Bank details will be provided after registration. You'll need to upload proof of payment for verification.
          </AlertDescription>
        </Alert>
      )}

      {paymentMethod === "WALK_IN_ON_SITE" && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Walk-in Payment:</strong> You can pay on-site during the event. Please bring valid ID and your registration confirmation.
          </AlertDescription>
        </Alert>
      )}

      {/* Custom Payment Amount (if needed) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Payment (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="customPaymentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Amount</FormLabel>
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
                  Add any additional amount if you wish to make a donation or pay for extras.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Hidden field for total payment amount */}
      <FormField
        control={form.control}
        name="totalPaymentAmount"
        render={({ field }) => (
          <input type="hidden" {...field} value={totalAmount || 0} />
        )}
      />
    </div>
  );
}