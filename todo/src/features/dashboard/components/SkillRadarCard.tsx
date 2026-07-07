"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type SkillRadarCardProps = {
  apiUnavailable: boolean;
};

const skillRadarConfig = {
  current: {
    label: "Current",
    color: "#f0805c",
  },
  target: {
    label: "6-Month Target",
    color: "#4ec98a",
  },
} satisfies ChartConfig;

const skillRadarData = [
  { skill: "TypeScript", current: 9, target: 9 },
  { skill: "System Design", current: 3, target: 6 },
  { skill: "Databases", current: 6, target: 9 },
  { skill: "Communication", current: 9, target: 9 },
  { skill: "AI Workflows", current: 3, target: 6 },
  { skill: "Cloud Delivery", current: 5, target: 7 },
  { skill: "Testing", current: 6, target: 8 },
];

export function SkillRadarCard({ apiUnavailable, red }: SkillRadarCardProps) {
  return (
    <Card
      size="sm"
      className="rounded-xl border border-[#232b36] bg-[#0e1218] p-4 py-4 shadow-none ring-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-[#57a773]">
            {"// skill_radar"}
          </div>
          <div className="mt-2 text-lg font-extrabold tracking-[-0.04em] text-[#f0805c]">
            now vs 6-month target
          </div>
          <p className="mt-2 max-w-lg text-xs leading-5 text-[#8b97a7]">
            Snapshot of where I am currently and where I expect to be by runway
            end.
          </p>
        </div>
        {apiUnavailable ? (
          <Badge className="border-[#f0805c]/35 bg-[#f0805c]/15 font-mono text-[#f0805c]">
            using demo todos
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px]">
        <ChartContainer
          config={skillRadarConfig}
          className="h-65 w-full rounded-lg border border-[#1a212b] bg-[#0b1016] p-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={skillRadarData}>
              <PolarGrid stroke="#232b36" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: "#8b97a7", fontSize: 11 }}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Radar
                dataKey="target"
                stroke="var(--color-target)"
                fill="var(--color-target)"
                fillOpacity={0.22}
                strokeWidth={2}
              />
              <Radar
                dataKey="current"
                stroke="var(--color-current)"
                fill="var(--color-current)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="grid content-start gap-2 text-xs">
          <div className="rounded-md border border-[#232b36] bg-[#0b1016] px-3 py-2 text-[#8b97a7]">
            <span className="font-semibold text-[#e9eef5]">Scale</span>
            <span className="ml-1">1-10</span>
          </div>
          <div className="rounded-md border border-[#232b36] bg-[#0b1016] px-3 py-2 text-[#8b97a7]">
            <span className="inline-flex items-center gap-2 text-[#e9eef5]">
              <span className="size-2 rounded-full bg-[#f0805c]" />
              Current
            </span>
          </div>
          <div className="rounded-md border border-[#232b36] bg-[#0b1016] px-3 py-2 text-[#8b97a7]">
            <span className="inline-flex items-center gap-2 text-[#e9eef5]">
              <span className="size-2 rounded-full bg-[#4ec98a]" />
              6-Month Target
            </span>
          </div>
          <p className="rounded-md border border-[#232b36] bg-[#0b1016] px-3 py-2 leading-5 text-[#8b97a7]">
            Focus lift areas: systems design, AI workflows, and cloud delivery.
          </p>
        </div>
      </div>
    </Card>
  );
}
