"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Home, Mail, FileText, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try multiple possible parameter names that PayMongo might use
    const checkoutSessionId =
      searchParams.get("checkout_session_id") ||
      searchParams.get("session_id") ||
      searchParams.get("checkout_id") ||
      searchParams.get("cs");

    console.log(
      "URL search params:",
      Object.fromEntries(searchParams.entries())
    );
    console.log("Looking for checkout session ID:", checkoutSessionId);

    if (!checkoutSessionId) {
      // Show available parameters for debugging
      const allParams = Object.fromEntries(searchParams.entries());
      console.log("Available URL parameters:", allParams);

      setError(
        `No checkout session ID found. Available parameters: ${
          Object.keys(allParams).join(", ") || "none"
        }`
      );
      setIsLoading(false);
      return;
    }

    // Verify payment status with backend
    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/conference/payment/verify?checkout_session_id=${checkoutSessionId}`
        );
        const data = await response.json();

        if (data.success) {
          setPaymentData(data.data);
        } else {
          setError(data.error || "Payment verification failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setError("Failed to verify payment status");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-center text-orange-800">
                Payment Verification Issue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-orange-700 text-center">{error}</p>

              <div className="text-sm text-orange-600">
                <p>
                  <strong>What happened?</strong>
                </p>
                <p>
                  PayMongo may have redirected here without the proper session
                  information. This can happen occasionally but doesn't mean
                  your payment failed.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Check your email</p>
                    <p className="text-sm text-muted-foreground">
                      If your payment was successful, you should receive a
                      confirmation email from both PayMongo and BEACON 2025.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Manual verification</p>
                    <p className="text-sm text-muted-foreground">
                      If you completed the payment, our team can manually verify
                      it using your checkout session ID.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Contact support</p>
                    <p className="text-sm text-muted-foreground">
                      If you're unsure about your payment status, contact our
                      support team with your payment reference.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link href="/admin/test-payment-verification">
                    Manual Verification
                  </Link>
                </Button>

                <Button variant="outline" asChild className="flex-1">
                  <Link href="/registration/conference">
                    Return to Registration
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-blue-800">
                <strong>Need immediate help?</strong>
                <br />
                Email:{" "}
                <a href="mailto:support@beacon2025.com" className="underline">
                  support@beacon2025.com
                </a>
                <br />
                Phone:{" "}
                <a href="tel:+639123456789" className="underline">
                  +63 912 345 6789
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-700">
              Thank you for your payment. Your BEACON 2025 Conference
              registration is now complete.
            </p>
          </CardContent>
        </Card>

        {/* Payment Details */}
        {paymentData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Registration ID:
                  </span>
                  <p className="font-medium">{paymentData.conferenceId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <p className="font-medium">
                    ₱{paymentData.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <p className="font-medium">
                    {paymentData.paymentMethod || "Online Payment"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Date:</span>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {paymentData.referenceNumber && (
                <div>
                  <span className="text-muted-foreground">
                    Reference Number:
                  </span>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {paymentData.referenceNumber}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                A confirmation email with your registration details and event
                tickets has been sent to your registered email address.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>
                  Check your email for the confirmation and event details
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Save your registration ID for future reference</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Mark your calendar for the event dates</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View My Registrations
            </Link>
          </Button>
        </div>

        {/* Support Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-blue-800">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@beacon2025.com" className="underline">
                support@beacon2025.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
