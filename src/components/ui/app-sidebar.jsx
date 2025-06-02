"use client"

import * as React from "react"
import {
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"
import {useHospital} from "@/context/HospitalProvider"
import { NavDocuments } from "@/components/ui/nav-documents"
import { NavMain } from "@/components/ui/nav-main"
import { NavSecondary } from "@/components/ui/nav-secondary"
import { NavUser } from "@/components/ui/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({
  ...props
}) {

  const { hospitalDetails, loading } = useHospital();

  const data = {

  user: {
      name: hospitalDetails?.name || "Hospital Admin",
      email: hospitalDetails?.adminEmail || "admin@example.com",
      avatar: hospitalDetails?.logo || "/tempusLogo1.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Appointments",
      url: "/dashboard/appointments",
      icon: ListIcon,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Doctors",
      url: "/dashboard/doctors",
      icon: UsersIcon,
    },
  ],
  
  navSecondary: [
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: HelpCircleIcon,
    },
    // {
    //   title: "Search",
    //   url: "/dashboard/search",
    //   icon: SearchIcon,
    // },
  ],
  
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: DatabaseIcon,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: ClipboardListIcon,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: FileIcon,
  //   },
  // ],

  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <img
                  src="/tempusLogo1.png"
                  alt="Tempus Logo"
                  className="h-6 w-6 mr-2"
                />
                <span className="text-base font-semibold">{data.user.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
