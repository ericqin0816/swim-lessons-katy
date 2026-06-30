"use client";

import { useMemo, useState, useActionState } from "react";
import { bookLesson, type FormState } from "@/app/actions/bookings";
import { translatedMessage, useLanguage } from "@/components/language-provider";
import { EmptyState, StatusMessage } from "@/components/section";
import { site, skillLevels, studentCounts } from "@/lib/config";
import type { TranslationKey } from "@/lib/i18n";
import type { BookingSlot, Swimmer } from "@/lib/types";

const initialState: FormState = { ok: false, message: "" };

function formatDay(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function instructorStyles(color?: string, selected = false, unavailable = false) {
  if (unavailable) {
    return "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500";
  }

  const isGreen = color === "green";
  const base = isGreen
    ? "border-emerald-200 bg-emerald-50 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-100"
    : "border-sky-200 bg-sky-50 text-sky-950 hover:border-sky-400 hover:bg-sky-100";
  const active = isGreen
    ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-100"
    : "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-100";

  return selected ? active : base;
}

export function BookingCalendar({
  slots,
  savedSwimmers,
}: {
  slots: BookingSlot[];
  savedSwimmers: Swimmer[];
}) {
  const { language, t } = useLanguage();
  const locale = language === "zh" ? "zh-CN" : "en-US";
  const sortedSlots = useMemo(
    () =>
      [...slots].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    [slots],
  );
  const firstAvailableSlot = sortedSlots.find((slot) => !slot.is_booked);
  const [selectedSlotId, setSelectedSlotId] = useState(firstAvailableSlot?.id ?? "");
  const [selectedSwimmerId, setSelectedSwimmerId] = useState("");
  const [state, action, pending] = useActionState(bookLesson, initialState);

  const selectedSlot = sortedSlots.find((slot) => slot.id === selectedSlotId && !slot.is_booked);
  const selectedSwimmer = savedSwimmers.find((swimmer) => swimmer.id === selectedSwimmerId);
  const openSlotCount = sortedSlots.filter((slot) => !slot.is_booked).length;

  const days = useMemo(() => {
    const grouped = new Map<string, BookingSlot[]>();
    sortedSlots.forEach((slot) => {
      const key = dayKey(new Date(slot.starts_at));
      grouped.set(key, [...(grouped.get(key) ?? []), slot]);
    });

    return Array.from(grouped.entries()).slice(0, 7);
  }, [sortedSlots]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] lg:items-start">
      <div className="soft-card rounded-lg p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-sky-700">
              {t("book.step1")}
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{t("book.chooseTitle")}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {t("book.chooseCopy")}
            </p>
          </div>
          <div className="grid gap-2 rounded-lg border border-sky-100 bg-white p-3 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2 font-bold text-sky-800">
              <span className="size-3 rounded-full bg-sky-600" />
              Eric
            </div>
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <span className="size-3 rounded-full bg-emerald-600" />
              Instructor 2
            </div>
            <div className="font-bold text-slate-700">
              ${site.price} / {t("site.lessonLength")}
            </div>
          </div>
        </div>

        {days.length && !openSlotCount ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
            {t("book.noOpen")}
          </div>
        ) : null}

        {days.length ? (
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {days.map(([key, daySlots]) => (
              <section key={key} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-black text-slate-950">
                    {formatDay(new Date(`${key}T12:00:00`), locale)}
                  </h3>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                    {daySlots.filter((slot) => !slot.is_booked).length} {t("book.open")}
                  </span>
                </div>
                <div className="grid gap-2">
                  {daySlots.map((slot) => {
                    const instructor = slot.instructors;
                    const unavailable = slot.is_booked;
                    const selected = slot.id === selectedSlotId;
                    const slotTime = formatTime(new Date(slot.starts_at), locale);
                    const slotStatus = unavailable
                      ? t("book.booked")
                      : selected
                        ? t("book.selected")
                        : t("book.open");

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          if (!unavailable) {
                            setSelectedSlotId(slot.id);
                          }
                        }}
                        aria-pressed={selected && !unavailable}
                        aria-label={`${instructor?.name ?? "Instructor"} ${slotTime}, ${slotStatus}`}
                        disabled={unavailable}
                        className={`rounded-lg border p-3 text-left transition ${
                          unavailable ? "" : "hover:-translate-y-0.5"
                        } ${instructorStyles(
                          instructor?.color,
                          selected,
                          unavailable,
                        )}`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-base font-black">
                            {slotTime}
                          </span>
                          {unavailable ? (
                            <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">
                              {t("book.booked")}
                            </span>
                          ) : selected ? (
                            <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-bold">
                              {t("book.selected")}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-sm font-semibold opacity-90">
                          {instructor?.name ?? "Instructor"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("book.noTimesTitle")}
            action={
              <a
                href="mailto:hello@swimlessonskaty.com"
                className="inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700"
              >
                {t("book.askAvailability")}
              </a>
            }
          >
            {t("book.noTimesCopy")}
          </EmptyState>
        )}
      </div>

      <form
        key={selectedSwimmerId || "new-swimmer"}
        action={action}
        className="soft-card rounded-lg p-5 lg:sticky lg:top-28"
      >
        <input type="hidden" name="slotId" value={selectedSlot?.id ?? ""} />
        <input type="hidden" name="savedSwimmerId" value={selectedSwimmerId} />

        <div className="mb-5 rounded-lg bg-slate-950 p-4 text-white">
          <p className="text-sm font-black uppercase tracking-wider text-sky-200">
            {t("book.step2")}
          </p>
          <h2 className="mt-1 text-2xl font-black">{t("book.finishTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {selectedSlot
              ? t("book.selectedSlot", {
                  instructor: selectedSlot.instructors?.name ?? "Instructor",
                  time: formatTime(new Date(selectedSlot.starts_at), locale),
                  day: formatDay(new Date(selectedSlot.starts_at), locale),
                })
              : openSlotCount
                ? t("book.chooseUnlock")
                : t("book.noOpenNow")}
          </p>
        </div>

        {selectedSlot ? (
          <div className="mb-4 rounded-lg border border-sky-100 bg-white p-4 text-sm shadow-sm">
            <p className="font-black text-slate-950">{t("book.summaryTitle")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: t("book.summaryInstructor"),
                  value: selectedSlot.instructors?.name ?? "Instructor",
                },
                {
                  label: t("book.summaryDate"),
                  value: formatDay(new Date(selectedSlot.starts_at), locale),
                },
                {
                  label: t("book.summaryTime"),
                  value: formatTime(new Date(selectedSlot.starts_at), locale),
                },
                { label: t("book.summaryDuration"), value: t("site.lessonLength") },
                { label: t("book.summaryPrice"), value: `$${site.price}` },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 font-black text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {savedSwimmers.length ? (
          <label className="mb-4 block text-sm font-semibold text-slate-700">
            {t("book.returningShortcut")}
            <select
              value={selectedSwimmerId}
              onChange={(event) => setSelectedSwimmerId(event.target.value)}
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <option value="">{t("book.newForm")}</option>
              {savedSwimmers.map((swimmer) => (
                <option key={swimmer.id} value={swimmer.id}>
                  {swimmer.swimmer_name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="mb-4 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          <p className="font-black">{t("book.beforeSubmit")}</p>
          <p className="mt-1">
            {t("book.beforeSubmitCopy")}
          </p>
        </div>

        <div className="grid gap-4">
          <label className="block text-sm font-semibold text-slate-700">
            {t("book.parentName")}
            <input
              name="parentName"
              required
              disabled={!selectedSlot}
              defaultValue={selectedSwimmer?.parent_name ?? ""}
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              {t("book.email")}
              <input
                name="parentEmail"
                type="email"
                required
                disabled={!selectedSlot}
                defaultValue={selectedSwimmer?.parent_email ?? ""}
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {t("book.phone")}
              <input
                name="parentPhone"
                required
                disabled={!selectedSlot}
                defaultValue={selectedSwimmer?.parent_phone ?? ""}
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <label className="block text-sm font-semibold text-slate-700">
              {t("book.swimmerName")}
              <input
                name="swimmerName"
                required
                disabled={!selectedSlot}
                defaultValue={selectedSwimmer?.swimmer_name ?? ""}
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {t("book.age")}
              <input
                name="swimmerAge"
                type="number"
                min="0"
                max="99"
                disabled={!selectedSlot}
                defaultValue={selectedSwimmer?.swimmer_age ?? ""}
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              {t("book.numberStudents")}
              <select
                name="numberOfStudents"
                required
                disabled={!selectedSlot}
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:bg-slate-100"
              >
                {studentCounts.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t(`students.${item.value}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              {t("book.skillLevel")}
              <select
                name="skillLevel"
                required
                disabled={!selectedSlot}
                defaultValue={selectedSwimmer?.skill_level ?? "New swimmer"}
                className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:bg-slate-100"
              >
                {skillLevels.map((level) => (
                  <option key={level} value={level}>
                    {t(`skill.${level}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold text-slate-700">
            {t("book.comments")}
            <textarea
              name="comments"
              rows={5}
              disabled={!selectedSlot}
              defaultValue={selectedSwimmer?.comments ?? ""}
              placeholder={t("book.commentsPlaceholder")}
              className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
            />
          </label>
        </div>

        {state.message ? (
          <StatusMessage ok={state.ok} className="mt-4">
            {translatedMessage(t, state.messageKey, state.message)}
          </StatusMessage>
        ) : null}

        <button
          disabled={!selectedSlot || pending}
          className="mt-5 w-full rounded-lg bg-sky-600 px-5 py-3 font-bold text-white shadow-sm shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
        >
          {pending ? t("book.pending") : t("book.submit")}
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-slate-500">
          {t("book.paymentNote")}
        </p>
      </form>
    </div>
  );
}
