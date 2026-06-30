import { redirect } from "next/navigation";
import { AccountContent } from "@/components/account-content";
import { getCurrentProfile, getCurrentUser, getParentBookings, getSavedSwimmers } from "@/lib/data";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [profile, swimmers, bookings] = await Promise.all([
    getCurrentProfile(),
    getSavedSwimmers(),
    getParentBookings(),
  ]);

  const parentName = profile?.full_name ?? user.email?.split("@")[0] ?? "";
  const parentEmail = user.email ?? "";
  const parentPhone = profile?.phone ?? "";

  return (
    <AccountContent
      profileName={profile?.full_name ?? null}
      parentName={parentName}
      parentEmail={parentEmail}
      parentPhone={parentPhone}
      swimmers={swimmers}
      bookings={bookings}
    />
  );
}
