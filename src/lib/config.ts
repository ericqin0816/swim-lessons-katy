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

export function getSupabaseConfigDiagnostics() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  let parsedUrl: URL | null = null;
  let urlError: string | null = null;

  if (rawUrl) {
    try {
      parsedUrl = new URL(rawUrl);
    } catch (error) {
      urlError = error instanceof Error ? error.message : "Invalid URL";
    }
  }

  return {
    hasUrl: Boolean(rawUrl),
    hasAnonKey: Boolean(anonKey),
    urlOrigin: parsedUrl?.origin ?? null,
    urlHost: parsedUrl?.host ?? null,
    urlProtocol: parsedUrl?.protocol ?? null,
    urlPathname: parsedUrl?.pathname ?? null,
    urlHasPath: parsedUrl ? parsedUrl.pathname !== "" && parsedUrl.pathname !== "/" : null,
    urlError,
    anonKeyType: getAnonKeyType(anonKey),
    anonKeyLength: anonKey?.length ?? 0,
    isConfigured: Boolean(getSupabaseConfig()),
  };
}

function getAnonKeyType(anonKey: string | undefined) {
  if (!anonKey) {
    return "missing";
  }

  if (anonKey.startsWith("sb_publishable_")) {
    return "publishable";
  }

  if (anonKey.startsWith("eyJ")) {
    return "legacy-jwt";
  }

  return "unknown";
}
