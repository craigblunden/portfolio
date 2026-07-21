import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/common/AppProviders";
// import { AppSidebar } from "@/components/common/AppSidebar";
import { EditorTabsNav } from "@/components/common/EditorTabsNav";
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
      <body className="h-full font-sans">
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          {/* <AppSidebar /> */}
          <EditorTabsNav />

          <main className="min-w-0 flex-1 bg-background text-foreground">
            <AppProviders>{children}</AppProviders>
          </main>
        </div>
      </body>
    </html>
  );
}
