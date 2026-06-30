"use client";

import { useActionState } from "react";
import { saveSwimmer, type FormState } from "@/app/actions/bookings";
import { translatedMessage, useLanguage } from "@/components/language-provider";
import { StatusMessage } from "@/components/section";
import { skillLevels } from "@/lib/config";
import type { TranslationKey } from "@/lib/i18n";

const initialState: FormState = { ok: false, message: "" };

export function SaveSwimmerForm({
  parentName,
  parentEmail,
  parentPhone,
}: {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
}) {
  const { t } = useLanguage();
  const [state, action, pending] = useActionState(saveSwimmer, initialState);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="parentName" value={parentName} />
      <input type="hidden" name="parentEmail" value={parentEmail} />
      <input type="hidden" name="parentPhone" value={parentPhone} />
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <label className="block text-sm font-semibold text-slate-700">
          {t("book.swimmerName")}
          <input
            name="swimmerName"
            required
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          {t("book.age")}
          <input
            name="swimmerAge"
            type="number"
            min="0"
            max="99"
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        {t("book.skillLevel")}
        <select name="skillLevel" className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
          {skillLevels.map((level) => (
            <option key={level} value={level}>
              {t(`skill.${level}` as TranslationKey)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        {t("account.futureNotes")}
        <textarea
          name="comments"
          rows={4}
          className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder={t("account.futurePlaceholder")}
        />
      </label>
      {state.message ? (
        <StatusMessage ok={state.ok}>
          {translatedMessage(t, state.messageKey, state.message)}
        </StatusMessage>
      ) : null}
      <button
        disabled={pending}
        className="rounded-lg bg-sky-600 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {pending ? t("account.saving") : t("account.saveSwimmer")}
      </button>
    </form>
  );
}
