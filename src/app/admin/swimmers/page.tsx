import Link from "next/link";
import { Card, EmptyState, Eyebrow, PageSection } from "@/components/section";
import { getAdminSwimmersWithDetails } from "@/lib/data";
import type { BookingWithDetails, SwimmerWithBookings } from "@/lib/types";

function bookingTime(booking: BookingWithDetails) {
  return new Date(booking.availability_slots?.starts_at ?? booking.created_at);
}

function formatLesson(booking: BookingWithDetails | undefined) {
  if (!booking) {
    return "None yet";
  }

  const instructor = booking.availability_slots?.instructors?.name ?? "Instructor";
  return `${bookingTime(booking).toLocaleString()} with ${instructor}`;
}

function swimmerStats(swimmer: SwimmerWithBookings) {
  const now = new Date().getTime();
  const confirmedBookings = [...(swimmer.bookings ?? [])].filter(
    (booking) => booking.status === "confirmed",
  );
  const upcoming = confirmedBookings
    .filter((booking) => bookingTime(booking).getTime() >= now)
    .sort((a, b) => bookingTime(a).getTime() - bookingTime(b).getTime());
  const past = confirmedBookings
    .filter((booking) => bookingTime(booking).getTime() < now)
    .sort((a, b) => bookingTime(b).getTime() - bookingTime(a).getTime());
  const lessonNotes = swimmer.lesson_notes ?? [];
  const latestLessonNote = [...lessonNotes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  return {
    totalLessons: confirmedBookings.length,
    nextLesson: upcoming[0],
    recentLesson: past[0],
    noteCount: lessonNotes.length + (swimmer.admin_notes ? 1 : 0),
    latestNote: latestLessonNote?.note ?? swimmer.admin_notes,
  };
}

export default async function AdminSwimmersPage() {
  const swimmers = await getAdminSwimmersWithDetails();

  return (
    <PageSection>
      <div className="mb-8">
        <Eyebrow>Admin swimmers</Eyebrow>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">
          Private swimmer database.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Open a swimmer record to view lesson history, parent contact information,
          total lessons, and private admin notes. This page is only available to admin users.
        </p>
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">All swimmers</h2>
            <p className="mt-1 text-sm text-slate-600">
              Parent users cannot access this database or admin notes.
            </p>
          </div>
          <span className="w-fit rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
            {swimmers.length}
          </span>
        </div>
        <div className="grid gap-4">
          {swimmers.length ? (
            swimmers.map((swimmer) => {
              const stats = swimmerStats(swimmer);

              return (
                <Link
                  key={swimmer.id}
                  href={`/admin/swimmers/${swimmer.id}`}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-slate-950">{swimmer.swimmer_name}</p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                          Age {swimmer.swimmer_age ?? "not set"}
                        </span>
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                          {swimmer.skill_level}
                        </span>
                      </div>
                      <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                        <p className="font-black text-slate-950">{swimmer.parent_name}</p>
                        <p>{swimmer.parent_email}</p>
                        <p>{swimmer.parent_phone}</p>
                      </div>
                    </div>
                    <span className="w-fit rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">
                      Open record
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Total lessons
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-950">{stats.totalLessons}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Next lesson
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {formatLesson(stats.nextLesson)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Recent lesson
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {formatLesson(stats.recentLesson)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
                        Private admin notes
                      </span>
                      <span className="text-xs font-bold text-amber-900">
                        {stats.noteCount} note{stats.noteCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-amber-950">
                      {stats.latestNote ?? "No private notes yet."}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <EmptyState title="No swimmers yet">
              Swimmer records are created when parents book a lesson or save a swimmer profile.
            </EmptyState>
          )}
        </div>
      </Card>
    </PageSection>
  );
}
