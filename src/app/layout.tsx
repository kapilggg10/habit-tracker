import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your daily habits and build consistency",
  manifest: "/manifest.json",
  themeColor: "#171717",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habit Tracker",
  },
  openGraph: {
    title: "Habit Tracker",
    description: "Track your daily habits and build consistency",
    url: "https://ifennztracker.netlify.app/",
    siteName: "Habit Tracker",
    images: [
      {
        url: "https://ifennztracker.netlify.app/icon-512.png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 antialiased dark:from-gray-900 dark:via-gray-900 dark:to-gray-800`}
      >
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
