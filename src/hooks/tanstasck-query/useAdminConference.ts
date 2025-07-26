import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/stores/adminStore";
import { useSupabaseRealtime } from "@/providers/SupabaseRealtimeProvider";
import { supabase } from "@/lib/supabase";
import { useEffect, useCallback } from "react";
import { toast } from "sonner";

interface ConferenceData {
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
  conferenceInfo: {
    isMaritimeLeagueMember: string;
    tmlMemberCode: string | null;
    jobTitle: string | null;
    companyName: string | null;
    industry: string | null;
    companyAddress: string | null;
    companyWebsite: string | null;
    interestAreas: string[];
    otherInterests: string | null;
    receiveEventInvites: boolean;
    emailCertificate: boolean;
    photoVideoConsent: boolean;
    dataUsageConsent: boolean;
  };
  paymentInfo: {
    totalAmount: number | null;
    referenceNumber: string | null;
    receiptImageUrl: string | null;
    notes: string | null;
    paymentMode: string | null;
    paymentStatus: string;
    requiresPayment: boolean;
    isPaid: boolean;
    paymentConfirmedAt: string | null;
  };
  selectedEvents: Array<{
    id: string;
    name: string;
    date: string;
    price: number;
    status: string;
  }>;
}

interface ConferenceResponse {
  success: boolean;
  data: ConferenceData[];
  count: number;
}

const fetchConferences = async (token: string): Promise<ConferenceResponse> => {
  const response = await fetch('/api/admin/conference', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch conference registrations');
  }

  return result;
};

export const useAdminConferences = () => {
  const { sessionToken, isAuthenticated } = useAdminStore();

  return useQuery({
    queryKey: ['admin-conferences'],
    queryFn: () => fetchConferences(sessionToken!),
    enabled: isAuthenticated && !!sessionToken,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};

// Realtime hook with direct Supabase subscriptions
export const useAdminConferencesRealtime = () => {
  const { sessionToken, isAuthenticated } = useAdminStore();
  const queryClient = useQueryClient();
  
  // Base query for API data
  const query = useQuery({
    queryKey: ['admin-conferences'],
    queryFn: () => fetchConferences(sessionToken!),
    enabled: isAuthenticated && !!sessionToken,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Realtime subscription callback
  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-conferences'] });
  }, [queryClient]);

  // Set up realtime subscription
  useEffect(() => {
    if (!isAuthenticated || !sessionToken) return;

    console.log('Setting up realtime subscription for conferences...');

    // Create the realtime channel
    const channel = supabase
      .channel('admin-conferences-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conferences'
        },
        (payload) => {
          console.log('Conferences realtime change:', payload);
          
          // Show appropriate toast notification
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('🎉 New conference registration received!');
              break;
            case 'UPDATE':
              toast.info('📝 Conference registration updated');
              break;
            case 'DELETE':
              toast.info('🗑️ Conference registration removed');
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
          table: 'conference_payments'
        },
        (payload) => {
          console.log('Conference payments realtime change:', payload);
          
          // Show appropriate toast notification for payment changes
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('💰 New conference payment initiated!');
              break;
            case 'UPDATE':
              // Check if payment was confirmed
              if (payload.new && payload.old && 
                  !payload.old.isPaid && payload.new.isPaid) {
                toast.success('✅ Conference payment confirmed!');
              } else {
                toast.info('💳 Conference payment updated');
              }
              break;
            case 'DELETE':
              toast.info('🗑️ Conference payment record removed');
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
          table: 'summary_of_payments'
        },
        (payload) => {
          console.log('Summary of payments realtime change:', payload);
          // Refresh conferences data when summary of payments change
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
          // Refresh conferences data when user details change
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
          // Refresh conferences data when user accounts change
          invalidateQuery();
        }
      )
      .subscribe((status) => {
        console.log('Conferences realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to conferences realtime updates');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up conferences realtime subscription...');
      channel.unsubscribe();
    };
  }, [isAuthenticated, sessionToken, invalidateQuery]);

  return {
    ...query,
    isRealtimeEnabled: true,
  };
};

const deleteConference = async (conferenceId: string, token: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/admin/conference/${conferenceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete conference registration');
  }

  return result;
};

export const useDeleteConference = () => {
  const { sessionToken } = useAdminStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conferenceId: string) => deleteConference(conferenceId, sessionToken!),
    onSuccess: () => {
      // Refetch the conferences list after successful deletion
      queryClient.invalidateQueries({ queryKey: ['admin-conferences'] });
    },
    onError: (error) => {
      console.error('Delete conference error:', error);
    },
  });
};