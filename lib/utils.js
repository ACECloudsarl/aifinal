// lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single className string
 * with Tailwind's conflict resolution
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}