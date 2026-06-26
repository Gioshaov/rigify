import Link from "next/link";

interface StaffSidebarProps {
  staff: {
    name: string;
    role: string;
    businesses: {
      name: string;
      city?: string;
    };
  };
  permissions: {
    can_view_appointments: boolean;
    can_view_customers: boolean;
    can_view_services: boolean;
    can_view_staff: boolean;
    can_view_settings: boolean;
    can_view_salome: boolean;
  };
}

export function StaffSidebar({ staff, permissions }: StaffSidebarProps) {
  const navItems = [
    { href: "/staff-dashboard", label: "OVERVIEW", show: true },
    {
      href: "/staff-dashboard/appointments",
      label: "APPOINTMENTS",
      show: permissions.can_view_appointments,
    },
    {
      href: "/staff-dashboard/customers",
      label: "CUSTOMERS",
      show: permissions.can_view_customers,
    },
    {
      href: "/staff-dashboard/services",
      label: "SERVICES",
      show: permissions.can_view_services,
    },
    {
      href: "/staff-dashboard/staff",
      label: "STAFF",
      show: permissions.can_view_staff,
    },
  ].filter((item) => item.show);

  return (
    <aside className="w-64 shrink-0 border-r border-outline-variant bg-surface min-h-dvh">
      <div className="px-gutter py-stack-lg border-b border-outline-variant">
        <Link
          href="/"
          className="font-mono text-data-label uppercase tracking-[0.2em] text-primary"
        >
          RIGIFY
        </Link>
        <p className="mt-stack-md text-on-surface text-body-md">{staff.businesses.name}</p>
        <p className="label-mono mt-1 text-on-surface-variant">{staff.role.toUpperCase()}</p>
      </div>
      <nav className="px-gutter py-stack-md space-y-1">
        {navItems.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="block font-mono text-data-label uppercase tracking-wider px-3 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
