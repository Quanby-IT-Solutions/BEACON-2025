"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Cancel Header */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-orange-800">
              <XCircle className="h-6 w-6" />
              Payment Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-orange-700">
              Your payment was cancelled and your registration has not been
              completed.
            </p>
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What Happened?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your payment process was cancelled before completion. This could
              happen for several reasons:
            </p>
            <ul className="space-y-2 text-sm list-disc pl-6">
              <li>You chose to cancel the payment</li>
              <li>The payment window was closed</li>
              <li>Your session timed out</li>
              <li>There was a technical issue</li>
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                Don't worry! Your registration information has been saved. You
                can continue from where you left off.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <span>
                  Return to the registration form to complete your payment
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <span>
                  Try a different payment method if the previous one didn't work
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <span>
                  Contact support if you're experiencing technical difficulties
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button asChild className="flex items-center gap-2">
            <Link href="/registration/conference">
              <RefreshCw className="h-4 w-4" />
              Complete Registration
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>

        {/* Payment Methods Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base text-blue-800">
              Available Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="bg-white rounded-lg p-3 mb-2">
                  <span className="font-medium text-blue-800">GCash</span>
                </div>
                <p className="text-blue-700">
                  Instant payment via GCash wallet
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-3 mb-2">
                  <span className="font-medium text-blue-800">
                    Bank Transfer
                  </span>
                </div>
                <p className="text-blue-700">
                  Online banking or over-the-counter
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-lg p-3 mb-2">
                  <span className="font-medium text-blue-800">Walk-in</span>
                </div>
                <p className="text-blue-700">Pay on-site during the event</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-700">
              Need assistance? Contact our support team at{" "}
              <a
                href="mailto:support@beacon2025.com"
                className="underline text-blue-600"
              >
                support@beacon2025.com
              </a>{" "}
              or call{" "}
              <a href="tel:+639123456789" className="underline text-blue-600">
                +63 912 345 6789
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
