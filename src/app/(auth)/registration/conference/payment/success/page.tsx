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
    const checkoutSessionId = searchParams.get('checkout_session_id');
    
    if (!checkoutSessionId) {
      setError('No checkout session ID found');
      setIsLoading(false);
      return;
    }

    // Verify payment status with backend
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/conference/payment/verify?checkout_session_id=${checkoutSessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setPaymentData(data.data);
        } else {
          setError(data.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError('Failed to verify payment status');
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
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/conference">
                Return to Registration
              </Link>
            </Button>
          </CardContent>
        </Card>
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
              Thank you for your payment. Your BEACON 2025 Conference registration is now complete.
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
                  <span className="text-muted-foreground">Registration ID:</span>
                  <p className="font-medium">{paymentData.conferenceId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <p className="font-medium">₱{paymentData.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <p className="font-medium">{paymentData.paymentMethod || 'Online Payment'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Date:</span>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {paymentData.referenceNumber && (
                <div>
                  <span className="text-muted-foreground">Reference Number:</span>
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
                A confirmation email with your registration details and event tickets has been sent to your registered email address.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Check your email for the confirmation and event details</span>
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