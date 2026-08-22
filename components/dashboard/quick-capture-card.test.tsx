// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ normalizeEvidencePhoto: vi.fn() }));
vi.mock("@/lib/evidence/photo-draft-storage", () => ({
  normalizeEvidencePhoto: mocks.normalizeEvidencePhoto,
}));
import { QuickCaptureCard } from "./quick-capture-card";

const roster = [
  {
    id: "student_mary",
    displayName: "Mary",
    mentionHandle: "mary",
    classGroupName: "Reading",
  },
];

beforeEach(() => {
  mocks.normalizeEvidencePhoto.mockResolvedValue({
    success: true,
    photo: {
      blob: new Blob([new Uint8Array([1, 2, 3])], { type: "image/webp" }),
      contentType: "image/webp",
      byteSize: 3,
      width: 100,
      height: 80,
    },
  });
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:preview"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("QuickCaptureCard mentions editor", () => {
  it("keeps the input and highlight layers on identical text metrics", () => {
    render(<QuickCaptureCard rosterStudents={roster} onDraft={vi.fn()} />);
    const input = screen.getByLabelText("What happened?") as HTMLTextAreaElement;
    const highlighter = input.previousElementSibling as HTMLDivElement;

    for (const property of [
      "boxSizing",
      "width",
      "margin",
      "padding",
      "border",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "textAlign",
      "whiteSpace",
      "overflowWrap",
      "wordBreak",
    ] as const) {
      expect(input.style[property]).toBe(highlighter.style[property]);
    }

    expect(input.style.border).toBe("0px");
    expect(input.style.lineHeight).toBe("22.5px");
  });

  it("selects a mention without changing its text width", async () => {
    const { container } = render(
      <QuickCaptureCard rosterStudents={roster} onDraft={vi.fn()} />
    );
    const input = screen.getByLabelText("What happened?") as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "@ma" } });
    input.setSelectionRange(3, 3);
    fireEvent.select(input);
    fireEvent.click(await screen.findByRole("option", { name: "Mary" }));

    const mention = await waitFor(() => {
      const element = container.querySelector(".quick-capture-mentions strong");
      expect(element).toBeTruthy();
      return element;
    });
    expect(mention).toBeTruthy();
    expect((mention as HTMLElement).style.fontWeight).toBe("inherit");
    expect((mention as HTMLElement).style.backgroundColor).toContain("var(--link)");
  });

  it("captures one unresolved handle for later review", async () => {
    const onDraft = vi.fn();
    render(<QuickCaptureCard rosterStudents={roster} onDraft={onDraft} />);

    fireEvent.change(screen.getByLabelText("What happened?"), {
      target: { value: "@Stacy completed the task independently." },
    });

    expect(
      await screen.findByText(
        "Ready to capture. You'll resolve @Stacy before saving."
      )
    ).toBeTruthy();
    const captureButton = screen.getByRole("button", { name: "Capture" });
    expect((captureButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(captureButton);

    expect(onDraft).toHaveBeenCalledOnce();
  });

  it("continues to block two distinct student handles", async () => {
    render(<QuickCaptureCard rosterStudents={roster} onDraft={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("What happened?"), {
      target: { value: "@Mary helped @Stacy with reading." },
    });

    expect(await screen.findByText("Choose one student for this capture.")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Capture" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it.each(["Choose photo", "Take photo"])(
    "captures a photo-only draft from %s without making a network request",
    async (photoInputLabel) => {
    const onDraft = vi.fn();
    const networkRequest = vi.fn();
    vi.stubGlobal("fetch", networkRequest);
    render(<QuickCaptureCard rosterStudents={roster} onDraft={onDraft} />);

    fireEvent.change(screen.getByLabelText(photoInputLabel), {
      target: {
        files: [new File([new Uint8Array([9])], "work-sample.png", { type: "image/png" })],
      },
    });

    expect(await screen.findByText("Photo ready")).toBeTruthy();
    const captureButton = screen.getByRole("button", { name: "Capture" });
    expect((captureButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(captureButton);

    await waitFor(() => expect(onDraft).toHaveBeenCalledOnce());
    expect(onDraft.mock.calls[0][0].parsed.rawNote).toBe("");
    expect(onDraft.mock.calls[0][2]).toMatchObject({
      contentType: "image/webp",
      byteSize: 3,
    });
    expect(networkRequest).not.toHaveBeenCalled();
    }
  );
});
