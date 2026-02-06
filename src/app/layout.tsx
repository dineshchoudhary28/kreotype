import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { FocusModeWrapper } from "@/components/layout/FocusModeWrapper";

const inter = Inter({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-secondary",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Kreotype — Minimalist Typing Test",
  description: "A minimalist, open-source typing test. Track your speed, accuracy, and consistency.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Kreotype — Minimalist Typing Test",
    description: "A minimalist, open-source typing test. Track your speed, accuracy, and consistency.",
    images: [{ url: "/images/og-image.svg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kreotype — Minimalist Typing Test",
    description: "A minimalist, open-source typing test.",
    images: ["/images/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <ThemeProvider>
            <FocusModeWrapper>
              <AnnouncementBanner />
              <Header />
              <main className="flex-1 flex flex-col w-full">
                {children}
              </main>
              <Footer />
            </FocusModeWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
