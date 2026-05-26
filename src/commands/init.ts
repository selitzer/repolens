import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import chalk from "chalk";
import { CONFIG_FILE_NAME, DEFAULT_CONFIG } from "../utils/config.js";
import { formatReportLine, symbols, terminalColors } from "../utils/terminal.js";

type InitOptions = {
  force?: boolean;
};

function printInitHeader() {
  console.log(formatReportLine(chalk.bold("RepoLens")));
  console.log(formatReportLine(terminalColors.muted("────────")));
}

function printSuccess(message: string) {
  printInitHeader();
  console.log(formatReportLine(`${terminalColors.success(symbols.success)} ${message}`, 1));
}

function printWarning(message: string) {
  printInitHeader();
  console.log(formatReportLine(`${terminalColors.warning(symbols.warning)} ${message}`, 1));
}

export function registerInitCommand(program: Command) {
  program
    .command("init")
    .description("Create a RepoLens config file.")
    .option("--force", "Overwrite an existing RepoLens config file.")
    .action((options: InitOptions) => {
      const configPath = path.join(process.cwd(), CONFIG_FILE_NAME);
      const configExists = fs.existsSync(configPath);

      if (configExists && !options.force) {
        printWarning(`${CONFIG_FILE_NAME} already exists. Use --force to overwrite it.`);
        return;
      }

      const configContent = `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`;
      fs.writeFileSync(configPath, configContent, "utf-8");

      if (configExists) {
        printSuccess(`Overwrote ${CONFIG_FILE_NAME}`);
      } else {
        printSuccess(`Created ${CONFIG_FILE_NAME}`);
      }
    });
}
