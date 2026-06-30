"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { site } from "@/lib/config";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-sky-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-slate-600 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-bold text-slate-950">{site.name}</p>
          <p className="mt-2 max-w-sm">
            {t("footer.copy")}
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-950">{t("footer.lessons")}</p>
          <p className="mt-2">{t("footer.price")}</p>
          <p>{t("footer.levels")}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {t("footer.privacy")}
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-950">{t("footer.quickLinks")}</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link href="/book" className="hover:text-sky-700">
              {t("footer.book")}
            </Link>
            <Link href="/account" className="hover:text-sky-700">
              {t("footer.account")}
            </Link>
            <Link href="/admin" className="hover:text-sky-700">
              {t("footer.admin")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
