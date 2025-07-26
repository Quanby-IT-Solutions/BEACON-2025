"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Users, LogOut, Bug } from "lucide-react";
import { runRealtimeTests } from "@/lib/supabase-realtime-debug";
import { useAdminStore } from "@/stores/adminStore";
import {
  useAdminVisitors,
  useAdminVisitorsRealtime,
  useDeleteVisitor,
} from "@/hooks/tanstasck-query/useAdminVisitors";
import { useAdminLogout } from "@/hooks/tanstasck-query/useAdminAuth";
import { VisitorsDataTable } from "@/components/admin/visitors-data-table";

export default function VisitorsDashboard() {
  const router = useRouter();
  const { currentAdmin } = useAdminStore();
  const logout = useAdminLogout();
  
  // Use the realtime-enabled hook
  const { data: visitorsData, isLoading, error, refetch, isRealtimeEnabled } = useAdminVisitorsRealtime();
  const deleteVisitor = useDeleteVisitor();

// Authentication is now handled by the layout, so we don't need these checks here

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleDeleteVisitor = (visitorId: string, visitorName: string) => {
    deleteVisitor.mutate(visitorId, {
      onSuccess: () => {
        toast.success(`Visitor ${visitorName} deleted successfully`);
      },
      onError: (error) => {
        toast.error(`Failed to delete visitor: ${error.message}`);
      },
    });
  };

// No need to check authentication here since layout handles it

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registered Visitors
            {isRealtimeEnabled && (
              <div className="flex items-center gap-2 ml-auto">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            All visitor registrations for BEACON 2025 event
            {isRealtimeEnabled && (
              <span className="text-green-600 ml-2">
                • Real-time updates enabled
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading visitors...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load visitors.{" "}
                {error instanceof Error ? error.message : "Please try again."}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="ml-2"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {visitorsData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Visitors:{" "}
                    <span className="font-semibold">{visitorsData.count}</span>
                  </p>
                  {isRealtimeEnabled && (
                    <p className="text-sm text-green-600">
                      ⚡ Realtime Active
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      console.log('🧪 Running realtime tests...');
                      runRealtimeTests();
                      toast.info('🔬 Realtime tests started - check console for results');
                    }}
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Test Realtime
                  </Button>
                  <Button variant="outline" onClick={() => refetch()}>
                    Refresh
                  </Button>
                </div>
              </div>

              <VisitorsDataTable
                data={visitorsData.data}
                onDeleteVisitor={handleDeleteVisitor}
                isDeleting={deleteVisitor.isPending}
                currentAdminStatus={currentAdmin?.status || "ADMIN"}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
