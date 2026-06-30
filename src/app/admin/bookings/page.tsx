import Link from "next/link";
import { Card, EmptyState, Eyebrow, PageSection } from "@/components/section";
import { getAdminBookings } from "@/lib/data";
import type { BookingWithDetails } from "@/lib/types";

function bookingTime(booking: BookingWithDetails) {
  return new Date(booking.availability_slots?.starts_at ?? booking.created_at);
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
      {status}
    </span>
  );
}

function formatStudents(value: string) {
  return value === "special_request" ? "Special request" : `${value} student(s)`;
}

function InstructorPill({ booking }: { booking: BookingWithDetails }) {
  const instructor = booking.availability_slots?.instructors;
  const isGreen = instructor?.color === "green";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        isGreen ? "bg-emerald-50 text-emerald-800" : "bg-sky-50 text-sky-800"
      }`}
    >
      {instructor?.name ?? "Instructor"}
    </span>
  );
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; instructor?: string; status?: string }>;
}) {
  const filters = await searchParams;
  const bookings = await getAdminBookings();
  const now = new Date().getTime();
  const view = filters.view === "past" || filters.view === "all" ? filters.view : "upcoming";
  const status = filters.status === "cancelled" || filters.status === "all" ? filters.status : "confirmed";
  const instructorFilter = filters.instructor ?? "all";
  const instructorOptions = Array.from(
    new Map(
      bookings
        .map((booking) => booking.availability_slots?.instructors)
        .filter((instructor): instructor is NonNullable<typeof instructor> => Boolean(instructor))
        .map((instructor) => [instructor.id, instructor]),
    ).values(),
  );
  const filteredBookings = bookings
    .filter((booking) => {
      const time = bookingTime(booking).getTime();
      const matchesView = view === "all" || (view === "upcoming" ? time >= now : time < now);
      const matchesStatus = status === "all" || booking.status === status;
      const matchesInstructor =
        instructorFilter === "all" || booking.availability_slots?.instructors?.id === instructorFilter;

      return matchesView && matchesStatus && matchesInstructor;
    })
    .sort((a, b) => bookingTime(a).getTime() - bookingTime(b).getTime());
  const makeHref = (nextFilters: { view?: string; instructor?: string; status?: string }) => {
    const params = new URLSearchParams({
      view,
      status,
      instructor: instructorFilter,
    });

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    return query ? `/admin/bookings?${query}` : "/admin/bookings";
  };

  return (
    <PageSection>
      <div className="mb-8">
        <Eyebrow>Admin bookings</Eyebrow>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">
          All lesson bookings.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Review parent contact details, swimmer names, instructor assignments,
          student counts, comments, and booking status across the business.
        </p>
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Booking list</h2>
            <p className="mt-1 text-sm text-slate-600">
              Showing {filteredBookings.length} of {bookings.length} bookings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {[
              ["upcoming", "Upcoming"],
              ["past", "Past"],
              ["all", "All"],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={makeHref({ view: value })}
                className={`rounded-lg px-3 py-2 ${
                  view === value
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Instructor</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href={makeHref({ instructor: "all" })}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  instructorFilter === "all" ? "bg-slate-950 text-white" : "bg-white text-slate-700"
                }`}
              >
                All
              </Link>
              {instructorOptions.map((instructor) => (
                <Link
                  key={instructor.id}
                  href={makeHref({ instructor: instructor.id })}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    instructorFilter === instructor.id
                      ? "bg-slate-950 text-white"
                      : instructor.color === "green"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-sky-50 text-sky-800"
                  }`}
                >
                  {instructor.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                ["confirmed", "Confirmed"],
                ["cancelled", "Cancelled"],
                ["all", "All"],
              ].map(([value, label]) => (
                <Link
                  key={value}
                  href={makeHref({ status: value })}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    status === value ? "bg-slate-950 text-white" : "bg-white text-slate-700"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {filteredBookings.length ? (
          <>
            <div className="space-y-3 md:hidden">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">
                        {booking.swimmers?.swimmer_name ?? "Swimmer"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {bookingTime(booking).toLocaleString()}
                      </p>
                    </div>
                    <InstructorPill booking={booking} />
                  </div>
                  <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                    <p className="font-black text-slate-950">{booking.parent_name}</p>
                    <p>{booking.parent_email}</p>
                    <p>{booking.parent_phone}</p>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <p>
                      <span className="font-bold text-slate-950">Skill:</span> {booking.skill_level}
                    </p>
                    <p>
                      <span className="font-bold text-slate-950">Students:</span>{" "}
                      {formatStudents(booking.number_of_students)}
                    </p>
                    {booking.comments ? (
                      <p className="rounded-lg bg-white p-3 leading-6">{booking.comments}</p>
                    ) : null}
                    <div>
                      <StatusPill status={booking.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="py-3 pr-4">Time</th>
                    <th className="py-3 pr-4">Instructor</th>
                    <th className="py-3 pr-4">Swimmer</th>
                    <th className="py-3 pr-4">Parent</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Skill</th>
                    <th className="py-3 pr-4">Students</th>
                    <th className="py-3 pr-4">Comments</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-100 align-top">
                      <td className="py-4 pr-4 font-semibold text-slate-950">
                        {bookingTime(booking).toLocaleString()}
                      </td>
                      <td className="py-4 pr-4">
                        <InstructorPill booking={booking} />
                      </td>
                      <td className="py-4 pr-4">
                        {booking.swimmers?.id ? (
                          <Link
                            href={`/admin/swimmers/${booking.swimmers.id}`}
                            className="font-bold text-sky-700 hover:text-sky-900"
                          >
                            {booking.swimmers.swimmer_name}
                          </Link>
                        ) : (
                          "Swimmer"
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-slate-900">{booking.parent_name}</p>
                        <p className="text-slate-500">{booking.parent_email}</p>
                      </td>
                      <td className="py-4 pr-4">{booking.parent_phone}</td>
                      <td className="py-4 pr-4">{booking.skill_level}</td>
                      <td className="py-4 pr-4">{formatStudents(booking.number_of_students)}</td>
                      <td className="max-w-[260px] py-4 pr-4 leading-6 text-slate-600">
                        {booking.comments || <span className="text-slate-400">No comments</span>}
                      </td>
                      <td className="py-4 pr-4">
                        <StatusPill status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState title={bookings.length ? "No bookings match these filters" : "No bookings yet"}>
            {bookings.length
              ? "Try changing the time, instructor, or status filters."
              : "Bookings will appear here after parents reserve public availability slots."}
          </EmptyState>
        )}
      </Card>
    </PageSection>
  );
}
