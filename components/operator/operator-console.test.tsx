// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  deleteWorkspace: vi.fn(),
  deleteClerkUser: vi.fn(),
}));

vi.mock("@/actions/operator", () => ({
  searchOperatorAccountAction: mocks.search,
  deleteOperatorWorkspaceDataAction: mocks.deleteWorkspace,
  deleteOperatorClerkUserAction: mocks.deleteClerkUser,
}));

import { OperatorConsole } from "@/components/operator/operator-console";

afterEach(cleanup);

const account = {
  clerkUserId: "target_1",
  email: "stacy@example.com",
  displayName: "Stacy Teacher",
  clerkCreatedAt: "2026-06-01T12:00:00.000Z",
  lastSignInAt: "2026-07-01T15:00:00.000Z",
  isCurrentOperator: false,
  classTrace: {
    teacherProfileId: "teacher_1",
    teacherDisplayName: "Stacy",
    teacherCreatedAt: "2026-06-02T12:00:00.000Z",
    workspaceId: "workspace_1",
    workspaceName: "Personal workspace",
    workspaceCreatedAt: "2026-06-02T12:05:00.000Z",
    counts: {
      classGroups: 2,
      rosterStudents: 12,
      evidenceRecords: 48,
    },
  },
};

describe("OperatorConsole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.search.mockResolvedValue({ success: true, account });
    mocks.deleteWorkspace.mockResolvedValue({
      success: true,
      deletedCounts: account.classTrace.counts,
    });
    mocks.deleteClerkUser.mockResolvedValue({ success: true });
  });

  it("searches one exact email and renders safe metadata with aggregate counts", async () => {
    render(<OperatorConsole />);

    fireEvent.change(screen.getByLabelText("Account email"), {
      target: { value: "stacy@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search account" }));

    expect(await screen.findByRole("heading", { name: "Stacy Teacher" })).toBeTruthy();
    expect(mocks.search).toHaveBeenCalledWith({ email: "stacy@example.com" });
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("48")).toBeTruthy();
    expect(screen.queryByText(/evidence note/i)).toBeNull();
  });

  it("keeps database and Clerk deletion as separately confirmed actions", async () => {
    render(<OperatorConsole />);

    fireEvent.change(screen.getByLabelText("Account email"), {
      target: { value: "stacy@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search account" }));
    await screen.findByRole("heading", { name: "Stacy Teacher" });

    expect(screen.getByText("Delete ClassTrace data first.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Delete Clerk user" })).toBeNull();

    const workspaceConfirmation = screen.getByLabelText(
      "Type stacy@example.com to confirm"
    );
    fireEvent.change(workspaceConfirmation, {
      target: { value: "stacy@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Delete ClassTrace data" })
    );

    expect(await screen.findByText("No ClassTrace data remains.")).toBeTruthy();
    expect(mocks.deleteWorkspace).toHaveBeenCalledWith({
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });
    expect(mocks.deleteClerkUser).not.toHaveBeenCalled();

    const clerkConfirmation = screen.getByLabelText(
      "Type stacy@example.com to confirm"
    );
    fireEvent.change(clerkConfirmation, {
      target: { value: "stacy@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Delete Clerk user" }));

    expect(
      await screen.findByText("Clerk user deleted. Search for another account when ready.")
    ).toBeTruthy();
    expect(mocks.deleteClerkUser).toHaveBeenCalledWith({
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });
  });

  it("shows search failures as accessible alerts", async () => {
    mocks.search.mockResolvedValue({
      success: false,
      error: "No Clerk account matches that exact email address.",
    });
    render(<OperatorConsole />);

    fireEvent.change(screen.getByLabelText("Account email"), {
      target: { value: "mary@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search account" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "No Clerk account matches that exact email address."
    );
  });

  it("clears the selected account after Clerk deletion succeeds but audit completion fails", async () => {
    mocks.search.mockResolvedValue({
      success: true,
      account: { ...account, classTrace: null },
    });
    mocks.deleteClerkUser.mockResolvedValue({
      success: false,
      clerkUserDeleted: true,
      error: "The Clerk user was deleted, but the audit outcome was not updated.",
    });
    render(<OperatorConsole />);

    const accountEmail = screen.getByLabelText("Account email") as HTMLInputElement;
    fireEvent.change(accountEmail, {
      target: { value: "stacy@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search account" }));
    await screen.findByRole("heading", { name: "Stacy Teacher" });

    const clerkConfirmation = screen.getByLabelText(
      "Type stacy@example.com to confirm"
    );
    fireEvent.change(clerkConfirmation, {
      target: { value: "stacy@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Delete Clerk user" }));

    expect((await screen.findByRole("status")).textContent).toBe(
      "The Clerk user was deleted, but the audit outcome was not updated."
    );
    expect(accountEmail.value).toBe("");
    expect(screen.queryByRole("heading", { name: "Stacy Teacher" })).toBeNull();
    expect(
      screen.queryByLabelText("Type stacy@example.com to confirm")
    ).toBeNull();
  });
});
