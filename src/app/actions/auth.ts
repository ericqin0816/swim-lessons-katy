"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { TranslationKey } from "@/lib/i18n";

export type AuthState = {
  ok: boolean;
  message: string;
  messageKey?: TranslationKey;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

function getAuthErrorDetails(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
  const cause = record.cause instanceof Error ? record.cause : null;

  return {
    name: error instanceof Error ? error.name : typeof record.name === "string" ? record.name : undefined,
    message: error instanceof Error ? error.message : typeof record.message === "string" ? record.message : String(error),
    status: typeof record.status === "number" || typeof record.status === "string" ? record.status : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
    cause: cause ? { name: cause.name, message: cause.message } : undefined,
  };
}

async function ensureProfileAfterSignIn(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("[auth] Signed-in user profile lookup failed.", {
      userId,
      error: getAuthErrorDetails(profileError),
    });
    return;
  }

  if (profile) {
    console.info("[auth] Signed-in user profile lookup succeeded.", {
      userId,
      role: profile.role,
    });
    return;
  }

  console.warn("[auth] Signed-in user has no matching profiles row. Attempting repair by auth user id.", {
    userId,
  });

  const { data: repairedProfile, error: repairError } = await supabase.rpc("ensure_current_user_profile", {
    p_full_name: null,
    p_phone: null,
  });

  if (repairError) {
    console.error("[auth] Missing profile repair failed. Run the latest supabase/schema.sql in Supabase SQL Editor.", {
      userId,
      error: getAuthErrorDetails(repairError),
    });
    return;
  }

  console.info("[auth] Missing profile repaired by auth user id.", {
    userId,
    role: repairedProfile?.role ?? null,
  });
}

export async function signUp(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please enter your name, email, and a 6+ character password.",
      messageKey: "message.signupInvalid",
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

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone ?? null,
      },
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data.user?.id && data.session) {
    await ensureProfileAfterSignIn(supabase, data.user.id);
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/account");
  }

  return {
    ok: true,
    message: "Account created. Check your email if confirmations are enabled, then sign in.",
    messageKey: "message.accountCreated",
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/");
}
