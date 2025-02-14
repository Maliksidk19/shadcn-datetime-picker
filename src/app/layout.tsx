import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shadcn Datetime Picker",
  description:
    "Shadcn Datetime Picker is a simple and easy-to-use datetime picker component for React. It is built with Tailwind CSS and Shadcn UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "flex")}>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 h-full">
            <SidebarTrigger />
            {children}
            <Toaster
              richColors
              icons={{
                success: "🎉",
                error: "🚨",
                warning: "⚠️",
              }}
            />
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
