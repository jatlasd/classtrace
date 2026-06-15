import { deriveMentionHandle } from "@/lib/students/derive-mention-handle";
import { normalizeMentionHandle } from "@/lib/students/normalize-mention-handle";

export type ExistingRosterImportStudent = {
  mentionHandle: string;
  schoolLocalId: string | null;
};

export type RosterImportPreviewRow = {
  rowNumber: number;
  originalText: string;
  displayName: string;
  mentionHandle: string;
  schoolLocalId: string | null;
  errors: string[];
};

export type RosterImportPreview = {
  rows: RosterImportPreviewRow[];
  validRows: RosterImportPreviewRow[];
  invalidRows: RosterImportPreviewRow[];
  totalRows: number;
  hasErrors: boolean;
  error: string | null;
};

function splitRosterImportLine(line: string): string[] {
  const delimiter = line.includes("\t") ? "\t" : ",";
  return line.split(delimiter).map((part) => part.trim());
}

function normalizeOptionalSchoolLocalId(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function countValues(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

export function parseRosterImport(
  rosterText: string,
  existingStudents: ExistingRosterImportStudent[] = []
): RosterImportPreview {
  const lines = rosterText
    .split(/\r?\n/)
    .map((line, index) => ({ text: line.trim(), rowNumber: index + 1 }))
    .filter((line) => line.text.length > 0);

  if (lines.length === 0) {
    return {
      rows: [],
      validRows: [],
      invalidRows: [],
      totalRows: 0,
      hasErrors: true,
      error: "No students found. Paste one student per line.",
    };
  }

  const existingHandles = new Set(
    existingStudents.map((student) => student.mentionHandle.toLowerCase())
  );
  const existingSchoolLocalIds = new Set(
    existingStudents
      .map((student) => student.schoolLocalId?.trim())
      .filter((schoolLocalId): schoolLocalId is string => Boolean(schoolLocalId))
  );

  const rows = lines.map((line): RosterImportPreviewRow => {
    const columns = splitRosterImportLine(line.text);
    const errors: string[] = [];
    const displayName = columns[0]?.trim() ?? "";
    const suppliedHandle = columns[1]?.trim();
    const handleInput = suppliedHandle || deriveMentionHandle(displayName);
    const normalizedHandle = normalizeMentionHandle(handleInput);
    const schoolLocalId = normalizeOptionalSchoolLocalId(columns[2]);

    if (columns.length > 3) {
      errors.push("This row has too many columns.");
    }

    if (!displayName) {
      errors.push("Student name is required.");
    }

    if (!normalizedHandle.success) {
      errors.push(normalizedHandle.error);
    }

    return {
      rowNumber: line.rowNumber,
      originalText: line.text,
      displayName,
      mentionHandle: normalizedHandle.success ? normalizedHandle.mentionHandle : "",
      schoolLocalId,
      errors,
    };
  });

  const handleCounts = countValues(
    rows.map((row) => row.mentionHandle).filter((handle) => handle.length > 0)
  );
  const schoolLocalIdCounts = countValues(
    rows
      .map((row) => row.schoolLocalId)
      .filter((schoolLocalId): schoolLocalId is string => Boolean(schoolLocalId))
  );

  const rowsWithDuplicateErrors = rows.map((row): RosterImportPreviewRow => {
    const errors = [...row.errors];

    if (row.mentionHandle) {
      if ((handleCounts.get(row.mentionHandle) ?? 0) > 1) {
        errors.push("This handle appears more than once in the import.");
      }

      if (existingHandles.has(row.mentionHandle)) {
        errors.push("A student with this handle already exists on your roster.");
      }
    }

    if (row.schoolLocalId) {
      if ((schoolLocalIdCounts.get(row.schoolLocalId) ?? 0) > 1) {
        errors.push("This school/local ID appears more than once in the import.");
      }

      if (existingSchoolLocalIds.has(row.schoolLocalId)) {
        errors.push(
          "A student with this school/local ID already exists on your roster."
        );
      }
    }

    return { ...row, errors };
  });

  const invalidRows = rowsWithDuplicateErrors.filter((row) => row.errors.length > 0);
  const validRows = rowsWithDuplicateErrors.filter((row) => row.errors.length === 0);

  return {
    rows: rowsWithDuplicateErrors,
    validRows,
    invalidRows,
    totalRows: rowsWithDuplicateErrors.length,
    hasErrors: invalidRows.length > 0,
    error: invalidRows.length > 0 ? "Fix the highlighted rows before saving." : null,
  };
}
