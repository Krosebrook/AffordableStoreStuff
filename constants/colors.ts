const brand = {
  primary: "#10B981",
  primaryDark: "#059669",
  primaryLight: "#34D399",
  accent: "#6366F1",
  accentLight: "#818CF8",
  warning: "#F59E0B",
  danger: "#EF4444",
  success: "#10B981",
  info: "#3B82F6",
};

export const shopColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#3B82F6",
  accent: "#10B981",
  background: "#F8FAFC",
  backgroundDark: "#0F172A",
  surface: "#FFFFFF",
  surfaceDark: "#1E293B",
  text: "#0F172A",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",
  border: "#E2E8F0",
  borderDark: "#334155",
  star: "#FACC15",
  sale: "#EF4444",
  stylistPrimary: "#2B8CEE",
};

export default {
  light: {
    text: "#111827",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    surfaceSecondary: "#F3F4F6",
    border: "#E5E7EB",
    tint: brand.primary,
    tabIconDefault: "#9CA3AF",
    tabIconSelected: brand.primary,
    ...brand,
  },
};

export const marketplace: Record<string, { color: string; label: string }> = {
  amazon: { color: "#FF9900", label: "Amazon" },
  etsy: { color: "#F1641E", label: "Etsy" },
  tiktok: { color: "#000000", label: "TikTok Shop" },
  shopify: { color: "#96BF48", label: "Shopify" },
  printify: { color: "#39B54A", label: "Printify" },
  wix: { color: "#0C6EFC", label: "Wix" },
  instagram: { color: "#E4405F", label: "Instagram Shop" },
  gumroad: { color: "#FF90E8", label: "Gumroad" },
  woocommerce: { color: "#96588A", label: "WooCommerce" },
  website: { color: "#10B981", label: "Website" },
};

export const statusColors: Record<string, string> = {
  active: "#10B981",
  draft: "#9CA3AF",
  pending: "#F59E0B",
  published: "#10B981",
  syncing: "#3B82F6",
  generating: "#8B5CF6",
  ready: "#3B82F6",
  error: "#EF4444",
  fulfilled: "#10B981",
  shipped: "#3B82F6",
  processing: "#F59E0B",
  cancelled: "#EF4444",
  returned: "#8B5CF6",
};
