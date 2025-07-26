"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  Copy, 
  CheckCircle2, 
  CreditCard, 
  Building2,
  QrCode,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface PaymentInfo {
  totalAmount: number;
  paymentMode: 'GCASH' | 'BANK_DEPOSIT_TRANSFER';
  conferenceId: string;
  selectedEvents: Array<{
    name: string;
    price: number;
  }>;
}

interface PaymentModalProps {
  isOpen: boolean;
  paymentInfo: PaymentInfo;
  onPaymentComplete: () => void;
}

// Payment details configuration
const PAYMENT_DETAILS = {
  GCASH: {
    name: "GCash Payment",
    icon: <CreditCard className="h-5 w-5" />,
    accountName: "BEACON 2025 Conference",
    accountNumber: "09123456789",
    qrCodeUrl: "/images/gcash-qr.png", // You'll need to add this
    instructions: [
      "Open your GCash app",
      "Scan the QR code or send money to the number above",
      "Enter the exact amount shown",
      "Take a screenshot of the transaction",
      "Upload the receipt below"
    ]
  },
  BANK_DEPOSIT_TRANSFER: {
    name: "Bank Transfer",
    icon: <Building2 className="h-5 w-5" />,
    bankName: "BPI Bank",
    accountName: "The Maritime League Inc.",
    accountNumber: "1234-5678-9012",
    instructions: [
      "Transfer to the bank account details above",
      "Use your name as reference",
      "Keep your deposit slip or online transfer receipt",
      "Upload the receipt below"
    ]
  }
};

export function PaymentModal({ isOpen, paymentInfo, onPaymentComplete }: PaymentModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const paymentDetails = PAYMENT_DETAILS[paymentInfo.paymentMode];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setReceiptFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile) {
      toast.error("Please upload your payment receipt");
      return;
    }

    setIsUploading(true);
    
    try {
      // Create FormData for receipt upload
      const formData = new FormData();
      formData.append('receiptFile', receiptFile);
      formData.append('conferenceId', paymentInfo.conferenceId);

      const response = await fetch('/api/conference/receipt', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload receipt');
      }

      toast.success("Receipt uploaded successfully!", {
        description: "Your payment is now under review. We'll notify you once confirmed."
      });

      onPaymentComplete();
    } catch (error) {
      console.error('Receipt upload error:', error);
      toast.error("Failed to upload receipt", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentDetails.icon}
            Complete Your Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentInfo.selectedEvents.map((event, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{event.name}</span>
                    <span className="text-sm font-medium">₱{event.price.toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-lg">₱{paymentInfo.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {paymentDetails.icon}
                {paymentDetails.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentInfo.paymentMode === 'GCASH' && (
                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-lg border">
                      <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                      {/* Replace with actual QR code image */}
                      <p className="text-sm text-gray-600 mt-2">Scan with GCash app</p>
                    </div>
                  </div>
                  
                  {/* Account Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <Label className="text-xs text-gray-600">Account Name</Label>
                        <p className="font-medium">{paymentDetails.accountName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paymentDetails.accountName, 'Account Name')}
                      >
                        {copied === 'Account Name' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <Label className="text-xs text-gray-600">GCash Number</Label>
                        <p className="font-medium font-mono">{paymentDetails.accountNumber}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paymentDetails.accountNumber, 'GCash Number')}
                      >
                        {copied === 'GCash Number' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {paymentInfo.paymentMode === 'BANK_DEPOSIT_TRANSFER' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <Label className="text-xs text-gray-600">Bank Name</Label>
                      <p className="font-medium">{paymentDetails.bankName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <Label className="text-xs text-gray-600">Account Name</Label>
                      <p className="font-medium">{paymentDetails.accountName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentDetails.accountName, 'Account Name')}
                    >
                      {copied === 'Account Name' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <Label className="text-xs text-gray-600">Account Number</Label>
                      <p className="font-medium font-mono">{paymentDetails.accountNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentDetails.accountNumber, 'Account Number')}
                    >
                      {copied === 'Account Number' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Amount to Pay */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <Label className="text-xs text-blue-600">Amount to Pay</Label>
                  <p className="font-bold text-xl text-blue-800">₱{paymentInfo.totalAmount.toLocaleString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(paymentInfo.totalAmount.toString(), 'Amount')}
                >
                  {copied === 'Amount' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {paymentDetails.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="min-w-[24px] h-6 text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Receipt Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Payment Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-upload"
                />
                <Label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload your payment receipt
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG, JPEG up to 5MB
                  </span>
                </Label>
              </div>

              {receiptPreview && (
                <div className="space-y-2">
                  <Label>Receipt Preview:</Label>
                  <div className="relative border rounded-lg overflow-hidden max-w-xs">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    File: {receiptFile?.name}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Important:</p>
                  <p>Make sure your receipt clearly shows the transaction amount, date, and reference number. This will help us verify your payment quickly.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmitReceipt}
              disabled={!receiptFile || isUploading}
              className="min-w-[150px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Receipt
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}