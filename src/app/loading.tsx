"use client";

import { useLanguage } from "@/components/language-provider";
import { PageSection } from "@/components/section";

export default function Loading() {
  const { t } = useLanguage();

  return (
    <PageSection>
      <div className="soft-card rounded-lg p-6">
        <p className="mb-2 text-sm font-black uppercase tracking-wider text-sky-700">
          {t("loading.title")}
        </p>
        <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-sky-100" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-32 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-sky-50" />
      </div>
    </PageSection>
  );
}
