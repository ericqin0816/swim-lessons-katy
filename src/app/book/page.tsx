import { BookingCalendar } from "@/components/booking-calendar";
import { BookingIntro } from "@/components/booking-intro";
import { PageSection } from "@/components/section";
import { getAvailableSlots, getSavedSwimmers } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/config";

export default async function BookPage() {
  const [slots, savedSwimmers] = await Promise.all([getAvailableSlots(), getSavedSwimmers()]);

  return (
    <PageSection>
      <BookingIntro demoMode={!isSupabaseConfigured()} />
      <BookingCalendar slots={slots} savedSwimmers={savedSwimmers} />
    </PageSection>
  );
}
