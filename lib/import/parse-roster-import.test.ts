import { describe, expect, it } from "vitest";
import { parseRosterImport } from "@/lib/import/parse-roster-import";

describe("parseRosterImport", () => {
  it("parses one-name-per-line input and derives handles", () => {
    const preview = parseRosterImport("Jeremy\nStacy Lee");

    expect(preview.hasErrors).toBe(false);
    expect(preview.validRows).toMatchObject([
      { rowNumber: 1, displayName: "Jeremy", mentionHandle: "jeremy" },
      { rowNumber: 2, displayName: "Stacy Lee", mentionHandle: "stacy" },
    ]);
  });

  it("parses comma-separated name, handle, and school/local ID", () => {
    const preview = parseRosterImport("Mary, @Mary, M-104");

    expect(preview.validRows).toMatchObject([
      {
        displayName: "Mary",
        mentionHandle: "mary",
        schoolLocalId: "M-104",
      },
    ]);
  });

  it("parses tab-separated name, handle, and school/local ID", () => {
    const preview = parseRosterImport("Jeff\t@jeff\tJ-22");

    expect(preview.validRows).toMatchObject([
      {
        displayName: "Jeff",
        mentionHandle: "jeff",
        schoolLocalId: "J-22",
      },
    ]);
  });

  it("ignores blank lines and rejects empty input", () => {
    expect(parseRosterImport("\n\nMary\n\n").totalRows).toBe(1);
    expect(parseRosterImport("\n\n").error).toBe(
      "No students found. Paste one student per line."
    );
  });

  it("rejects missing names, invalid handles, and too many columns", () => {
    const preview = parseRosterImport(", @mary\nMary, !!!\nMary, mary, M-1, extra");

    expect(preview.invalidRows).toHaveLength(3);
    expect(preview.rows[0].errors).toContain("Student name is required.");
    expect(preview.rows[1].errors).toContain(
      "Handle must include at least one letter or number."
    );
    expect(preview.rows[2].errors).toContain("This row has too many columns.");
  });

  it("detects duplicate handles and school/local IDs inside the import", () => {
    const preview = parseRosterImport("Mary, mary, M-1\nMary Lee, mary, M-1");

    expect(preview.invalidRows).toHaveLength(2);
    expect(preview.rows[0].errors).toContain(
      "This handle appears more than once in the import."
    );
    expect(preview.rows[0].errors).toContain(
      "This school/local ID appears more than once in the import."
    );
  });

  it("detects existing roster handle and school/local ID duplicates", () => {
    const preview = parseRosterImport("Mary, mary, M-1", [
      { mentionHandle: "mary", schoolLocalId: "M-1" },
    ]);

    expect(preview.invalidRows).toHaveLength(1);
    expect(preview.rows[0].errors).toContain(
      "A student with this handle already exists on your roster."
    );
    expect(preview.rows[0].errors).toContain(
      "A student with this school/local ID already exists on your roster."
    );
  });
});
