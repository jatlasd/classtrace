"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { createClassGroup } from "@/actions/classes";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

const inputClassName =
  "h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

export function ClassGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createClassGroup({ name });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setName("");
      router.push(`${routes.roster}?classId=${result.classGroup.id}`);
      router.refresh();
    });
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="class-name" className="text-sm font-medium text-foreground">
          Class name
        </label>
        <input
          id="class-name"
          name="className"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          className={inputClassName}
          autoComplete="off"
          disabled={isPending}
        />
      </div>
      <div aria-live="polite" className="min-h-5 text-sm">
        {error ? <p className="text-destructive">{error}</p> : null}
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-9 rounded-lg px-5 text-sm font-semibold"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Create class"}
      </Button>
    </form>
  );
}
