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

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const hasValidProtocol = parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
    const hasNoDashboardPath = parsedUrl.pathname === "" || parsedUrl.pathname === "/";

    if (!hasValidProtocol || !hasNoDashboardPath) {
      return null;
    }

    return {
      url: parsedUrl.origin,
      anonKey,
    };
  } catch {
    return null;
  }
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseConfig());
}
