"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Card, EmptyState, PageSection } from "@/components/section";
import { SaveSwimmerForm } from "@/components/save-swimmer-form";
import type { TranslationKey } from "@/lib/i18n";
import type { BookingWithDetails, Swimmer } from "@/lib/types";

function bookingTime(booking: BookingWithDetails) {
  return new Date(booking.availability_slots?.starts_at ?? booking.created_at);
}

function InstructorPill({ booking }: { booking: BookingWithDetails }) {
  const instructor = booking.availability_slots?.instructors;
  const isGreen = instructor?.color === "green";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${
        isGreen ? "bg-emerald-50 text-emerald-800" : "bg-sky-50 text-sky-800"
      }`}
    >
      {instructor?.name ?? "Instructor"}
    </span>
  );
}

function BookingCard({ booking }: { booking: BookingWithDetails }) {
  const { language, t } = useLanguage();
  const locale = language === "zh" ? "zh-CN" : "en-US";
  const time = bookingTime(booking);
  const studentText =
    booking.number_of_students === "special_request"
      ? t("account.specialRequest")
      : t("account.students", { count: booking.number_of_students });

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition hover:border-sky-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-black text-slate-950">{booking.swimmers?.swimmer_name ?? "Swimmer"}</p>
          <p className="mt-1 text-sm text-slate-600">
            {time.toLocaleDateString(locale, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            {t("account.at")}{" "}
            {time.toLocaleTimeString(locale, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <InstructorPill booking={booking} />
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {t(`status.${booking.status}` as TranslationKey)}
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-2">
        <p>
          <span className="font-bold text-slate-950">{t("account.skill")}:</span>{" "}
          {t(`skill.${booking.skill_level}` as TranslationKey)}
        </p>
        <p>
          <span className="font-bold text-slate-950">{t("account.studentsLabel")}:</span>{" "}
          {studentText}
        </p>
      </div>
      {booking.comments ? (
        <p className="mt-3 rounded-lg border border-slate-100 bg-white p-3 text-sm leading-6 text-slate-600">
          {booking.comments}
        </p>
      ) : null}
    </div>
  );
}

function BookingList({ title, bookings }: { title: string; bookings: BookingWithDetails[] }) {
  const { t } = useLanguage();
  const isUpcoming = title === t("account.upcomingBookings");

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {bookings.length}
        </span>
      </div>
      <div className="space-y-3">
        {bookings.length ? (
          bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          <EmptyState
            title={isUpcoming ? t("account.noUpcoming") : t("account.noPast")}
            action={
              isUpcoming ? (
                <Link
                  href="/book"
                  className="inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
                >
                  {t("footer.book")}
                </Link>
              ) : null
            }
          >
            {isUpcoming ? t("account.noUpcomingCopy") : t("account.noPastCopy")}
          </EmptyState>
        )}
      </div>
    </Card>
  );
}

export function AccountContent({
  profileName,
  parentName,
  parentEmail,
  parentPhone,
  swimmers,
  bookings,
}: {
  profileName: string | null;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  swimmers: Swimmer[];
  bookings: BookingWithDetails[];
}) {
  const { t } = useLanguage();
  const now = new Date().getTime();
  const upcoming = bookings
    .filter((booking) => bookingTime(booking).getTime() >= now)
    .sort((a, b) => bookingTime(a).getTime() - bookingTime(b).getTime());
  const past = bookings
    .filter((booking) => bookingTime(booking).getTime() < now)
    .sort((a, b) => bookingTime(b).getTime() - bookingTime(a).getTime());

  return (
    <PageSection>
      <div className="mb-8 rounded-lg bg-slate-950 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-sky-200">
              {t("account.eyebrow")}
            </p>
            <h1 className="text-4xl font-black tracking-tight">
              {t("account.welcome", { suffix: profileName ? `, ${profileName}` : "" })}
            </h1>
            <p className="mt-4 max-w-2xl text-slate-200">{t("account.copy")}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
              <span className="rounded-full bg-white/10 px-3 py-1">{parentEmail}</span>
              {parentPhone ? <span className="rounded-full bg-white/10 px-3 py-1">{parentPhone}</span> : null}
            </div>
          </div>
          <Link
            href="/book"
            className="rounded-lg bg-sky-500 px-5 py-3 text-center font-bold text-white transition hover:bg-sky-400"
          >
            {t("account.bookAnother")}
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
          <p className="text-3xl font-black text-slate-950">{upcoming.length}</p>
          <p className="text-sm font-semibold text-slate-500">{t("account.upcoming")}</p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
          <p className="text-3xl font-black text-slate-950">{swimmers.length}</p>
          <p className="text-sm font-semibold text-slate-500">{t("account.savedSwimmers")}</p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
          <p className="text-3xl font-black text-slate-950">{bookings.length}</p>
          <p className="text-sm font-semibold text-slate-500">{t("account.totalBookings")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <Card>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">{t("account.savedTitle")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("account.savedCopy")}</p>
              </div>
              <span className="w-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                {t("account.faster")}
              </span>
            </div>
            <div className="space-y-3">
              {swimmers.length ? (
                swimmers.map((swimmer) => (
                  <div key={swimmer.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950">{swimmer.swimmer_name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {t("account.age")} {swimmer.swimmer_age ?? t("account.notSet")} -{" "}
                          {t(`skill.${swimmer.skill_level}` as TranslationKey)}
                        </p>
                      </div>
                      <Link
                        href="/book"
                        className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-sky-700 shadow-sm ring-1 ring-sky-100 hover:bg-sky-50 hover:text-sky-900"
                      >
                        {t("account.book")}
                      </Link>
                    </div>
                    {swimmer.comments ? (
                      <p className="mt-3 rounded-lg bg-white p-3 text-sm leading-6 text-slate-600">
                        {swimmer.comments}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState title={t("account.noSavedTitle")}>
                  {t("account.noSavedCopy")}
                </EmptyState>
              )}
            </div>
          </Card>

          <Card>
            <div className="rounded-lg bg-sky-50 p-4">
              <h2 className="text-xl font-black text-slate-950">{t("account.addProfile")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {t("account.addProfileCopy")}
              </p>
            </div>
            <div className="mt-5">
              <SaveSwimmerForm
                parentName={parentName}
                parentEmail={parentEmail}
                parentPhone={parentPhone}
              />
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          <BookingList title={t("account.upcomingBookings")} bookings={upcoming} />
          <BookingList title={t("account.pastBookings")} bookings={past} />
        </div>
      </div>
    </PageSection>
  );
}
