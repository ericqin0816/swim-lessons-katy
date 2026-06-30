"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { translatedMessage, useLanguage } from "@/components/language-provider";
import { StatusMessage } from "@/components/section";

const initialState: AuthState = { ok: false, message: "" };

export function LoginPanel() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);
  const state = mode === "login" ? loginState : signUpState;
  const pending = mode === "login" ? loginPending : signUpPending;

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

      <form action={mode === "login" ? loginAction : signUpAction} noValidate className="space-y-4">
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
