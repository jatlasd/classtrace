import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ValidatedStampProps = {
  className?: string;
};

export function ValidatedStamp({ className }: ValidatedStampProps) {
  return (
    <span
      className={cn(
        "label inline-flex shrink-0 items-center gap-1.5 text-fg",
        className
      )}
    >
      <span className="flex size-4 items-center justify-center rounded-full bg-fg text-base">
        <Check aria-hidden="true" className="size-2.5" strokeWidth={3.5} />
      </span>
      Validated
    </span>
  );
}
