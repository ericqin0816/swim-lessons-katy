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

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please enter a valid email and password.",
      messageKey: "message.loginInvalid",
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

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/account");
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
