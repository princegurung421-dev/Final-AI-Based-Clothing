import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { PWAInstall } from "@/components/PWAInstall";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WearWise | AI-Powered Personal Stylist",
  description:
    "Your personal AI stylist. Shop and get outfit recommendations through conversation.",
  applicationName: "WearWise",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WearWise",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#4A7C59",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const cartCount = session?.user?.id
    ? (await prisma.cartItem.aggregate({
        where: { userId: session.user.id },
        _sum: { quantity: true },
      }))._sum.quantity || 0
    : 0;

  return (
    <html lang="en" className={`${jakarta.variable} antialiased h-full`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <LayoutWrapper
        header={<Header user={session?.user as any} cartCount={cartCount} />}
        footer={<Footer />}
      >
        <ToastProvider>
          {children}
          <PWAInstall />
        </ToastProvider>
      </LayoutWrapper>
    </html>
  );
}
