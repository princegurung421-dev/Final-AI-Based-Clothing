import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utility to intelligently merge tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Price helpers ───────────────────────────────────────────
// salePrice, when present, is ALWAYS less than price and is what the
// customer actually pays. The original price is shown struck-through
// beside the sale price everywhere the product is displayed.

export function effectivePrice(p: { price: any; salePrice?: any | null }): number {
  const sale = p.salePrice == null ? NaN : Number(p.salePrice)
  const reg = Number(p.price)
  return Number.isFinite(sale) && sale > 0 ? sale : reg
}

export function hasSale(p: { price: any; salePrice?: any | null }): boolean {
  const sale = p.salePrice == null ? NaN : Number(p.salePrice)
  const reg = Number(p.price)
  return Number.isFinite(sale) && sale > 0 && sale < reg
}

export function formatPrice(n: number): string {
  return `£${n.toFixed(2)}`
}
