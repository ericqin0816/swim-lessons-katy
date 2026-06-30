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

function logAuthError(context: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[auth] ${context}`, {
      message: error.message,
      name: error.name,
      status: "status" in error ? error.status : undefined,
    });
    return;
  }

  console.error(`[auth] ${context}`, error);
}

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      ok: false,
      message: "Please enter your email and password.",
      messageKey: "message.loginMissing",
    };
  }

  const parsed = loginSchema.safeParse({
    email,
    password,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Incorrect email or password. Please try again.",
      messageKey: "message.loginIncorrect",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    console.error("[auth] Sign in attempted without valid Supabase environment configuration.");
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
      messageKey: "message.loginUnexpected",
    };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      logAuthError("Supabase signInWithPassword failed.", error);
      const status = "status" in error ? error.status : undefined;

      return {
        ok: false,
        message:
          status === 400 || status === 401 || status === 403
            ? "Incorrect email or password. Please try again."
            : "Something went wrong. Please try again.",
        messageKey:
          status === 400 || status === 401 || status === 403
            ? "message.loginIncorrect"
            : "message.loginUnexpected",
      };
    }
  } catch (error) {
    logAuthError("Unexpected sign in exception.", error);
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
      messageKey: "message.loginUnexpected",
    };
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
