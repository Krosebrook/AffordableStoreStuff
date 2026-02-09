import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  gradient?: "purple" | "blue" | "green" | "pink";
}

const gradientClasses = {
  purple: "from-purple-500/20 to-pink-500/20",
  blue: "from-blue-500/20 to-cyan-500/20",
  green: "from-green-500/20 to-emerald-500/20",
  pink: "from-pink-500/20 to-rose-500/20",
};

const iconBgClasses = {
  purple: "from-purple-500 to-pink-500",
  blue: "from-blue-500 to-cyan-500",
  green: "from-green-500 to-emerald-500",
  pink: "from-pink-500 to-rose-500",
};

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  trend = "neutral",
  gradient = "purple",
}: StatsCardProps) {
  return (
    <Card className="glass border-white/10 card-glow overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[gradient]} opacity-50`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {trend === "up" && (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">+{change}%</span>
                  </>
                )}
                {trend === "down" && (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">{change}%</span>
                  </>
                )}
                {trend === "neutral" && <span className="text-muted-foreground">{change}%</span>}
                <span className="text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconBgClasses[gradient]} flex items-center justify-center shrink-0`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
