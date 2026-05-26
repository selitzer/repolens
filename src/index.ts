import { Command } from "commander";
import chalk from "chalk";

const program = new Command();

program
  .name("repolens")
  .description("Analyze a codebase and generate a project health report.")
  .version("1.0.0");

program
  .command("analyze")
  .description("Analyze a local project folder.")
  .argument("[path]", "Path to the project folder", ".")
  .action((path) => {
    console.log(chalk.bold("RepoLens Report"));
    console.log("----------------");
    console.log(`Analyzing project at: ${path}`);
  });

program.parse();