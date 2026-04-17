"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/assistant") return null;

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8 px-6 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <span className="text-lg font-bold tracking-tight">WearWise</span>
            </div>
            <p className="text-[14px] text-white/60 leading-relaxed">
              Dress for the day, every day. AI-powered styling meets curated British fashion.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-[14px] uppercase tracking-wider text-white/90">Shop</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/browse" className="text-[14px] text-white/50 hover:text-primary transition-colors">Browse All</Link>
              <Link href="/browse?sort=newest" className="text-[14px] text-white/50 hover:text-primary transition-colors">New In</Link>
              <Link href="/assistant" className="text-[14px] text-white/50 hover:text-primary transition-colors">AI Stylist</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-[14px] uppercase tracking-wider text-white/90">Help</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="#" className="text-[14px] text-white/50 hover:text-primary transition-colors">FAQ</Link>
              <Link href="#" className="text-[14px] text-white/50 hover:text-primary transition-colors">Returns & Exchanges</Link>
              <Link href="#" className="text-[14px] text-white/50 hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-[14px] uppercase tracking-wider text-white/90">Account</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/login" className="text-[14px] text-white/50 hover:text-primary transition-colors">Sign In</Link>
              <Link href="/register" className="text-[14px] text-white/50 hover:text-primary transition-colors">Create Account</Link>
              <Link href="/orders" className="text-[14px] text-white/50 hover:text-primary transition-colors">My Orders</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[13px] text-white/40">&copy; {new Date().getFullYear()} WearWise. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[13px] text-white/40 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[13px] text-white/40 hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
