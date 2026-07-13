"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { createClassGroup } from "@/actions/classes";
import { ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { RosterFormMessage } from "@/components/roster/roster-form-message";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

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
          className={ROSTER_INPUT_CLASS_NAME}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "class-name-error" : undefined}
          autoComplete="off"
          disabled={isPending}
        />
      </div>
      <RosterFormMessage id="class-name-error" message={error} />
      <Button
        type="submit"
        size="lg"
        className="h-9 rounded-lg px-5 text-sm font-semibold"
        disabled={isPending}
      >
        {isPending ? "Saving…" : "Create class"}
      </Button>
    </form>
  );
}
