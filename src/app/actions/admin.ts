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
  startsAtLocal: z.string().optional(),
  startsAtDate: z.string().optional(),
  startsAtTime: z.string().optional(),
});

const bulkAvailabilitySchema = z.object({
  instructorId: z.string().uuid(),
  startDate: z.string().min(10),
  endDate: z.string().optional(),
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

function getSlotStart(formData: FormData) {
  const startsAtLocal = String(formData.get("startsAtLocal") ?? "").trim();
  if (startsAtLocal) {
    return startsAtLocal;
  }

  const date = String(formData.get("startsAtDate") ?? "").trim();
  const time = String(formData.get("startsAtTime") ?? "").trim();

  return date && time ? `${date}T${time}` : "";
}

function isDuplicateSlotError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already has a slot") ||
    normalized.includes("duplicate key") ||
    normalized.includes("one_slot_per_instructor_time")
  );
}

function friendlyAdminError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("schema cache") || normalized.includes("could not find the function")) {
    return "Database setup is missing the latest availability functions. Run the updated Supabase SQL, then retry.";
  }

  if (isDuplicateSlotError(message)) {
    return "This instructor already has a slot at that time.";
  }

  return message;
}

function revalidateAvailabilityViews() {
  revalidatePath("/book");
  revalidatePath("/admin");
  revalidatePath("/admin/availability");
}

export async function addAvailability(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const parsed = availabilitySchema.safeParse({
    instructorId: formData.get("instructorId"),
    startsAtLocal: formData.get("startsAtLocal") || undefined,
    startsAtDate: formData.get("startsAtDate") || undefined,
    startsAtTime: formData.get("startsAtTime") || undefined,
  });
  const startsAtLocal = getSlotStart(formData);

  if (!parsed.success || !startsAtLocal) {
    return { ok: false, message: "Choose an instructor, date, and start time." };
  }

  const { supabase, error } = await requireAdmin();
  if (!supabase) {
    return { ok: false, message: error ?? "Admin access required." };
  }

  const { error: rpcError } = await supabase.rpc("create_availability_slot", {
    p_instructor_id: parsed.data.instructorId,
    p_starts_at_local: startsAtLocal,
  });

  if (rpcError) {
    return { ok: false, message: friendlyAdminError(rpcError.message) };
  }

  revalidateAvailabilityViews();
  return { ok: true, message: "Availability slot added." };
}

export async function bulkAddAvailability(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const parsed = bulkAvailabilitySchema.safeParse({
    instructorId: formData.get("instructorId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });
  const times = formData.getAll("times").map((value) => String(value)).filter(Boolean);

  if (!parsed.success || !times.length) {
    return { ok: false, message: "Choose an instructor, date range, and at least one time." };
  }

  const start = new Date(`${parsed.data.startDate}T00:00:00`);
  const end = new Date(`${parsed.data.endDate || parsed.data.startDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return { ok: false, message: "Choose a valid date range." };
  }

  const dayCount = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (dayCount > 31 || times.length > 12) {
    return { ok: false, message: "Bulk add is limited to 31 days and 12 times at once." };
  }

  const { supabase, error } = await requireAdmin();
  if (!supabase) {
    return { ok: false, message: error ?? "Admin access required." };
  }

  let added = 0;
  let skipped = 0;
  let failed = 0;
  let lastError = "";

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + dayIndex);
    const datePart = current.toISOString().slice(0, 10);

    for (const time of times) {
      const { error: rpcError } = await supabase.rpc("create_availability_slot", {
        p_instructor_id: parsed.data.instructorId,
        p_starts_at_local: `${datePart}T${time}`,
      });

      if (!rpcError) {
        added += 1;
      } else if (isDuplicateSlotError(rpcError.message)) {
        skipped += 1;
      } else {
        failed += 1;
        lastError = friendlyAdminError(rpcError.message);
      }
    }
  }

  revalidateAvailabilityViews();

  const summary = `${added} slot${added === 1 ? "" : "s"} added, ${skipped} duplicate${skipped === 1 ? "" : "s"} skipped${failed ? `, ${failed} failed` : ""}.`;
  return {
    ok: failed === 0,
    message: failed ? `${summary} Last error: ${lastError}` : summary,
  };
}

export async function deleteAvailabilitySlot(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const slotId = String(formData.get("slotId") ?? "");
  if (!z.string().uuid().safeParse(slotId).success) {
    return { ok: false, message: "Choose a valid availability slot." };
  }

  const { supabase, error } = await requireAdmin();
  if (!supabase) {
    return { ok: false, message: error ?? "Admin access required." };
  }

  const { error: rpcError } = await supabase.rpc("delete_availability_slot", {
    p_slot_id: slotId,
  });

  if (rpcError) {
    return { ok: false, message: friendlyAdminError(rpcError.message) };
  }

  revalidateAvailabilityViews();
  return { ok: true, message: "Availability slot deleted." };
}

export async function markAvailabilityUnavailable(
  _prevState: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const slotId = String(formData.get("slotId") ?? "");
  if (!z.string().uuid().safeParse(slotId).success) {
    return { ok: false, message: "Choose a valid availability slot." };
  }

  const { supabase, error } = await requireAdmin();
  if (!supabase) {
    return { ok: false, message: error ?? "Admin access required." };
  }

  const { error: rpcError } = await supabase.rpc("mark_availability_unavailable", {
    p_slot_id: slotId,
  });

  if (rpcError) {
    return { ok: false, message: friendlyAdminError(rpcError.message) };
  }

  revalidateAvailabilityViews();
  return { ok: true, message: "Availability slot marked unavailable." };
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
