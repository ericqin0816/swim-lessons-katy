import type { BookingSlot, Instructor } from "@/lib/types";

export const demoInstructors: Instructor[] = [
  {
    id: "demo-eric",
    name: "Eric",
    color: "blue",
    active: true,
    bio: "Calm, technical coaching for first-time swimmers through stroke refinement.",
  },
  {
    id: "demo-instructor-2",
    name: "Instructor 2",
    color: "green",
    active: true,
    bio: "Encouraging private lessons for confidence, safety, and steady progress.",
  },
];

export function getDemoSlots(): BookingSlot[] {
  const today = new Date();
  const start = new Date(today);
  start.setHours(9, 0, 0, 0);

  return Array.from({ length: 7 }).flatMap((_, dayIndex) => {
    const day = new Date(start);
    day.setDate(start.getDate() + dayIndex);

    return [9, 10, 16, 17].flatMap((hour) => {
      const startsAt = new Date(day);
      startsAt.setHours(hour, 0, 0, 0);

      return demoInstructors.map((instructor) => ({
        id: `${instructor.id}-${dayIndex}-${hour}`,
        starts_at: startsAt.toISOString(),
        instructor_id: instructor.id,
        is_booked: dayIndex === 1 && hour === 10 && instructor.name === "Eric",
        instructors: instructor,
      }));
    });
  });
}
