import {
  AddAvailabilityForm,
  AvailabilitySlotActions,
  BulkAvailabilityForm,
} from "@/components/admin-forms";
import { Card, EmptyState, Eyebrow, PageSection } from "@/components/section";
import { getAdminAvailabilitySlots, getInstructors } from "@/lib/data";
import type { AvailabilitySlot, Booking, Instructor, Swimmer } from "@/lib/types";

type AdminAvailabilitySlot = AvailabilitySlot & {
  instructors: Pick<Instructor, "id" | "name" | "color"> | null;
  bookings: (Booking & {
    swimmers: Pick<Swimmer, "id" | "swimmer_name" | "swimmer_age"> | null;
  })[];
};

function formatDateHeading(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatSlotTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDateKey(value: string) {
  return new Date(value).toLocaleDateString("en-CA");
}

function groupSlotsByDate(slots: AdminAvailabilitySlot[]) {
  return slots.reduce<Record<string, AdminAvailabilitySlot[]>>((groups, slot) => {
    const key = getDateKey(slot.starts_at);
    groups[key] = groups[key] ?? [];
    groups[key].push(slot);
    return groups;
  }, {});
}

function getSlotStatus(slot: AdminAvailabilitySlot) {
  const confirmedBooking = slot.bookings?.find((booking) => booking.status === "confirmed");
  const anyBooking = confirmedBooking ?? slot.bookings?.[0] ?? null;

  if (anyBooking) {
    return { label: "Booked", kind: "booked" as const, confirmedBooking: anyBooking };
  }

  if (slot.is_booked) {
    return { label: "Unavailable", kind: "unavailable" as const, confirmedBooking: null };
  }

  return { label: "Open", kind: "open" as const, confirmedBooking: null };
}

function instructorBadgeClasses(color?: string) {
  return color === "green"
    ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
    : "bg-sky-50 text-sky-800 ring-sky-100";
}

function slotCardClasses(kind: "open" | "booked" | "unavailable", color?: string) {
  if (kind !== "open") {
    return "border-slate-200 bg-slate-100";
  }

  return color === "green"
    ? "border-emerald-100 bg-emerald-50/40"
    : "border-sky-100 bg-sky-50/40";
}

function statusBadgeClasses(kind: "open" | "booked" | "unavailable") {
  if (kind === "open") {
    return "bg-emerald-50 text-emerald-800";
  }

  return "bg-slate-700 text-white";
}

export default async function AdminAvailabilityPage() {
  const [slots, instructors] = await Promise.all([
    getAdminAvailabilitySlots(),
    getInstructors(),
  ]);

  const now = new Date().getTime();
  const futureSlots = slots.filter((slot) => new Date(slot.starts_at).getTime() >= now);
  const groupedSlots = groupSlotsByDate(futureSlots);
  const dateKeys = Object.keys(groupedSlots).sort();
  const openCount = futureSlots.filter((slot) => getSlotStatus(slot).kind === "open").length;
  const bookedCount = futureSlots.filter((slot) => getSlotStatus(slot).kind === "booked").length;
  const unavailableCount = futureSlots.filter((slot) => getSlotStatus(slot).kind === "unavailable").length;

  return (
    <PageSection>
      <div className="mb-8">
        <Eyebrow>Admin availability</Eyebrow>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">
          Manage instructor time slots.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Add, bulk-create, remove, or block one-hour lesson slots. Booked slots
          stay protected so parent reservations are not accidentally deleted.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h2 className="text-xl font-black text-slate-950">Add availability</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Times are saved as Katy local time. Each slot belongs to one instructor.
          </p>
          <div className="mt-4 grid gap-2 text-sm">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span className="font-semibold text-slate-800">{instructor.name}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    instructor.color === "green"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-sky-50 text-sky-800"
                  }`}
                >
                  {instructor.color === "green" ? "Green" : "Blue"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <AddAvailabilityForm instructors={instructors} />
          </div>
          <div className="my-6 border-t border-slate-100" />
          <h2 className="text-xl font-black text-slate-950">Bulk add slots</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pick a date range and common lesson times. Existing duplicates are skipped safely.
          </p>
          <div className="mt-5">
            <BulkAvailabilityForm instructors={instructors} />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Upcoming slots</h2>
              <p className="mt-1 text-sm text-slate-600">
                Open slots are visible on the public calendar. Booked or unavailable slots stay gray.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                {openCount} open
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {bookedCount} booked
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {unavailableCount} unavailable
              </span>
            </div>
          </div>
          <div className="mb-5 grid gap-2 text-xs font-bold text-slate-700 sm:grid-cols-3">
            <span className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sky-800">
              Eric: blue
            </span>
            <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-800">
              Instructor 2: green
            </span>
            <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700">
              Booked/blocked: gray
            </span>
          </div>
          <div className="space-y-6">
            {dateKeys.length ? (
              dateKeys.map((dateKey) => (
                <section key={dateKey} className="rounded-lg border border-slate-100 bg-white p-3">
                  <div className="mb-3 flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-black text-slate-950">
                      {formatDateHeading(groupedSlots[dateKey][0].starts_at)}
                    </h3>
                    <span className="text-sm font-semibold text-slate-500">
                      {groupedSlots[dateKey].length} slot{groupedSlots[dateKey].length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {groupedSlots[dateKey].map((slot) => {
                      const status = getSlotStatus(slot);
                      const canDelete = status.kind !== "booked";
                      const canMarkUnavailable = status.kind === "open";

                      return (
                        <details
                          key={slot.id}
                          className={`rounded-lg border p-4 ${slotCardClasses(status.kind, slot.instructors?.color)}`}
                        >
                          <summary className="cursor-pointer list-none">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-black text-slate-950">{formatSlotTime(slot.starts_at)}</p>
                                <p className="mt-1 text-sm text-slate-600">
                                  {status.kind === "open"
                                    ? "Open for booking"
                                    : status.kind === "booked"
                                      ? "Booked - click to view parent and swimmer details"
                                      : "Unavailable - hidden from open booking choices"}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${instructorBadgeClasses(slot.instructors?.color)}`}
                                >
                                  {slot.instructors?.name ?? "Instructor"}
                                </span>
                                <span
                                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClasses(status.kind)}`}
                                >
                                  {status.label}
                                </span>
                              </div>
                            </div>
                          </summary>

                          <div className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-600">
                            {status.confirmedBooking ? (
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <p className="font-black text-slate-950">Parent</p>
                                  <p className="mt-1">{status.confirmedBooking.parent_name}</p>
                                  <p>{status.confirmedBooking.parent_email}</p>
                                  <p>{status.confirmedBooking.parent_phone}</p>
                                </div>
                                <div>
                                  <p className="font-black text-slate-950">Swimmer</p>
                                  <p className="mt-1">
                                    {status.confirmedBooking.swimmers?.swimmer_name ?? "Swimmer"}
                                    {status.confirmedBooking.swimmers?.swimmer_age != null
                                      ? `, age ${status.confirmedBooking.swimmers.swimmer_age}`
                                      : ""}
                                  </p>
                                  <p>{status.confirmedBooking.skill_level}</p>
                                  <p>
                                    {status.confirmedBooking.number_of_students === "special_request"
                                      ? "Special request"
                                      : `${status.confirmedBooking.number_of_students} student(s)`}
                                  </p>
                                </div>
                                {status.confirmedBooking.comments ? (
                                  <div className="rounded-lg bg-slate-50 p-3 md:col-span-2">
                                    <p className="font-black text-slate-950">Comments</p>
                                    <p className="mt-1">{status.confirmedBooking.comments}</p>
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <p>
                                  {status.kind === "open"
                                    ? "This slot is visible as an open choice on the public booking calendar."
                                    : "This slot is blocked from public booking but does not have a confirmed booking."}
                                </p>
                                <AvailabilitySlotActions
                                  slotId={slot.id}
                                  canDelete={canDelete}
                                  canMarkUnavailable={canMarkUnavailable}
                                />
                              </div>
                            )}
                            {status.confirmedBooking ? (
                              <div className="mt-4">
                                <AvailabilitySlotActions
                                  slotId={slot.id}
                                  canDelete={canDelete}
                                  canMarkUnavailable={canMarkUnavailable}
                                />
                              </div>
                            ) : null}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <EmptyState title="No upcoming availability">
                Add a slot to make it visible on the public booking calendar.
              </EmptyState>
            )}
          </div>
        </Card>
      </div>
    </PageSection>
  );
}
