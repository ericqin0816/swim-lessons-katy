"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Card, Eyebrow, PageSection } from "@/components/section";
import { site } from "@/lib/config";

export default function Home() {
  const { t } = useLanguage();
  const lessonLength = t("site.lessonLength");
  const levels = [
    t("skill.New swimmer"),
    t("skill.Beginner"),
    t("skill.Intermediate"),
    t("skill.Advanced stroke technique"),
  ];
  const steps = [
    { title: t("home.step1Title"), copy: t("home.step1Copy") },
    { title: t("home.step2Title"), copy: t("home.step2Copy") },
    { title: t("home.step3Title"), copy: t("home.step3Copy") },
  ];
  const trustItems = [t("home.trust1"), t("home.trust2"), t("home.trust3")];
  const faqs = [
    {
      question: t("home.faq1Question"),
      answer: t("home.faq1Answer", { lessonLength, price: site.price }),
    },
    { question: t("home.faq2Question"), answer: t("home.faq2Answer") },
    { question: t("home.faq3Question"), answer: t("home.faq3Answer") },
    { question: t("home.faq4Question"), answer: t("home.faq4Answer") },
  ];

  return (
    <>
      <section className="water-grid pool-lines overflow-hidden">
        <div className="mx-auto grid min-h-[640px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-3 py-2 text-sm font-bold text-sky-800 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              {t("home.badge", { location: site.location })}
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              {t("home.heroCopy", { siteName: site.name })}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="rounded-lg bg-sky-600 px-6 py-3 text-center font-bold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700"
              >
                {t("home.viewTimes")}
              </Link>
              <Link
                href="/lessons"
                className="rounded-lg border border-sky-200 bg-white px-6 py-3 text-center font-bold text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-50"
              >
                {t("home.seeLessons")}
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white/85 p-4 shadow-sm">
                <p className="text-2xl font-black text-slate-950">${site.price}</p>
                <p className="text-xs font-semibold text-slate-500">{t("home.perLesson")}</p>
              </div>
              <div className="rounded-lg bg-white/85 p-4 shadow-sm">
                <p className="text-2xl font-black text-slate-950">{lessonLength}</p>
                <p className="text-xs font-semibold text-slate-500">{t("home.everyBooking")}</p>
              </div>
              <div className="rounded-lg bg-white/85 p-4 shadow-sm">
                <p className="text-2xl font-black text-slate-950">{t("home.levelsValue")}</p>
                <p className="text-xs font-semibold text-slate-500">{t("home.instructors")}</p>
              </div>
            </div>
          </div>

          <div className="soft-card rounded-lg p-4 sm:p-5">
            <div className="rounded-lg bg-slate-950 p-5 text-white">
              <p className="text-sm font-bold uppercase tracking-wider text-sky-200">
                {t("home.weekGlance")}
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  { name: "Eric", color: "bg-sky-500", time: "9:00 AM", note: t("home.ericNote") },
                  {
                    name: "Instructor 2",
                    color: "bg-emerald-500",
                    time: "9:00 AM",
                    note: t("home.instructor2Note"),
                  },
                  { name: "Eric", color: "bg-slate-400", time: "4:00 PM", note: t("home.bookedNote") },
                ].map((slot) => (
                  <div key={`${slot.name}-${slot.time}`} className="rounded-lg bg-white/10 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`size-3 rounded-full ${slot.color}`} />
                        <p className="font-bold">{slot.name}</p>
                      </div>
                      <p className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-950">
                        {slot.time}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-sky-100">{slot.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-sky-50 p-4">
              <p className="font-bold text-slate-950">{t("home.twoInstructorsTitle")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t("home.twoInstructorsCopy")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <Eyebrow>{t("home.parentsEyebrow")}</Eyebrow>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {t("home.parentsTitle")}
            </h2>
            <p className="mt-4 leading-7 text-slate-600">{t("home.parentsCopy")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title}>
                <p className="mb-4 flex size-10 items-center justify-center rounded-lg bg-sky-100 font-black text-sky-800">
                  {index + 1}
                </p>
                <h3 className="text-lg font-bold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </PageSection>

      <section className="bg-white">
        <PageSection>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <Eyebrow>{t("home.trustEyebrow")}</Eyebrow>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                {t("home.trustTitle")}
              </h2>
              <p className="mt-4 leading-7 text-slate-600">{t("home.trustCopy")}</p>
            </div>
            <div className="grid gap-3">
              {trustItems.map((item) => (
                <div key={item} className="rounded-lg border border-sky-100 bg-sky-50 p-4">
                  <p className="font-bold text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </PageSection>
      </section>

      <PageSection>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <Eyebrow>{t("home.levelsEyebrow")}</Eyebrow>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              {t("home.levelsTitle")}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {levels.map((level) => (
                <span
                  key={level}
                  className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800"
                >
                  {level}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <h3 className="font-black text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </PageSection>
    </>
  );
}
