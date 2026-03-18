import { Play, ServerCrash, Zap, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@components/ui/card";
import { StatusMeta } from "@presentation/interfaces/types";
import React from "react";

interface RunnerStatsProps {
  providersCount: number;
  activeProvider: string | null;
  statusMeta: StatusMeta | null;
}

export default function RunnerStats({
  providersCount,
  activeProvider,
  statusMeta,
}: RunnerStatsProps) {
  const stats = [
    {
      label: "Providers",
      value: providersCount,
      icon: ServerCrash,
    },
    {
      label: "Last Status",
      value: statusMeta?.label || "Idle",
      icon: statusMeta?.icon || Zap,
    },
    {
      label: "Active",
      value: activeProvider?.replace(".json", "") || "None",
      icon: Play,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => {
        const rawIcon = stat.icon;

        return (
          <Card key={i} className="shadow-xl border-slate-100 bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                {/* Si es una función o un objeto con render (como los de Lucide),
                  lo tratamos como componente. Si no, lo renderizamos como nodo (JSX).
                */}
                {typeof rawIcon === "function" ||
                (typeof rawIcon === "object" &&
                  rawIcon !== null &&
                  "render" in rawIcon)
                  ? React.createElement(
                      rawIcon as React.ComponentType<{ className?: string }>,
                      {
                        className: "w-5 h-5",
                      },
                    )
                  : (rawIcon as React.ReactNode)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-xl font-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
