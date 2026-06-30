"use client";

import { useLanguage } from "@/components/language-provider";
import { Eyebrow } from "@/components/section";
import { site } from "@/lib/config";

export function BookingIntro({ demoMode }: { demoMode: boolean }) {
  const { t } = useLanguage();
  const lessonLength = t("site.lessonLength");

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
      <div className="max-w-3xl">
        <Eyebrow>{t("book.eyebrow")}</Eyebrow>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {t("book.title")}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          {t("book.copy", { lessonLength, price: site.price })}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t("book.specialNote")}</p>
      </div>
      <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-black text-slate-950">{t("book.calendarGuide")}</p>
        <div className="mt-3 grid gap-2 text-sm font-bold sm:grid-cols-3 lg:grid-cols-1">
          <p className="flex items-center gap-2 text-sky-800">
            <span className="size-3 rounded-full bg-sky-600" />
            Eric
          </p>
          <p className="flex items-center gap-2 text-emerald-800">
            <span className="size-3 rounded-full bg-emerald-600" />
            Instructor 2
          </p>
          <p className="flex items-center gap-2 text-slate-600">
            <span className="size-3 rounded-full bg-slate-300" />
            {t("book.bookedUnavailable")}
          </p>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">{t("book.publicPrivacy")}</p>
      </div>
      {demoMode ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 lg:col-span-2">
          {t("book.demoMode")}
        </p>
      ) : null}
    </div>
  );
}
