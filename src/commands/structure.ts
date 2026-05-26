import type { Command } from "commander";
import chalk from "chalk";
import { resolveProjectPath, scanProject } from "../utils/readProject.js";
import { formatReportLine } from "../utils/terminal.js";
import { printReportTitle, printSection } from "../utils/terminalReport.js";

export function registerStructureCommand(program: Command) {
  program
    .command("structure")
    .description("Show project structure only.")
    .argument("[path]", "Path to the project folder", ".")
    .action((path) => {
      try {
        const projectPath = resolveProjectPath(path);
        const result = scanProject(projectPath);

        printReportTitle("RepoLens Structure");
        printSection("Project Structure");
        for (const line of result.projectStructure) {
          console.log(formatReportLine(line, 1));
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
