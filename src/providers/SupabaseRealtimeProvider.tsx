"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, type Tables } from '@/lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define the types for our realtime data
type ConferenceData = Tables<'conferences'>;
type VisitorData = Tables<'visitors'>;
type EventData = Tables<'events'>;
type CodeDistributionData = Tables<'code_distribution'>;
type ConferencePaymentData = Tables<'conference_payments'>;

// Realtime context type
interface RealtimeContextType {
  // Connection status
  isConnected: boolean;
  connectionError: string | null;
  
  // Data with real-time updates
  conferences: ConferenceData[];
  visitors: VisitorData[];
  events: EventData[];
  codes: CodeDistributionData[];
  payments: ConferencePaymentData[];
  
  // Loading states
  loading: {
    conferences: boolean;
    visitors: boolean;
    events: boolean;
    codes: boolean;
    payments: boolean;
  };
  
  // Manual refresh functions
  refreshConferences: () => void;
  refreshVisitors: () => void;
  refreshEvents: () => void;
  refreshCodes: () => void;
  refreshPayments: () => void;
  
  // Subscribe to specific table changes
  subscribeToTable: (table: string, callback: (payload: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface SupabaseRealtimeProviderProps {
  children: React.ReactNode;
}

export function SupabaseRealtimeProvider({ children }: SupabaseRealtimeProviderProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Data states
  const [conferences, setConferences] = useState<ConferenceData[]>([]);
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [codes, setCodes] = useState<CodeDistributionData[]>([]);
  const [payments, setPayments] = useState<ConferencePaymentData[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    conferences: true,
    visitors: true,
    events: true,
    codes: true,
    payments: true,
  });
  
  // Channels for each table
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  // Fetch initial data
  const fetchConferences = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, conferences: true }));
      const { data, error } = await supabase
        .from('conferences')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setConferences(data || []);
    } catch (error) {
      console.error('Error fetching conferences:', error);
      toast.error('Failed to load conference data');
    } finally {
      setLoading(prev => ({ ...prev, conferences: false }));
    }
  }, []);

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, visitors: true }));
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setVisitors(data || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      toast.error('Failed to load visitor data');
    } finally {
      setLoading(prev => ({ ...prev, visitors: false }));
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, events: true }));
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('eventDate', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events data');
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, []);

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, codes: true }));
      const { data, error } = await supabase
        .from('code_distribution')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
      toast.error('Failed to load code data');
    } finally {
      setLoading(prev => ({ ...prev, codes: false }));
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, payments: true }));
      const { data, error } = await supabase
        .from('conference_payments')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  }, []);

  // Handle realtime changes
  const handleConferenceChange = useCallback((payload: RealtimePostgresChangesPayload<ConferenceData>) => {
    console.log('Conference change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setConferences(prev => [payload.new, ...prev]);
        toast.success('New conference registration received!');
        break;
      case 'UPDATE':
        setConferences(prev => 
          prev.map(item => item.id === payload.new.id ? payload.new : item)
        );
        toast.info('Conference registration updated');
        break;
      case 'DELETE':
        setConferences(prev => 
          prev.filter(item => item.id !== payload.old.id)
        );
        toast.info('Conference registration removed');
        break;
    }
  }, []);

  const handleVisitorChange = useCallback((payload: RealtimePostgresChangesPayload<VisitorData>) => {
    console.log('Visitor change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setVisitors(prev => [payload.new, ...prev]);
        toast.success('New visitor registration received!');
        break;
      case 'UPDATE':
        setVisitors(prev => 
          prev.map(item => item.id === payload.new.id ? payload.new : item)
        );
        toast.info('Visitor registration updated');
        break;
      case 'DELETE':
        setVisitors(prev => 
          prev.filter(item => item.id !== payload.old.id)
        );
        toast.info('Visitor registration removed');
        break;
    }
  }, []);

  const handleEventChange = useCallback((payload: RealtimePostgresChangesPayload<EventData>) => {
    console.log('Event change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setEvents(prev => [...prev, payload.new].sort((a, b) => 
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        ));
        toast.success('New event created!');
        break;
      case 'UPDATE':
        setEvents(prev => 
          prev.map(item => item.id === payload.new.id ? payload.new : item)
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        );
        toast.info('Event updated');
        break;
      case 'DELETE':
        setEvents(prev => 
          prev.filter(item => item.id !== payload.old.id)
        );
        toast.info('Event removed');
        break;
    }
  }, []);

  const handleCodeChange = useCallback((payload: RealtimePostgresChangesPayload<CodeDistributionData>) => {
    console.log('Code change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setCodes(prev => [payload.new, ...prev]);
        toast.success('New TML code created!');
        break;
      case 'UPDATE':
        setCodes(prev => 
          prev.map(item => item.id === payload.new.id ? payload.new : item)
        );
        // Only show toast if code was actually used (userId changed from null to something)
        if (!payload.old.userId && payload.new.userId) {
          toast.info('TML code was used in registration');
        }
        break;
      case 'DELETE':
        setCodes(prev => 
          prev.filter(item => item.id !== payload.old.id)
        );
        toast.info('TML code removed');
        break;
    }
  }, []);

  const handlePaymentChange = useCallback((payload: RealtimePostgresChangesPayload<ConferencePaymentData>) => {
    console.log('Payment change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setPayments(prev => [payload.new, ...prev]);
        toast.success('New payment initiated!');
        break;
      case 'UPDATE':
        setPayments(prev => 
          prev.map(item => item.id === payload.new.id ? payload.new : item)
        );
        // Show different toasts based on payment status change
        if (!payload.old.isPaid && payload.new.isPaid) {
          toast.success('Payment confirmed!');
        } else if (payload.old.paymentStatus !== payload.new.paymentStatus) {
          toast.info(`Payment status updated: ${payload.new.paymentStatus}`);
        }
        break;
      case 'DELETE':
        setPayments(prev => 
          prev.filter(item => item.id !== payload.old.id)
        );
        toast.info('Payment record removed');
        break;
    }
  }, []);

  // Generic subscription function
  const subscribeToTable = useCallback((table: string, callback: (payload: any) => void) => {
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();

    setChannels(prev => [...prev, channel]);

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
      setChannels(prev => prev.filter(c => c !== channel));
    };
  }, []);

  // Set up realtime subscriptions
  useEffect(() => {
    console.log('Setting up realtime subscriptions...');
    
    // Create channels for each table
    const conferenceChannel = supabase
      .channel('public:conferences')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conferences' }, handleConferenceChange)
      .subscribe();

    const visitorChannel = supabase
      .channel('public:visitors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitors' }, handleVisitorChange)
      .subscribe();

    const eventChannel = supabase
      .channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, handleEventChange)
      .subscribe();

    const codeChannel = supabase
      .channel('public:code_distribution')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'code_distribution' }, handleCodeChange)
      .subscribe();

    const paymentChannel = supabase
      .channel('public:conference_payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conference_payments' }, handlePaymentChange)
      .subscribe();

    setChannels([conferenceChannel, visitorChannel, eventChannel, codeChannel, paymentChannel]);

    // Monitor connection status
    const statusListener = supabase.channel('connection-status')
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('✅ Supabase realtime connected');
      })
      .on('presence', { event: 'join' }, () => {
        setIsConnected(true);
        console.log('✅ Supabase realtime joined');
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false);
        console.log('❌ Supabase realtime disconnected');
      })
      .subscribe();

    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscriptions...');
      supabase.removeChannel(conferenceChannel);
      supabase.removeChannel(visitorChannel);
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(codeChannel);
      supabase.removeChannel(paymentChannel);
      supabase.removeChannel(statusListener);
    };
  }, [handleConferenceChange, handleVisitorChange, handleEventChange, handleCodeChange, handlePaymentChange]);

  // Fetch initial data on mount
  useEffect(() => {
    Promise.all([
      fetchConferences(),
      fetchVisitors(),
      fetchEvents(),
      fetchCodes(),
      fetchPayments(),
    ]).then(() => {
      console.log('✅ Initial data loaded');
    }).catch((error) => {
      console.error('❌ Error loading initial data:', error);
      setConnectionError('Failed to load initial data');
    });
  }, [fetchConferences, fetchVisitors, fetchEvents, fetchCodes, fetchPayments]);

  const contextValue: RealtimeContextType = {
    isConnected,
    connectionError,
    conferences,
    visitors,
    events,
    codes,
    payments,
    loading,
    refreshConferences: fetchConferences,
    refreshVisitors: fetchVisitors,
    refreshEvents: fetchEvents,
    refreshCodes: fetchCodes,
    refreshPayments: fetchPayments,
    subscribeToTable,
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}

// Custom hook to use the realtime context
export function useSupabaseRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useSupabaseRealtime must be used within a SupabaseRealtimeProvider');
  }
  return context;
}

// Individual hooks for each data type
export function useRealtimeConferences() {
  const { conferences, loading, refreshConferences } = useSupabaseRealtime();
  return { data: conferences, isLoading: loading.conferences, refetch: refreshConferences };
}

export function useRealtimeVisitors() {
  const { visitors, loading, refreshVisitors } = useSupabaseRealtime();
  return { data: visitors, isLoading: loading.visitors, refetch: refreshVisitors };
}

export function useRealtimeEvents() {
  const { events, loading, refreshEvents } = useSupabaseRealtime();
  return { data: events, isLoading: loading.events, refetch: refreshEvents };
}

export function useRealtimeCodes() {
  const { codes, loading, refreshCodes } = useSupabaseRealtime();
  return { data: codes, isLoading: loading.codes, refetch: refreshCodes };
}

export function useRealtimePayments() {
  const { payments, loading, refreshPayments } = useSupabaseRealtime();
  return { data: payments, isLoading: loading.payments, refetch: refreshPayments };
}