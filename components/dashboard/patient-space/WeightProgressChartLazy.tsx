"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

function ChartSkeleton() {
  return <div className="h-[280px] w-full min-w-0 animate-pulse rounded-xl bg-slate-100" />;
}

export const WeightProgressChartLazy = dynamic(
  () =>
    import("@/components/dashboard/patient-space/WeightProgressChart").then(
      (m) => m.WeightProgressChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export type WeightProgressChartLazyProps = ComponentProps<typeof WeightProgressChartLazy>;
