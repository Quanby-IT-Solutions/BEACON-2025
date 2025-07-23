"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  Lightbulb,
  UserCheck,
  Smartphone,
  Monitor,
} from "lucide-react";

interface FaceCaptureInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  isMobile: boolean;
}

const instructions = [
  {
    step: 1,
    title: "Prepare Your Environment",
    icon: Lightbulb,
    content: [
      "Find a well-lit area with natural light if possible",
      "Ensure your camera is clean and unobstructed",
      "Position yourself in front of the camera",
      "Remove sunglasses and hats for clear visibility",
    ],
    tip: "Good lighting is essential for face detection to work properly.",
  },
  {
    step: 2,
    title: "Camera Positioning",
    icon: Eye,
    content: [
      "Hold your device steady at eye level",
      "Keep the camera about arm's length away",
      "Look directly into the camera lens",
      "Keep your face upright and centered",
    ],
    tip: "The closer your face to the center, the better the detection.",
  },
  {
    step: 3,
    title: "Face Positioning Guide",
    icon: UserCheck,
    content: [
      "Position your face within the oval guide that will appear",
      "Make sure your entire face is visible",
      "Keep your expression neutral with eyes open",
      "Wait for the green border indicating proper positioning",
    ],
    tip: "The system will automatically detect when your face is properly positioned.",
  },
  {
    step: 4,
    title: "Capture Your Photo",
    icon: Camera,
    content: [
      "When you see 'Ready to Capture!' message, click the capture button",
      "Stay still during the capture process",
      "Review your photo and retake if needed",
      "Ensure the photo clearly shows your face",
    ],
    tip: "You can retake the photo as many times as needed until you're satisfied.",
  },
];

export function FaceCaptureInstructions({
  isOpen,
  onClose,
  onProceed,
  isMobile,
}: FaceCaptureInstructionsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentInstruction = instructions[currentStep];
  const IconComponent = currentInstruction.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isMobile ? "max-w-[95vw] w-full p-4" : "max-w-2xl"
        } max-h-[90vh] overflow-y-auto scroll-none`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center text-xl">
            <Camera className="w-6 h-6" />
            Face Capture Instructions
            {isMobile && <Smartphone className="w-5 h-5" />}
            {!isMobile && <Monitor className="w-5 h-5" />}
          </DialogTitle>
          <DialogDescription className="text-center">
            Follow these steps to capture a perfect profile photo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Stepper */}
          <div className="flex items-center justify-center space-x-2">
            {instructions.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground border-primary"
                      : index < currentStep
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-gray-200 text-gray-500 border-gray-300"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < instructions.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 transition-colors ${
                      index < currentStep ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-primary/10 rounded-full p-3">
                <IconComponent className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h3 className="text-xl font-semibold">
              Step {currentInstruction.step}: {currentInstruction.title}
            </h3>

            <div className="space-y-3 text-left max-w-md mx-auto">
              {currentInstruction.content.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Tip:</span>{" "}
                  {currentInstruction.tip}
                </p>
              </div>
            </div>

            {/* Visual Guide for Step 3 */}
            {currentStep === 2 && (
              <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm font-semibold mb-3">Visual Guide:</p>
                <div className="relative w-fit h-fit mx-auto bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src="/images/face-recognition.jpg"
                    className="object-contain"
                    alt=""
                  />
                  {/* Status indicator */}
                  <Badge className="absolute top-1 left-1 text-xs bg-green-500 text-white">
                    <CheckCircle className="w-2 h-2 mr-1" />
                    Perfect!
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Position your face like this within the oval guide
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              {currentStep + 1} of {instructions.length}
            </div>

            {currentStep === instructions.length - 1 ? (
              <Button
                onClick={onProceed}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Camera className="w-4 h-4" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onProceed}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip instructions and start camera
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
