import { describe, expect, it, vi } from "vitest";
import {
  SESSION_DRAFT_STORAGE_KEY,
  clearSessionDrafts,
  isCurrentLocalDay,
  loadSessionDrafts,
  nextLocalMidnight,
  removeSessionDraft,
  saveSessionDrafts,
  upsertSessionDraft,
  type SessionDraftStorage,
} from "./session-draft-storage";

class MemoryStorage implements SessionDraftStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const workspaceId = "workspace_1";
const capturedAt = new Date(2026, 6, 10, 9, 30).getTime();
const now = new Date(2026, 6, 10, 10, 0).getTime();

function draft(overrides: Partial<{ id: string; rawNote: string; capturedAt: number }> = {}) {
  return {
    id: "draft_1",
    rawNote: "@Jeremy did thing #thing",
    capturedAt,
    ...overrides,
  };
}

describe("session draft storage", () => {
  it("stores only the versioned minimal session-draft shape", () => {
    const storage = new MemoryStorage();

    expect(saveSessionDrafts(storage, workspaceId, [draft()], now)).toBe(true);

    const raw = storage.getItem(SESSION_DRAFT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const payload = JSON.parse(raw ?? "{}") as Record<string, unknown>;

    expect(Object.keys(payload).sort()).toEqual([
      "drafts",
      "expiresAt",
      "version",
      "workspaceId",
    ]);
    expect(payload).toMatchObject({
      version: 1,
      workspaceId,
      expiresAt: nextLocalMidnight(now),
      drafts: [draft()],
    });
    expect(raw).not.toMatch(/evidenceNote|validation|studentDisplayName|savedEvidenceId/);
  });

  it("restores valid same-workspace drafts before local midnight", () => {
    const storage = new MemoryStorage();
    saveSessionDrafts(storage, workspaceId, [draft()], now);

    expect(loadSessionDrafts(storage, workspaceId, now)).toEqual({
      drafts: [draft()],
      expiresAt: nextLocalMidnight(now),
    });
  });

  it("fails closed for a different workspace", () => {
    const storage = new MemoryStorage();
    saveSessionDrafts(storage, workspaceId, [draft()], now);

    expect(loadSessionDrafts(storage, "workspace_2", now).drafts).toEqual([]);
    expect(storage.getItem(SESSION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("removes malformed JSON and unsupported versions", () => {
    const malformedStorage = new MemoryStorage();
    malformedStorage.setItem(SESSION_DRAFT_STORAGE_KEY, "{not-json");

    expect(loadSessionDrafts(malformedStorage, workspaceId, now).drafts).toEqual([]);
    expect(malformedStorage.getItem(SESSION_DRAFT_STORAGE_KEY)).toBeNull();

    const oldStorage = new MemoryStorage();
    oldStorage.setItem(
      SESSION_DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: 0,
        workspaceId,
        expiresAt: nextLocalMidnight(now),
        drafts: [draft()],
      })
    );

    expect(loadSessionDrafts(oldStorage, workspaceId, now).drafts).toEqual([]);
    expect(oldStorage.getItem(SESSION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("sanitizes malformed individual records without losing valid drafts", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      SESSION_DRAFT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        workspaceId,
        expiresAt: nextLocalMidnight(now),
        drafts: [draft(), { id: "draft_2", rawNote: "   ", capturedAt }],
      })
    );

    expect(loadSessionDrafts(storage, workspaceId, now).drafts).toEqual([draft()]);
    expect(storage.getItem(SESSION_DRAFT_STORAGE_KEY)).not.toContain("draft_2");
  });

  it("purges drafts at the next device-local calendar day", () => {
    const storage = new MemoryStorage();
    saveSessionDrafts(storage, workspaceId, [draft()], now);
    const midnight = nextLocalMidnight(now);

    expect(loadSessionDrafts(storage, workspaceId, midnight - 1).drafts).toEqual([
      draft(),
    ]);
    expect(loadSessionDrafts(storage, workspaceId, midnight).drafts).toEqual([]);
    expect(storage.getItem(SESSION_DRAFT_STORAGE_KEY)).toBeNull();
    expect(isCurrentLocalDay(capturedAt, midnight)).toBe(false);
  });

  it("constructs local midnight from calendar fields instead of adding 24 hours", () => {
    const localNow = new Date(2026, 2, 8, 0, 0, 0, 0);
    const expected = new Date(2026, 2, 9, 0, 0, 0, 0);

    expect(nextLocalMidnight(localNow.getTime())).toBe(expected.getTime());

    if (localNow.getTimezoneOffset() !== expected.getTimezoneOffset()) {
      expect(nextLocalMidnight(localNow.getTime()) - localNow.getTime()).not.toBe(
        24 * 60 * 60 * 1000
      );
    }
  });

  it("updates raw text while preserving draft identity and capture time", () => {
    const storage = new MemoryStorage();
    saveSessionDrafts(storage, workspaceId, [draft()], now);
    upsertSessionDraft(
      storage,
      workspaceId,
      draft({ rawNote: "@Jeremy did a different thing #thing" }),
      now
    );

    expect(loadSessionDrafts(storage, workspaceId, now).drafts).toEqual([
      draft({ rawNote: "@Jeremy did a different thing #thing" }),
    ]);
  });

  it("removes one draft and removes the key after the last draft", () => {
    const storage = new MemoryStorage();
    saveSessionDrafts(
      storage,
      workspaceId,
      [draft(), draft({ id: "draft_2" })],
      now
    );

    removeSessionDraft(storage, workspaceId, "draft_1", now);
    expect(loadSessionDrafts(storage, workspaceId, now).drafts).toEqual([
      draft({ id: "draft_2" }),
    ]);

    removeSessionDraft(storage, workspaceId, "draft_2", now);
    expect(storage.getItem(SESSION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("degrades safely when browser storage throws without logging raw notes", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const throwingStorage: SessionDraftStorage = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
    };

    expect(() => loadSessionDrafts(throwingStorage, workspaceId, now)).not.toThrow();
    expect(saveSessionDrafts(throwingStorage, workspaceId, [draft()], now)).toBe(
      false
    );
    expect(() => clearSessionDrafts(throwingStorage)).not.toThrow();
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
