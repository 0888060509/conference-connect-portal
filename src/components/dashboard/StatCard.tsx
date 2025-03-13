
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  change?: {
    value: number;
    positive?: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, iconColor = "bg-secondary", change }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {change && (
            <p className={cn(
              "text-xs mt-1 flex items-center",
              change.positive ? "text-success" : "text-accent"
            )}>
              {change.positive ? "+" : "-"}{Math.abs(change.value)}%
              <span className="text-muted-foreground ml-1">vs last month</span>
            </p>
          )}
        </div>
        
        <div className={cn(
          "rounded-full p-2 flex-shrink-0",
          iconColor
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
