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
  UserCheck,
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
      avatar: hospitalDetails?.logo || "/tiqoraLogo1.png",
  },
  navMain: [
    // {
    //   title: "Dashboard",
    //   url: "/dashboard",
    //   icon: LayoutDashboardIcon,
    // },
    {
      title: "Appointments",
      url: "/dashboard/",
      icon: ListIcon,
    },
    {
      title: "Doctors",
      url: "/dashboard/doctors",
      icon: UsersIcon,
    },
    {
      title: "Staff",
      url: "/dashboard/staff",
      icon: UserCheck,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChartIcon,
    },
    ],
    
    navSecondary: [
     {
      title: "Documentation",
      url: "/dashboard/help/documentation",
      icon: FileTextIcon,
    },
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
                  style={{ backgroundColor: 'white' }}
                  src="/tiqoraLogo1.png"
                  alt="Tiqora Logo"
                  className="h-8 w-8 mr-2 rounded *:hover:opacity-40 transition-opacity duration-500"
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
