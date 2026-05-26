import type { Command } from "commander";
import chalk from "chalk";

export function registerAnalyzeCommand(program: Command) {
  program
    .command("analyze")
    .description("Analyze a local project folder.")
    .argument("[path]", "Path to the project folder", ".")
    .action((path) => {
      console.log(chalk.bold("RepoLens Report"));
      console.log("----------------");
      console.log(`Analyzing project at: ${path}`);
    });
}