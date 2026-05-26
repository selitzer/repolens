import type { Command } from "commander";
import chalk from "chalk";
import { resolveProjectPath, scanProject } from "../utils/readProject.js";
import { calculateHealthScore } from "../utils/projectHealth.js";
import {
  formatReportLine,
  startSpinner,
  symbols,
  terminalColors,
} from "../utils/terminal.js";

const RESULT_PREVIEW_LIMIT = 10;

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function printSection(title: string) {
  console.log("");
  console.log(formatReportLine(terminalColors.heading(title)));
}

function printBullet(text: string) {
  console.log(formatReportLine(`${terminalColors.muted(symbols.bullet)} ${text}`, 1));
}

function printStatusLine(isSuccess: boolean, text: string) {
  const color = isSuccess ? terminalColors.success : terminalColors.warning;
  const symbol = isSuccess ? symbols.success : symbols.warning;

  console.log(formatReportLine(`${color(symbol)} ${text}`, 1));
}

function printHealthStatusLine(isFound: boolean, name: string) {
  const color = isFound ? terminalColors.success : terminalColors.warning;
  const symbol = isFound ? symbols.success : symbols.warning;
  const status = isFound ? "Found" : "Missing";

  console.log(formatReportLine(`${color(symbol)} ${name}: ${color(status)}`, 1));
}

function formatHealthScore(score: number) {
  if (score >= 80) {
    return terminalColors.success(`${score}%`);
  }

  if (score >= 60) {
    return terminalColors.warning(`${score}%`);
  }

  return terminalColors.danger(`${score}%`);
}

export function registerAnalyzeCommand(program: Command) {
  program
    .command("analyze")
    .description("Analyze a local project folder.")
    .argument("[path]", "Path to the project folder", ".")
    .action((path) => {
      const spinner = startSpinner("Analyzing project...");

      try {
        const projectPath = resolveProjectPath(path);
        const result = scanProject(projectPath);
        const healthScore = calculateHealthScore(result.projectHealth);

        spinner.stop();

        console.log(formatReportLine(chalk.bold("RepoLens Report")));
        console.log(formatReportLine(terminalColors.muted("────────────────")));
        console.log(formatReportLine(`${terminalColors.muted("Project:")} ${result.projectPath}`));

        printSection("Health Score");
        console.log(formatReportLine(formatHealthScore(healthScore.score), 1));

        printSection("Summary");
        console.log(formatReportLine(`Files: ${terminalColors.number(result.totalFiles)}`, 1));
        console.log(formatReportLine(`Folders: ${terminalColors.number(result.totalFolders)}`, 1));
        console.log(
          formatReportLine(`Lines of Code: ${terminalColors.number(result.totalLines)}`, 1),
        );

        printSection("Language Breakdown");
        for (const item of result.languageBreakdown) {
          printBullet(
            `${item.language}: ${terminalColors.number(item.files)} ${pluralize(item.files, "file")}`,
          );
        }

        printSection("Detected Stack");
        if (result.detectedStack.length === 0) {
          printBullet(terminalColors.muted("No known technologies detected"));
        } else {
          for (const technology of result.detectedStack) {
            printBullet(technology);
          }
        }

        printSection("Code Quality");
        printStatusLine(
          result.todos.length === 0,
          `TODO/FIXME Comments: ${terminalColors.number(result.todos.length)}`,
        );
        for (const todo of result.todos.slice(0, RESULT_PREVIEW_LIMIT)) {
          printBullet(
            terminalColors.muted(`${todo.filePath}:${todo.lineNumber} ${todo.text}`),
          );
        }

        printSection("Large Files");
        printStatusLine(
          result.largeFiles.length === 0,
          `${terminalColors.number(result.largeFiles.length)} ${pluralize(
            result.largeFiles.length,
            "file",
          )} over 300 lines`,
        );
        for (const file of result.largeFiles.slice(0, RESULT_PREVIEW_LIMIT)) {
          printBullet(
            terminalColors.muted(
              `${file.filePath}: ${terminalColors.number(file.lineCount)} lines`,
            ),
          );
        }

        printSection("Project Health");
        for (const check of result.projectHealth.importantFiles) {
          printHealthStatusLine(check.found, check.name);
        }

        printSection("README Quality");
        if (result.projectHealth.readmeQuality.length === 0) {
          printHealthStatusLine(false, "README.md");
        } else {
          for (const check of result.projectHealth.readmeQuality) {
            printHealthStatusLine(check.found, check.name);
          }
        }

        printSection(".gitignore Checks");
        for (const check of result.projectHealth.gitignoreChecks) {
          printHealthStatusLine(check.found, check.name);
        }

        printSection("package.json Metadata");
        for (const check of result.projectHealth.packageJsonMetadata) {
          printHealthStatusLine(check.found, check.name);
        }
      } catch (error) {
        spinner.stop();

        if (error instanceof Error) {
          console.error(chalk.red(`Error: ${error.message}`));
        } else {
          console.error(chalk.red("An unknown error occurred."));
        }

        process.exit(1);
      }
    });
}
