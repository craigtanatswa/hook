import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

async function checkMaintenance(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return false;

    const res = await fetch(
      `${url}/rest/v1/site_settings?id=eq.1&select=maintenance`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return false;
    const rows = await res.json();
    return Boolean(rows?.[0]?.maintenance);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isOfflinePage = pathname === "/offline";

  // --- Admin auth ---
  if (isAdminRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!isLoginPage && !user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isLoginPage && user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return supabaseResponse;
  }

  // --- Maintenance mode for public routes ---
  const maintenance = await checkMaintenance();

  if (maintenance && !isOfflinePage) {
    return NextResponse.redirect(new URL("/offline", request.url));
  }

  if (!maintenance && isOfflinePage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
  ],
};
