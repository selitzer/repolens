import type { Command } from "commander";
import chalk from "chalk";
import { resolveProjectPath } from "../utils/readProject.js";

export function registerAnalyzeCommand(program: Command) {
  program
    .command("analyze")
    .description("Analyze a local project folder.")
    .argument("[path]", "Path to the project folder", ".")
    .action((path) => {
      try {
        const projectPath = resolveProjectPath(path);

        console.log(chalk.bold("RepoLens Report"));
        console.log("----------------");
        console.log(`Analyzing project at: ${projectPath}`);
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
