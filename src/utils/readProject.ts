import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "./config.js";
import { checkProjectHealth } from "./projectHealth.js";
import { buildProjectStructure } from "./projectStructure.js";
import { detectStack } from "./stackDetector.js";
import type { RepoLensConfigResult } from "./config.js";
import type { ProjectHealthResult } from "./projectHealth.js";

const LANGUAGE_BY_EXTENSION = new Map([
  [".ts", "TypeScript"],
  [".tsx", "TSX"],
  [".js", "JavaScript"],
  [".jsx", "JSX"],
  [".html", "HTML"],
  [".css", "CSS"],
  [".json", "JSON"],
  [".md", "Markdown"],
  [".py", "Python"],
  [".java", "Java"],
  [".cpp", "C++"],
  [".c", "C"],
  [".cs", "C#"],
]);

const TODO_PATTERN = /(?:\/\/|#|\/\*|\*|<!--)\s*(TODO|FIXME)\b/i;
const CODE_QUALITY_IGNORED_FILES = new Set(["package-lock.json"]);

export type LanguageBreakdown = {
  language: string;
  files: number;
};

export type TodoResult = {
  filePath: string;
  lineNumber: number;
  text: string;
};

export type LargeFileResult = {
  filePath: string;
  lineCount: number;
};

export type ProjectScanResult = {
  projectPath: string;
  totalFiles: number;
  totalFolders: number;
  totalLines: number;
  languageBreakdown: LanguageBreakdown[];
  todos: TodoResult[];
  largeFiles: LargeFileResult[];
  projectHealth: ProjectHealthResult;
  detectedStack: string[];
  projectStructure: string[];
  config: RepoLensConfigResult;
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
  const configResult = loadConfig(projectPath);
  const config = configResult.config;
  const ignoredDirectories = new Set(config.ignoredDirectories);
  const ignoredFiles = new Set(config.ignoredFiles);
  let totalFiles = 0;
  let totalFolders = 0;
  let totalLines = 0;
  const languageCounts = new Map<string, number>();
  const todos: TodoResult[] = [];
  const largeFiles: LargeFileResult[] = [];

  function trackLanguage(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();
    const language = LANGUAGE_BY_EXTENSION.get(extension) ?? "Other";
    const currentCount = languageCounts.get(language) ?? 0;

    languageCounts.set(language, currentCount + 1);
  }

  function scanCodeQuality(filePath: string, lines: string[]) {
    const fileName = path.basename(filePath);

    if (CODE_QUALITY_IGNORED_FILES.has(fileName) || ignoredFiles.has(fileName)) {
      return;
    }

    const relativePath = path.relative(projectPath, filePath);

    lines.forEach((line, index) => {
      if (TODO_PATTERN.test(line)) {
        todos.push({
          filePath: relativePath,
          lineNumber: index + 1,
          text: line.trim(),
        });
      }
    });

    if (lines.length > config.largeFileThreshold) {
      largeFiles.push({
        filePath: relativePath,
        lineCount: lines.length,
      });
    }
  }

  function walkDirectory(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name)) {
          continue;
        }

        totalFolders++;
        walkDirectory(entryPath);
        continue;
      }

      if (entry.isFile()) {
        if (ignoredFiles.has(entry.name)) {
          continue;
        }

        totalFiles++;
        trackLanguage(entryPath);

        const content = fs.readFileSync(entryPath, "utf-8");
        const lines = content.split(/\r?\n/);
        const lineCount = lines.length;

        totalLines += lineCount;
        scanCodeQuality(entryPath, lines);
      }
    }
  }

  walkDirectory(projectPath);

  const languageBreakdown = Array.from(languageCounts, ([language, files]) => ({
    language,
    files,
  })).sort((a, b) => b.files - a.files || a.language.localeCompare(b.language));

  largeFiles.sort((a, b) => b.lineCount - a.lineCount);

  return {
    projectPath,
    totalFiles,
    totalFolders,
    totalLines,
    languageBreakdown,
    todos,
    largeFiles,
    projectHealth: checkProjectHealth(projectPath),
    detectedStack: detectStack(projectPath),
    projectStructure: buildProjectStructure(projectPath, config),
    config: configResult,
  };
}
