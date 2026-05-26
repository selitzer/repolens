import type { Command } from "commander";
import chalk from "chalk";
import { resolveProjectPath, scanProject } from "../utils/readProject.js";
import { terminalColors } from "../utils/terminal.js";
import {
  pluralize,
  printBullet,
  printReportTitle,
  printSection,
  printStatusLine,
} from "../utils/terminalReport.js";

export function registerTodosCommand(program: Command) {
  program
    .command("todos")
    .description("Show TODO/FIXME comments only.")
    .argument("[path]", "Path to the project folder", ".")
    .action((path) => {
      try {
        const projectPath = resolveProjectPath(path);
        const result = scanProject(projectPath);

        printReportTitle("RepoLens TODOs");
        printSection("TODO/FIXME Comments");
        printStatusLine(
          result.todos.length === 0,
          `${terminalColors.number(result.todos.length)} ${pluralize(
            result.todos.length,
            "comment",
          )} found`,
        );

        if (result.todos.length === 0) {
          printBullet(terminalColors.muted("No TODO/FIXME comments found."));
        } else {
          for (const todo of result.todos) {
            printBullet(`${todo.filePath}:${todo.lineNumber} ${todo.text}`);
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
