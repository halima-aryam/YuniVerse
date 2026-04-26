import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FloatingSparks } from "@/components/FloatingSparks";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "yuniverse | Your Personal Curriculum",
  description: "Design a learning path on any topic you love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Elsie:wght@400;900&family=Nunito:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <FloatingSparks />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
