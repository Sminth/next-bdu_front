"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import {
  BarChart2,
  Briefcase,
  Building2,
  FileText,
  Frame,
  History,
  PieChart,
  ShieldCheck,
  Tag,
  Users,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { usePermission } from "@/lib/permissions";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_CONFIG = {
  navTop: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: PieChart,
      permission: null,
    },
    {
      title: "Saisie des données",
      url: "/dashboard/saisie",
      icon: FileText,
      permission: "saisie.read",
    },
    {
      title: "Reporting",
      url: "/dashboard/reporting",
      icon: BarChart2,
      permission: "reporting.read",
    },
  ],

  navGroups: [
    {
      label: "Paramétrage",
      items: [
        {
          title: "Projets",
          url: "/dashboard/projets",
          icon: Briefcase,
          permission: "project.read",
        },
        {
          title: "Domaines",
          url: "/dashboard/domaines",
          icon: Frame,
          permission: "domain.read",
        },
        {
          title: "Axes stratégiques",
          url: "/dashboard/axes",
          icon: Frame,
          permission: "axe.read",
        },
        {
          title: "Types de gain",
          url: "/dashboard/gain-types",
          icon: Tag,
          permission: "gainType.read",
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          title: "Direction",
          url: "/dashboard/settings/direction",
          icon: Building2,
          permission: "direction.read",
        },
        {
          title: "Habilitation",
          url: "/dashboard/settings/habilitation",
          icon: ShieldCheck,
          permission: "profile.read",
        },
        {
          title: "Utilisateurs",
          url: "/dashboard/settings/users",
          icon: Users,
          permission: "user.read",
        },
        {
          title: "Historique",
          url: "/dashboard/settings/historique",
          icon: History,
          permission: "historique.read",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user: authUser } = useAuthStore();
  const { can } = usePermission();

  const user = {
    name: authUser?.firstName ? `${authUser.firstName} ${authUser.lastName}` : "Admin BDU",
    email: authUser?.email || "admin@bdu.ci",
    avatar: "/avatars/admin.jpg",
  };

  const isVisible = (permission: string | null) => {
    if (!permission) return true;
    return can(permission);
  };

  const withActive = (items: typeof NAV_CONFIG.navTop) =>
    items
      .filter((item) => isVisible(item.permission))
      .map((item) => ({
        ...item,
        isActive: item.url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.url),
      }));

  const navTopWithActive = withActive(NAV_CONFIG.navTop);

  const navGroupsWithActive = NAV_CONFIG.navGroups
    .map((group) => ({
      ...group,
      items: withActive(group.items),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar className="border-r border-border/40 bg-[white]!" {...props}>
      <SidebarHeader className="pt-6 pb-4 px-6 bg-[white]!">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent p-0 mb-6 mt-2">
              <a href="/dashboard" className="flex items-center justify-center gap-3">
                <img src="/logo.svg" alt="BDU-CI Logo" className="h-[66px] w-auto ml-2" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-[white]!">
        <NavMain items={navTopWithActive} groups={navGroupsWithActive} />
        <NavSecondary items={[]} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="bg-[white]!">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
