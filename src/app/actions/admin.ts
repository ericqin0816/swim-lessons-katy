"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AdminState = {
  ok: boolean;
  message: string;
};

const availabilitySchema = z.object({
  instructorId: z.string().uuid(),
  startsAtLocal: z.string().min(10),
});

const lessonNoteSchema = z.object({
  bookingId: z.string().uuid(),
  swimmerId: z.string().uuid(),
  instructorId: z.string().uuid().optional().or(z.literal("")),
  note: z.string().min(2).max(2500),
});

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { supabase: null, error: "Supabase is not configured yet." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, error: "You must be logged in as an admin." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { supabase: null, error: "Admin access required." };
  }

  return { supabase, error: null, userId: user.id };
}

export async function addAvailability(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const parsed = availabilitySchema.safeParse({
    instructorId: formData.get("instructorId"),
    startsAtLocal: formData.get("startsAtLocal"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Choose an instructor and a start time." };
  }

  const { supabase, error } = await requireAdmin();
  if (!supabase) {
    return { ok: false, message: error ?? "Admin access required." };
  }

  const { error: rpcError } = await supabase.rpc("create_availability_slot", {
    p_instructor_id: parsed.data.instructorId,
    p_starts_at_local: parsed.data.startsAtLocal,
  });

  if (rpcError) {
    return { ok: false, message: rpcError.message };
  }

  revalidatePath("/book");
  revalidatePath("/admin");
  return { ok: true, message: "Availability slot added." };
}

export async function addLessonNote(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const parsed = lessonNoteSchema.safeParse({
    bookingId: formData.get("bookingId"),
    swimmerId: formData.get("swimmerId"),
    instructorId: formData.get("instructorId") || "",
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Choose a booking and enter a note." };
  }

  const { supabase, error, userId } = await requireAdmin();
  if (!supabase) {
    return { ok: false, message: error ?? "Admin access required." };
  }

  const { error: insertError } = await supabase.from("lesson_notes").insert({
    booking_id: parsed.data.bookingId,
    swimmer_id: parsed.data.swimmerId,
    instructor_id: parsed.data.instructorId || null,
    note: parsed.data.note,
    created_by: userId,
  });

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/swimmers/${parsed.data.swimmerId}`);
  return { ok: true, message: "Private lesson note saved." };
}
