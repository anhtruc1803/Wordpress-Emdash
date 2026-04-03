import type { Metadata } from "next";
import { cookies } from "next/headers";
import { JetBrains_Mono, Manrope } from "next/font/google";

import "./globals.css";

import { QueryProvider } from "@/components/layout/query-provider";
import { DEFAULT_LOCALE, LOCALE_COOKIE_KEY, normalizeLocale } from "@/lib/i18n/ui";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "WordPress to EmDash Migration Console",
  description: "Không gian làm việc để audit, chuyển đổi và lập kế hoạch migration từ WordPress sang EmDash."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value ?? DEFAULT_LOCALE);

  return (
    <html lang={initialLocale}>
      <body className={`${manrope.variable} ${jetbrainsMono.variable}`}>
        <QueryProvider initialLocale={initialLocale}>{children}</QueryProvider>
      </body>
    </html>
  );
}
