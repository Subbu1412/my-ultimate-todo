import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The metadata object handles all head tags automatically in Next.js
export const metadata: Metadata = {
  title: 'GoalGrid | Ultimate Task & Workspace Manager',
  description: 'Organize your life with GoalGrid. Manage tasks in List, Board, and Calendar views with real-time sync.',
  keywords: 'GoalGrid, task manager, to-do list, project management, productivity',
  verification: {
    // Moved your verification code here
    google: "rg9IF7GwwTi22l825gJ78NcrH_MzeIdQpiZOWK7E5YI",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
