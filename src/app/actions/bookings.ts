"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { skillLevels, studentCounts } from "@/lib/config";
import type { TranslationKey } from "@/lib/i18n";
import type { SkillLevel, StudentCount } from "@/lib/types";

export type FormState = {
  ok: boolean;
  message: string;
  messageKey?: TranslationKey;
};

const bookingSchema = z.object({
  slotId: z.string().uuid(),
  parentName: z.string().min(2),
  parentEmail: z.string().email(),
  parentPhone: z.string().min(7),
  savedSwimmerId: z.string().uuid().optional().or(z.literal("")),
  swimmerName: z.string().min(1),
  swimmerAge: z.coerce.number().int().min(0).max(99).optional(),
  numberOfStudents: z.enum(studentCounts.map((item) => item.value) as [StudentCount, ...StudentCount[]]),
  skillLevel: z.enum(skillLevels as unknown as [SkillLevel, ...SkillLevel[]]),
  comments: z.string().max(1500).optional(),
});

const swimmerSchema = z.object({
  parentName: z.string().min(2),
  parentEmail: z.string().email(),
  parentPhone: z.string().min(7),
  swimmerName: z.string().min(1),
  swimmerAge: z.coerce.number().int().min(0).max(99).optional(),
  skillLevel: z.enum(skillLevels as unknown as [SkillLevel, ...SkillLevel[]]),
  comments: z.string().max(1500).optional(),
});

export async function bookLesson(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = bookingSchema.safeParse({
    slotId: formData.get("slotId"),
    parentName: formData.get("parentName"),
    parentEmail: formData.get("parentEmail"),
    parentPhone: formData.get("parentPhone"),
    savedSwimmerId: formData.get("savedSwimmerId") || "",
    swimmerName: formData.get("swimmerName"),
    swimmerAge: formData.get("swimmerAge") || undefined,
    numberOfStudents: formData.get("numberOfStudents"),
    skillLevel: formData.get("skillLevel"),
    comments: formData.get("comments") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please choose an available time and complete the required parent and swimmer fields.",
      messageKey: "message.bookingInvalid",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured yet. The calendar is showing demo slots only.",
      messageKey: "message.demoSlots",
    };
  }

  const { data, error } = await supabase.rpc("book_lesson", {
    p_slot_id: parsed.data.slotId,
    p_parent_name: parsed.data.parentName,
    p_parent_email: parsed.data.parentEmail,
    p_parent_phone: parsed.data.parentPhone,
    p_swimmer_id: parsed.data.savedSwimmerId || null,
    p_swimmer_name: parsed.data.swimmerName,
    p_swimmer_age: parsed.data.swimmerAge ?? null,
    p_number_of_students: parsed.data.numberOfStudents,
    p_skill_level: parsed.data.skillLevel,
    p_comments: parsed.data.comments ?? null,
  });

  if (error || !data) {
    return {
      ok: false,
      message: "That time is no longer available. Please choose another open slot and submit again.",
      messageKey: "message.slotUnavailable",
    };
  }

  revalidatePath("/book");
  revalidatePath("/account");
  revalidatePath("/admin");

  return {
    ok: true,
    message:
      "Booking request received. Your one-hour lesson is saved, and we will confirm details by phone or email. Payment is handled offline for now.",
    messageKey: "message.bookingSuccess",
  };
}

export async function saveSwimmer(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = swimmerSchema.safeParse({
    parentName: formData.get("parentName"),
    parentEmail: formData.get("parentEmail"),
    parentPhone: formData.get("parentPhone"),
    swimmerName: formData.get("swimmerName"),
    swimmerAge: formData.get("swimmerAge") || undefined,
    skillLevel: formData.get("skillLevel"),
    comments: formData.get("comments") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please complete the swimmer profile fields.",
      messageKey: "message.saveSwimmerInvalid",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured yet.",
      messageKey: "message.supabaseMissing",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Please log in to save swimmer profiles.",
      messageKey: "message.loginToSave",
    };
  }

  const { error } = await supabase.from("swimmers").insert({
    parent_user_id: user.id,
    parent_name: parsed.data.parentName,
    parent_email: parsed.data.parentEmail,
    parent_phone: parsed.data.parentPhone,
    swimmer_name: parsed.data.swimmerName,
    swimmer_age: parsed.data.swimmerAge ?? null,
    skill_level: parsed.data.skillLevel,
    comments: parsed.data.comments ?? null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/account");
  revalidatePath("/book");
  return { ok: true, message: "Swimmer profile saved.", messageKey: "message.swimmerSaved" };
}
