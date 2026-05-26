import fs from "node:fs";
import path from "node:path";

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "coverage",
]);

const IGNORED_FILES = new Set([
  "report.md",
  "report.json",
]);

const MAX_DEPTH = 3;
const MAX_ENTRIES_PER_FOLDER = 12;

function shouldIgnoreEntry(entry: fs.Dirent) {
  if (entry.isDirectory()) {
    return IGNORED_DIRECTORIES.has(entry.name);
  }

  return entry.isFile() && IGNORED_FILES.has(entry.name);
}

function sortEntries(entries: fs.Dirent[]) {
  return entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) {
      return -1;
    }

    if (!a.isDirectory() && b.isDirectory()) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });
}

export function buildProjectStructure(projectPath: string): string[] {
  const lines: string[] = [];

  function walkDirectory(currentPath: string, depth: number) {
    const entries = sortEntries(
      fs.readdirSync(currentPath, { withFileTypes: true }).filter((entry) => {
        return !shouldIgnoreEntry(entry);
      }),
    );
    const visibleEntries = entries.slice(0, MAX_ENTRIES_PER_FOLDER);
    const hiddenEntryCount = entries.length - visibleEntries.length;

    for (const entry of visibleEntries) {
      const entryPath = path.join(currentPath, entry.name);
      const indentation = "  ".repeat(depth);
      const displayName = entry.isDirectory() ? `${entry.name}/` : entry.name;

      lines.push(`${indentation}${displayName}`);

      if (entry.isDirectory() && depth + 1 < MAX_DEPTH) {
        walkDirectory(entryPath, depth + 1);
      }
    }

    if (hiddenEntryCount > 0) {
      const indentation = "  ".repeat(depth);
      lines.push(`${indentation}... ${hiddenEntryCount} more items`);
    }
  }

  walkDirectory(projectPath, 0);

  return lines;
}
