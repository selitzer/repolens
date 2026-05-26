import fs from "node:fs";
import path from "node:path";
import type { RepoLensConfig } from "./config.js";

function shouldIgnoreEntry(entry: fs.Dirent, config: RepoLensConfig) {
  if (entry.isDirectory()) {
    return config.ignoredDirectories.includes(entry.name);
  }

  return entry.isFile() && config.ignoredFiles.includes(entry.name);
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

export function buildProjectStructure(projectPath: string, config: RepoLensConfig): string[] {
  const lines: string[] = [];

  function walkDirectory(currentPath: string, depth: number) {
    const entries = sortEntries(
      fs.readdirSync(currentPath, { withFileTypes: true }).filter((entry) => {
        return !shouldIgnoreEntry(entry, config);
      }),
    );
    const visibleEntries = entries.slice(0, config.maxEntriesPerFolder);
    const hiddenEntryCount = entries.length - visibleEntries.length;

    for (const entry of visibleEntries) {
      const entryPath = path.join(currentPath, entry.name);
      const indentation = "  ".repeat(depth);
      const displayName = entry.isDirectory() ? `${entry.name}/` : entry.name;

      lines.push(`${indentation}${displayName}`);

      if (entry.isDirectory() && depth + 1 < config.maxStructureDepth) {
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
