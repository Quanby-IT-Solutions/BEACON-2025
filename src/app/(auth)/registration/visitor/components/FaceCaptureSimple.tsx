"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Camera,
  X,
  Check,
  AlertCircle,
  UserCheck,
  RotateCcw,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FaceCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  capturedImage?: string;
}

// Hook to detect mobile devices
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export function FaceCapture({ onCapture, capturedImage }: FaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Reset states when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setHasPermission(null);
      setDeviceError(null);
      setIsCapturing(false);
    }
  };

  // Request camera permission
  const requestPermission = useCallback(async () => {
    try {
      setDeviceError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (error) {
      console.error("Camera permission error:", error);
      setHasPermission(false);
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setDeviceError("Camera access was denied. Please allow camera access and try again.");
        } else if (error.name === "NotFoundError") {
          setDeviceError("No camera found on this device.");
        } else if (error.name === "NotReadableError") {
          setDeviceError("Camera is being used by another application.");
        } else {
          setDeviceError("Unable to access camera. Please check your device settings.");
        }
      }
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;

    setIsCapturing(true);
    
    try {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 640,
        height: 480,
      });

      if (imageSrc) {
        onCapture(imageSrc);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Capture error:", error);
      setDeviceError("Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [onCapture]);

  // Clear captured image
  const clearCapture = useCallback(() => {
    onCapture("");
  }, [onCapture]);

  return (
    <div className="space-y-4">
      {/* Capture Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {capturedImage ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
              <Check className="w-3 h-3 mr-1" />
              Photo Captured
            </Badge>
          ) : (
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              Photo Required
            </Badge>
          )}
        </div>
      </div>

      {/* Preview or Capture Button */}
      {capturedImage ? (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured face"
              className="w-full max-w-sm h-48 object-cover rounded-lg border-2 border-green-300 mx-auto block"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-600 text-white">
                <UserCheck className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Retake Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearCapture}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-full max-w-sm h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto">
            <div className="text-center space-y-2">
              <Camera className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500">No photo captured</p>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capture Photo
          </Button>
        </div>
      )}

      {/* Device Information */}
      <Alert className="border-blue-200 bg-blue-50">
        <div className="flex items-start gap-2">
          {isMobile ? (
            <Smartphone className="w-4 h-4 text-blue-600 mt-0.5" />
          ) : (
            <Monitor className="w-4 h-4 text-blue-600 mt-0.5" />
          )}
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Device detected:</strong> {isMobile ? "Mobile device" : "Desktop/Laptop"}
            <br />
            Please ensure good lighting and position yourself clearly in the frame.
          </AlertDescription>
        </div>
      </Alert>

      {/* Camera Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Capture Your Photo
            </DialogTitle>
            <DialogDescription>
              Position yourself in the center of the frame and click capture when ready.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {hasPermission === null && (
              <div className="text-center space-y-4 py-8">
                <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="font-medium mb-2">Camera Access Required</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We need access to your camera to capture your photo for identification.
                  </p>
                  <Button onClick={requestPermission}>
                    Allow Camera Access
                  </Button>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {deviceError || "Camera access denied. Please allow camera access in your browser settings."}
                </AlertDescription>
              </Alert>
            )}

            {hasPermission === true && (
              <div className="space-y-4">
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: "user",
                    }}
                    className="w-full rounded-lg"
                    onUserMediaError={(error) => {
                      console.error("Webcam error:", error);
                      setDeviceError("Failed to start camera. Please check your device.");
                      setHasPermission(false);
                    }}
                  />
                  
                  {/* Face detection overlay would go here if needed */}
                  <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-50 pointer-events-none" />
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isCapturing}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCapturing ? (
                      <>
                        <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Capturing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-1" />
                        Capture Photo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}