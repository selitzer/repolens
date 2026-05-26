import fs from "node:fs";
import path from "node:path";

const IMPORTANT_PROJECT_FILES = [
  "README.md",
  "package.json",
  ".gitignore",
  "LICENSE",
  "tsconfig.json",
  ".env.example",
];

const README_CHECKS = [
  {
    name: "Project Title",
    keywords: [/^#\s+\S+/m],
  },
  {
    name: "Description",
    keywords: [/\bdescription\b/i, /\boverview\b/i, /\babout\b/i],
  },
  {
    name: "Installation",
    keywords: [/\binstall\b/i, /\binstallation\b/i, /\bnpm install\b/i],
  },
  {
    name: "Usage",
    keywords: [/\busage\b/i, /\bhow to use\b/i, /\bcommands\b/i],
  },
  {
    name: "Technologies",
    keywords: [/\btech\b/i, /\bstack\b/i, /\bbuilt with\b/i],
  },
  {
    name: "Features",
    keywords: [/\bfeatures\b/i],
  },
  {
    name: "Screenshots/Demo",
    keywords: [/\bscreenshot\b/i, /\bdemo\b/i, /\bpreview\b/i],
  },
  {
    name: "License",
    keywords: [/\blicense\b/i],
  },
];

const GITIGNORE_CHECKS = [
  "node_modules",
  "dist",
  ".env",
  ".DS_Store",
  "coverage",
];

const PACKAGE_JSON_CHECKS = [
  "name",
  "version",
  "description",
  "scripts",
  "license",
  "repository",
  "keywords",
  "author",
];

export type HealthCheckResult = {
  name: string;
  found: boolean;
};

export type ProjectHealthResult = {
  importantFiles: HealthCheckResult[];
  readmeQuality: HealthCheckResult[];
  gitignoreChecks: HealthCheckResult[];
  packageJsonMetadata: HealthCheckResult[];
};

export type HealthScore = {
  passingChecks: number;
  totalChecks: number;
  score: number;
};

function fileExists(projectPath: string, fileName: string) {
  return fs.existsSync(path.join(projectPath, fileName));
}

function readTextFileIfExists(projectPath: string, fileName: string) {
  const filePath = path.join(projectPath, fileName);

  if (!fs.existsSync(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf-8");
}

function checkReadmeQuality(projectPath: string): HealthCheckResult[] {
  const content = readTextFileIfExists(projectPath, "README.md");

  if (!content) {
    return [];
  }

  return README_CHECKS.map((check) => ({
    name: check.name,
    found: check.keywords.some((keyword) => keyword.test(content)),
  }));
}

function checkGitignore(projectPath: string): HealthCheckResult[] {
  const content = readTextFileIfExists(projectPath, ".gitignore");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  return GITIGNORE_CHECKS.map((name) => ({
    name,
    found: lines.some((line) => line === name || line === `${name}/`),
  }));
}

function hasPackageJsonField(packageJson: Record<string, unknown>, fieldName: string) {
  const value = packageJson[fieldName];

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length > 0;
  }

  return typeof value === "string" ? value.trim().length > 0 : value !== undefined;
}

function checkPackageJsonMetadata(projectPath: string): HealthCheckResult[] {
  const content = readTextFileIfExists(projectPath, "package.json");
  let packageJson: Record<string, unknown> = {};

  if (content) {
    try {
      packageJson = JSON.parse(content) as Record<string, unknown>;
    } catch {
      packageJson = {};
    }
  }

  return PACKAGE_JSON_CHECKS.map((name) => ({
    name,
    found: hasPackageJsonField(packageJson, name),
  }));
}

export function checkProjectHealth(projectPath: string): ProjectHealthResult {
  return {
    importantFiles: IMPORTANT_PROJECT_FILES.map((name) => ({
      name,
      found: fileExists(projectPath, name),
    })),
    readmeQuality: checkReadmeQuality(projectPath),
    gitignoreChecks: checkGitignore(projectPath),
    packageJsonMetadata: checkPackageJsonMetadata(projectPath),
  };
}

export function calculateHealthScore(projectHealth: ProjectHealthResult): HealthScore {
  const checks = [
    ...projectHealth.importantFiles,
    ...projectHealth.readmeQuality,
    ...projectHealth.gitignoreChecks,
    ...projectHealth.packageJsonMetadata,
  ];

  if (checks.length === 0) {
    return {
      passingChecks: 0,
      totalChecks: 0,
      score: 0,
    };
  }

  const passingChecks = checks.filter((check) => check.found).length;

  return {
    passingChecks,
    totalChecks: checks.length,
    score: Math.round((passingChecks / checks.length) * 100),
  };
}
