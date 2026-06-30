"use client";

import { useActionState } from "react";
import { addAvailability, addLessonNote, type AdminState } from "@/app/actions/admin";
import { StatusMessage } from "@/components/section";
import type { BookingWithDetails, Instructor } from "@/lib/types";

const initialState: AdminState = { ok: false, message: "" };

export function AddAvailabilityForm({ instructors }: { instructors: Instructor[] }) {
  const [state, action, pending] = useActionState(addAvailability, initialState);
  const hasInstructors = instructors.length > 0;

  return (
    <form action={action} className="grid gap-4">
      <label className="block text-sm font-semibold text-slate-700">
        Instructor
        <select
          name="instructorId"
          required
          disabled={!hasInstructors}
          className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:bg-slate-100"
        >
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Start time in Katy local time
        <input
          name="startsAtLocal"
          type="datetime-local"
          required
          className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </label>
      {!hasInstructors ? (
        <StatusMessage ok={false}>
          No active instructors are available. Add instructors in Supabase before creating slots.
        </StatusMessage>
      ) : null}
      {state.message ? (
        <StatusMessage ok={state.ok}>
          {state.message}
        </StatusMessage>
      ) : null}
      <button
        disabled={pending || !hasInstructors}
        className="rounded-lg bg-sky-600 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {pending ? "Adding..." : "Add availability"}
      </button>
    </form>
  );
}

export function LessonNoteForm({
  bookings,
  swimmerId,
}: {
  bookings: BookingWithDetails[];
  swimmerId: string;
}) {
  const [state, action, pending] = useActionState(addLessonNote, initialState);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="swimmerId" value={swimmerId} />
      <label className="block text-sm font-semibold text-slate-700">
        Booking
        <select
          name="bookingId"
          required
          disabled={!bookings.length}
          className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:bg-slate-100"
        >
          {bookings.map((booking) => (
            <option key={booking.id} value={booking.id}>
              {new Date(booking.availability_slots?.starts_at ?? booking.created_at).toLocaleString()} -
              {" "}
              {booking.availability_slots?.instructors?.name ?? "Instructor"}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Private note
        <textarea
          name="note"
          rows={5}
          required
          className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Progress, goals for next time, comfort level, or admin-only follow-up."
        />
      </label>
      {!bookings.length ? (
        <StatusMessage ok={false}>
          This swimmer does not have a booking yet, so notes can be added after a lesson is scheduled.
        </StatusMessage>
      ) : null}
      {state.message ? (
        <StatusMessage ok={state.ok}>
          {state.message}
        </StatusMessage>
      ) : null}
      <button
        disabled={pending || !bookings.length}
        className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {pending ? "Saving..." : "Save private note"}
      </button>
    </form>
  );
}
