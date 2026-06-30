import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { HeaderTagline, SiteNav } from "@/components/site-nav";
import { getCurrentUserProfile } from "@/lib/data";
import { site } from "@/lib/config";

export async function SiteHeader() {
  const { user, profile } = await getCurrentUserProfile();
  const showAdminLink = Boolean(user && profile?.role === "admin");

  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" aria-label={`${site.name} home`} className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-sky-600 text-lg font-black text-white shadow-sm shadow-sky-200">
            SL
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-950">
              {site.name}
            </span>
            <HeaderTagline />
          </span>
        </Link>

        <SiteNav
          isLoggedIn={Boolean(user)}
          showAdminLink={showAdminLink}
          signOutAction={signOut}
        />
      </div>
    </header>
  );
}
