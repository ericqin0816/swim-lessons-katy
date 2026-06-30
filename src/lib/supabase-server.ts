import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig, getSupabaseConfigDiagnostics } from "@/lib/config";
import type { Database } from "@/lib/types";

type SupabaseServerClientOptions = {
  cookieWriteContext?: string;
  logCookieWrites?: boolean;
  throwOnCookieWriteError?: boolean;
};

function getErrorDetails(error: unknown) {
  const record = error && typeof error === "object" ? (error as Record<string, unknown>) : {};

  return {
    name: error instanceof Error ? error.name : typeof record.name === "string" ? record.name : undefined,
    message: error instanceof Error ? error.message : typeof record.message === "string" ? record.message : String(error),
    status: typeof record.status === "number" || typeof record.status === "string" ? record.status : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
  };
}

export async function createSupabaseServerClient(options: SupabaseServerClientOptions = {}) {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, responseHeaders) {
          try {
            if (options.logCookieWrites) {
              console.info("[auth] Writing Supabase auth cookies.", {
                context: options.cookieWriteContext ?? "unspecified",
                cookieCount: cookiesToSet.length,
                cookieNames: cookiesToSet.map((cookie) => cookie.name),
                responseHeaderKeys: responseHeaders ? Object.keys(responseHeaders) : [],
              });
            }

            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            if (options.throwOnCookieWriteError || options.cookieWriteContext) {
              console.error("[auth] Failed to write Supabase auth cookies.", {
                context: options.cookieWriteContext ?? "unspecified",
                cookieCount: cookiesToSet.length,
                cookieNames: cookiesToSet.map((cookie) => cookie.name),
                error: getErrorDetails(error),
                supabase: getSupabaseConfigDiagnostics(),
              });
            }

            if (options.throwOnCookieWriteError) {
              throw error;
            }

            // Server Components can read cookies but cannot always set them.
          }
        },
      },
    },
  );
}
