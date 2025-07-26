import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/stores/adminStore";
import { useSupabaseRealtime } from "@/providers/SupabaseRealtimeProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useCallback } from "react";
import { toast } from "sonner";

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

// Realtime hook with direct Supabase subscriptions
export const useAdminVisitorsRealtime = () => {
  const { sessionToken, isAuthenticated } = useAdminStore();
  const queryClient = useQueryClient();
  
  // Base query for API data
  const query = useQuery({
    queryKey: ['admin-visitors'],
    queryFn: () => fetchVisitors(sessionToken!),
    enabled: isAuthenticated && !!sessionToken,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Realtime subscription callback
  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-visitors'] });
  }, [queryClient]);

  // Set up realtime subscription
  useEffect(() => {
    if (!isAuthenticated || !sessionToken) return;

    console.log('Setting up realtime subscription for visitors...');

    // Create the realtime channel
    const channel = supabase
      .channel('admin-visitors-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitors'
        },
        (payload) => {
          console.log('Visitors realtime change:', payload);
          
          // Show appropriate toast notification
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('🎉 New visitor registration received!');
              break;
            case 'UPDATE':
              toast.info('📝 Visitor registration updated');
              break;
            case 'DELETE':
              toast.info('🗑️ Visitor registration removed');
              break;
          }
          
          // Refresh the query data
          invalidateQuery();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_details'
        },
        (payload) => {
          console.log('User details realtime change:', payload);
          // Refresh visitors data when user details change
          invalidateQuery();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_accounts'
        },
        (payload) => {
          console.log('User accounts realtime change:', payload);
          // Refresh visitors data when user accounts change
          invalidateQuery();
        }
      )
      .subscribe((status) => {
        console.log('Visitors realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to visitors realtime updates');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up visitors realtime subscription...');
      channel.unsubscribe();
    };
  }, [isAuthenticated, sessionToken, invalidateQuery]);

  return {
    ...query,
    isRealtimeEnabled: true,
  };
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