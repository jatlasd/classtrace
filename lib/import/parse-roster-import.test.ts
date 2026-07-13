import { describe, expect, it } from "vitest";
import { parseRosterImport } from "@/lib/import/parse-roster-import";
import { INPUT_LIMITS } from "@/lib/validation/input-limits";

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

  it("rejects oversized imports, row counts, lines, and fields", () => {
    expect(
      parseRosterImport("x".repeat(INPUT_LIMITS.rosterImportText + 1)).error
    ).toContain("characters or fewer");

    const tooManyRows = Array.from(
      { length: INPUT_LIMITS.rosterImportRows + 1 },
      (_, index) => `Student ${index}`
    ).join("\n");
    expect(parseRosterImport(tooManyRows).error).toContain("students or fewer");

    const longLine = parseRosterImport(
      `${"Mary".padEnd(INPUT_LIMITS.rosterImportLine + 1, "x")}, mary`
    );
    expect(longLine.rows[0].errors).toContain(
      `Each import row must be ${INPUT_LIMITS.rosterImportLine.toLocaleString()} characters or fewer.`
    );

    const longName = parseRosterImport(
      `${"M".repeat(INPUT_LIMITS.displayName + 1)}, mary`
    );
    expect(longName.rows[0].errors).toContain(
      `Student name must be ${INPUT_LIMITS.displayName} characters or fewer.`
    );
  });
});
