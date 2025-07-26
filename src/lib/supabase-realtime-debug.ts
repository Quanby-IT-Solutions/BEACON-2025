import { supabase } from "@/lib/supabase";

// Simplified realtime connection test
export const testSupabaseRealtimeConnection = async () => {
  try {
    console.log('🔍 Testing Supabase realtime connection...');
    console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔧 Environment:', process.env.NODE_ENV);
    
    // Test connection status (no direct socket access)
    // No direct method to get current realtime connections in Supabase client
    // You can log the supabase.realtime object for debugging if needed
    console.log('🔗 Supabase realtime client:', supabase.realtime);
    
    // Test basic connection with simple broadcast
    const testChannel = supabase
      .channel('simple-test-connection')
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log('✅ Broadcast test successful:', payload);
      })
      .subscribe((status) => {
        console.log('🔗 Simple test connection status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Supabase realtime is working properly');
          
          // Send a test broadcast
          testChannel.send({
            type: 'broadcast',
            event: 'test',
            payload: { message: 'Test successful', timestamp: new Date().toISOString() }
          });
          
          // Clean up test channel quickly
          setTimeout(() => {
            try {
              testChannel.unsubscribe();
              console.log('✅ Test channel cleaned up');
            } catch (cleanupError) {
              console.log('ℹ️ Test channel cleanup completed');
            }
          }, 1500);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Supabase realtime connection failed');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Supabase realtime connection timeout');
        } else if (status === 'CLOSED') {
          console.error('🔒 Supabase realtime connection closed');
        }
      });

    return testChannel;
  } catch (error) {
    console.error('❌ Error testing Supabase realtime:', error);
    return null;
  }
};

// Test specific table subscription (simplified)
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
          
          // Clean up quickly to avoid connection issues
          setTimeout(() => {
            try {
              testChannel.unsubscribe();
              console.log(`🧹 Cleaned up test subscription for ${tableName}`);
            } catch (cleanupError) {
              console.log(`ℹ️ Test subscription for ${tableName} cleanup completed`);
            }
          }, 5000); // Reduced to 5 seconds
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Failed to subscribe to ${tableName}`);
        } else if (status === 'TIMED_OUT') {
          console.error(`⏰ Timeout subscribing to ${tableName}`);
        } else if (status === 'CLOSED') {
          console.log(`🔒 ${tableName} subscription closed`);
        }
      });

    return testChannel;
  } catch (error) {
    console.error(`❌ Error testing ${tableName} subscription:`, error);
    return null;
  }
};

// Test database permissions and RLS policies
export const testDatabasePermissions = async () => {
  try {
    console.log('🔍 Testing database permissions...');
    
    // Test if we can read from tables
    const tables = ['visitors', 'conferences', 'user_details', 'user_accounts', 'conference_payments'];
    
    for (const table of tables) {
      try {
        console.log(`🔍 Testing read access to ${table}...`);
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Read access failed for ${table}:`, error.message);
        } else {
          console.log(`✅ Read access working for ${table}`);
        }
      } catch (tableError) {
        console.error(`❌ Database access error for ${table}:`, tableError);
      }
    }
  } catch (error) {
    console.error('❌ Error testing database permissions:', error);
  }
};

// Test realtime publication status (simplified)
export const testRealtimePublications = async () => {
  try {
    console.log('🔍 Testing realtime configuration...');
    
    // Test basic database connectivity instead of system tables
    const { data, error } = await supabase
      .from('visitors')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection test failed:', error.message);
    } else {
      console.log('✅ Database connection working');
    }
    
    // Test a simple query to verify permissions
    const { data: confData, error: confError } = await supabase
      .from('conferences')
      .select('id')
      .limit(1);
    
    if (confError) {
      console.error('❌ Conference table access failed:', confError.message);
    } else {
      console.log('✅ Conference table access working');
    }
    
    console.log('ℹ️ Note: Realtime publications are managed by Supabase automatically');
  } catch (error) {
    console.error('❌ Error testing realtime configuration:', error);
  }
};

// Test alternative connection method (simplified - no disconnection)
export const testAlternativeConnection = () => {
  try {
    console.log('🔍 Testing alternative connection method...');
    
    // Test with a simple broadcast channel without disconnecting
    const broadcastChannel = supabase
      .channel('test-broadcast-alt')
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log('✅ Alternative broadcast working:', payload);
      })
      .subscribe((status) => {
        console.log('📡 Alternative broadcast channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          // Send a test broadcast
          broadcastChannel.send({
            type: 'broadcast',
            event: 'test',
            payload: { message: 'Alternative test broadcast message' }
          });
          
          // Clean up quickly
          setTimeout(() => {
            try {
              broadcastChannel.unsubscribe();
              console.log('✅ Alternative broadcast channel cleaned up');
            } catch (cleanupError) {
              console.log('ℹ️ Alternative broadcast cleanup completed');
            }
          }, 2000);
        }
      });
  } catch (error) {
    console.error('❌ Error testing alternative connection:', error);
  }
};

// Run comprehensive realtime tests (simplified)
export const runRealtimeTests = () => {
  console.log('🚀 Running simplified realtime tests...');
  
  // Test basic connection
  testSupabaseRealtimeConnection();
  
  // Test database permissions
  setTimeout(() => {
    testDatabasePermissions();
  }, 2000);
  
  // Test realtime configuration
  setTimeout(() => {
    testRealtimePublications();
  }, 4000);
  
  // Test only main tables to avoid overwhelming the connection
  const tablesToTest = ['visitors', 'conferences'];
  
  tablesToTest.forEach((table, index) => {
    setTimeout(() => {
      testTableSubscription(table);
    }, 6000 + (index * 2000)); // Longer delays
  });
  
  // Test alternative connection last
  setTimeout(() => {
    testAlternativeConnection();
  }, 12000);
};