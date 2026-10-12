import type { ReactNode } from "react";
import { Navigate, NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Car, CarFront, LayoutDashboard, LogOut, Users, Wrench } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { endSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const STAFF_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/services", label: "Service Records", icon: Wrench },
  { to: "/vehicles", label: "Vehicles", icon: Car },
  { to: "/customers", label: "Customers", icon: Users },
];

const CUSTOMER_NAV: NavItem[] = [
  { to: "/customer-portal", label: "My Vehicles & Services", icon: CarFront },
];

function navTestId(to: string): string {
  return `nav-${to === "/" ? "dashboard" : to.slice(1)}`;
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 px-6 py-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/15 text-sky-400">
        <Wrench className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-base font-bold tracking-tight text-white">AutoPulse VSM</p>
        <p className="truncate text-xs text-slate-400">Vehicle Service Management</p>
      </div>
    </div>
  );
}

function SidebarLinks({ items }: { items: NavItem[] }) {
  return (
    <nav className="flex flex-col gap-1 px-3" data-testid="app-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          data-testid={navTestId(item.to)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              isActive
                ? "bg-[#1E293B] text-[#38BDF8]"
                : "text-slate-300 hover:bg-[#1E293B]/70 hover:text-white",
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function MobileLinks({ items }: { items: NavItem[] }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-white px-3 py-2 md:hidden" data-testid="app-nav-mobile">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          data-testid={navTestId(item.to)}
          className={({ isActive }) =>
            cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
              isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

// Role-aware shell: guards the route, renders sidebar + topbar. require="staff"|"customer".
export default function AppShell({ require, children }: { require: "staff" | "customer"; children: ReactNode }) {
  const { data: user, isPending, isError } = useMe();

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background" data-testid="app-loading">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (isError || !user) return <Navigate to="/login" replace />;
  if (require === "staff" && user.role !== "staff") return <Navigate to="/customer-portal" replace />;
  if (require === "customer" && user.role !== "customer") return <Navigate to="/" replace />;

  const nav = user.role === "staff" ? STAFF_NAV : CUSTOMER_NAV;

  return (
    <div className="min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col justify-between bg-[#0F172A] md:flex" data-testid="app-sidebar">
        <div>
          <BrandMark />
          <SidebarLinks items={nav} />
        </div>
        <div className="border-t border-[#1E293B] px-6 py-4">
          <p className="truncate text-sm font-medium text-white" data-testid="sidebar-user-name">{user.name}</p>
          <p className="truncate text-xs text-slate-400" data-testid="sidebar-user-email">{user.email}</p>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-white/85 px-4 backdrop-blur lg:px-8">
          <Badge variant="secondary" data-testid="role-badge">
            {user.role === "staff" ? "Staff Operations" : "Customer Portal"}
          </Badge>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block" data-testid="header-user-name">{user.name}</span>
            <Button variant="outline" size="sm" onClick={() => void endSession()} data-testid="logout-button">
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </header>

        <MobileLinks items={nav} />

        <main className="mx-auto w-full max-w-7xl p-4 lg:p-8" data-testid="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
