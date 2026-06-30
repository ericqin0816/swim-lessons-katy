"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Card, Eyebrow, PageSection } from "@/components/section";
import { site } from "@/lib/config";

export default function LessonsPage() {
  const { t } = useLanguage();
  const lessonLength = t("site.lessonLength");
  const offerings = [
    { title: t("skill.New swimmer"), copy: t("lessons.newCopy") },
    { title: t("skill.Beginner"), copy: t("lessons.beginnerCopy") },
    { title: t("skill.Intermediate"), copy: t("lessons.intermediateCopy") },
    { title: t("skill.Advanced stroke technique"), copy: t("lessons.advancedCopy") },
  ];
  const policies = [
    { title: t("lessons.cancelTitle"), copy: t("lessons.cancelCopy") },
    { title: t("lessons.weatherTitle"), copy: t("lessons.weatherCopy") },
    { title: t("lessons.specialTitle"), copy: t("lessons.specialCopy") },
  ];
  const faqs = [
    { question: t("lessons.faq1Question"), answer: t("lessons.faq1Answer", { lessonLength }) },
    { question: t("lessons.faq2Question"), answer: t("lessons.faq2Answer", { price: site.price }) },
    { question: t("lessons.faq3Question"), answer: t("lessons.faq3Answer") },
    { question: t("lessons.faq4Question"), answer: t("lessons.faq4Answer") },
    { question: t("lessons.faq5Question"), answer: t("lessons.faq5Answer") },
    { question: t("lessons.faq6Question"), answer: t("lessons.faq6Answer") },
  ];

  return (
    <PageSection>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <Eyebrow>{t("lessons.eyebrow")}</Eyebrow>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            {t("lessons.title")}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            {t("lessons.copy", { lessonLength, price: site.price })}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="rounded-lg bg-sky-600 px-6 py-3 text-center font-bold text-white shadow-sm shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700"
            >
              {t("lessons.findTime")}
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-sky-200 bg-white px-6 py-3 text-center font-bold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-50"
            >
              {t("lessons.meet")}
            </Link>
          </div>
        </div>

        <Card className="border-sky-200 bg-white text-slate-950">
          <p className="text-sm font-bold uppercase tracking-wider text-sky-700">
            {t("lessons.rate")}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <span className="text-6xl font-black text-slate-950">${site.price}</span>
            <span className="pb-2 text-lg font-semibold text-sky-800">
              {t("lessons.perOneHour")}
            </span>
          </div>
          <ul className="mt-6 space-y-3 text-slate-700">
            {[t("lessons.bullet1"), t("lessons.bullet2"), t("lessons.bullet3"), t("lessons.bullet4")].map(
              (item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-600" />
                  <span>{item}</span>
                </li>
              ),
            )}
          </ul>
        </Card>
      </div>

      <div className="mt-12">
        <Eyebrow>{t("lessons.skillLevels")}</Eyebrow>
        <div className="grid gap-6 md:grid-cols-2">
          {offerings.map((item) => (
            <Card key={item.title}>
              <h2 className="text-xl font-black text-slate-950">{item.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{item.copy}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <Eyebrow>{t("lessons.safetyPolicies")}</Eyebrow>
          <div className="grid gap-4">
            {policies.map((policy) => (
              <div key={policy.title} className="rounded-lg bg-slate-50 p-4">
                <h2 className="font-black text-slate-950">{policy.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{policy.copy}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Eyebrow>{t("lessons.faq")}</Eyebrow>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border border-slate-100 bg-white p-4">
                <h2 className="font-black text-slate-950">{faq.question}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-lg bg-sky-50 p-4 text-sm leading-6 text-sky-900">
            {t("lessons.privacy")}
          </p>
        </Card>
      </div>
    </PageSection>
  );
}
