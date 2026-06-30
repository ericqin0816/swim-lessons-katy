import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig, getSupabaseConfigDiagnostics } from "@/lib/config";
import type { Database } from "@/lib/types";

function getAuthErrorDetails(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};

  return {
    name: error instanceof Error ? error.name : typeof record.name === "string" ? record.name : undefined,
    message: error instanceof Error ? error.message : typeof record.message === "string" ? record.message : String(error),
    status: typeof record.status === "number" || typeof record.status === "string" ? record.status : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
  };
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") ?? "/account";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";
  const config = getSupabaseConfig();

  if (code && config) {
    const response = NextResponse.redirect(new URL(next, requestUrl.origin));

    const supabase = createServerClient<Database>(
      config.url,
      config.anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth] Failed to exchange Supabase auth code.", {
        error: getAuthErrorDetails(error),
        requestOrigin: requestUrl.origin,
        redirectTarget: next,
        supabase: getSupabaseConfigDiagnostics(),
      });
    }

    return response;
  }

  if (code && !config) {
    console.error("[auth] Supabase auth callback received a code but Supabase is not configured.", {
      requestOrigin: requestUrl.origin,
      supabase: getSupabaseConfigDiagnostics(),
    });
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
