import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { cookies } from "next/headers";
import { KenteStrip } from "@/components/KenteStrip";
import { SiteNav } from "@/components/SiteNav";
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

export const metadata: Metadata = {
  title: "The Podium — coming soon",
  description: "Voices of the continent and the diaspora.",
};

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

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <KenteStrip />
        <SiteNav />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
