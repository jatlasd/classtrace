import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BrandLockupProps = Omit<ComponentProps<"span">, "children"> & {
  mark?: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "inverse";
};

const sizeClasses = {
  sm: {
    lockup: "gap-2 text-base",
    mark: "size-5",
  },
  md: {
    lockup: "gap-2.5 text-xl",
    mark: "size-6",
  },
  lg: {
    lockup: "gap-3 text-2xl",
    mark: "size-7",
  },
} as const;

export function BrandLockup({
  mark,
  size = "md",
  tone = "default",
  className,
  ...props
}: BrandLockupProps) {
  const classes = sizeClasses[size];

  return (
    <span
      data-slot="brand-lockup"
      className={cn(
        "inline-flex min-w-0 items-center font-sans font-bold tracking-[-0.025em]",
        tone === "inverse" ? "text-navy-foreground" : "text-foreground",
        classes.lockup,
        className
      )}
      {...props}
    >
      <span
        data-slot="brand-mark"
        data-empty={mark ? undefined : ""}
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center [&>svg]:size-full",
          classes.mark,
          mark ? null : "invisible"
        )}
      >
        {mark}
      </span>
      <span data-slot="brand-wordmark">ClassTrace</span>
    </span>
  );
}
