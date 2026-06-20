export const DEFAULT_ACCENT_COLOR = "#E8B92F"

export const ACCENT_COLORS = [
  { name: "Sun", value: "#E8B92F" },
  { name: "Calm", value: "#0071E3" },
  { name: "Growth", value: "#34C759" },
  { name: "Fire", value: "#FF3B30" },
  { name: "Dream", value: "#AF52DE" },
  { name: "Adventure", value: "#FF9500" },
  { name: "Focus", value: "#5AC8FA" },
  { name: "Bold", value: "#FF2D55" },
]

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "")
  if (normalized.length !== 3 && normalized.length !== 6) return null

  const full = normalized.length === 3
    ? normalized
        .split("")
        .map((c) => c + c)
        .join("")
    : normalized

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export function getAccentForeground(hex: string): "#ffffff" | "#1d1d1f" {
  const rgb = hexToRgb(hex)
  if (!rgb) return "#1d1d1f"

  // Convert to linear RGB and compute relative luminance
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }

  const luminance =
    0.2126 * toLinear(rgb.r) +
    0.7152 * toLinear(rgb.g) +
    0.0722 * toLinear(rgb.b)

  return luminance > 0.5 ? "#1d1d1f" : "#ffffff"
}

export function getAccentColor(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT_COLOR
  return localStorage.getItem("accent_color") || DEFAULT_ACCENT_COLOR
}

export function storeAccentColor(color: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("accent_color", color)
}

export function applyAccentColor(color: string): void {
  if (typeof window === "undefined") return
  const root = document.documentElement
  const foreground = getAccentForeground(color)

  root.style.setProperty("--accent-color", color)
  root.style.setProperty("--accent-foreground", foreground)
  root.style.setProperty("--accent-color-10", hexToRgba(color, 0.1))
  root.style.setProperty("--accent-color-15", hexToRgba(color, 0.15))
  root.style.setProperty("--accent-color-20", hexToRgba(color, 0.2))
  root.style.setProperty("--accent-color-30", hexToRgba(color, 0.3))
  root.style.setProperty("--accent-color-50", hexToRgba(color, 0.5))
  root.style.setProperty("--accent-color-80", hexToRgba(color, 0.8))
}
