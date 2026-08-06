import {
  BarChart3,
  Bike,
  Box,
  Boxes,
  Building2,
  Calculator,
  Code2,
  Compass,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Link2,
  MapPin,
  Mail,
  Network,
  Package,
  Radio,
  Receipt,
  Route,
  Shield,
  ShoppingBasket,
  Snowflake,
  Store,
  Timer,
  Truck,
  UtensilsCrossed,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit registry rather than `import * as Icons from "lucide-react"`.
 *
 * The namespace import defeats tree-shaking and drags the entire icon set
 * (~1,500 components) into the client bundle — it was worth roughly 200 kB
 * of first-load JS on the home page alone.
 */
export const iconRegistry: Record<string, LucideIcon> = {
  BarChart3,
  Bike,
  Box,
  Boxes,
  Building2,
  Calculator,
  Code2,
  Compass,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Link2,
  MapPin,
  Mail,
  Network,
  Package,
  Radio,
  Receipt,
  Route,
  Shield,
  ShoppingBasket,
  Snowflake,
  Store,
  Timer,
  Truck,
  UtensilsCrossed,
  Wallet,
  Zap,
};

export function getIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  return iconRegistry[name] ?? null;
}
