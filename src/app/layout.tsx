import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope'
}) 

export const metadata: Metadata = {
  title: "VIBEE",
  description: "The best social media for Gen-Z",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${manrope.variable} antialiased`} suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Toaster position="top-center"/>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
