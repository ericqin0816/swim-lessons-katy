import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUserProfile } from "@/lib/data";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/swimmers", label: "Swimmers" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await getCurrentUserProfile();

  if (!user) {
    redirect("/login");
  }

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  return (
    <>
      <div className="border-b border-sky-100 bg-white/80">
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 text-sm font-bold text-slate-700 sm:px-6">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-2 transition hover:bg-sky-50 hover:text-sky-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </>
  );
}
