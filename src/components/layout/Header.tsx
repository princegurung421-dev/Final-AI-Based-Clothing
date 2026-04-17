"use client";

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingBag, Menu, X, User, LogOut, MessageSquare, Search, ChevronDown, Settings, Package, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/login/actions"

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
  cartCount?: number;
}

export function Header({ user, cartCount = 0 }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [currentCartCount, setCurrentCartCount] = React.useState(cartCount);
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [profileOpen, setProfileOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Shop" },
    { href: "/assistant", label: "AI Stylist", featured: true },
  ];

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    setCurrentCartCount(cartCount);
  }, [cartCount]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close profile dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileOpen]);

  React.useEffect(() => {
    const refreshCartCount = async () => {
      try {
        const response = await fetch("/api/cart/count", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        setCurrentCartCount(Number(data.count) || 0);
      } catch { }
    };
    const handleCartUpdated = () => refreshCartCount();
    window.addEventListener("cart:updated", handleCartUpdated);
    refreshCartCount();
    return () => window.removeEventListener("cart:updated", handleCartUpdated);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/assistant?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : null;

  return (
    <>
      <header className={cn(
        "sticky top-0 w-full shrink-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
          : "bg-white"
      )}>
        {/* Top bar - only shows when not scrolled */}
        {!scrolled && (
          <div className="hidden md:block bg-foreground text-white text-center text-[12px] py-1.5 font-medium tracking-wide">
            Free delivery on orders over {"\u00A3"}50 &mdash; AI-powered styling, just for you
          </div>
        )}

        <div className={cn(
          "flex items-center px-5 md:px-8 border-b border-border/40",
          scrolled ? "h-[60px]" : "h-16"
        )}>
          {/* Mobile: hamburger */}
          <button className="lg:hidden mr-3 p-1" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mr-10 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <span className="text-white text-[13px] font-bold tracking-tight">W</span>
            </div>
            <span className="text-[17px] font-bold tracking-tight text-foreground">WearWise</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-[14px] font-medium transition-colors rounded-lg",
                    isActive
                      ? "text-primary"
                      : link.featured
                        ? "text-primary/80 hover:text-primary hover:bg-primary/[0.04]"
                        : "text-foreground/70 hover:text-foreground hover:bg-zinc-50"
                  )}
                >
                  {link.featured && <MessageSquare className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={cn(
                  "relative px-4 py-2 text-[14px] font-medium transition-colors rounded-lg",
                  pathname.startsWith("/admin")
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-zinc-50"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                Admin
                {pathname.startsWith("/admin") && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center animate-fade-in">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, styles..."
                    className="w-[180px] md:w-[280px] h-9 pl-9 pr-8 text-[13px] rounded-full border border-border bg-zinc-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } }}
                  />
                  <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-foreground/60 hover:text-foreground hover:bg-zinc-50 transition-colors"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>
            )}

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-border/60 mx-1.5" />

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-foreground/60 hover:text-foreground hover:bg-zinc-50 transition-colors"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {currentCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm">
                  {currentCartCount}
                </span>
              )}
            </Link>

            {/* Desktop: User area */}
            <div className="hidden md:flex items-center ml-1.5">
              {user ? (
                /* Logged in: Profile dropdown */
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={cn(
                      "flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full transition-colors",
                      profileOpen ? "bg-zinc-100" : "hover:bg-zinc-50"
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                      {userInitial || <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-[13px] font-medium text-foreground max-w-[80px] truncate hidden lg:block">
                      {user.name?.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted transition-transform hidden lg:block", profileOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-[260px] bg-white rounded-xl border border-border/60 shadow-xl shadow-black/8 py-1.5 animate-fade-in z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-border/40">
                        <p className="text-[14px] font-semibold text-foreground truncate">{user.name || "Account"}</p>
                        <p className="text-[12px] text-muted truncate">{user.email}</p>
                      </div>

                      {/* Links */}
                      <div className="py-1.5">
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-foreground/80 hover:bg-zinc-50 hover:text-foreground transition-colors">
                          <User className="w-4 h-4 text-muted" />
                          My Profile
                        </Link>
                        <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-foreground/80 hover:bg-zinc-50 hover:text-foreground transition-colors">
                          <Package className="w-4 h-4 text-muted" />
                          My Orders
                        </Link>
                        {user.role === "ADMIN" && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-foreground/80 hover:bg-zinc-50 hover:text-foreground transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-muted" />
                            Admin Panel
                          </Link>
                        )}
                        <Link href="/cart" className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-foreground/80 hover:bg-zinc-50 hover:text-foreground transition-colors">
                          <ShoppingBag className="w-4 h-4 text-muted" />
                          Shopping Bag
                          {currentCartCount > 0 && (
                            <span className="ml-auto text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{currentCartCount}</span>
                          )}
                        </Link>
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-border/40 pt-1.5">
                        <form action={logout}>
                          <button type="submit" className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Not logged in: Sign in + Register */
                <div className="flex items-center gap-2 ml-1">
                  <Link
                    href="/login"
                    className="text-[13px] font-medium text-foreground/70 hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="text-[13px] font-semibold text-white bg-primary px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: show sign-in or avatar */}
            <div className="flex md:hidden items-center ml-1">
              {user ? (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-bold"
                >
                  {userInitial || <User className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <Link href="/login" className="text-[12px] font-semibold text-white bg-primary px-3 py-1.5 rounded-full">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Drawer ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">W</span>
                </div>
                <span className="text-[16px] font-bold tracking-tight">WearWise</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            {/* User section (top of drawer if logged in) */}
            {user && (
              <div className="px-5 py-4 bg-zinc-50/50 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-[14px] font-bold shrink-0">
                    {userInitial || <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold truncate">{user.name || "Account"}</p>
                    <p className="text-[12px] text-muted truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="px-5 py-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, styles..."
                  className="w-full h-10 pl-10 pr-4 text-[14px] rounded-xl border border-border bg-zinc-50 focus:bg-white focus:border-primary outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Main nav */}
            <nav className="px-3 flex flex-col gap-0.5">
              <p className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wider font-semibold text-muted/60">Menu</p>
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors",
                      isActive ? "text-primary bg-primary/[0.06]" : "text-foreground hover:bg-zinc-50"
                    )}
                  >
                    {link.featured && <MessageSquare className="w-4 h-4" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Account nav */}
            {user && (
              <nav className="px-3 mt-4 flex flex-col gap-0.5">
                <p className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wider font-semibold text-muted/60">Account</p>
                <Link href="/profile" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors", pathname === "/profile" ? "text-primary bg-primary/[0.06]" : "text-foreground hover:bg-zinc-50")}>
                  <User className="w-4 h-4 text-muted" />
                  Profile
                </Link>
                <Link href="/orders" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors", pathname === "/orders" ? "text-primary bg-primary/[0.06]" : "text-foreground hover:bg-zinc-50")}>
                  <Package className="w-4 h-4 text-muted" />
                  Orders
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors", pathname.startsWith("/admin") ? "text-primary bg-primary/[0.06]" : "text-foreground hover:bg-zinc-50")}>
                    <LayoutDashboard className="w-4 h-4 text-muted" />
                    Admin Panel
                  </Link>
                )}
                <Link href="/cart" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors", pathname === "/cart" ? "text-primary bg-primary/[0.06]" : "text-foreground hover:bg-zinc-50")}>
                  <ShoppingBag className="w-4 h-4 text-muted" />
                  Bag
                  {currentCartCount > 0 && (
                    <span className="ml-auto text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{currentCartCount}</span>
                  )}
                </Link>
              </nav>
            )}

            {/* Bottom section */}
            <div className="mt-auto px-5 py-5 border-t border-border/40">
              {user ? (
                <form action={logout}>
                  <button type="submit" className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link href="/login" className="block text-center text-[14px] font-semibold bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register" className="block text-center text-[14px] font-medium text-foreground border border-border py-3 rounded-xl hover:bg-zinc-50 transition-colors">
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
