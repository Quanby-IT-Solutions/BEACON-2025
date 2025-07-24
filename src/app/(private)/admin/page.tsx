"use client";

import { useEffect } from "react";
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
import { Loader2, Users, LogOut } from "lucide-react";
import { useAdminStore } from "@/stores/adminStore";
import {
  useAdminVisitors,
  useDeleteVisitor,
} from "@/hooks/tanstasck-query/useAdminVisitors";
import { useAdminLogout } from "@/hooks/tanstasck-query/useAdminAuth";
import { VisitorsDataTable } from "@/components/admin/visitors-data-table";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, currentAdmin, isSessionValid } = useAdminStore();
  const logout = useAdminLogout();
  const { data: visitorsData, isLoading, error, refetch } = useAdminVisitors();
  const deleteVisitor = useDeleteVisitor();

  useEffect(() => {
    // Check authentication state
    const checkAuth = () => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Only check session validity if we have session data
      if (isAuthenticated && !isSessionValid()) {
        router.push("/login");
        return;
      }
    };

    checkAuth();
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-1 flex-col min-h-screen gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted aspect-video rounded-xl" />
        <div className="bg-muted aspect-video rounded-xl" />
        <div className="bg-muted aspect-video rounded-xl" />
      </div>
      <div className="bg-muted min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  );
}
