"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  BookTemplate,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  ShowerHeadIcon,
  SquareTerminal,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "BEACON EXPO 2025",
      logo: GalleryVerticalEnd,
      plan: "Registration management",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "",
      icon: Frame,
      isActive: true,
      items: [
        {
          title: "Visitors ",
          url: "/admin/visitors",
        },
        {
          title: "Conference ",
          url: "/admin/conference",
        },
        {
          title: "Exhibitors ",
          url: "/admin/exhibitors",
        },
        {
          title: "Sponsors ",
          url: "/admin/sponsors",
        },
      ],
    },
  ],

  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
