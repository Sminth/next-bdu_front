"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

export function NavMain({
  items,
  groups,
}: {
  items: NavItem[];
  groups?: NavGroup[];
}) {
  return (
    <>
      {/* Éléments principaux sans titre de section */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4 mt-2">
          Menu
        </SidebarGroupLabel>
        <SidebarMenu className="gap-1 px-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                tooltip={item.title}
                className="rounded-lg data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:shadow-md hover:bg-muted/50 transition-all px-4 py-5"
              >
                <a href={item.url} className="flex items-center gap-2">
                  {item.icon && <item.icon className="h-4.5 w-4.5 opacity-70 shrink-0" />}
                  <span className="font-medium text-sm">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Groupes avec titres de section */}
      {groups?.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">
            {group.label}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1 px-2">
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  tooltip={item.title}
                  className="rounded-lg data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:shadow-md hover:bg-muted/50 transition-all px-4 py-5"
                >
                  <a href={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4.5 w-4.5 opacity-70 shrink-0" />}
                    <span className="font-medium text-sm">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
