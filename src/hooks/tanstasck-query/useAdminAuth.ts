import { useMutation, useQuery } from "@tanstack/react-query";
import { useAdminStore } from "@/stores/adminStore";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    admin: {
      id: string;
      username: string;
      status: 'SUPERADMIN' | 'ADMIN';
      isActive: boolean;
    };
    token: string;
    expiresAt: string;
  };
}

const adminLogin = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Login failed');
  }

  return result;
};

export const useAdminLogin = () => {
  const { setAdmin, setSession } = useAdminStore();

  return useMutation({
    mutationFn: adminLogin,
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAdmin(data.data.admin);
        setSession(data.data.token, new Date(data.data.expiresAt));
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

export const useAdminLogout = () => {
  const { clearSession } = useAdminStore();

  return () => {
    clearSession();
  };
};