import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonNoteForm } from "@/components/admin-forms";
import { Card, EmptyState, Eyebrow, PageSection } from "@/components/section";
import { getAdminSwimmer } from "@/lib/data";

export default async function AdminSwimmerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const swimmer = await getAdminSwimmer(id);

  if (!swimmer) {
    notFound();
  }

  const bookings = [...(swimmer.bookings ?? [])].sort(
    (a, b) =>
      new Date(b.availability_slots?.starts_at ?? b.created_at).getTime() -
      new Date(a.availability_slots?.starts_at ?? a.created_at).getTime(),
  );
  const totalLessons = bookings.filter((booking) => booking.status === "confirmed").length;
  const privateNotes = swimmer.lesson_notes ?? [];

  return (
    <PageSection>
      <Link href="/admin/swimmers" className="text-sm font-bold text-sky-700 hover:text-sky-900">
        Back to swimmer database
      </Link>
      <div className="mt-6 mb-10">
        <Eyebrow>Private swimmer record</Eyebrow>
        <h1 className="text-4xl font-black tracking-tight text-slate-950">{swimmer.swimmer_name}</h1>
        <p className="mt-4 text-slate-600">
          Lesson history, parent contact info, total lessons, and admin-only notes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-6">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-950">Parent contact</h2>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
                Admin only
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Parent:</span> {swimmer.parent_name}</p>
              <p><span className="font-semibold text-slate-900">Email:</span> {swimmer.parent_email}</p>
              <p><span className="font-semibold text-slate-900">Phone:</span> {swimmer.parent_phone}</p>
              <p><span className="font-semibold text-slate-900">Age:</span> {swimmer.swimmer_age ?? "Not set"}</p>
              <p><span className="font-semibold text-slate-900">Skill:</span> {swimmer.skill_level}</p>
              <p><span className="font-semibold text-slate-900">Total lessons:</span> {totalLessons}</p>
            </div>
            {swimmer.comments ? (
              <p className="mt-4 rounded-lg bg-sky-50 p-4 text-sm text-slate-700">{swimmer.comments}</p>
            ) : null}
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">Add private note</h2>
            <p className="mt-2 text-sm text-slate-500">Parents cannot see lesson notes or admin notes.</p>
            <div className="mt-5">
              <LessonNoteForm bookings={swimmer.bookings ?? []} swimmerId={swimmer.id} />
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">Lesson history</h2>
            <div className="mt-4 space-y-3">
              {bookings.length ? (
                bookings.map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950">
                          {new Date(booking.availability_slots?.starts_at ?? booking.created_at).toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.availability_slots?.instructors?.name ?? "Instructor"} - {booking.skill_level}
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {booking.status}
                      </span>
                    </div>
                    {booking.comments ? <p className="mt-2 text-sm text-slate-500">{booking.comments}</p> : null}
                  </div>
                ))
              ) : (
                <EmptyState title="No lessons booked yet">
                  This swimmer will show lesson history after a parent books a slot.
                </EmptyState>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-950">Admin-only notes</h2>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
                Private
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {swimmer.admin_notes ? (
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm leading-6 text-amber-950">{swimmer.admin_notes}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-wider text-amber-900">
                    Swimmer record admin note
                  </p>
                </div>
              ) : null}
              {privateNotes.length ? (
                privateNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-slate-100 bg-amber-50 p-4">
                    <p className="text-sm text-slate-700">{note.note}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {new Date(note.created_at).toLocaleString()} {note.instructors?.name ? `- ${note.instructors.name}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                !swimmer.admin_notes ? (
                  <EmptyState title="No private notes yet">
                    Add notes here after a lesson or when there is admin-only context to remember.
                  </EmptyState>
                ) : null
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageSection>
  );
}
