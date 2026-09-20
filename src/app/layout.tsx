import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CaseLine — Delhi Police Case Intelligence",
  description: "Simulated Delhi Police case-management and investigation intelligence platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}
      >
        {/*
          THESIS: A government system of record earns trust through institutional
          gravity, not startup polish — replaces stone/amber SaaS neutrals.
          OWN-WORLD: UIDAI/Aadhaar civic identity — deep navy ink, lavender-tinted
          surfaces, saffron/green tricolor accent hairline, serif display (Lora)
          over sans body (Geist), pill nav and CTAs, rounded institutional cards.
          STORY: an officer opens the shell and reads it as an official system of
          record before reading a single number.
          FIRST VIEWPORT: navy+tricolor sidebar brand mark, lavender active-nav
          pills, dashboard header in serif display, KPI cards on lavender-tinted
          ground.
          FORM: brief-pinned direction (uidai.gov.in), no concept roll — user
          named the reference explicitly.
          FINISH: unreviewed and undocumented is unfinished; this build ends
          with the finish review, the verdict, DESIGN.md, and every shipping
          raster carrying its provenance.
        */}
        {children}
      </body>
    </html>
  );
}
