import type { Command } from "commander";
import chalk from "chalk";
import { resolveProjectPath, scanProject } from "../utils/readProject.js";
import { printBullet, printReportTitle, printSection } from "../utils/terminalReport.js";
import { terminalColors } from "../utils/terminal.js";

export function registerStackCommand(program: Command) {
  program
    .command("stack")
    .description("Show detected project stack only.")
    .argument("[path]", "Path to the project folder", ".")
    .action((path) => {
      try {
        const projectPath = resolveProjectPath(path);
        const result = scanProject(projectPath);

        printReportTitle("RepoLens Stack");
        printSection("Detected Stack");
        if (result.detectedStack.length === 0) {
          printBullet(terminalColors.muted("No known technologies detected"));
        } else {
          for (const technology of result.detectedStack) {
            printBullet(technology);
          }
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
