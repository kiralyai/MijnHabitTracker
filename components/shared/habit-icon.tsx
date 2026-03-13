import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BrainCircuit,
  Briefcase,
  CalendarRange,
  ChartLine,
  CircleCheckBig,
  Dumbbell,
  Flag,
  Footprints,
  GlassWater,
  Grid2X2,
  LayoutDashboard,
  MoonStar,
  Settings2,
  ShieldBan,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sunrise,
  WifiOff,
} from "lucide-react";

import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  BrainCircuit,
  Briefcase,
  CalendarRange,
  ChartLine,
  CircleCheckBig,
  Dumbbell,
  Flag,
  Footprints,
  GlassWater,
  Grid2X2,
  LayoutDashboard,
  MoonStar,
  Settings2,
  ShieldBan,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sunrise,
  WifiOff,
};

export function resolveIcon(name: string) {
  return iconMap[name] ?? Sparkles;
}

function renderIcon(name: string) {
  switch (name) {
    case "BookOpen":
      return <BookOpen className="size-4" />;
    case "BrainCircuit":
      return <BrainCircuit className="size-4" />;
    case "Briefcase":
      return <Briefcase className="size-4" />;
    case "CalendarRange":
      return <CalendarRange className="size-4" />;
    case "ChartLine":
      return <ChartLine className="size-4" />;
    case "CircleCheckBig":
      return <CircleCheckBig className="size-4" />;
    case "Dumbbell":
      return <Dumbbell className="size-4" />;
    case "Flag":
      return <Flag className="size-4" />;
    case "Footprints":
      return <Footprints className="size-4" />;
    case "GlassWater":
      return <GlassWater className="size-4" />;
    case "Grid2X2":
      return <Grid2X2 className="size-4" />;
    case "LayoutDashboard":
      return <LayoutDashboard className="size-4" />;
    case "MoonStar":
      return <MoonStar className="size-4" />;
    case "Settings2":
      return <Settings2 className="size-4" />;
    case "ShieldBan":
      return <ShieldBan className="size-4" />;
    case "ShieldCheck":
      return <ShieldCheck className="size-4" />;
    case "Snowflake":
      return <Snowflake className="size-4" />;
    case "Sunrise":
      return <Sunrise className="size-4" />;
    case "WifiOff":
      return <WifiOff className="size-4" />;
    default:
      return <Sparkles className="size-4" />;
  }
}

export function HabitIcon({
  name,
  color,
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-sm shadow-black/5",
        className,
      )}
      style={{
        background: color ? `linear-gradient(135deg, ${color}22, ${color}50)` : undefined,
        color: color ?? undefined,
      }}
    >
      {renderIcon(name)}
    </span>
  );
}
