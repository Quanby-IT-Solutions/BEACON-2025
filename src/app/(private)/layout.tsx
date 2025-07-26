"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrivateHeader from "@/components/reuseable/Header/PrivateHeader";
import { AppSidebar } from "@/components/reuseable/Sidebar/app-sidebar";

import { CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAdminStore } from "@/stores/adminStore";
import { Loader2 } from "lucide-react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isSessionValid } = useAdminStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Give a small delay to allow Zustand to rehydrate from localStorage
      setTimeout(() => {
        if (!isAuthenticated || !isSessionValid()) {
          // Store current URL before redirecting to login
          const returnUrl = encodeURIComponent(window.location.pathname);
          router.push(`/login?returnUrl=${returnUrl}`);
        } else {
          setIsLoading(false);
        }
      }, 100);
    };

    checkAuth();
  }, [isAuthenticated, isSessionValid, router]);

  if (isLoading || !isAuthenticated || !isSessionValid()) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex h-screen w-full flex-col bg-muted">
          <PrivateHeader />

          <SidebarInset className="bg-muted">
            <main className="w-full h-full">
              <CardContent className="p-0 bg-muted">{children}</CardContent>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
