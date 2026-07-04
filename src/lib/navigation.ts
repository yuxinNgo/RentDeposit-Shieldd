import {
  BarChart3,
  FilePlus2,
  FileStack,
  Gavel,
  Home,
  MessageSquare,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

export interface RoleNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: string[];
  prefixes?: string[];
  excludes?: string[];
}

interface RoleWorkspaceConfig {
  defaultHref: string;
  missionTitle: string;
  missionDescription: string;
  primaryActionLabel: string;
  primaryActionIcon: LucideIcon;
  navItems: RoleNavItem[];
}

const caseListMatcher = {
  exact: ["/cases"],
  prefixes: ["/cases/"],
  excludes: ["/cases/new"],
};

export const ROLE_WORKSPACE_CONFIG: Record<UserRole, RoleWorkspaceConfig> = {
  LANDLORD: {
    defaultHref: "/cases/new",
    missionTitle: "Landlord mission",
    missionDescription: "Create cases, track lifecycle progress, and prepare submission evidence.",
    primaryActionLabel: "Create case",
    primaryActionIcon: FilePlus2,
    navItems: [
      { href: "/dashboard", label: "Overview", icon: Home, exact: ["/dashboard"] },
      { href: "/cases", label: "Cases", icon: FileStack, ...caseListMatcher },
      { href: "/cases/new", label: "New case", icon: FilePlus2, exact: ["/cases/new"] },
      { href: "/analytics", label: "Analytics", icon: BarChart3, exact: ["/analytics"] },
      { href: "/feedback", label: "Feedback", icon: MessageSquare, exact: ["/feedback"] },
      { href: "/submission", label: "Submission", icon: Send, exact: ["/submission"] },
    ],
  },
  TENANT: {
    defaultHref: "/cases",
    missionTitle: "Tenant mission",
    missionDescription: "Review assigned cases, fund escrow, request refunds, and leave product feedback.",
    primaryActionLabel: "Open cases",
    primaryActionIcon: FileStack,
    navItems: [
      { href: "/dashboard", label: "Overview", icon: Home, exact: ["/dashboard"] },
      { href: "/cases", label: "Cases", icon: FileStack, ...caseListMatcher },
      { href: "/feedback", label: "Feedback", icon: MessageSquare, exact: ["/feedback"] },
    ],
  },
  MEDIATOR: {
    defaultHref: "/disputes",
    missionTitle: "Mediator mission",
    missionDescription: "Watch disputed cases, inspect evidence, and sign the final on-chain resolution.",
    primaryActionLabel: "Open disputes",
    primaryActionIcon: Gavel,
    navItems: [
      { href: "/dashboard", label: "Overview", icon: Home, exact: ["/dashboard"] },
      { href: "/disputes", label: "Disputes", icon: Gavel, exact: ["/disputes"] },
      { href: "/cases", label: "Cases", icon: FileStack, ...caseListMatcher },
      { href: "/feedback", label: "Feedback", icon: MessageSquare, exact: ["/feedback"] },
    ],
  },
};

export function getRoleNavItems(role: UserRole) {
  return ROLE_WORKSPACE_CONFIG[role].navItems;
}

export function getDefaultRouteForRole(role: UserRole) {
  return ROLE_WORKSPACE_CONFIG[role].defaultHref;
}

export function getRoleMission(role: UserRole) {
  return ROLE_WORKSPACE_CONFIG[role];
}

export function isNavItemActive(item: RoleNavItem, pathname: string) {
  if (item.excludes?.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  if (item.exact?.includes(pathname)) {
    return true;
  }

  if (item.prefixes?.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  return pathname === item.href;
}

export function isPathAllowedForRole(role: UserRole, pathname: string) {
  return getRoleNavItems(role).some((item) => isNavItemActive(item, pathname));
}
