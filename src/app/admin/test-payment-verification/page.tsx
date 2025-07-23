"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

export default function TestPaymentVerificationPage() {
  const [checkoutSessionId, setCheckoutSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleManualVerify = async () => {
    if (!checkoutSessionId.trim()) {
      setError("Please enter a checkout session ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/conference/payment/manual-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checkoutSessionId: checkoutSessionId.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!checkoutSessionId.trim()) {
      setError("Please enter a checkout session ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/conference/payment/manual-verify?checkout_session_id=${encodeURIComponent(checkoutSessionId.trim())}`
      );

      const data = await response.json();

      if (data.success) {
        setResult({ data: data.data, type: 'status' });
      } else {
        setError(data.error || "Status check failed");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Test Payment Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use this tool to manually verify PayMongo test payments and check payment status.
              This is for testing purposes only.
            </p>
          </CardContent>
        </Card>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="checkoutSessionId">PayMongo Checkout Session ID</Label>
              <Input
                id="checkoutSessionId"
                placeholder="cs_test_..."
                value={checkoutSessionId}
                onChange={(e) => setCheckoutSessionId(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find this in the URL after PayMongo payment or in the database paymongoCheckoutId field
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleManualVerify}
                disabled={isLoading || !checkoutSessionId.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Verify & Confirm Payment
              </Button>

              <Button
                variant="outline"
                onClick={handleCheckStatus}
                disabled={isLoading || !checkoutSessionId.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Check Status Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Result Display */}
        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                {result.type === 'status' ? 'Payment Status' : 'Verification Result'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.message && (
                <Alert className="border-green-300 bg-green-100 mb-4">
                  <AlertDescription className="text-green-800">
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Payment ID:</span>
                  <p className="font-mono">{result.data?.paymentId}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Conference ID:</span>
                  <p className="font-mono">{result.data?.conferenceId}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Status:</span>
                  <p className="font-semibold">{result.data?.status || result.data?.paymentStatus}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Is Paid:</span>
                  <p className="font-semibold">{result.data?.isPaid ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Amount:</span>
                  <p>₱{result.data?.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Payment Method:</span>
                  <p>{result.data?.paymentMethod || 'N/A'}</p>
                </div>
                {result.data?.referenceNumber && (
                  <div className="md:col-span-2">
                    <span className="text-green-700 font-medium">Reference Number:</span>
                    <p className="font-mono">{result.data.referenceNumber}</p>
                  </div>
                )}
                {result.data?.confirmedAt && (
                  <div className="md:col-span-2">
                    <span className="text-green-700 font-medium">Confirmed At:</span>
                    <p>{new Date(result.data.confirmedAt).toLocaleString()}</p>
                  </div>
                )}
                {result.data?.email && (
                  <div>
                    <span className="text-green-700 font-medium">Email:</span>
                    <p>{result.data.email}</p>
                  </div>
                )}
                {result.data?.name && (
                  <div>
                    <span className="text-green-700 font-medium">Name:</span>
                    <p>{result.data.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2 text-sm">
            <p><strong>1. Get Checkout Session ID:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>From the PayMongo payment URL (cs_test_...)</li>
              <li>From the database conference_payments table (paymongoCheckoutId field)</li>
              <li>From the browser console logs during payment</li>
            </ul>
            
            <p><strong>2. Verify Payment:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Check Status Only:</strong> View current payment status without making changes</li>
              <li><strong>Verify & Confirm:</strong> Manually confirm the payment if PayMongo shows it as paid</li>
            </ul>

            <p><strong>3. Webhook Setup:</strong></p>
            <p>For automatic verification, configure PayMongo webhook to: <code>{window.location.origin}/api/webhooks/paymongo</code></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}