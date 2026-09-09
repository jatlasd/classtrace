import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BrandLockupProps = Omit<ComponentProps<"span">, "children"> & {
  mark?: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "inverse";
};

const sizeClasses = {
  sm: {
    lockup: "gap-2 text-[1.05rem]",
    mark: "size-5",
  },
  md: {
    lockup: "gap-2.5 text-[1.35rem]",
    mark: "size-6",
  },
  lg: {
    lockup: "gap-3 text-[1.75rem]",
    mark: "size-8",
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
  const inverse = tone === "inverse";
  const defaultMark = (
    <span className="relative block size-full">
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          inverse ? "bg-base" : "bg-fg"
        )}
      />
      <span
        className={cn(
          "absolute -bottom-px -right-px size-[46%] rounded-full bg-live-bright ring-2",
          inverse ? "ring-fg" : "ring-base"
        )}
      />
    </span>
  );

  return (
    <span
      data-slot="brand-lockup"
      className={cn(
        "inline-flex min-w-0 items-center font-display font-semibold",
        inverse ? "text-[color:var(--base)]" : "text-fg",
        classes.lockup,
        className
      )}
      {...props}
    >
      <span
        data-slot="brand-mark"
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center [&>svg]:size-full",
          classes.mark
        )}
      >
        {mark ?? defaultMark}
      </span>
      <span data-slot="brand-wordmark">ClassTrace</span>
    </span>
  );
}
