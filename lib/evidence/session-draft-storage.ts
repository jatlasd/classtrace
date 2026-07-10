export const SESSION_DRAFT_STORAGE_KEY = "classtrace:session-drafts:v1";

const SESSION_DRAFT_VERSION = 1;
const MAX_SESSION_DRAFTS = 500;
const MAX_RAW_NOTE_LENGTH = 100_000;
const MAX_IDENTIFIER_LENGTH = 200;

export type SessionDraftRecord = {
  id: string;
  rawNote: string;
  capturedAt: number;
};

export type SessionDraftStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

type SessionDraftPayload = {
  version: typeof SESSION_DRAFT_VERSION;
  workspaceId: string;
  expiresAt: number;
  drafts: SessionDraftRecord[];
};

export type SessionDraftLoadResult = {
  drafts: SessionDraftRecord[];
  expiresAt: number;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_IDENTIFIER_LENGTH
  );
}

function isSessionDraftRecord(value: unknown): value is SessionDraftRecord {
  if (!isObject(value)) {
    return false;
  }

  return (
    isBoundedIdentifier(value.id) &&
    typeof value.rawNote === "string" &&
    value.rawNote.trim().length > 0 &&
    value.rawNote.length <= MAX_RAW_NOTE_LENGTH &&
    typeof value.capturedAt === "number" &&
    Number.isFinite(value.capturedAt) &&
    value.capturedAt > 0
  );
}

function isPayloadShape(value: unknown): value is SessionDraftPayload {
  if (!isObject(value)) {
    return false;
  }

  return (
    value.version === SESSION_DRAFT_VERSION &&
    isBoundedIdentifier(value.workspaceId) &&
    typeof value.expiresAt === "number" &&
    Number.isFinite(value.expiresAt) &&
    Array.isArray(value.drafts)
  );
}

function sameLocalCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function nextLocalMidnight(now = Date.now()): number {
  const localNow = new Date(now);

  return new Date(
    localNow.getFullYear(),
    localNow.getMonth(),
    localNow.getDate() + 1,
    0,
    0,
    0,
    0
  ).getTime();
}

export function isCurrentLocalDay(
  capturedAt: number,
  now = Date.now()
): boolean {
  if (!Number.isFinite(capturedAt) || capturedAt <= 0) {
    return false;
  }

  return sameLocalCalendarDay(new Date(capturedAt), new Date(now));
}

export function clearSessionDrafts(storage: SessionDraftStorage | null): void {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(SESSION_DRAFT_STORAGE_KEY);
  } catch {
    // Browser storage is best-effort. The current React state remains usable.
  }
}

function writePayload(
  storage: SessionDraftStorage,
  payload: SessionDraftPayload
): boolean {
  try {
    storage.setItem(SESSION_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadSessionDrafts(
  storage: SessionDraftStorage | null,
  workspaceId: string,
  now = Date.now()
): SessionDraftLoadResult {
  const emptyResult = { drafts: [], expiresAt: nextLocalMidnight(now) };

  if (!storage || !isBoundedIdentifier(workspaceId)) {
    return emptyResult;
  }

  let rawPayload: string | null;

  try {
    rawPayload = storage.getItem(SESSION_DRAFT_STORAGE_KEY);
  } catch {
    return emptyResult;
  }

  if (!rawPayload) {
    return emptyResult;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawPayload) as unknown;
  } catch {
    clearSessionDrafts(storage);
    return emptyResult;
  }

  if (
    !isPayloadShape(parsed) ||
    parsed.workspaceId !== workspaceId ||
    parsed.expiresAt <= now
  ) {
    clearSessionDrafts(storage);
    return emptyResult;
  }

  const drafts = parsed.drafts
    .filter(isSessionDraftRecord)
    .filter((draft) => isCurrentLocalDay(draft.capturedAt, now))
    .slice(0, MAX_SESSION_DRAFTS);

  if (drafts.length === 0) {
    clearSessionDrafts(storage);
    return emptyResult;
  }

  const expiresAt = nextLocalMidnight(now);
  const sanitizedPayload: SessionDraftPayload = {
    version: SESSION_DRAFT_VERSION,
    workspaceId,
    expiresAt,
    drafts,
  };

  if (
    drafts.length !== parsed.drafts.length ||
    parsed.expiresAt !== expiresAt
  ) {
    writePayload(storage, sanitizedPayload);
  }

  return { drafts, expiresAt };
}

export function saveSessionDrafts(
  storage: SessionDraftStorage | null,
  workspaceId: string,
  drafts: SessionDraftRecord[],
  now = Date.now()
): boolean {
  if (!storage || !isBoundedIdentifier(workspaceId)) {
    return false;
  }

  const validDrafts = drafts
    .filter(isSessionDraftRecord)
    .filter((draft) => isCurrentLocalDay(draft.capturedAt, now))
    .slice(0, MAX_SESSION_DRAFTS);

  if (validDrafts.length === 0) {
    clearSessionDrafts(storage);
    return true;
  }

  return writePayload(storage, {
    version: SESSION_DRAFT_VERSION,
    workspaceId,
    expiresAt: nextLocalMidnight(now),
    drafts: validDrafts,
  });
}

export function removeSessionDraft(
  storage: SessionDraftStorage | null,
  workspaceId: string,
  draftId: string,
  now = Date.now()
): void {
  if (!storage || !isBoundedIdentifier(draftId)) {
    return;
  }

  const current = loadSessionDrafts(storage, workspaceId, now);
  saveSessionDrafts(
    storage,
    workspaceId,
    current.drafts.filter((draft) => draft.id !== draftId),
    now
  );
}

export function upsertSessionDraft(
  storage: SessionDraftStorage | null,
  workspaceId: string,
  draft: SessionDraftRecord,
  now = Date.now()
): void {
  if (!storage || !isSessionDraftRecord(draft)) {
    return;
  }

  const current = loadSessionDrafts(storage, workspaceId, now);
  saveSessionDrafts(
    storage,
    workspaceId,
    [draft, ...current.drafts.filter((item) => item.id !== draft.id)],
    now
  );
}
