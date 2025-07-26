import { supabase } from "@/lib/supabase";

// Debug utility to test Supabase realtime connection
export const testSupabaseRealtimeConnection = async () => {
  try {
    console.log('🔍 Testing Supabase realtime connection...');
    
    // Test basic connection
    const testChannel = supabase
      .channel('test-connection')
      .on('presence', { event: 'sync' }, () => {
        console.log('✅ Supabase realtime presence working');
      })
      .subscribe((status) => {
        console.log('🔗 Test connection status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Supabase realtime is working properly');
          // Clean up test channel
          setTimeout(() => {
            testChannel.unsubscribe();
          }, 1000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Supabase realtime connection failed');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Supabase realtime connection timeout');
        }
      });

    return testChannel;
  } catch (error) {
    console.error('❌ Error testing Supabase realtime:', error);
    return null;
  }
};

// Test specific table subscription
export const testTableSubscription = (tableName: string) => {
  try {
    console.log(`🔍 Testing subscription to table: ${tableName}`);
    
    const testChannel = supabase
      .channel(`test-${tableName}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        (payload) => {
          console.log(`✅ Received change event for ${tableName}:`, payload);
        }
      )
      .subscribe((status) => {
        console.log(`📡 ${tableName} subscription status:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to ${tableName} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Failed to subscribe to ${tableName}`);
        } else if (status === 'TIMED_OUT') {
          console.error(`⏰ Timeout subscribing to ${tableName}`);
        }
      });

    // Clean up after 30 seconds
    setTimeout(() => {
      testChannel.unsubscribe();
      console.log(`🧹 Cleaned up test subscription for ${tableName}`);
    }, 30000);

    return testChannel;
  } catch (error) {
    console.error(`❌ Error testing ${tableName} subscription:`, error);
    return null;
  }
};

// Run comprehensive realtime tests
export const runRealtimeTests = () => {
  console.log('🚀 Running comprehensive realtime tests...');
  
  // Test basic connection
  testSupabaseRealtimeConnection();
  
  // Test table subscriptions
  const tablesToTest = ['visitors', 'conferences', 'user_details', 'user_accounts', 'conference_payments'];
  
  tablesToTest.forEach((table) => {
    setTimeout(() => {
      testTableSubscription(table);
    }, 1000);
  });
};