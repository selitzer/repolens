import type { Command } from "commander";
import chalk from "chalk";
import { resolveProjectPath, scanProject } from "../utils/readProject.js";

const RESULT_PREVIEW_LIMIT = 10;

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function registerAnalyzeCommand(program: Command) {
  program
    .command("analyze")
    .description("Analyze a local project folder.")
    .argument("[path]", "Path to the project folder", ".")
    .action((path) => {
      try {
        const projectPath = resolveProjectPath(path);
        const result = scanProject(projectPath);

        console.log(chalk.bold("RepoLens Report"));
        console.log("----------------");
        console.log(`Analyzing project at: ${result.projectPath}`);
        console.log("");
        console.log(`Files: ${result.totalFiles}`);
        console.log(`Folders: ${result.totalFolders}`);
        console.log(`Lines of Code: ${result.totalLines}`);
        console.log("");
        console.log(chalk.bold("Language Breakdown:"));
        for (const item of result.languageBreakdown) {
          console.log(`- ${item.language}: ${item.files} ${pluralize(item.files, "file")}`);
        }
        console.log("");
        console.log(chalk.bold("Code Quality:"));
        console.log(`- TODO/FIXME Comments: ${result.todos.length}`);
        for (const todo of result.todos.slice(0, RESULT_PREVIEW_LIMIT)) {
          console.log(`  - ${todo.filePath}:${todo.lineNumber} ${todo.text}`);
        }
        console.log("");
        console.log(chalk.bold("Large Files:"));
        console.log(
          `- ${result.largeFiles.length} ${pluralize(result.largeFiles.length, "file")} over 300 lines`,
        );
        for (const file of result.largeFiles.slice(0, RESULT_PREVIEW_LIMIT)) {
          console.log(`  - ${file.filePath}: ${file.lineCount} lines`);
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
