import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { cookies } from "next/headers";
import { KenteStrip } from "@/components/KenteStrip";
import { SiteNav } from "@/components/SiteNav";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getLocale } from "@/lib/i18n/locale";
import { LOCALE_COOKIE } from "@/lib/i18n/cookie";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "fr"
    ? {
        title: "The Podium — bientôt disponible",
        description: "Les voix du continent et de la diaspora.",
      }
    : {
        title: "The Podium — coming soon",
        description: "Voices of the continent and the diaspora.",
      };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the theme cookie server-side (see <ThemeToggle>) so the initial
  // HTML already has the right data-theme -- no flash, no hydration
  // mismatch, matches ThePodium_v5.html's default of "light".
  const cookieStore = await cookies();
  const theme = cookieStore.get("thepodium_theme")?.value === "dark" ? "dark" : "light";
  const locale = cookieStore.get(LOCALE_COOKIE)?.value === "fr" ? "fr" : "en";

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale}>
          <KenteStrip />
          <SiteNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </LocaleProvider>
      </body>
    </html>
  );
}
