"use client";

import { useId, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmationPanelProps = {
  ariaLabel: string;
  description: ReactNode;
  confirmLabel: string;
  confirmAriaLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  pendingLabel?: string;
  tone?: "default" | "destructive";
  className?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationPanel({
  ariaLabel,
  description,
  confirmLabel,
  confirmAriaLabel,
  cancelLabel = "Cancel",
  disabled = false,
  pendingLabel,
  tone = "default",
  className,
  onConfirm,
  onCancel,
}: ConfirmationPanelProps) {
  const descriptionId = useId();
  const isDestructive = tone === "destructive";

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || disabled) {
      return;
    }

    event.preventDefault();
    onCancel();
  }

  return (
    <div
      role="alertdialog"
      aria-label={ariaLabel}
      aria-describedby={descriptionId}
      aria-modal="false"
      className={cn(
        "space-y-3 border-y px-3 py-3 sm:px-4",
        isDestructive
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-muted/20",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <p
        id={descriptionId}
        className={cn(
          "text-xs font-medium leading-relaxed",
          isDestructive ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={isDestructive ? "destructive" : "outline"}
          size="sm"
          onClick={onConfirm}
          disabled={disabled}
          autoFocus
          aria-label={confirmAriaLabel}
        >
          {disabled && pendingLabel ? pendingLabel : confirmLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={disabled}
        >
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
