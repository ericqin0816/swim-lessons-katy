import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/config";
import type { Database } from "@/lib/types";

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
        message: error.message,
        name: error.name,
        status: "status" in error ? error.status : undefined,
      });
    }

    return response;
  }

  if (code && !config) {
    console.error("[auth] Supabase auth callback received a code but Supabase is not configured.");
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
