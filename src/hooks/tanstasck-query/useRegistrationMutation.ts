import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RegistrationFormData } from "@/types/visitor/registration";

interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    visitorId: string;
  };
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

const registerVisitor = async (data: RegistrationFormData): Promise<RegistrationResponse> => {
  console.log("Sending registration data:", data);

  const response = await fetch("/api/visitors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("Response status:", response.status);
  console.log("Response headers:", Object.fromEntries(response.headers.entries()));

  const responseText = await response.text();
  console.log("Raw response:", responseText);

  let responseData;
  try {
    responseData = JSON.parse(responseText);
    console.log("Parsed response data:", responseData);
  } catch (parseError) {
    console.error("Failed to parse JSON response:", parseError);
    console.error("Response was:", responseText);
    throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseData.message || "Registration failed"}`);
  }

  return responseData;
};

export const useRegistrationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerVisitor,
    onSuccess: (data) => {
      if (data.success) {
        // Success toast is now handled in the component for better control
        // Invalidate and refetch any related queries
        queryClient.invalidateQueries({ queryKey: ['visitors'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error("Registration Failed", {
          description: data.message || "Please check your information and try again.",
        });
      }
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast.error("Registration Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    },
  });
};

// Export mutation key for other hooks to use
export const REGISTRATION_MUTATION_KEY = ['register-visitor'] as const;