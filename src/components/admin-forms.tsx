"use client";

import { useActionState } from "react";
import {
  addAvailability,
  addLessonNote,
  bulkAddAvailability,
  deleteAvailabilitySlot,
  markAvailabilityUnavailable,
  type AdminState,
} from "@/app/actions/admin";
import { StatusMessage } from "@/components/section";
import type { BookingWithDetails, Instructor } from "@/lib/types";

const initialState: AdminState = { ok: false, message: "" };
const bulkTimes = ["08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00"];

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
        Date
        <input
          name="startsAtDate"
          type="date"
          required
          className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Start time in Katy local time
        <input
          name="startsAtTime"
          type="time"
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

export function BulkAvailabilityForm({ instructors }: { instructors: Instructor[] }) {
  const [state, action, pending] = useActionState(bulkAddAvailability, initialState);
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
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          Start date
          <input
            name="startDate"
            type="date"
            required
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          End date
          <input
            name="endDate"
            type="date"
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
      </div>
      <fieldset className="rounded-lg border border-slate-200 p-3">
        <legend className="px-1 text-sm font-semibold text-slate-700">Times</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {bulkTimes.map((time) => (
            <label
              key={time}
              className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <input name="times" type="checkbox" value={time} className="size-4 accent-sky-600" />
              {formatTimeLabel(time)}
            </label>
          ))}
        </div>
      </fieldset>
      {state.message ? (
        <StatusMessage ok={state.ok}>
          {state.message}
        </StatusMessage>
      ) : null}
      <button
        disabled={pending || !hasInstructors}
        className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {pending ? "Adding..." : "Bulk add slots"}
      </button>
    </form>
  );
}

export function AvailabilitySlotActions({
  slotId,
  canDelete,
  canMarkUnavailable,
}: {
  slotId: string;
  canDelete: boolean;
  canMarkUnavailable: boolean;
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAvailabilitySlot, initialState);
  const [unavailableState, unavailableAction, unavailablePending] = useActionState(
    markAvailabilityUnavailable,
    initialState,
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <form
          action={unavailableAction}
          onSubmit={(event) => {
            if (!window.confirm("Mark this open slot unavailable? Parents will no longer be able to book it.")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="slotId" value={slotId} />
          <button
            type="submit"
            disabled={!canMarkUnavailable || unavailablePending}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:w-auto"
          >
            {unavailablePending ? "Updating..." : "Mark unavailable"}
          </button>
        </form>
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm("Delete this open availability slot?")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="slotId" value={slotId} />
          <button
            type="submit"
            disabled={!canDelete || deletePending}
            className="w-full rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:w-auto"
          >
            {deletePending ? "Deleting..." : "Delete"}
          </button>
        </form>
      </div>
      {!canDelete && !canMarkUnavailable ? (
        <p className="text-xs font-semibold text-slate-500">
          Booked slots cannot be deleted or marked unavailable here.
        </p>
      ) : null}
      {unavailableState.message ? (
        <StatusMessage ok={unavailableState.ok}>{unavailableState.message}</StatusMessage>
      ) : null}
      {deleteState.message ? (
        <StatusMessage ok={deleteState.ok}>{deleteState.message}</StatusMessage>
      ) : null}
    </div>
  );
}

function formatTimeLabel(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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
