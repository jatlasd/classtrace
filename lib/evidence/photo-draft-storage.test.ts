// @vitest-environment jsdom

import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAllPhotoDrafts,
  clearPhotoDraftSessionKey,
  loadPhotoDraft,
  normalizeEvidencePhoto,
  prunePhotoDrafts,
  removePhotoDraft,
  savePhotoDraft,
  type PhotoDraft,
} from "./photo-draft-storage";

type FakeRecord = Record<string, unknown> & { key: string };

function installIndexedDb() {
  const records = new Map<string, FakeRecord>();
  let storeCreated = false;

  function request<T>(result: T, complete?: () => void) {
    const value = {
      result: undefined as T,
      error: null,
      onsuccess: null as ((event: Event) => void) | null,
      onerror: null as ((event: Event) => void) | null,
    };
    queueMicrotask(() => {
      value.result = result;
      value.onsuccess?.(new Event("success"));
      queueMicrotask(() => complete?.());
    });
    return value as unknown as IDBRequest<T>;
  }

  const database = {
    objectStoreNames: { contains: () => storeCreated },
    createObjectStore: () => {
      storeCreated = true;
      return { createIndex: () => undefined };
    },
    transaction: () => {
      const transaction = {
        error: null,
        oncomplete: null as ((event: Event) => void) | null,
        onerror: null as ((event: Event) => void) | null,
        onabort: null as ((event: Event) => void) | null,
        objectStore: () => ({
          getAll: () =>
            request(
              [...records.values()],
              () => transaction.oncomplete?.(new Event("complete"))
            ),
          get: (key: string) =>
            request(
              records.get(key),
              () => transaction.oncomplete?.(new Event("complete"))
            ),
          put: (record: FakeRecord) => {
            records.set(record.key, record);
            return request(
              record.key,
              () => transaction.oncomplete?.(new Event("complete"))
            );
          },
          delete: (key: string) => {
            records.delete(key);
            return request(
              undefined,
              () => transaction.oncomplete?.(new Event("complete"))
            );
          },
        }),
      };
      return transaction;
    },
    close: () => undefined,
  };

  const indexedDb = {
    open: () => {
      const openRequest = {
        result: database,
        error: null,
        onupgradeneeded: null as ((event: Event) => void) | null,
        onsuccess: null as ((event: Event) => void) | null,
        onerror: null as ((event: Event) => void) | null,
      };
      queueMicrotask(() => {
        if (!storeCreated) openRequest.onupgradeneeded?.(new Event("upgradeneeded"));
        openRequest.onsuccess?.(new Event("success"));
      });
      return openRequest;
    },
    deleteDatabase: () => {
      records.clear();
      const deleteRequest = {
        onsuccess: null as ((event: Event) => void) | null,
        onerror: null as ((event: Event) => void) | null,
        onblocked: null as ((event: Event) => void) | null,
      };
      queueMicrotask(() => deleteRequest.onsuccess?.(new Event("success")));
      return deleteRequest;
    },
  };

  Object.defineProperty(globalThis, "indexedDB", {
    configurable: true,
    value: indexedDb,
  });
  return records;
}

function photo(bytes = [1, 2, 3]): PhotoDraft {
  return {
    blob: new Blob([new Uint8Array(bytes)], { type: "image/webp" }),
    contentType: "image/webp",
    byteSize: bytes.length,
    width: 320,
    height: 240,
  };
}

describe("local photo draft storage", () => {
  let records: Map<string, FakeRecord>;

  beforeEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: webcrypto,
    });
    window.sessionStorage.clear();
    records = installIndexedDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("normalizes a still photo locally and rejects source limits before decoding", async () => {
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({ width: 4_096, height: 2_048, close })
    );
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        fillStyle: "",
        fillRect: vi.fn(),
        drawImage: vi.fn(),
      }),
      toBlob: (callback: BlobCallback) =>
        callback(new Blob([new Uint8Array([1, 2, 3])], { type: "image/webp" })),
    };
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName) =>
      tagName === "canvas"
        ? (canvas as unknown as HTMLCanvasElement)
        : createElement(tagName)
    );

    const result = await normalizeEvidencePhoto(
      new File([new Uint8Array([1])], "ignored-name.jpg", {
        type: "image/jpeg",
      })
    );
    expect(result).toMatchObject({
      success: true,
      photo: { contentType: "image/webp", width: 2_048, height: 1_024 },
    });
    expect(close).toHaveBeenCalledOnce();

    const oversized = new File([new Uint8Array([1])], "large.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(oversized, "size", { value: 20 * 1024 * 1024 + 1 });
    await expect(normalizeEvidencePhoto(oversized)).resolves.toMatchObject({
      success: false,
    });
    expect(createImageBitmap).toHaveBeenCalledOnce();
    await expect(
      normalizeEvidencePhoto(
        new File([new Uint8Array([1])], "notes.pdf", {
          type: "application/pdf",
        })
      )
    ).resolves.toMatchObject({ success: false });
  });

  it("restores encrypted photo bytes only inside the same workspace session", async () => {
    expect(
      await savePhotoDraft({
        workspaceId: "workspace_1",
        draftId: "draft_1",
        expiresAt: 2_000,
        photo: photo(),
      })
    ).toBe(true);

    const stored = records.get("workspace_1:draft_1");
    expect(stored).toMatchObject({
      workspaceId: "workspace_1",
      draftId: "draft_1",
      contentType: "image/webp",
      byteSize: 3,
    });
    expect(stored).toHaveProperty("ciphertext");
    expect(stored).not.toHaveProperty("blob");
    expect(await loadPhotoDraft("workspace_2", "draft_1", 1_000)).toBeNull();

    const restored = await loadPhotoDraft("workspace_1", "draft_1", 1_000);
    expect(restored).toMatchObject({ byteSize: 3, width: 320, height: 240 });
    expect(
      Array.from(new Uint8Array(await restored!.blob.arrayBuffer()))
    ).toEqual([1, 2, 3]);

    clearPhotoDraftSessionKey("workspace_1");
    expect(await loadPhotoDraft("workspace_1", "draft_1", 1_000)).toBeNull();
  });

  it("removes expired, deleted, malformed, and logged-out photo drafts", async () => {
    await savePhotoDraft({
      workspaceId: "workspace_1",
      draftId: "expired",
      expiresAt: 900,
      photo: photo(),
    });
    expect(await loadPhotoDraft("workspace_1", "expired", 1_000)).toBeNull();
    expect(records.has("workspace_1:expired")).toBe(false);

    await savePhotoDraft({
      workspaceId: "workspace_1",
      draftId: "malformed",
      expiresAt: 2_000,
      photo: photo(),
    });
    records.get("workspace_1:malformed")!.width = 4_096;
    expect(await loadPhotoDraft("workspace_1", "malformed", 1_000)).toBeNull();

    await savePhotoDraft({
      workspaceId: "workspace_1",
      draftId: "deleted",
      expiresAt: 2_000,
      photo: photo(),
    });
    await removePhotoDraft("workspace_1", "deleted");
    expect(records.has("workspace_1:deleted")).toBe(false);

    await savePhotoDraft({
      workspaceId: "workspace_1",
      draftId: "stale",
      expiresAt: 2_000,
      photo: photo(),
    });
    await prunePhotoDrafts("workspace_1", new Set(), 1_000);
    expect(records.size).toBe(0);

    await savePhotoDraft({
      workspaceId: "workspace_1",
      draftId: "logout",
      expiresAt: 2_000,
      photo: photo(),
    });
    await clearAllPhotoDrafts();
    expect(records.size).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });
});
