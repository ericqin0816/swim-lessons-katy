"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { site } from "@/lib/config";
import type { Language } from "@/lib/i18n";

const nav = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/lessons", labelKey: "nav.lessons" },
  { href: "/book", labelKey: "nav.book" },
] as const;

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const choices: { value: Language; label: string }[] = [
    { value: "en", label: t("language.english") },
    { value: "zh", label: t("language.chinese") },
  ];

  return (
    <div
      aria-label={t("language.label")}
      role="group"
      className="flex shrink-0 items-center rounded-lg border border-sky-100 bg-sky-50 p-1"
    >
      {choices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          onClick={() => setLanguage(choice.value)}
          aria-pressed={language === choice.value}
          className={`rounded-md px-3 py-1.5 text-xs font-black transition ${
            language === choice.value
              ? "bg-white text-sky-800 shadow-sm"
              : "text-slate-600 hover:text-sky-800"
          }`}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

export function SiteNav({
  isLoggedIn,
  showAdminLink,
  signOutAction,
}: {
  isLoggedIn: boolean;
  showAdminLink: boolean;
  signOutAction: () => Promise<void>;
}) {
  const { t } = useLanguage();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-sm font-semibold text-slate-700 lg:flex-wrap lg:overflow-visible lg:pb-0">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-lg px-3 py-2 transition hover:bg-sky-50 hover:text-sky-700"
        >
          {t(item.labelKey)}
        </Link>
      ))}
      {showAdminLink ? (
        <Link
          href="/admin"
          className="shrink-0 rounded-lg px-3 py-2 text-sky-700 transition hover:bg-sky-50"
        >
          {t("nav.admin")}
        </Link>
      ) : null}
      {isLoggedIn ? (
        <>
          <Link
            href="/account"
            className="shrink-0 rounded-lg px-3 py-2 text-sky-700 transition hover:bg-sky-50"
          >
            {t("nav.account")}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
            >
              {t("nav.signOut")}
            </button>
          </form>
        </>
      ) : (
        <Link
          href="/login"
          className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
        >
          {t("nav.login")}
        </Link>
      )}
      <LanguageSwitcher />
    </nav>
  );
}

export function HeaderTagline() {
  const { t } = useLanguage();
  return (
    <span className="block text-sm text-slate-500">
      {t("nav.tagline", { location: site.location })}
    </span>
  );
}
