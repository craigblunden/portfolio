import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/common/AppProviders";
// import { AppSidebar } from "@/components/common/AppSidebar";
import { EditorTabsNav } from "@/components/common/EditorTabsNav";
import { StatusBar } from "@/components/common/StatusBar";
import { cn } from "@/lib/utils";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Makes canonical and OpenGraph URLs absolute. Without it they are relative and
  // largely useless to crawlers and link unfurlers.
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="h-full font-sans">
        {/*
          min-h-dvh rather than min-h-screen so the bar lands on the real viewport
          bottom on mobile, where the browser chrome makes 100vh taller than what is
          actually visible. `flex-1` on main takes up the slack, which puts the status
          bar at the bottom of the screen on short pages and after the content on
          long ones.
        */}
        <div className="flex min-h-dvh flex-col bg-background text-foreground">
          {/* <AppSidebar /> */}
          <EditorTabsNav />

          <main className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
            <AppProviders>{children}</AppProviders>
          </main>

          <StatusBar />
        </div>
      </body>
    </html>
  );
}
