"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Card, Eyebrow, PageSection } from "@/components/section";
import { site } from "@/lib/config";

export default function AboutPage() {
  const { t } = useLanguage();
  const lessonLength = t("site.lessonLength");
  const ericHighlights = [
    {
      title: t("about.highlightCompetitiveTitle"),
      items: [
        t("about.highlightCompetitive1"),
        t("about.highlightCompetitive2"),
        t("about.highlightCompetitive3"),
      ],
    },
    {
      title: t("about.highlightAwardsTitle"),
      items: [
        t("about.highlightAwards1"),
        t("about.highlightAwards2"),
        t("about.highlightAwards3"),
        t("about.highlightAwards4"),
      ],
    },
    {
      title: t("about.highlightTeachingTitle"),
      items: [
        t("about.highlightTeaching1"),
        t("about.highlightTeaching2"),
        t("about.highlightTeaching3"),
        t("about.highlightTeaching4"),
      ],
    },
  ];
  const instructors = [
    {
      name: "Eric",
      color: "bg-sky-600",
      soft: "bg-sky-50 text-sky-800",
      border: "border-sky-100",
      badge: t("about.ericBadge"),
      copy: t("about.ericCopy"),
      focus: [t("about.ericFocus1"), t("about.ericFocus2"), t("about.ericFocus3")],
    },
    {
      name: "Instructor 2",
      color: "bg-emerald-600",
      soft: "bg-emerald-50 text-emerald-800",
      border: "border-emerald-100",
      badge: t("about.instructor2Badge"),
      copy: t("about.instructor2Copy"),
      focus: [
        t("about.instructor2Focus1"),
        t("about.instructor2Focus2"),
        t("about.instructor2Focus3"),
      ],
    },
  ];

  return (
    <PageSection>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <Eyebrow>{t("about.eyebrow")}</Eyebrow>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            {t("about.title")}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            {t("about.copy", { siteName: site.name })}
          </p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
          <p className="font-black text-slate-950">{t("about.expect")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[lessonLength, `$${site.price}`, t("about.allLevels")].map((item) => (
              <div key={item} className="rounded-lg bg-sky-50 p-4">
                <p className="text-xl font-black text-sky-800">{item}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {t("about.clearBefore")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {instructors.map((instructor) => (
          <Card key={instructor.name} className={`border ${instructor.border}`}>
            <div className={`mb-5 h-2 rounded-full ${instructor.color}`} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-lg ${instructor.soft} text-xl font-black`}
                >
                  {instructor.name === "Eric" ? "E" : "I2"}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{instructor.name}</h2>
                  <p className="mt-2 leading-7 text-slate-600">{instructor.copy}</p>
                </div>
              </div>
              <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ${instructor.soft}`}>
                {instructor.badge}
              </span>
            </div>
            <div className="mt-5 grid gap-2">
              {instructor.focus.map((item) => (
                <p key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  {item}
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <section className="mt-10 rounded-lg border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <Eyebrow>{t("about.ericHighlightsEyebrow")}</Eyebrow>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              {t("about.ericHighlightsTitle")}
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              {t("about.ericHighlightsCopy")}
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {ericHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-lg border border-sky-100 bg-sky-50 p-4"
              >
                <h3 className="font-black text-slate-950">{highlight.title}</h3>
                <div className="mt-3 grid gap-2">
                  {highlight.items.map((item) => (
                    <p
                      key={item}
                      className="rounded-lg bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
                    >
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg bg-sky-900 p-6 text-white sm:p-8">
          <h2 className="text-2xl font-black">{t("about.poolTitle")}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-sky-100">{t("about.poolCopy")}</p>
        </div>
        <Card>
          <h2 className="text-xl font-black text-slate-950">{t("about.privacyTitle")}</h2>
          <p className="mt-3 leading-7 text-slate-600">{t("about.privacyCopy")}</p>
          <Link
            href="/book"
            className="mt-5 inline-flex rounded-lg bg-sky-600 px-5 py-3 font-bold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
          >
            {t("about.book")}
          </Link>
        </Card>
      </div>
    </PageSection>
  );
}
