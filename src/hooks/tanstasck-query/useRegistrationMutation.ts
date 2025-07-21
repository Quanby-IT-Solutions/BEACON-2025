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

  const responseData = await response.json();
  console.log("Response data:", responseData);

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
        toast.success("Registration completed successfully!");
        // Invalidate and refetch any related queries
        queryClient.invalidateQueries({ queryKey: ['visitors'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error(data.message || "Registration failed");
      }
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    },
  });
};

// Export mutation key for other hooks to use
export const REGISTRATION_MUTATION_KEY = ['register-visitor'] as const;