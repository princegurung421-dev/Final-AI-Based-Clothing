"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LayoutWrapper({ 
  children,
  header,
  footer
}: { 
  children: React.ReactNode,
  header: React.ReactNode,
  footer: React.ReactNode
}) {
  const pathname = usePathname();
  const isAssistant = pathname === "/assistant";

  return (
    <body className={cn(
      "flex flex-col bg-background text-foreground transition-colors duration-300",
      isAssistant ? "h-screen overflow-hidden" : "min-h-screen"
    )}>
      {header}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      {footer}
    </body>
  );
}
