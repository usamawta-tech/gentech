import {
  BatteryCharging,
  Cable,
  Headphones,
  Phone,
  Shield,
  Smartphone,
  Tablet,
  Watch,
  type LucideIcon,
} from "lucide-react";

/** Maps category `icon` slugs (from DB/fixtures) to lucide components. */
const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  tablet: Tablet,
  watch: Watch,
  headphones: Headphones,
  cable: Cable,
  "battery-charging": BatteryCharging,
  shield: Shield,
  phone: Phone,
};

export function CategoryIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || Smartphone;
  return <Icon className={className} />;
}
