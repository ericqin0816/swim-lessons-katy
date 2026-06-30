import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getDemoSlots, demoInstructors } from "@/lib/demo-data";
import type { User } from "@supabase/supabase-js";
import type {
  BookingSlot,
  BookingWithDetails,
  Booking,
  Instructor,
  AvailabilitySlot,
  Profile,
  Swimmer,
  SwimmerWithBookings,
} from "@/lib/types";

export async function getCurrentUserProfile(): Promise<{
  user: User | null;
  profile: Profile | null;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { user: null, profile: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: data };
}

export async function getCurrentUser(): Promise<User | null> {
  const { user } = await getCurrentUserProfile();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { profile } = await getCurrentUserProfile();
  return profile;
}

export async function isAdmin(): Promise<boolean> {
  const { user, profile } = await getCurrentUserProfile();
  return Boolean(user && profile?.role === "admin");
}

export async function getAvailableSlots(): Promise<BookingSlot[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return getDemoSlots();
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("availability_slots")
    .select("id, starts_at, instructor_id, is_booked, instructors(id, name, color, bio, active)")
    .gte("starts_at", now)
    .order("starts_at", { ascending: true })
    .returns<BookingSlot[]>();

  if (error) {
    return getDemoSlots();
  }

  return data ?? [];
}

export async function getInstructors(): Promise<Instructor[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return demoInstructors;
  }

  const { data } = await supabase
    .from("instructors")
    .select("*")
    .eq("active", true)
    .order("name")
    .returns<Instructor[]>();

  return data?.length ? data : demoInstructors;
}

export async function getSavedSwimmers(): Promise<Swimmer[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("swimmers")
    .select("*")
    .eq("parent_user_id", user.id)
    .order("swimmer_name")
    .returns<Swimmer[]>();

  return data ?? [];
}

export async function getParentBookings(): Promise<BookingWithDetails[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("bookings")
    .select(
      "*, availability_slots(id, starts_at, instructor_id, instructors(id, name, color)), swimmers(id, swimmer_name, swimmer_age)",
    )
    .eq("parent_user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<BookingWithDetails[]>();

  return data ?? [];
}

export async function getAdminBookings(): Promise<BookingWithDetails[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("bookings")
    .select(
      "*, availability_slots(id, starts_at, instructor_id, instructors(id, name, color)), swimmers(id, swimmer_name, swimmer_age)",
    )
    .order("created_at", { ascending: false })
    .returns<BookingWithDetails[]>();

  return data ?? [];
}

export async function getAdminAvailabilitySlots(): Promise<
  (AvailabilitySlot & {
    instructors: Pick<Instructor, "id" | "name" | "color"> | null;
    bookings: (Booking & {
      swimmers: Pick<Swimmer, "id" | "swimmer_name" | "swimmer_age"> | null;
    })[];
  })[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("availability_slots")
    .select(
      "*, instructors(id, name, color), bookings(*, swimmers(id, swimmer_name, swimmer_age))",
    )
    .order("starts_at", { ascending: true })
    .returns<
      (AvailabilitySlot & {
        instructors: Pick<Instructor, "id" | "name" | "color"> | null;
        bookings: (Booking & {
          swimmers: Pick<Swimmer, "id" | "swimmer_name" | "swimmer_age"> | null;
        })[];
      })[]
    >();

  return data ?? [];
}

export async function getAdminSwimmers(): Promise<Swimmer[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("swimmers")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Swimmer[]>();

  return data ?? [];
}

export async function getAdminSwimmersWithDetails(): Promise<SwimmerWithBookings[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("swimmers")
    .select(
      "*, bookings(*, availability_slots(id, starts_at, instructor_id, instructors(id, name, color)), swimmers(id, swimmer_name, swimmer_age)), lesson_notes(*, instructors(name))",
    )
    .order("created_at", { ascending: false })
    .returns<SwimmerWithBookings[]>();

  return data ?? [];
}

export async function getAdminSwimmer(id: string): Promise<SwimmerWithBookings | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("swimmers")
    .select(
      "*, bookings(*, availability_slots(id, starts_at, instructor_id, instructors(id, name, color)), swimmers(id, swimmer_name, swimmer_age)), lesson_notes(*, instructors(name))",
    )
    .eq("id", id)
    .maybeSingle()
    .returns<SwimmerWithBookings>();

  return data;
}
