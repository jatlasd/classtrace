"use client";

import {
  ChevronLeft,
  ChevronRight,
  Database,
  KeyRound,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import {
  deleteOperatorClerkUserAction,
  deleteOperatorWorkspaceDataAction,
  listOperatorAccountsAction,
  seedOperatorDemoWorkspaceAction,
} from "@/actions/operator";
import { ROSTER_INPUT_CLASS_NAME } from "@/components/roster/form-styles";
import { Button } from "@/components/ui/button";
import type {
  ListOperatorAccountsResult,
  OperatorAccount,
  OperatorDirectoryPage,
} from "@/lib/operator/operator-accounts";

type Operation =
  | "directory"
  | "demo-seed"
  | "workspace-delete"
  | "clerk-delete"
  | null;

type ConsoleMessage = {
  tone: "error" | "success" | "warning";
  text: string;
};

const EMPTY_COUNTS = {
  classGroups: 0,
  rosterStudents: 0,
  evidenceRecords: 0,
};

function formatDate(value: string | null, includeTime = true): string {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(new Date(value));
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-line py-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5">
      <dt className="label text-fg-3">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium text-fg [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

function CountCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 px-4 py-4 first:pl-0 last:pr-0 sm:border-l sm:border-line sm:first:border-l-0 sm:first:pl-0">
      <p className="text-2xl font-semibold tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs font-medium text-fg-2">{label}</p>
    </div>
  );
}

function hasWorkspaceData(account: OperatorAccount): boolean {
  const counts = account.classTrace?.counts;
  return Boolean(
    counts &&
      (counts.classGroups > 0 ||
        counts.rosterStudents > 0 ||
        counts.evidenceRecords > 0)
  );
}

function DirectoryList({
  directory,
  selectedAccountId,
  disabled,
  onSelect,
}: {
  directory: OperatorDirectoryPage;
  selectedAccountId: string | null;
  disabled: boolean;
  onSelect: (account: OperatorAccount) => void;
}) {
  if (directory.accounts.length === 0) {
    return (
      <p className="mt-5 border-y border-line py-5 text-sm text-fg-2">
        No Clerk users match this filter.
      </p>
    );
  }

  return (
    <ul className="mt-5 divide-y divide-border border-y border-line">
      {directory.accounts.map((account) => {
        const selected = account.clerkUserId === selectedAccountId;
        const counts = account.classTrace?.counts ?? EMPTY_COUNTS;
        return (
          <li key={account.clerkUserId}>
            <button
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onSelect(account)}
              className="grid w-full gap-3 px-1 py-4 text-left outline-none transition-colors hover:bg-well focus-visible:ring-2 focus-visible:ring-live-bright disabled:opacity-50 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center sm:px-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-fg">
                  {account.displayName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-fg-2">
                  {account.email}
                </span>
              </span>
              <span className="text-xs leading-relaxed text-fg-2">
                <span className="block">
                  Created {formatDate(account.clerkCreatedAt, false)}
                </span>
                <span className="block">
                  Last sign-in {formatDate(account.lastSignInAt, false)}
                </span>
                <span className="block">
                  {account.classTrace?.workspaceId
                    ? `Workspace · ${counts.classGroups} classes · ${counts.rosterStudents} students · ${counts.evidenceRecords} evidence`
                    : account.classTrace
                      ? "ClassTrace profile · no workspace"
                      : "No ClassTrace profile or workspace"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg">
                {selected ? "Selected" : "View account"}
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function OperatorConsole({
  initialDirectory,
}: {
  initialDirectory: ListOperatorAccountsResult;
}) {
  const [filter, setFilter] = useState(
    initialDirectory.success ? initialDirectory.directory.query : ""
  );
  const [directory, setDirectory] = useState<OperatorDirectoryPage | null>(
    initialDirectory.success ? initialDirectory.directory : null
  );
  const [account, setAccount] = useState<OperatorAccount | null>(null);
  const [seedConfirmationOpen, setSeedConfirmationOpen] = useState(false);
  const [seedConfirmation, setSeedConfirmation] = useState("");
  const [workspaceConfirmation, setWorkspaceConfirmation] = useState("");
  const [clerkConfirmation, setClerkConfirmation] = useState("");
  const [message, setMessage] = useState<ConsoleMessage | null>(
    initialDirectory.success
      ? null
      : { tone: "error", text: initialDirectory.error }
  );
  const [operation, setOperation] = useState<Operation>(null);
  const [isPending, startTransition] = useTransition();

  const normalizedTargetEmail = account?.email.trim().toLowerCase() ?? "";
  const workspaceConfirmed =
    workspaceConfirmation.trim().toLowerCase() === normalizedTargetEmail;
  const clerkConfirmed =
    clerkConfirmation.trim().toLowerCase() === normalizedTargetEmail;
  const seedRequiresEmail = account ? hasWorkspaceData(account) : false;
  const seedConfirmed =
    !seedRequiresEmail ||
    seedConfirmation.trim().toLowerCase() === normalizedTargetEmail;

  function replaceDirectoryAccount(nextAccount: OperatorAccount): void {
    setDirectory((current) =>
      current
        ? {
            ...current,
            accounts: current.accounts.map((candidate) =>
              candidate.clerkUserId === nextAccount.clerkUserId
                ? nextAccount
                : candidate
            ),
          }
        : current
    );
  }

  function loadDirectory(query: string, offset: number): void {
    setMessage(null);
    setOperation("directory");
    startTransition(async () => {
      const result = await listOperatorAccountsAction({ query, offset });
      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        setOperation(null);
        return;
      }
      setDirectory(result.directory);
      setOperation(null);
    });
  }

  function handleFilter(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    loadDirectory(filter, 0);
  }

  function handleSelect(nextAccount: OperatorAccount): void {
    setAccount(nextAccount);
    setMessage(null);
    setSeedConfirmationOpen(false);
    setSeedConfirmation("");
    setWorkspaceConfirmation("");
    setClerkConfirmation("");
  }

  function handleSeedDemo(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!account) return;
    setMessage(null);
    setOperation("demo-seed");

    startTransition(async () => {
      const result = await seedOperatorDemoWorkspaceAction({
        targetClerkUserId: account.clerkUserId,
        confirmationEmail: seedConfirmation,
      });
      if (!result.success) {
        setMessage({ tone: "error", text: result.error });
        setOperation(null);
        return;
      }

      setAccount(result.account);
      replaceDirectoryAccount(result.account);
      setSeedConfirmation("");
      setSeedConfirmationOpen(false);
      setMessage({
        tone: "success",
        text: `Demo workspace loaded: ${result.counts.classGroups} classes, ${result.counts.rosterStudents} students, ${result.counts.evidenceRecords} evidence records, and ${result.counts.photos} photos.`,
      });
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

      const nextAccount = { ...account, classTrace: null };
      setAccount(nextAccount);
      replaceDirectoryAccount(nextAccount);
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
          setDirectory((current) =>
            current
              ? {
                  ...current,
                  accounts: current.accounts.filter(
                    (candidate) => candidate.clerkUserId !== account.clerkUserId
                  ),
                  totalCount: Math.max(0, current.totalCount - 1),
                }
              : current
          );
          setAccount(null);
          setClerkConfirmation("");
          setMessage({ tone: "warning", text: result.error });
        } else {
          setMessage({ tone: "error", text: result.error });
        }
        setOperation(null);
        return;
      }

      setDirectory((current) =>
        current
          ? {
              ...current,
              accounts: current.accounts.filter(
                (candidate) => candidate.clerkUserId !== account.clerkUserId
              ),
              totalCount: Math.max(0, current.totalCount - 1),
            }
          : current
      );
      setAccount(null);
      setClerkConfirmation("");
      setMessage({
        tone: "success",
        text: "Clerk user deleted. Select another account when ready.",
      });
      setOperation(null);
    });
  }

  const messageClassName =
    message?.tone === "error"
      ? "border-danger bg-danger text-danger"
      : "border-line bg-plate text-fg";

  return (
    <div className="space-y-7">
      <section aria-labelledby="account-directory-heading">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 size-5 shrink-0 text-fg" aria-hidden="true" />
          <div>
            <h2 id="account-directory-heading" className="text-lg font-semibold text-fg">
              User directory
            </h2>
            <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-fg-2">
              Browse bounded Clerk account metadata or filter by name or email. Workspace content is never included.
            </p>
          </div>
        </div>

        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleFilter}>
          <div className="min-w-0 flex-1">
            <label htmlFor="operator-account-filter" className="label block text-fg-2">
              Name or email
            </label>
            <input
              id="operator-account-filter"
              type="search"
              autoComplete="off"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className={`${ROSTER_INPUT_CLASS_NAME} mt-1.5`}
              placeholder="Filter users"
              maxLength={100}
              disabled={isPending}
            />
          </div>
          <Button type="submit" size="lg" disabled={isPending}>
            <Search aria-hidden="true" />
            {isPending && operation === "directory" ? "Loading…" : "Filter users"}
          </Button>
        </form>

        {directory ? (
          <>
            <DirectoryList
              directory={directory}
              selectedAccountId={account?.clerkUserId ?? null}
              disabled={isPending}
              onSelect={handleSelect}
            />
            <div className="mt-4 flex flex-col gap-3 text-xs text-fg-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                {directory.totalCount === 0
                  ? "0 users"
                  : `Showing ${directory.offset + 1}–${Math.min(directory.offset + directory.limit, directory.totalCount)} of ${directory.totalCount} users`}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending || !directory.hasPreviousPage}
                  onClick={() =>
                    loadDirectory(
                      directory.query,
                      Math.max(0, directory.offset - directory.limit)
                    )
                  }
                >
                  <ChevronLeft aria-hidden="true" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending || !directory.hasNextPage}
                  onClick={() =>
                    loadDirectory(directory.query, directory.offset + directory.limit)
                  }
                >
                  Next
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </>
        ) : null}
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
        <div className="space-y-7 border-t border-line pt-7">
          <section aria-labelledby="account-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="account-heading" className="text-xl font-semibold text-fg">
                  {account.displayName}
                </h2>
                <p className="mt-1 break-words text-sm text-fg-2 [overflow-wrap:anywhere]">
                  {account.email}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-well px-2.5 py-1 text-xs font-medium text-fg-2">
                <ShieldCheck className="size-3.5 text-fg" aria-hidden="true" />
                Selected account
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
                  <DetailRow
                    label="Current beta acknowledgement"
                    value={account.classTrace.hasCurrentBetaAcknowledgement ? "Completed" : "Not completed"}
                  />
                </>
              ) : null}
            </dl>

            <div className="mt-3 grid border-y border-line sm:grid-cols-3">
              <CountCell label="Classes" value={account.classTrace?.counts.classGroups ?? 0} />
              <CountCell label="Students" value={account.classTrace?.counts.rosterStudents ?? 0} />
              <CountCell label="Evidence records" value={account.classTrace?.counts.evidenceRecords ?? 0} />
            </div>
          </section>

          <section aria-labelledby="demo-workspace-heading" className="border-t border-line pt-7">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 size-5 shrink-0 text-fg" aria-hidden="true" />
              <div>
                <h2 id="demo-workspace-heading" className="text-lg font-semibold text-fg">
                  Demo workspace
                </h2>
                <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-fg-2">
                  Load the canonical fictional dataset into this existing workspace.
                </p>
              </div>
            </div>

            {!account.classTrace?.workspaceId ? (
              <p className="mt-4 text-sm font-medium text-fg-2">
                An existing ClassTrace profile and workspace are required.
              </p>
            ) : !account.classTrace.hasCurrentBetaAcknowledgement ? (
              <p className="mt-4 text-sm font-medium text-fg-2">
                The current beta acknowledgement must be completed first.
              </p>
            ) : seedConfirmationOpen ? (
              <form className="mt-4 border border-line bg-well p-4" onSubmit={handleSeedDemo}>
                <p className="text-sm font-semibold text-fg">
                  Existing classes, students, evidence, and photos in this workspace will be replaced.
                </p>
                <p className="mt-2 text-sm text-fg-2">
                  Demo dataset: 3 classes · 14 students · 81 evidence records · 12 photos
                </p>
                {seedRequiresEmail ? (
                  <div className="mt-4">
                    <label htmlFor="demo-seed-confirmation" className="label block text-fg-2">
                      Type {account.email} to confirm
                    </label>
                    <input
                      id="demo-seed-confirmation"
                      type="email"
                      autoComplete="off"
                      value={seedConfirmation}
                      onChange={(event) => setSeedConfirmation(event.target.value)}
                      className={`${ROSTER_INPUT_CLASS_NAME} mt-1.5 max-w-xl`}
                      disabled={isPending}
                    />
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="submit" variant="destructive" disabled={isPending || !seedConfirmed}>
                    {isPending && operation === "demo-seed"
                      ? "Loading demo workspace…"
                      : seedRequiresEmail
                        ? "Replace with demo workspace"
                        : "Seed demo workspace"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => {
                      setSeedConfirmationOpen(false);
                      setSeedConfirmation("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                type="button"
                variant={seedRequiresEmail ? "destructive" : "outline"}
                className="mt-4"
                disabled={isPending}
                onClick={() => setSeedConfirmationOpen(true)}
              >
                {seedRequiresEmail ? "Replace with demo workspace" : "Seed demo workspace"}
              </Button>
            )}
          </section>

          <section aria-labelledby="destructive-actions-heading" className="border-t border-line pt-7">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
              <div>
                <h2 id="destructive-actions-heading" className="text-lg font-semibold text-fg">
                  Destructive actions
                </h2>
                <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-fg-2">
                  These actions are permanent, audited, and intentionally separate.
                </p>
              </div>
            </div>

            {account.isCurrentOperator ? (
              <p role="status" className="mt-4 border border-line bg-well px-4 py-3 text-sm text-fg">
                Self-deletion is blocked for the configured operator account.
              </p>
            ) : (
              <div className="mt-5 divide-y divide-border border-y border-line">
                <div className="py-5">
                  <div className="flex items-start gap-3">
                    <Database className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-fg">Delete ClassTrace data</h3>
                      <p className="mt-1 text-sm leading-relaxed text-fg-2">
                        Deletes the teacher profile, workspace, classes, students, and evidence. The Clerk user remains.
                      </p>

                      {account.classTrace ? (
                        <form className="mt-4 space-y-3" onSubmit={handleWorkspaceDelete}>
                          <div>
                            <label htmlFor="workspace-delete-confirmation" className="label block text-fg-2">
                              Type {account.email} to confirm deletion
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
                        <p className="mt-3 text-sm font-medium text-fg">
                          No ClassTrace data remains.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="py-5">
                  <div className="flex items-start gap-3">
                    <KeyRound className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-fg">Delete Clerk user</h3>
                      <p className="mt-1 text-sm leading-relaxed text-fg-2">
                        Deletes the sign-in identity. This is available only after ClassTrace data is gone.
                      </p>

                      {!account.classTrace ? (
                        <form className="mt-4 space-y-3" onSubmit={handleClerkDelete}>
                          <div>
                            <label htmlFor="clerk-delete-confirmation" className="label block text-fg-2">
                              Type {account.email} to confirm deletion
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
                        <p className="mt-3 text-sm font-medium text-fg-2">
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
