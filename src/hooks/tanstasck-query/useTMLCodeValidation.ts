import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/standard-hooks/useDebounce";
import { useState, useEffect } from "react";

interface CodeValidationResponse {
  success: boolean;
  message: string;
  data?: {
    code: string;
    isValid: boolean;
    benefits: string[];
  };
  error?: string;
  usedBy?: {
    name: string;
    email: string;
  };
}

interface CodeUsageUpdateData {
  code: string;
  userId: string;
}

// Validate TML member code
const validateTMLCode = async (code: string): Promise<CodeValidationResponse> => {
  const response = await fetch("/api/code-distribution", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: code.trim() }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Return the error data as is for proper handling
    return data;
  }

  return data;
};

// Hook for validating TML member codes
export const useTMLCodeValidationMutation = () => {
  return useMutation({
    mutationFn: validateTMLCode,
    onError: (error) => {
      console.error("TML code validation error:", error);
    },
    // Don't show automatic toasts - let components handle the response
  });
};

// Mark code as used by a user
const markCodeAsUsed = async ({ code, userId }: CodeUsageUpdateData): Promise<CodeValidationResponse> => {
  const response = await fetch("/api/code-distribution", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to mark code as used');
  }

  return response.json();
};

// Hook for marking code as used
export const useMarkCodeAsUsedMutation = () => {
  return useMutation({
    mutationFn: markCodeAsUsed,
    onSuccess: (data) => {
      toast.success("TML Member code verified and applied successfully!");
    },
    onError: (error) => {
      console.error("Code usage update error:", error);
      toast.error("Failed to apply TML member code", {
        description: error.message,
      });
    },
  });
};

// Real-time code validation hook with debouncing
export const useRealTimeTMLCodeValidation = (initialCode: string = "") => {
  const [code, setCode] = useState(initialCode);
  const [validationResult, setValidationResult] = useState<CodeValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedCode = useDebounce(code, 500); // 500ms delay
  const { mutateAsync: validateCode } = useTMLCodeValidationMutation();

  // Validate code when debounced value changes
  useEffect(() => {
    const validateCodeAsync = async () => {
      if (!debouncedCode.trim()) {
        setValidationResult(null);
        return;
      }

      if (debouncedCode.length < 3) {
        setValidationResult({
          success: false,
          message: "Code must be at least 3 characters long",
          error: "Code too short"
        });
        return;
      }

      setIsValidating(true);
      try {
        const result = await validateCode(debouncedCode);
        setValidationResult(result);
      } catch (error) {
        console.error("Validation error:", error);
        setValidationResult({
          success: false,
          message: "Error validating code",
          error: "Validation failed"
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateCodeAsync();
  }, [debouncedCode, validateCode]);

  const clearValidation = () => {
    setValidationResult(null);
    setCode("");
  };

  const isValid = validationResult?.success === true;
  const hasError = validationResult?.success === false;
  const isEmpty = !code.trim();

  return {
    code,
    setCode,
    validationResult,
    isValidating,
    isValid,
    hasError,
    isEmpty,
    clearValidation,
    // Computed states for UI
    showLoading: isValidating && debouncedCode.length >= 3,
    showSuccess: isValid,
    showError: hasError && !isEmpty,
    errorMessage: validationResult?.message || validationResult?.error,
    benefits: validationResult?.data?.benefits || [],
  };
};

// Get code details by code string
const getCodeDetails = async (code: string) => {
  const response = await fetch(`/api/code-distribution?code=${encodeURIComponent(code)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch code details: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
};

// Hook for fetching code details
export const useCodeDetailsQuery = (code: string) => {
  return useQuery({
    queryKey: ['code-details', code],
    queryFn: () => getCodeDetails(code),
    enabled: !!code && code.length >= 3,
    staleTime: 30 * 1000, // 30 seconds

  });
};

// Get all codes (admin use)
const getAllCodes = async (filters?: { active?: boolean; used?: boolean }) => {
  const params = new URLSearchParams();
  if (filters?.active !== undefined) params.set('active', String(filters.active));
  if (filters?.used !== undefined) params.set('used', String(filters.used));

  const response = await fetch(`/api/code-distribution?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch codes: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
};

// Hook for fetching all codes (admin use)
export const useAllCodesQuery = (filters?: { active?: boolean; used?: boolean }) => {
  return useQuery({
    queryKey: ['all-codes', filters],
    queryFn: () => getAllCodes(filters),
    staleTime: 60 * 1000, // 1 minute

  });
};

// Helper hook for TML member benefits display
export const useTMLMemberBenefits = () => {
  const defaultBenefits = [
    'Free access to all conference events',
    'No registration fees',
    'Priority seating where applicable',
    'Exclusive networking sessions',
    'Digital certificate of attendance'
  ];

  const getBenefitIcon = (benefit: string) => {
    if (benefit.includes('Free') || benefit.includes('free')) return '🆓';
    if (benefit.includes('Priority') || benefit.includes('priority')) return '⭐';
    if (benefit.includes('networking') || benefit.includes('Networking')) return '🤝';
    if (benefit.includes('certificate') || benefit.includes('Certificate')) return '🏆';
    return '✅';
  };

  return {
    defaultBenefits,
    getBenefitIcon,
  };
};

// Export query keys
export const TML_CODE_VALIDATION_KEY = ['tml-code-validation'] as const;
export const CODE_DETAILS_KEY = ['code-details'] as const;
export const ALL_CODES_KEY = ['all-codes'] as const;