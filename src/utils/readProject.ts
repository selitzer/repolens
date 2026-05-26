import fs from "node:fs";
import path from "node:path";

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