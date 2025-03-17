import type { Metadata } from "next";
import { Tomorrow } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const tomorrow = Tomorrow({
  variable: "--font-tomorrow",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SK-Fomalhout-001 | SiKepin",
  description: "Experimental Project with codename SK-Fomalhout-001 by SiKepin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${tomorrow.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
