"use client"

import { useState } from "react";
import { MailIcon, PlusCircleIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import AppointmentDetailsProvider from '@/context/AppointmentDetailsProvider';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { SuccessDialog } from "@/components/ui/success-dialog"
import { useHospital } from "@/context/HospitalProvider"
import AppointmentCreationFlow from "@/components/appointments/AppointmentCreationFlow"

export function NavMain({
  items
}) {
  const { hospitalDashboardDetails } = useHospital();
  const { isMobile, setOpenMobile } = useSidebar();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: []
  });

  const subdomain = hospitalDashboardDetails?.hospitalInfo?.subdomain || '';

  const handleAppointmentCreated = (appointmentDetails) => {
    setShowCreateDialog(false);
    
    // Show success dialog with appointment details
    setSuccessDialog({
      isOpen: true,
      title: 'Appointment Created',
      message: 'New appointment has been successfully created.',
      details: [
        `Patient: ${appointmentDetails.data.patientName}`,
        `Doctor: Dr. ${appointmentDetails.data.doctor.name}`,
        `Date: ${appointmentDetails.data.appointmentDate.split('T')[0]}`,
        `Status: ${appointmentDetails.data.status}`,
      ]
    });
  };

  const handleQuickCreate = () => {
    setShowCreateDialog(true);
  };

  const handleNavItemClick = () => {
    // Close mobile sidebar when navigation item is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              onClick={handleQuickCreate}
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground">
              <PlusCircleIcon />
              <span>Create New Appointment</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} onClick={handleNavItemClick}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      {/* Appointment Creation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <AppointmentDetailsProvider subdomain={subdomain}>
              <AppointmentCreationFlow 
                onSuccess={handleAppointmentCreated}
                onCancel={() => setShowCreateDialog(false)}
              />
            </AppointmentDetailsProvider>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        title={successDialog.title}
        message={successDialog.message}
        details={successDialog.details}
      />
    </SidebarGroup>
  );
}
