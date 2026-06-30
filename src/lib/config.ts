export const site = {
  name: "Swim Lessons Katy",
  location: "Katy, TX",
  lessonLength: "1 hour",
  price: 35,
  phone: "(832) 555-0147",
  email: "hello@swimlessonskaty.com",
};

export const skillLevels = [
  "New swimmer",
  "Beginner",
  "Intermediate",
  "Advanced stroke technique",
] as const;

export const studentCounts = [
  { value: "1", label: "1 student" },
  { value: "2", label: "2 students" },
  { value: "special_request", label: "Special request" },
] as const;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
