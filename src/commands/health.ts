import type { Command } from "commander";
import chalk from "chalk";
import { calculateHealthScore } from "../utils/projectHealth.js";
import { resolveProjectPath, scanProject } from "../utils/readProject.js";
import { formatReportLine } from "../utils/terminal.js";
import {
  formatHealthScore,
  printConfigurationStatus,
  printHealthStatusLine,
  printReportTitle,
  printSection,
} from "../utils/terminalReport.js";

export function registerHealthCommand(program: Command) {
  program
    .command("health")
    .description("Show project health checks only.")
    .argument("[path]", "Path to the project folder", ".")
    .action((path) => {
      try {
        const projectPath = resolveProjectPath(path);
        const result = scanProject(projectPath);
        const healthScore = calculateHealthScore(result.projectHealth);

        printReportTitle("RepoLens Health");
        console.log(formatReportLine(`${chalk.gray("Project:")} ${result.projectPath}`));

        printSection("Health Score");
        console.log(formatReportLine(formatHealthScore(healthScore.score), 1));

        printSection("Configuration");
        printConfigurationStatus(result.config.configFileFound, result.config.configFileName);

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
        if (error instanceof Error) {
          console.error(chalk.red(`Error: ${error.message}`));
        } else {
          console.error(chalk.red("An unknown error occurred."));
        }

        process.exit(1);
      }
    });
}
