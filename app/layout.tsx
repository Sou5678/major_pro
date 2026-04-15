import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";

import { Providers } from "@/components/shared/providers";
import "@/app/globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "ResumeIQ | AI Resume Analyzer",
    template: "%s | ResumeIQ",
  },
  description:
    "AI-powered resume analysis that surfaces gaps, missing keywords, formatting issues, and actionable fixes in seconds.",
  openGraph: {
    title: "ResumeIQ",
    description:
      "AI-powered resume analysis that surfaces gaps, missing keywords, formatting issues, and actionable fixes in seconds.",
    url: "/",
    siteName: "ResumeIQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeIQ",
    description:
      "AI-powered resume analysis that surfaces gaps, missing keywords, formatting issues, and actionable fixes in seconds.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
