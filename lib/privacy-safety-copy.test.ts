import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json"]);
const teacherFacingRoots = ["app", "components"];
const sourceRoots = ["app", "components", "actions", "lib"];
const ignoredDirectoryNames = new Set([
  ".git",
  ".next",
  "context",
  "coverage",
  "node_modules",
  "lib/generated",
]);

type SourceFile = {
  path: string;
  relativePath: string;
  content: string;
};

function isIgnoredPath(path: string): boolean {
  const normalized = relative(projectRoot, path).replaceAll("\\", "/");
  return Array.from(ignoredDirectoryNames).some(
    (ignored) => normalized === ignored || normalized.startsWith(`${ignored}/`)
  );
}

function collectSourceFiles(rootNames: string[]): SourceFile[] {
  const files: SourceFile[] = [];

  function walk(directory: string): void {
    if (isIgnoredPath(directory)) {
      return;
    }

    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      const stats = statSync(path);

      if (stats.isDirectory()) {
        walk(path);
        continue;
      }

      if (!stats.isFile() || !sourceExtensions.has(extname(entry))) {
        continue;
      }

      files.push({
        path,
        relativePath: relative(projectRoot, path).replaceAll("\\", "/"),
        content: readFileSync(path, "utf8"),
      });
    }
  }

  for (const rootName of rootNames) {
    walk(join(projectRoot, rootName));
  }

  return files;
}

function findPatternHits(
  files: SourceFile[],
  patterns: RegExp[]
): string[] {
  const hits: string[] = [];

  for (const file of files) {
    for (const pattern of patterns) {
      if (pattern.test(file.content)) {
        hits.push(`${file.relativePath}: ${pattern.source}`);
      }
    }
  }

  return hits;
}

describe("Unit 23 privacy and safety copy guardrails", () => {
  it("keeps teacher-facing copy away from compliance, legal, and security overclaims", () => {
    const files = collectSourceFiles(teacherFacingRoots);
    const bannedOverclaims = [
      /\bFERPA[- ]?(ready|compliant|certified)\b/i,
      /\bcompliance-ready\b/i,
      /\baudit-ready\b/i,
      /\bdistrict-approved\b/i,
      /\bschool-approved\b/i,
      /\blegally (safe|de-identified)\b/i,
      /\bguaranteed secure\b/i,
      /\bsecure forever\b/i,
      /\bproduction-safe\b/i,
    ];

    expect(findPatternHits(files, bannedOverclaims)).toEqual([]);
  });

  it("keeps teacher-facing copy away from AI marketing and automatic-record claims", () => {
    const files = collectSourceFiles(teacherFacingRoots);
    const bannedAiClaims = [
      /\bAI-powered\b/i,
      /\bAI-generated\b/i,
      /\bAI-written\b/i,
      /\bAI-analy[sz]ed\b/i,
      /\bsmart AI\b/i,
      /\bautomatic official (documentation|record)\b/i,
      /\bautomated official (documentation|record)\b/i,
    ];

    expect(findPatternHits(files, bannedAiClaims)).toEqual([]);
  });

  it("keeps direct dependencies and source imports free of V1-forbidden services", () => {
    const packageJson = JSON.parse(
      readFileSync(join(projectRoot, "package.json"), "utf8")
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const directDependencyNames = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];
    const forbiddenDependencyPatterns = [
      /openai/i,
      /anthropic/i,
      /\bai\b/i,
      /analytics/i,
      /telemetry/i,
      /posthog/i,
      /segment/i,
      /sentry/i,
      /uploadthing/i,
      /cloudinary/i,
      /supabase/i,
      /s3/i,
      /classlink/i,
      /clever/i,
    ];

    const forbiddenDependencies = directDependencyNames.filter((name) =>
      forbiddenDependencyPatterns.some((pattern) => pattern.test(name))
    );

    const files = collectSourceFiles(sourceRoots);
    const forbiddenSourcePatterns = [
      /from ["']openai["']/i,
      /from ["']@anthropic\//i,
      /from ["']ai["']/i,
      /from ["']@vercel\/analytics["']/i,
      /from ["']posthog-js["']/i,
      /from ["']@sentry\//i,
      /from ["']uploadthing\//i,
      /from ["']cloudinary["']/i,
      /from ["']@aws-sdk\/client-s3["']/i,
    ];

    expect(forbiddenDependencies).toEqual([]);
    expect(findPatternHits(files, forbiddenSourcePatterns)).toEqual([]);
  });

  it("uses only approved fictional student names in app-facing examples and tests", () => {
    const files = collectSourceFiles(sourceRoots).filter(
      (file) => basename(file.path) !== "privacy-safety-copy.test.ts"
    );
    const oldOrDisallowedDemoNames = [
      /\bJayden\b/,
      /\bAnthony\b/,
      /\bAlex\b/,
      /\bMaya\b/,
      /\bJalen\b/,
      /\bBrielle\b/,
      /\bMateo\b/,
      /\bNoah\b/,
    ];

    expect(findPatternHits(files, oldOrDisallowedDemoNames)).toEqual([]);
  });

  it("keeps durable save and export paths free of raw draft fields", () => {
    const durableFiles = [
      "actions/evidence.ts",
      "lib/evidence/save-validated-evidence.ts",
      "lib/evidence/export-student-evidence.ts",
      "prisma/schema.prisma",
    ].map((path) => ({
      path: join(projectRoot, path),
      relativePath: path,
      content: readFileSync(join(projectRoot, path), "utf8"),
    }));

    expect(
      findPatternHits(durableFiles, [
        /rawNote/i,
        /draftText/i,
        /originalCapture/i,
        /sourceText/i,
      ])
    ).toEqual([]);
  });

  it("does not log raw draft note identifiers from app source", () => {
    const files = collectSourceFiles(sourceRoots);
    const consoleLinesWithRawDraft = files.flatMap((file) =>
      file.content
        .split(/\r?\n/)
        .map((line, index) => ({
          line,
          location: `${file.relativePath}:${index + 1}`,
        }))
        .filter(
          ({ line }) =>
            /console\.(log|warn|error|info)/.test(line) &&
            /rawNote|draftText|originalCapture|sourceText/i.test(line)
        )
        .map(({ location, line }) => `${location}: ${line.trim()}`)
    );

    expect(consoleLinesWithRawDraft).toEqual([]);
  });

  it("keeps stale POC capture types text-only", () => {
    const mockData = readFileSync(join(projectRoot, "lib", "mock-data.ts"), "utf8");

    expect(mockData).not.toMatch(/attachment|photo|audio|upload|file/i);
  });

  it("preserves cautious landing boundaries and teacher-validation language", () => {
    const landingBoundary = readFileSync(
      join(projectRoot, "components", "landing", "landing-not-dashboard.tsx"),
      "utf8"
    );
    const reviewPanel = readFileSync(
      join(
        projectRoot,
        "components",
        "dashboard",
        "interpretation-review-panel.tsx"
      ),
      "utf8"
    );

    expect(landingBoundary).toContain("Not an IEP generator");
    expect(landingBoundary).toContain("Not an admin dashboard");
    expect(reviewPanel).toContain("Review before saving");
    expect(reviewPanel).toContain("Save validated evidence");
  });
});
