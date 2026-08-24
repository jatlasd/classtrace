import { INPUT_LIMITS } from "@/lib/validation/input-limits";

const PHOTO_DRAFT_DATABASE = "classtrace-photo-drafts";
const PHOTO_DRAFT_STORE = "photos";
const PHOTO_DRAFT_DATABASE_VERSION = 1;
const PHOTO_DRAFT_SCHEMA_VERSION = 1;
const PHOTO_KEY_PREFIX = "classtrace:photo-draft-key:v1:";
const SUPPORTED_CLIENT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const encoder = new TextEncoder();

type StoredPhotoDraft = {
  key: string;
  version: typeof PHOTO_DRAFT_SCHEMA_VERSION;
  workspaceId: string;
  draftId: string;
  expiresAt: number;
  contentType: "image/webp";
  byteSize: number;
  width: number;
  height: number;
  iv: Uint8Array;
  ciphertext: ArrayBuffer;
};

export type PhotoDraft = {
  blob: Blob;
  contentType: "image/webp";
  byteSize: number;
  width: number;
  height: number;
};

export type NormalizePhotoResult =
  | { success: true; photo: PhotoDraft }
  | { success: false; error: string };

function recordKey(workspaceId: string, draftId: string): string {
  return `${workspaceId}:${draftId}`;
}

function keyStorageName(workspaceId: string): string {
  return `${PHOTO_KEY_PREFIX}${workspaceId}`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array | null {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function getSessionCryptoKey(
  workspaceId: string,
  create: boolean
): Promise<CryptoKey | null> {
  let storage: Storage;
  try {
    storage = window.sessionStorage;
  } catch {
    return null;
  }

  const storageName = keyStorageName(workspaceId);
  let rawKey = base64ToBytes(storage.getItem(storageName) ?? "");
  if ((!rawKey || rawKey.byteLength !== 32) && create) {
    rawKey = crypto.getRandomValues(new Uint8Array(32));
    try {
      storage.setItem(storageName, bytesToBase64(rawKey));
    } catch {
      return null;
    }
  }

  if (!rawKey || rawKey.byteLength !== 32) return null;

  try {
    return await crypto.subtle.importKey(
      "raw",
      rawKey as BufferSource,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );
  } catch {
    return null;
  }
}

function openPhotoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      PHOTO_DRAFT_DATABASE,
      PHOTO_DRAFT_DATABASE_VERSION
    );
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PHOTO_DRAFT_STORE)) {
        const store = database.createObjectStore(PHOTO_DRAFT_STORE, {
          keyPath: "key",
        });
        store.createIndex("workspaceId", "workspaceId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withPhotoStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const database = await openPhotoDatabase();
  try {
    const transaction = database.transaction(PHOTO_DRAFT_STORE, mode);
    const completion = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    const result = await operation(transaction.objectStore(PHOTO_DRAFT_STORE));
    await completion;
    return result;
  } finally {
    database.close();
  }
}

function associatedData(record: Pick<StoredPhotoDraft, "version" | "workspaceId" | "draftId" | "expiresAt">): Uint8Array {
  return encoder.encode(
    `${record.version}:${record.workspaceId}:${record.draftId}:${record.expiresAt}`
  );
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

export async function normalizeEvidencePhoto(
  file: File
): Promise<NormalizePhotoResult> {
  if (
    file.size === 0 ||
    file.size > INPUT_LIMITS.evidencePhotoSourceBytes
  ) {
    return { success: false, error: "Choose a photo smaller than 20 MB." };
  }
  if (!SUPPORTED_CLIENT_IMAGE_TYPES.has(file.type)) {
    return { success: false, error: "Choose a supported still photo." };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { success: false, error: "This photo could not be processed." };
  }

  try {
    const sourceLongEdge = Math.max(bitmap.width, bitmap.height);
    if (sourceLongEdge <= 0) {
      return { success: false, error: "This photo could not be processed." };
    }

    let scale = Math.min(
      1,
      INPUT_LIMITS.evidencePhotoLongEdge / sourceLongEdge
    );
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      return { success: false, error: "This photo could not be processed." };
    }

    for (let attempt = 0; attempt < 7; attempt += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const quality = Math.max(0.42, 0.86 - attempt * 0.08);
      const blob = await canvasBlob(canvas, quality);
      if (!blob || blob.type !== "image/webp") {
        return { success: false, error: "This photo could not be processed." };
      }
      if (blob.size <= INPUT_LIMITS.evidencePhotoStoredBytes) {
        return {
          success: true,
          photo: {
            blob,
            contentType: "image/webp",
            byteSize: blob.size,
            width: canvas.width,
            height: canvas.height,
          },
        };
      }
      scale *= 0.84;
    }

    return {
      success: false,
      error: "This photo could not be reduced below the 1 MB storage limit.",
    };
  } finally {
    bitmap.close();
  }
}

export async function savePhotoDraft(args: {
  workspaceId: string;
  draftId: string;
  expiresAt: number;
  photo: PhotoDraft;
}): Promise<boolean> {
  const cryptoKey = await getSessionCryptoKey(args.workspaceId, true);
  if (!cryptoKey) return false;

  try {
    const currentRecords = await withPhotoStore("readonly", (store) =>
      requestResult(store.getAll() as IDBRequest<StoredPhotoDraft[]>)
    );
    const currentKey = recordKey(args.workspaceId, args.draftId);
    const otherBytes = currentRecords.reduce(
      (total, record) => total + (record.key === currentKey ? 0 : record.byteSize),
      0
    );
    if (
      otherBytes + args.photo.byteSize >
      INPUT_LIMITS.localEvidencePhotoBytes
    ) {
      return false;
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const baseRecord = {
      key: currentKey,
      version: PHOTO_DRAFT_SCHEMA_VERSION,
      workspaceId: args.workspaceId,
      draftId: args.draftId,
      expiresAt: args.expiresAt,
      contentType: args.photo.contentType,
      byteSize: args.photo.byteSize,
      width: args.photo.width,
      height: args.photo.height,
      iv,
    } satisfies Omit<StoredPhotoDraft, "ciphertext">;
    const plaintext = await args.photo.blob.arrayBuffer();
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
        additionalData: associatedData(baseRecord) as BufferSource,
      },
      cryptoKey,
      plaintext as BufferSource
    );

    await withPhotoStore("readwrite", async (store) => {
      await requestResult(store.put({ ...baseRecord, ciphertext }));
    });
    return true;
  } catch {
    return false;
  }
}

