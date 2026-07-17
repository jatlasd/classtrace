"use client";

import {
  Database,
  KeyRound,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import {
  deleteOperatorClerkUserAction,
  deleteOperatorWorkspaceDataAction,
  searchOperatorAccountAction,
} from "@/actions/operator";
import { ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { Button } from "@/components/ui/button";
import type { OperatorAccount } from "@/lib/operator/operator-accounts";

type Operation = "search" | "workspace-delete" | "clerk-delete" | null;

type ConsoleMessage = {
  tone: "error" | "success" | "warning";
  text: string;
};

const EMPTY_COUNTS = {
  classGroups: 0,
  rosterStudents: 0,
  evidenceRecords: 0,
};

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-border/70 py-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium text-foreground [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

function CountCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 px-4 py-4 first:pl-0 last:pr-0 sm:border-l sm:border-border/70 sm:first:border-l-0 sm:first:pl-0">
      <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function OperatorConsole() {
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<OperatorAccount | null>(null);
  const [workspaceConfirmation, setWorkspaceConfirmation] = useState("");
  const [clerkConfirmation, setClerkConfirmation] = useState("");
  const [message, setMessage] = useState<ConsoleMessage | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [isPending, startTransition] = useTransition();

  const normalizedTargetEmail = account?.email.trim().toLowerCase() ?? "";
  const workspaceConfirmed =
    workspaceConfirmation.trim().toLowerCase() === normalizedTargetEmail;
  const clerkConfirmed =
    clerkConfirmation.trim().toLowerCase() === normalizedTargetEmail;

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMessage(null);
    setAccount(null);
    setWorkspaceConfirmation("");
    setClerkConfirmation("");
    setOperation("search");

    startTransition(async () => {
      const result = await searchOperatorAccountAction({ email });
      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        setOperation(null);
        return;
      }

      setAccount(result.account);
      setOperation(null);
    });
  }

  function handleWorkspaceDelete(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!account) return;
    setMessage(null);
    setOperation("workspace-delete");

    startTransition(async () => {
      const result = await deleteOperatorWorkspaceDataAction({
        targetClerkUserId: account.clerkUserId,
        confirmationEmail: workspaceConfirmation,
      });
      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        setOperation(null);
        return;
      }

      setAccount({ ...account, classTrace: null });
      setWorkspaceConfirmation("");
      setMessage({
        tone: "success",
        text: `ClassTrace data deleted: ${result.deletedCounts.classGroups} classes, ${result.deletedCounts.rosterStudents} students, and ${result.deletedCounts.evidenceRecords} evidence records. The Clerk user still exists.`,
      });
      setOperation(null);
    });
  }

  function handleClerkDelete(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!account) return;
    setMessage(null);
    setOperation("clerk-delete");

    startTransition(async () => {
      const result = await deleteOperatorClerkUserAction({
        targetClerkUserId: account.clerkUserId,
        confirmationEmail: clerkConfirmation,
      });
      if (!result.success) {
        if (result.clerkUserDeleted) {
          setAccount(null);
          setEmail("");
          setClerkConfirmation("");
          setMessage({ tone: "warning", text: result.error });
        } else {
          setMessage({ tone: "error", text: result.error });
        }
        setOperation(null);
        return;
      }

      setAccount(null);
      setEmail("");
      setClerkConfirmation("");
      setMessage({
        tone: "success",
        text: "Clerk user deleted. Search for another account when ready.",
      });
      setOperation(null);
    });
  }

  const messageClassName =
    message?.tone === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : message?.tone === "warning"
        ? "border-primary/30 bg-primary/10 text-foreground"
        : "border-validated/30 bg-validated/10 text-foreground";

  return (
    <div className="space-y-7">
      <section aria-labelledby="account-search-heading">
        <div className="flex items-start gap-3">
          <Search className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 id="account-search-heading" className="text-lg font-semibold text-foreground">
              Find one account
            </h2>
            <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
              Enter the complete email address. Partial matching and account browsing are disabled.
            </p>
          </div>
        </div>

        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSearch}>
          <div className="min-w-0 flex-1">
            <label htmlFor="operator-account-email" className="text-sm font-medium text-foreground">
              Account email
            </label>
            <input
              id="operator-account-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage(null);
              }}
              className={`${ROSTER_INPUT_CLASS_NAME} mt-1.5`}
              placeholder="teacher@example.com"
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" size="lg" disabled={isPending || !email.trim()}>
            <Search aria-hidden="true" />
            {isPending && operation === "search" ? "Searching…" : "Search account"}
          </Button>
        </form>
      </section>

      {message ? (
        <div
          role={message.tone === "error" ? "alert" : "status"}
          className={`border px-4 py-3 text-sm leading-relaxed ${messageClassName}`}
        >
          {message.text}
        </div>
      ) : null}

      {account ? (
        <div className="space-y-7 border-t border-border pt-7">
          <section aria-labelledby="account-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="account-heading" className="text-xl font-semibold text-foreground">
                  {account.displayName}
                </h2>
                <p className="mt-1 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">
                  {account.email}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
                Exact match
              </span>
            </div>

            <dl className="mt-5">
              <DetailRow label="Clerk user ID" value={account.clerkUserId} />
              <DetailRow label="Clerk account created" value={formatDate(account.clerkCreatedAt)} />
              <DetailRow label="Last sign-in" value={formatDate(account.lastSignInAt)} />
              <DetailRow
                label="ClassTrace profile"
                value={account.classTrace ? "Present" : "No app-owned data"}
              />
              {account.classTrace ? (
                <>
                  <DetailRow label="Teacher profile ID" value={account.classTrace.teacherProfileId} />
                  <DetailRow label="Workspace ID" value={account.classTrace.workspaceId ?? "Not created"} />
                  <DetailRow label="Workspace" value={account.classTrace.workspaceName ?? "Not created"} />
                </>
              ) : null}
            </dl>

            <div className="mt-3 grid border-y border-border/70 sm:grid-cols-3">
              <CountCell label="Classes" value={account.classTrace?.counts.classGroups ?? EMPTY_COUNTS.classGroups} />
              <CountCell label="Students" value={account.classTrace?.counts.rosterStudents ?? EMPTY_COUNTS.rosterStudents} />
              <CountCell label="Evidence records" value={account.classTrace?.counts.evidenceRecords ?? EMPTY_COUNTS.evidenceRecords} />
            </div>
          </section>

          <section aria-labelledby="destructive-actions-heading" className="border-t border-border pt-7">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
              <div>
                <h2 id="destructive-actions-heading" className="text-lg font-semibold text-foreground">
                  Destructive actions
                </h2>
                <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
                  These actions are permanent, audited, and intentionally separate.
                </p>
              </div>
            </div>

            {account.isCurrentOperator ? (
              <p role="status" className="mt-4 border border-border bg-muted/60 px-4 py-3 text-sm text-foreground">
                Self-deletion is blocked for the configured operator account.
              </p>
            ) : (
              <div className="mt-5 divide-y divide-border border-y border-border">
                <div className="py-5">
                  <div className="flex items-start gap-3">
                    <Database className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">Delete ClassTrace data</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Deletes the teacher profile, workspace, classes, students, and evidence. The Clerk user remains.
                      </p>

                      {account.classTrace ? (
                        <form className="mt-4 space-y-3" onSubmit={handleWorkspaceDelete}>
                          <div>
                            <label htmlFor="workspace-delete-confirmation" className="text-sm font-medium text-foreground">
                              Type {account.email} to confirm
                            </label>
                            <input
                              id="workspace-delete-confirmation"
                              type="email"
                              autoComplete="off"
                              value={workspaceConfirmation}
                              onChange={(event) => setWorkspaceConfirmation(event.target.value)}
                              className={`${ROSTER_INPUT_CLASS_NAME} mt-1.5 max-w-xl`}
                              disabled={isPending}
                            />
                          </div>
                          <Button type="submit" variant="destructive" disabled={isPending || !workspaceConfirmed}>
                            {isPending && operation === "workspace-delete" ? "Deleting ClassTrace data…" : "Delete ClassTrace data"}
                          </Button>
                        </form>
                      ) : (
                        <p className="mt-3 text-sm font-medium text-validated-foreground">
                          No ClassTrace data remains.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="py-5">
                  <div className="flex items-start gap-3">
                    <KeyRound className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">Delete Clerk user</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Deletes the sign-in identity. This is available only after ClassTrace data is gone.
                      </p>

                      {!account.classTrace ? (
                        <form className="mt-4 space-y-3" onSubmit={handleClerkDelete}>
                          <div>
                            <label htmlFor="clerk-delete-confirmation" className="text-sm font-medium text-foreground">
                              Type {account.email} to confirm
                            </label>
                            <input
                              id="clerk-delete-confirmation"
                              type="email"
                              autoComplete="off"
                              value={clerkConfirmation}
                              onChange={(event) => setClerkConfirmation(event.target.value)}
                              className={`${ROSTER_INPUT_CLASS_NAME} mt-1.5 max-w-xl`}
                              disabled={isPending}
                            />
                          </div>
                          <Button type="submit" variant="destructive" disabled={isPending || !clerkConfirmed}>
                            {isPending && operation === "clerk-delete" ? "Deleting Clerk user…" : "Delete Clerk user"}
                          </Button>
                        </form>
                      ) : (
                        <p className="mt-3 text-sm font-medium text-muted-foreground">
                          Delete ClassTrace data first.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
