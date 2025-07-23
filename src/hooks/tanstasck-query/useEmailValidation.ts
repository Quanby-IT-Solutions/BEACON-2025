import { useQuery } from "@tanstack/react-query";

interface EmailCheckResponse {
  exists: boolean;
  message: string;
}

const checkEmailExists = async (email: string): Promise<EmailCheckResponse> => {
  if (!email || email.length < 3) {
    return { exists: false, message: "" };
  }

  const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);

  if (!response.ok) {
    throw new Error("Failed to check email");
  }

  return response.json();
};

export const useEmailValidation = (email: string) => {
  return useQuery({
    queryKey: ["check-email", email],
    queryFn: () => checkEmailExists(email),
    enabled: !!email && email.includes("@"), // Only run if email looks valid
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};