'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SiteHeader } from "@/components/ui/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthProvider";
import { Spinner } from "@/components/ui/spinner";
import { useHospital } from '@/context/HospitalProvider';
import { checkServerStatusWithCache } from '@/lib/serverStatus';

export default function DashBoardLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isProfileComplete, loading: profileLoading } = useHospital();
  const router = useRouter();
  
  const isLoading = authLoading || profileLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!isProfileComplete) {
        router.push('/onboarding');
      }
    }
  }, [isLoading, user, isProfileComplete, router]);

  useEffect(() => {
    let isMounted = true;
    
    const checkServer = async () => {
      try {
        const result = await checkServerStatusWithCache();
        if (!result.isOnline && isMounted) {
          router.push('/error');
        }
      } catch (error) {
        if (isMounted) {
          router.push('/error');
        }
      }
    };
    
    // Only run server check if user is authenticated and profile is complete
    if (user && isProfileComplete && !isLoading) {
      checkServer();
    }
    
    return () => {
      isMounted = false;
    };
  }, [router, user, isProfileComplete, isLoading]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user || !isProfileComplete) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}