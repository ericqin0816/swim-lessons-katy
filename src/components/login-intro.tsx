"use client";

import { useLanguage } from "@/components/language-provider";
import { Eyebrow } from "@/components/section";

export function LoginIntro() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto mb-8 max-w-xl text-center">
      <Eyebrow>{t("login.eyebrow")}</Eyebrow>
      <h1 className="text-4xl font-black tracking-tight text-slate-950">
        {t("login.title")}
      </h1>
      <p className="mt-4 text-slate-600">{t("login.copy")}</p>
    </div>
  );
}
