"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseConfigDiagnostics } from "@/lib/config";
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

function logAuthError(context: string, error: unknown) {
  console.error(`[auth] ${context}`, {
    error: getAuthErrorDetails(error),
    supabase: getSupabaseConfigDiagnostics(),
  });
}

function isCredentialError(error: unknown) {
  const details = getAuthErrorDetails(error);
  const message = details.message.toLowerCase();
  const status = typeof details.status === "string" ? Number(details.status) : details.status;

  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  );
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

  const supabase = await createSupabaseServerClient({
    cookieWriteContext: "signIn",
    logCookieWrites: true,
    throwOnCookieWriteError: true,
  });
  if (!supabase) {
    console.error("[auth] Sign in attempted without valid Supabase environment configuration.", {
      supabase: getSupabaseConfigDiagnostics(),
    });
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
      messageKey: "message.loginUnexpected",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      logAuthError("Supabase signInWithPassword failed.", error);
      const isIncorrectLogin = isCredentialError(error);

      return {
        ok: false,
        message: isIncorrectLogin
          ? "Incorrect email or password. Please try again."
          : "Something went wrong. Please try again.",
        messageKey: isIncorrectLogin ? "message.loginIncorrect" : "message.loginUnexpected",
      };
    }

    console.info("[auth] Supabase signInWithPassword succeeded.", {
      userId: data.user?.id ?? null,
      hasSession: Boolean(data.session),
      hasAccessToken: Boolean(data.session?.access_token),
      supabase: getSupabaseConfigDiagnostics(),
    });

    if (data.user?.id) {
      await ensureProfileAfterSignIn(supabase, data.user.id);
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
