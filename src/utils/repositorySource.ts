import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveProjectPath } from "./readProject.js";

export type AnalyzeSource =
  | {
      type: "local";
      label: "Local folder";
      projectPath: string;
      cleanup: () => void;
    }
  | {
      type: "github";
      label: "GitHub repository";
      repositoryUrl: string;
      projectPath: string;
      cleanup: () => void;
    };

function parseGitHubUrl(input: string) {
  try {
    const url = new URL(input);
    const pathParts = url.pathname.replace(/^\/|\/$/g, "").split("/");

    if (url.protocol !== "https:" || url.hostname !== "github.com" || pathParts.length !== 2) {
      return null;
    }

    const [owner, repoPath] = pathParts;
    const repo = repoPath.endsWith(".git") ? repoPath.slice(0, -4) : repoPath;

    if (!owner || !repo) {
      return null;
    }

    return `https://github.com/${owner}/${repo}`;
  } catch {
    return null;
  }
}

export function isGitHubRepositoryUrl(input: string) {
  return parseGitHubUrl(input) !== null;
}

export function createLocalSource(inputPath: string): AnalyzeSource {
  return {
    type: "local",
    label: "Local folder",
    projectPath: resolveProjectPath(inputPath),
    cleanup: () => undefined,
  };
}

export function createGitHubSource(repositoryInput: string): AnalyzeSource {
  const repositoryUrl = parseGitHubUrl(repositoryInput);

  if (!repositoryUrl) {
    throw new Error("Unsupported GitHub URL. Use https://github.com/owner/repo.");
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "repolens-"));
  const clonePath = path.join(tempRoot, "repo");

  try {
    execFileSync("git", ["clone", "--depth", "1", repositoryUrl, clonePath], {
      stdio: "pipe",
    });
  } catch {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    throw new Error(
      "Failed to clone GitHub repository. Make sure git is installed and the repository is public.",
    );
  }

  return {
    type: "github",
    label: "GitHub repository",
    repositoryUrl,
    projectPath: clonePath,
    cleanup: () => {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    },
  };
}
