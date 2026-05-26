import fs from "node:fs";
import path from "node:path";

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "coverage",
]);

export type ProjectScanResult = {
  projectPath: string;
  totalFiles: number;
  totalFolders: number;
};

export function resolveProjectPath(inputPath: string): string {
  const projectPath = path.resolve(inputPath);

  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  const stats = fs.statSync(projectPath);

  if (!stats.isDirectory()) {
    throw new Error(`Project path is not a directory: ${projectPath}`);
  }

  return projectPath;
}

export function scanProject(projectPath: string): ProjectScanResult {
  let totalFiles = 0;
  let totalFolders = 0;

  function walkDirectory(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          continue;
        }

        totalFolders++;
        walkDirectory(entryPath);
        continue;
      }

      if (entry.isFile()) {
        totalFiles++;
      }
    }
  }

  walkDirectory(projectPath);

  return {
    projectPath,
    totalFiles,
    totalFolders,
  };
}
