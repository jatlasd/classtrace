import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentWorkspace: vi.fn(),
  getEvidencePhotoForWorkspace: vi.fn(),
  captureOperationalError: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-workspace", () => ({
  getCurrentWorkspace: mocks.getCurrentWorkspace,
}));
vi.mock("@/lib/evidence/get-evidence-photo", () => ({
  getEvidencePhotoForWorkspace: mocks.getEvidencePhotoForWorkspace,
}));
vi.mock("@/lib/monitoring/capture-operational-error", () => ({
  captureOperationalError: mocks.captureOperationalError,
}));

import { GET } from "./route";

describe("authenticated evidence photo route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentWorkspace.mockResolvedValue({ workspaceId: "workspace_1" });
  });

  it("returns owned bytes with private no-store and nosniff headers", async () => {
    mocks.getEvidencePhotoForWorkspace.mockResolvedValue({
      imageData: new Uint8Array([1, 2, 3]),
      contentType: "image/webp",
    });

    const response = await GET(new Request("https://example.test"), {
      params: Promise.resolve({ evidenceId: "evidence_1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3])
    );
  });

  it("uses the same unavailable response for missing and failed reads", async () => {
    mocks.getEvidencePhotoForWorkspace.mockResolvedValueOnce(null);
    const missing = await GET(new Request("https://example.test"), {
      params: Promise.resolve({ evidenceId: "missing" }),
    });

    mocks.getCurrentWorkspace.mockRejectedValueOnce(new Error("unavailable"));
    const failed = await GET(new Request("https://example.test"), {
      params: Promise.resolve({ evidenceId: "elsewhere" }),
    });

    expect(missing.status).toBe(404);
    expect(failed.status).toBe(404);
    expect(await missing.text()).toBe(await failed.text());
    expect(failed.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.captureOperationalError).toHaveBeenCalledWith(
      "evidence.photo-read",
      expect.any(Error)
    );
  });
});
