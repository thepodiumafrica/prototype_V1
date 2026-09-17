import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/cookie";

// Next.js 16 renamed Middleware to Proxy (same mechanism, new file name/
// export). This runs on every request to keep the Supabase auth session
// cookie fresh, so Server Components always see an up-to-date session.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not add logic between createServerClient and getUser(): calling
  // getUser() is what actually revalidates the token with Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Cross-device language restore: a signed-in visitor with no language
  // cookie on this browser yet (a new device, or their first visit after
  // clearing cookies) gets their saved profiles.preferred_language seeded
  // here as that cookie -- see LocaleProvider's toggleLocale() for the
  // write side. Only a Set-Cookie header on the *response*, deliberately:
  // this request itself still renders with the cookie-default language,
  // but every request after it (including client-side nav) is correct --
  // simpler and safer than trying to also rewrite the in-flight request,
  // which risks dropping the Supabase auth cookies set just above.
  if (user && !request.cookies.get(LOCALE_COOKIE)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user.id)
      .single();
    if (profile?.preferred_language) {
      response.cookies.set(LOCALE_COOKIE, profile.preferred_language, {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
