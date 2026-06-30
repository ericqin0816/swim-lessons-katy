import Link from "next/link";
import { AddAvailabilityForm } from "@/components/admin-forms";
import { Card, EmptyState, PageSection } from "@/components/section";
import {
  getAdminAvailabilitySlots,
  getAdminBookings,
  getAdminSwimmers,
  getInstructors,
} from "@/lib/data";
import type { BookingWithDetails } from "@/lib/types";

function bookingTime(booking: BookingWithDetails) {
  return new Date(booking.availability_slots?.starts_at ?? booking.created_at);
}

function BookingRow({ booking }: { booking: BookingWithDetails }) {
  const instructor = booking.availability_slots?.instructors;
  const isGreen = instructor?.color === "green";

  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="py-4 pr-4 font-semibold text-slate-950">
        {bookingTime(booking).toLocaleString()}
      </td>
      <td className="py-4 pr-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isGreen ? "bg-emerald-50 text-emerald-800" : "bg-sky-50 text-sky-800"
          }`}
        >
          {instructor?.name ?? "Instructor"}
        </span>
      </td>
      <td className="py-4 pr-4">{booking.swimmers?.swimmer_name ?? "Swimmer"}</td>
      <td className="py-4 pr-4">
        <p className="font-semibold text-slate-900">{booking.parent_name}</p>
        <p className="text-slate-500">{booking.parent_email}</p>
      </td>
      <td className="py-4 pr-4">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {booking.status}
        </span>
      </td>
    </tr>
  );
}

function BookingCard({ booking }: { booking: BookingWithDetails }) {
  const instructor = booking.availability_slots?.instructors;
  const isGreen = instructor?.color === "green";

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-950">{booking.swimmers?.swimmer_name ?? "Swimmer"}</p>
          <p className="mt-1 text-sm text-slate-600">{bookingTime(booking).toLocaleString()}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isGreen ? "bg-emerald-50 text-emerald-800" : "bg-sky-50 text-sky-800"
          }`}
        >
          {instructor?.name ?? "Instructor"}
        </span>
      </div>
      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">{booking.parent_name}</p>
        <p>{booking.parent_email}</p>
        <p>{booking.parent_phone}</p>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const [bookings, swimmers, instructors, slots] = await Promise.all([
    getAdminBookings(),
    getAdminSwimmers(),
    getInstructors(),
    getAdminAvailabilitySlots(),
  ]);

  const now = new Date().getTime();
  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "confirmed" && bookingTime(booking).getTime() >= now,
  );
  const futureSlots = slots.filter((slot) => new Date(slot.starts_at).getTime() >= now);
  const availableSlots = futureSlots.filter((slot) => !slot.is_booked);
  const bookedSlots = futureSlots.filter((slot) => slot.is_booked);
  const recentBookings = [...bookings]
    .sort((a, b) => bookingTime(b).getTime() - bookingTime(a).getTime())
    .slice(0, 10);

  return (
    <PageSection>
      <div className="mb-8 rounded-lg bg-slate-950 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-sky-200">
              Admin dashboard
            </p>
            <h1 className="text-4xl font-black tracking-tight">Manage lessons.</h1>
            <p className="mt-4 max-w-2xl text-slate-200">
              Add availability, monitor bookings, and open private swimmer records
              without hunting through the database.
            </p>
          </div>
          <Link
            href="/book"
            className="rounded-lg bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-sky-50"
          >
            View public calendar
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Link
          href="/admin/availability"
          className="rounded-lg border border-sky-100 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50"
        >
          <p className="font-black text-slate-950">Manage availability</p>
          <p className="mt-1 text-sm text-slate-600">Add one-hour slots for either instructor.</p>
        </Link>
        <Link
          href="/admin/bookings"
          className="rounded-lg border border-sky-100 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50"
        >
          <p className="font-black text-slate-950">View all bookings</p>
          <p className="mt-1 text-sm text-slate-600">Scan parent contact details and comments.</p>
        </Link>
        <Link
          href="/admin/swimmers"
          className="rounded-lg border border-sky-100 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50"
        >
          <p className="font-black text-slate-950">Open swimmer database</p>
          <p className="mt-1 text-sm text-slate-600">Review history and private admin notes.</p>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-sky-100 bg-white p-4">
          <p className="text-3xl font-black text-slate-950">{upcomingBookings.length}</p>
          <p className="text-sm font-semibold text-slate-500">upcoming bookings</p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-white p-4">
          <p className="text-3xl font-black text-slate-950">{availableSlots.length}</p>
          <p className="text-sm font-semibold text-slate-500">available slots</p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-white p-4">
          <p className="text-3xl font-black text-slate-950">{bookedSlots.length}</p>
          <p className="text-sm font-semibold text-slate-500">booked slots</p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-white p-4">
          <p className="text-3xl font-black text-slate-950">{swimmers.length}</p>
          <p className="text-sm font-semibold text-slate-500">total swimmers</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="grid gap-6">
          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-950">Add availability</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose the instructor and start time. Each slot is one hour and
                belongs to only that instructor.
              </p>
            </div>
            <AddAvailabilityForm instructors={instructors} />
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-950">Swimmer database</h2>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                Private
              </span>
            </div>
            <div className="space-y-3">
              {swimmers.length ? (
                swimmers.slice(0, 8).map((swimmer) => (
                  <Link
                    key={swimmer.id}
                    href={`/admin/swimmers/${swimmer.id}`}
                    className="block rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950">{swimmer.swimmer_name}</p>
                        <p className="mt-1 text-sm text-slate-600">{swimmer.parent_name}</p>
                      </div>
                      <span className="text-sm font-bold text-sky-700">Open</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{swimmer.skill_level}</p>
                  </Link>
                ))
              ) : (
                <EmptyState title="No swimmers yet">
                  Swimmer records appear after parents book or save swimmer profiles.
                </EmptyState>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Recent bookings</h2>
              <p className="mt-1 text-sm text-slate-500">Latest confirmed lessons across both instructors.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              Showing {recentBookings.length}
            </span>
          </div>

          {recentBookings.length ? (
            <>
              <div className="space-y-3 md:hidden">
                {recentBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="py-3 pr-4">Time</th>
                      <th className="py-3 pr-4">Instructor</th>
                      <th className="py-3 pr-4">Swimmer</th>
                      <th className="py-3 pr-4">Parent</th>
                      <th className="py-3 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState title="No bookings yet">
              Bookings will appear here after parents submit the public booking form.
            </EmptyState>
          )}
        </Card>
      </div>
    </PageSection>
  );
}
