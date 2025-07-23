"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, X, Check, AlertCircle, Loader2, RotateCcw } from "lucide-react";

interface FaceCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageDataUrl: string) => void;
  capturedImage?: string;
}

export default function FaceCaptureDialog({ open, onOpenChange, onCapture, capturedImage }: FaceCaptureDialogProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const videoConstraints = {
    width: 480,
    height: 640,
    facingMode: facingMode
  };

  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
    setError("");
  }, []);

  const handleCameraError = useCallback(() => {
    setError("Unable to access camera. Please ensure camera permissions are granted.");
    setIsCameraReady(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsCapturing(true);
      // Simulate processing time
      setTimeout(() => {
        onCapture(imageSrc);
        setIsCapturing(false);
      }, 1000);
    }
  }, [onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    setIsCameraReady(false);
  }, []);

  const handleClose = () => {
    setError("");
    setIsCameraReady(false);
    setIsCapturing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Capture Your Photo
          </DialogTitle>
          <DialogDescription>
            Position yourself in the frame and capture a clear photo for identification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Feed */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-[3/4] flex items-center justify-center">
              {!error ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMedia={handleCameraReady}
                  onUserMediaError={handleCameraError}
                  className="w-full h-full object-cover"
                  mirrored={facingMode === "user"}
                />
              ) : (
                <div className="text-center p-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">Camera not available</p>
                </div>
              )}
            </div>

            {/* Loading Overlay */}
            {!isCameraReady && !error && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading camera...</span>
                </div>
              </div>
            )}

            {/* Capture Processing Overlay */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-800">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing photo...</span>
                </div>
              </div>
            )}

            {/* Camera Guidelines */}
            {isCameraReady && !error && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-8 top-8 bottom-8 border-2 border-white/80 rounded-full"></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Center your face in the circle
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          {isCameraReady && !error && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>Ensure good lighting</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>Look directly at the camera</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>Remove sunglasses or hats</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={switchCamera}
              disabled={!isCameraReady || isCapturing}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Switch Camera
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isCapturing}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              
              <Button
                onClick={capturePhoto}
                disabled={!isCameraReady || error !== "" || isCapturing}
                className="flex items-center gap-2"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Capture
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}