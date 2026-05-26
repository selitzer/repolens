import fs from "node:fs";
import path from "node:path";

const CONFIG_FILE_NAME = ".repolensrc.json";

export type RepoLensConfig = {
  largeFileThreshold: number;
  maxStructureDepth: number;
  maxEntriesPerFolder: number;
  ignoredDirectories: string[];
  ignoredFiles: string[];
};

export type RepoLensConfigResult = {
  configFileFound: boolean;
  configFileName: string;
  config: RepoLensConfig;
};

type PartialRepoLensConfig = Partial<RepoLensConfig>;

export const DEFAULT_CONFIG: RepoLensConfig = {
  largeFileThreshold: 300,
  maxStructureDepth: 3,
  maxEntriesPerFolder: 12,
  ignoredDirectories: ["node_modules", ".git", "dist", "coverage"],
  ignoredFiles: ["report.md", "report.json"],
};

function usePositiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function useStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return fallback;
  }

  return value;
}

function mergeConfig(config: PartialRepoLensConfig): RepoLensConfig {
  return {
    largeFileThreshold: usePositiveNumber(
      config.largeFileThreshold,
      DEFAULT_CONFIG.largeFileThreshold,
    ),
    maxStructureDepth: usePositiveNumber(
      config.maxStructureDepth,
      DEFAULT_CONFIG.maxStructureDepth,
    ),
    maxEntriesPerFolder: usePositiveNumber(
      config.maxEntriesPerFolder,
      DEFAULT_CONFIG.maxEntriesPerFolder,
    ),
    ignoredDirectories: useStringArray(
      config.ignoredDirectories,
      DEFAULT_CONFIG.ignoredDirectories,
    ),
    ignoredFiles: useStringArray(config.ignoredFiles, DEFAULT_CONFIG.ignoredFiles),
  };
}

export function loadConfig(projectPath: string): RepoLensConfigResult {
  const configPath = path.join(projectPath, CONFIG_FILE_NAME);

  if (!fs.existsSync(configPath)) {
    return {
      configFileFound: false,
      configFileName: CONFIG_FILE_NAME,
      config: DEFAULT_CONFIG,
    };
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const parsedConfig = JSON.parse(content) as PartialRepoLensConfig;

    return {
      configFileFound: true,
      configFileName: CONFIG_FILE_NAME,
      config: mergeConfig(parsedConfig),
    };
  } catch {
    throw new Error(`${CONFIG_FILE_NAME} contains invalid JSON.`);
  }
}
