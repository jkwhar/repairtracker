import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Repair Tracker",
  description: "Chromebook repair tracking for technicians",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased bg-gray-50 text-gray-900`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
