import type { ScriptGroup } from "./config";

/**
 * System font stacks for all supported scripts.
 * Eliminates runtime Google Fonts network downloads and compilation timeouts.
 */
const systemFontClass: Record<ScriptGroup, string> = {
  latin: "font-stack-latin",
  cyrillic: "font-stack-cyrillic",
  devanagari: "font-stack-devanagari",
  arabic: "font-stack-arabic",
  sc: "font-stack-sc",
  jp: "font-stack-jp",
  kr: "font-stack-kr",
};

/** Font classes for a script — zero runtime download overhead. */
export function fontClassName(script: ScriptGroup): string {
  return systemFontClass[script] ?? "font-stack-latin";
}
