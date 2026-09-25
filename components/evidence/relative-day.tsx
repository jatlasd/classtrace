"use client";

import { useSyncExternalStore } from "react";
import {
  formatRelativeDay,
  formatStableShortDate,
  localDaysAgo,
} from "@/lib/evidence/relative-day";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

export function RelativeDay({
  value,
  staleAfterDays,
  className,
  staleClassName,
}: {
  value: string;
  staleAfterDays?: number;
  className?: string;
  staleClassName?: string;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const label = hydrated
    ? formatRelativeDay(value)
    : formatStableShortDate(value);
  const days = hydrated ? localDaysAgo(value) : null;
  const stale =
    staleAfterDays !== undefined && days !== null && days >= staleAfterDays;

  return (
    <time dateTime={value} className={cn(className, stale && staleClassName)}>
      {label}
    </time>
  );
}
