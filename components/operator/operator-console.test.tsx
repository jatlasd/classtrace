// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  seedDemo: vi.fn(),
  deleteWorkspace: vi.fn(),
  deleteClerkUser: vi.fn(),
}));

vi.mock("@/actions/operator", () => ({
  listOperatorAccountsAction: mocks.list,
  seedOperatorDemoWorkspaceAction: mocks.seedDemo,
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
    hasCurrentBetaAcknowledgement: true,
    counts: {
      classGroups: 2,
      rosterStudents: 12,
      evidenceRecords: 48,
    },
  },
};

function directoryFor(selectedAccount = account) {
  return {
    success: true as const,
    directory: {
      accounts: [selectedAccount],
      query: "",
      offset: 0,
      limit: 20,
      totalCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
}

function selectAccount(selectedAccount = account) {
  render(<OperatorConsole initialDirectory={directoryFor(selectedAccount)} />);
  fireEvent.click(screen.getByRole("button", { name: /view account/i }));
}

describe("OperatorConsole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue(directoryFor());
    mocks.seedDemo.mockResolvedValue({
      success: true,
      account: {
        ...account,
        classTrace: {
          ...account.classTrace,
          counts: {
            classGroups: 3,
            rosterStudents: 14,
            evidenceRecords: 81,
          },
        },
      },
      counts: {
        classGroups: 3,
        rosterStudents: 14,
        evidenceRecords: 81,
        photos: 12,
      },
    });
    mocks.deleteWorkspace.mockResolvedValue({
      success: true,
      deletedCounts: account.classTrace.counts,
    });
    mocks.deleteClerkUser.mockResolvedValue({ success: true });
  });

  it("renders the authorized bounded directory and selects safe account metadata", () => {
    selectAccount();

    expect(screen.getByRole("heading", { name: "User directory" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Stacy Teacher" })).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("48")).toBeTruthy();
    expect(screen.queryByText(/evidence note/i)).toBeNull();
  });

  it("clears the selected account and confirmations after filtering", async () => {
    selectAccount();

    fireEvent.click(
      screen.getByRole("button", { name: "Replace with demo workspace" })
    );
    fireEvent.change(screen.getByLabelText("Type stacy@example.com to confirm"), {
      target: { value: "stacy@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Name or email"), {
      target: { value: "Stacy" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filter users" }));

    expect(mocks.list).toHaveBeenCalledWith({ query: "Stacy", offset: 0 });
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Stacy Teacher" })
      ).toBeNull();
    });

    const refreshedAccount = screen.getByRole("button", {
      name: /view account/i,
    }) as HTMLButtonElement;
    await waitFor(() => expect(refreshedAccount.disabled).toBe(false));
    fireEvent.click(refreshedAccount);
    fireEvent.click(
      screen.getByRole("button", { name: "Replace with demo workspace" })
    );
    expect(
      (screen.getByLabelText(
        "Type stacy@example.com to confirm"
      ) as HTMLInputElement).value
    ).toBe("");
  });

  it("requires email re-entry before replacing a non-empty workspace", async () => {
    selectAccount();

    fireEvent.click(
      screen.getByRole("button", { name: "Replace with demo workspace" })
    );
    expect(
      screen.getByText(
        "Existing classes, students, evidence, and photos in this workspace will be replaced."
      )
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Demo dataset: 3 classes · 14 students · 81 evidence records · 12 photos"
      )
    ).toBeTruthy();

    const confirmButton = screen.getByRole("button", {
      name: "Replace with demo workspace",
    }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Type stacy@example.com to confirm"), {
      target: { value: "stacy@example.com" },
    });
    fireEvent.click(confirmButton);

    expect(mocks.seedDemo).toHaveBeenCalledWith({
      targetClerkUserId: "target_1",
      confirmationEmail: "stacy@example.com",
    });
    expect(
      await screen.findByText(
        "Demo workspace loaded: 3 classes, 14 students, 81 evidence records, and 12 photos."
      )
    ).toBeTruthy();
  });

  it("requires explicit confirmation but no email re-entry for an empty workspace", () => {
    const emptyAccount = {
      ...account,
      classTrace: {
        ...account.classTrace,
        counts: {
          classGroups: 0,
          rosterStudents: 0,
          evidenceRecords: 0,
        },
      },
    };
    selectAccount(emptyAccount);

    fireEvent.click(screen.getByRole("button", { name: "Seed demo workspace" }));

    expect(
      screen.queryByLabelText("Type stacy@example.com to confirm")
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Seed demo workspace" })
    ).toBeTruthy();
    expect(mocks.seedDemo).not.toHaveBeenCalled();
  });

  it("keeps database and Clerk deletion separately confirmed", async () => {
    selectAccount();

    expect(screen.getByText("Delete ClassTrace data first.")).toBeTruthy();
    const workspaceConfirmation = screen.getByLabelText(
      "Type stacy@example.com to confirm deletion"
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

    const clerkConfirmation = screen.getByLabelText(
      "Type stacy@example.com to confirm deletion"
    );
    fireEvent.change(clerkConfirmation, {
      target: { value: "stacy@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Delete Clerk user" }));

    expect(
      await screen.findByText("Clerk user deleted. Select another account when ready.")
    ).toBeTruthy();
  });

  it("shows a safe directory failure as an accessible alert", () => {
    render(
      <OperatorConsole
        initialDirectory={{
          success: false,
          error: "The account directory is not available. Try again.",
        }}
      />
    );

    expect(screen.getByRole("alert").textContent).toBe(
      "The account directory is not available. Try again."
    );
  });
});
