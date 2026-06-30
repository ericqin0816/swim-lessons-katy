"use client";

import { type FormEvent, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, type AuthState } from "@/app/actions/auth";
import { translatedMessage, useLanguage } from "@/components/language-provider";
import { StatusMessage } from "@/components/section";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const initialState: AuthState = { ok: false, message: "" };

function getAuthErrorDetails(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};

  return {
    message: error instanceof Error ? error.message : typeof record.message === "string" ? record.message : String(error),
    status: typeof record.status === "number" || typeof record.status === "string" ? record.status : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
  };
}

function isInvalidCredentials(error: unknown) {
  const details = getAuthErrorDetails(error);
  const status = typeof details.status === "string" ? Number(details.status) : details.status;
  const message = details.message.toLowerCase();
  const code = details.code?.toLowerCase() ?? "";

  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    code.includes("invalid_credentials") ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  );
}

export function LoginPanel() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, setLoginState] = useState<AuthState>(initialState);
  const [loginPending, setLoginPending] = useState(false);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);
  const state = mode === "login" ? loginState : signUpState;
  const pending = mode === "login" ? loginPending : signUpPending;

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginState(initialState);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setLoginState({
        ok: false,
        message: "Please enter your email and password.",
        messageKey: "message.loginMissing",
      });
      return;
    }

    setLoginPending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("[auth] Browser signInWithPassword failed.", getAuthErrorDetails(error));
        const invalidCredentials = isInvalidCredentials(error);

        setLoginState({
          ok: false,
          message: invalidCredentials
            ? "Incorrect email or password. Please try again."
            : "Something went wrong. Please try again.",
          messageKey: invalidCredentials ? "message.loginIncorrect" : "message.loginUnexpected",
        });
        return;
      }

      console.info("[auth] Browser signInWithPassword succeeded.");
      router.refresh();
      router.push("/account");
    } catch (error) {
      console.error("[auth] Unexpected browser sign in exception.", getAuthErrorDetails(error));
      setLoginState({
        ok: false,
        message: "Something went wrong. Please try again.",
        messageKey: "message.loginUnexpected",
      });
    } finally {
      setLoginPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-lg border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100">
      <div className="mb-6 grid grid-cols-2 rounded-lg bg-sky-50 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          aria-pressed={mode === "login"}
          className={`rounded-md px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-white text-sky-800 shadow-sm" : "text-slate-600"}`}
        >
          {t("login.loginTab")}
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          aria-pressed={mode === "signup"}
          className={`rounded-md px-4 py-2 text-sm font-bold ${mode === "signup" ? "bg-white text-sky-800 shadow-sm" : "text-slate-600"}`}
        >
          {t("login.signupTab")}
        </button>
      </div>

      <form
        action={mode === "signup" ? signUpAction : undefined}
        onSubmit={mode === "login" ? handleLoginSubmit : undefined}
        noValidate
        className="space-y-4"
      >
        {mode === "signup" ? (
          <>
            <label className="block text-sm font-semibold text-slate-700">
              {t("login.parentName")}
              <input
                name="fullName"
                required
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {t("login.phone")}
              <input name="phone" className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>
          </>
        ) : null}
        <label className="block text-sm font-semibold text-slate-700">
          {t("login.email")}
          <input
            name="email"
            type="email"
            required
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          {t("login.password")}
          <input
            name="password"
            type="password"
            minLength={6}
            required
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>

        {state.message ? (
          <StatusMessage ok={state.ok}>
            {translatedMessage(t, state.messageKey, state.message)}
          </StatusMessage>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-sky-600 px-5 py-3 font-bold text-white shadow-sm shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {pending ? t("login.working") : mode === "login" ? t("login.loginTab") : t("login.create")}
        </button>
      </form>
    </div>
  );
}
