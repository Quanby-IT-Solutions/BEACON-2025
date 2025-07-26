import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/stores/adminStore";
import { useSupabaseRealtime } from "@/providers/SupabaseRealtimeProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRealtimeWithFallback } from "./useRealtimeWithFallback";

interface VisitorData {
  id: string;
  createdAt: string;
  updatedAt: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName: string;
    suffix: string;
    preferredName: string;
    gender: string;
    genderOthers: string;
    ageBracket: string;
    nationality: string;
    faceScannedUrl: string;
  };
  contactInfo: {
    email: string;
    mobileNumber: string;
    landline: string;
    mailingAddress: string;
    status: string;
  };
  professionalInfo: {
    jobTitle: string;
    companyName: string;
    industry: string;
    industryOthers: string;
    companyAddress: string;
    companyWebsite: string;
    businessEmail: string;
  };
  eventInfo: {
    attendingDays: string[];
    eventParts: string[];
    attendeeType: string;
    interestAreas: string[];
    receiveUpdates: boolean;
    inviteToFutureEvents: boolean;
  };
  emergencyInfo: {
    specialAssistance: string;
    emergencyContactPerson: string;
    emergencyContactNumber: string;
  };
  consentInfo: {
    dataPrivacyConsent: boolean;
    hearAboutEvent: string;
    hearAboutOthers: string;
  };
}

interface VisitorsResponse {
  success: boolean;
  data: VisitorData[];
  count: number;
}

const fetchVisitors = async (token: string): Promise<VisitorsResponse> => {
  const response = await fetch('/api/admin/visitors', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch visitors');
  }

  return result;
};

export const useAdminVisitors = () => {
  const { sessionToken, isAuthenticated } = useAdminStore();

  return useQuery({
    queryKey: ['admin-visitors'],
    queryFn: () => fetchVisitors(sessionToken!),
    enabled: isAuthenticated && !!sessionToken,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};

// Enhanced realtime hook with fallback mechanism
export const useAdminVisitorsRealtime = () => {
  const { sessionToken, isAuthenticated } = useAdminStore();
  
  return useRealtimeWithFallback({
    queryKey: ['admin-visitors'],
    fetchFunction: () => fetchVisitors(sessionToken!),
    enabled: isAuthenticated && !!sessionToken,
    staleTime: 1000 * 60 * 5,
    tablesToWatch: ['visitors', 'user_details', 'user_accounts', 'visitor_events'],
    enableFallback: true,
    fallbackInterval: 30000, // 30 seconds
  });
};

const deleteVisitor = async (visitorId: string, token: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/admin/visitors/${visitorId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete visitor');
  }

  return result;
};

export const useDeleteVisitor = () => {
  const { sessionToken } = useAdminStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitorId: string) => deleteVisitor(visitorId, sessionToken!),
    onSuccess: () => {
      // Refetch the visitors list after successful deletion
      queryClient.invalidateQueries({ queryKey: ['admin-visitors'] });
    },
    onError: (error) => {
      console.error('Delete visitor error:', error);
    },
  });
};