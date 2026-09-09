"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { restoreClassGroup } from "@/actions/classes";
import { RosterFormMessage } from "@/components/roster/roster-form-message";
import { Button } from "@/components/ui/button";

export function ArchivedClassGroupActions({
  classGroupId,
  className,
}: {
  classGroupId: string;
  className: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleRestore(): void {
    setError("");
    startTransition(async () => {
      const result = await restoreClassGroup({ classGroupId });
      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="shrink-0 text-right">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleRestore}
        aria-label={`Restore ${className}`}
      >
        {isPending ? "Restoring…" : "Restore class"}
      </Button>
      <RosterFormMessage
        id={`restore-class-error-${classGroupId}`}
        message={error}
        className="mt-1 max-w-64 text-xs leading-relaxed"
      />
    </div>
  );
}