export async function loadPhotoDraft(
  workspaceId: string,
  draftId: string,
  now = Date.now()
): Promise<PhotoDraft | null> {
  const cryptoKey = await getSessionCryptoKey(workspaceId, false);
  if (!cryptoKey) return null;

  try {
    const record = await withPhotoStore("readonly", (store) =>
      requestResult(
        store.get(recordKey(workspaceId, draftId)) as IDBRequest<
          StoredPhotoDraft | undefined
        >
      )
    );
    if (
      !record ||
      record.version !== PHOTO_DRAFT_SCHEMA_VERSION ||
      record.workspaceId !== workspaceId ||
      record.draftId !== draftId ||
      record.expiresAt <= now ||
      record.contentType !== "image/webp" ||
      record.byteSize <= 0 ||
      record.byteSize > INPUT_LIMITS.evidencePhotoStoredBytes ||
      record.width <= 0 ||
      record.height <= 0 ||
      Math.max(record.width, record.height) > INPUT_LIMITS.evidencePhotoLongEdge
    ) {
      await removePhotoDraft(workspaceId, draftId);
      return null;
    }

    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: record.iv as BufferSource,
        additionalData: associatedData(record) as BufferSource,
      },
      cryptoKey,
      record.ciphertext as BufferSource
    );
    if (plaintext.byteLength !== record.byteSize) {
      await removePhotoDraft(workspaceId, draftId);
      return null;
    }

    return {
      blob: new Blob([plaintext], { type: "image/webp" }),
      contentType: "image/webp",
      byteSize: record.byteSize,
      width: record.width,
      height: record.height,
    };
  } catch {
    await removePhotoDraft(workspaceId, draftId);
    return null;
  }
}

export async function removePhotoDraft(
  workspaceId: string,
  draftId: string
): Promise<void> {
  try {
    await withPhotoStore("readwrite", async (store) => {
      await requestResult(store.delete(recordKey(workspaceId, draftId)));
    });
  } catch {
    // Local recovery is best-effort; the active in-memory preview remains usable.
  }
}

export async function pruneExpiredPhotoDrafts(now = Date.now()): Promise<void> {
  try {
    await withPhotoStore("readwrite", async (store) => {
      const records = await requestResult(
        store.getAll() as IDBRequest<StoredPhotoDraft[]>
      );
      const expiredRecords = records.filter((record) => record.expiresAt <= now);
      await Promise.all(
        expiredRecords.map((record) => requestResult(store.delete(record.key)))
      );
    });
  } catch {
    // Stale local data is retried at the next lifecycle boundary.
  }
}

export function clearPhotoDraftSessionKey(workspaceId: string): void {
  try {
    window.sessionStorage.removeItem(keyStorageName(workspaceId));
  } catch {
    // The current tab is already unable to use the recovery key.
  }
}

export async function clearAllPhotoDrafts(): Promise<void> {
  try {
    const storage = window.sessionStorage;
    const keys: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(PHOTO_KEY_PREFIX)) keys.push(key);
    }
    for (const key of keys) storage.removeItem(key);
  } catch {
    // Continue deleting IndexedDB even when session storage is unavailable.
  }

  try {
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(PHOTO_DRAFT_DATABASE);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  } catch {
    // Logout still removes the usable session key when IndexedDB is blocked.
  }
}
