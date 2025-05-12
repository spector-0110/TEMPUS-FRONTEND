'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from "@/components/ui/app-sidebar"
import { DataTable } from "@/components/ui/data-table"
import { SectionCards } from "@/components/ui/section-cards"
import { SiteHeader } from "@/components/ui/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";
import { useHospital } from '@/context/HospitalProvider';
import { checkServerStatus } from '@/lib/api';

import data from "./data.json";

export default function DashBoardLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isProfileComplete, loading: profileLoading } = useHospital();
  const router = useRouter();

  const isLoading = authLoading || profileLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/');
      } else if (!isProfileComplete) {
        router.push('/onboarding');
      }
    }
  }, [isLoading, user, isProfileComplete, router]);

  useEffect(() => {
      const checkServer = async () => {
        try {
          await checkServerStatus();
        } catch (error) {
          router.push('/error');
        }
      };
      checkServer();
    }, [router]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Avoid rendering protected content if auth or onboarding is not complete
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
              <SectionCards />
              <div className="px-4 lg:px-6">
                {children}
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}