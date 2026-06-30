"use client";

import { useLanguage } from "@/components/language-provider";
import { PageSection } from "@/components/section";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  return (
    <PageSection>
      <div className="mx-auto max-w-2xl rounded-lg border border-rose-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-wider text-rose-700">
          {t("error.eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          {t("error.title")}
        </h1>
        <p className="mt-4 text-slate-600">
          {t("error.copy")}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-sky-600 px-5 py-3 font-bold text-white transition hover:bg-sky-700"
        >
          {t("error.retry")}
        </button>
      </div>
    </PageSection>
  );
}
