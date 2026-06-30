import { AddAvailabilityForm } from "@/components/admin-forms";
import { Card, EmptyState, Eyebrow, PageSection } from "@/components/section";
import { getAdminAvailabilitySlots, getInstructors } from "@/lib/data";

function formatSlotTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminAvailabilityPage() {
  const [slots, instructors] = await Promise.all([
    getAdminAvailabilitySlots(),
    getInstructors(),
  ]);

  const now = new Date().getTime();
  const futureSlots = slots.filter((slot) => new Date(slot.starts_at).getTime() >= now);

  return (
    <PageSection>
      <div className="mb-8">
        <Eyebrow>Admin availability</Eyebrow>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">
          Manage instructor time slots.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Add one-hour slots for Eric or Instructor 2. Booked slots remain visible
          here and can be opened to review the booking details.
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
        </Card>

        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Upcoming slots</h2>
              <p className="mt-1 text-sm text-slate-600">
                Open slots are visible on the public calendar. Booked or unavailable slots stay gray.
              </p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
              {futureSlots.length}
            </span>
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
          <div className="space-y-3">
            {futureSlots.length ? (
              futureSlots.map((slot) => {
                const isGreen = slot.instructors?.color === "green";
                const confirmedBooking = slot.bookings?.find(
                  (booking) => booking.status === "confirmed",
                );

                return (
                  <details
                    key={slot.id}
                    className={`rounded-lg border p-4 ${
                      slot.is_booked
                        ? "border-slate-200 bg-slate-100"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-slate-950">{formatSlotTime(slot.starts_at)}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {slot.is_booked ? "Booked or unavailable - click to view details" : "Open for booking"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                              isGreen ? "bg-emerald-50 text-emerald-800" : "bg-sky-50 text-sky-800"
                            }`}
                          >
                            {slot.instructors?.name ?? "Instructor"}
                          </span>
                          {slot.is_booked ? (
                            <span className="w-fit rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">
                              Booked/unavailable
                            </span>
                          ) : (
                            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    </summary>

                    {slot.is_booked ? (
                      <div className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-600">
                        {confirmedBooking ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="font-black text-slate-950">Parent</p>
                              <p className="mt-1">{confirmedBooking.parent_name}</p>
                              <p>{confirmedBooking.parent_email}</p>
                              <p>{confirmedBooking.parent_phone}</p>
                            </div>
                            <div>
                              <p className="font-black text-slate-950">Swimmer</p>
                              <p className="mt-1">
                                {confirmedBooking.swimmers?.swimmer_name ?? "Swimmer"}
                                {confirmedBooking.swimmers?.swimmer_age != null
                                  ? `, age ${confirmedBooking.swimmers.swimmer_age}`
                                  : ""}
                              </p>
                              <p>{confirmedBooking.skill_level}</p>
                              <p>
                                {confirmedBooking.number_of_students === "special_request"
                                  ? "Special request"
                                  : `${confirmedBooking.number_of_students} student(s)`}
                              </p>
                            </div>
                            {confirmedBooking.comments ? (
                              <div className="rounded-lg bg-slate-50 p-3 md:col-span-2">
                                <p className="font-black text-slate-950">Comments</p>
                                <p className="mt-1">{confirmedBooking.comments}</p>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p>No confirmed booking details found for this booked slot.</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-lg bg-white p-4 text-sm text-slate-500">
                        This slot is still available on the public calendar.
                      </p>
                    )}
                  </details>
                );
              })
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
