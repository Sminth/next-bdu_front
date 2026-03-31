"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { BREADCRUMB_NAME_MAP } from "@/constants/breadcrumb"; // Import the constant

function getPageName(path: string) {
  const name = BREADCRUMB_NAME_MAP[path]; // Use the imported constant
  if (name) {
    return name;
  }
  // Fallback for paths not in the map: capitalize the last segment
  const pathParts = path.split("/").filter(Boolean);
  const lastPart = pathParts.at(-1) ?? "Page";
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const currentPageName = getPageName(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className={pathname === "/dashboard" ? "" : "hidden md:block"}>
          {pathname === "/dashboard" ? (
            <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href="/dashboard">Tableau de bord</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {pathname !== "/dashboard" && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPageName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
