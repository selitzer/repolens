import chalk from "chalk";
import { formatReportLine, symbols, terminalColors } from "./terminal.js";

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function printReportTitle(title: string) {
  console.log(formatReportLine(chalk.bold(title)));
  console.log(formatReportLine(terminalColors.muted("────────────────")));
}

export function printSection(title: string) {
  console.log("");
  console.log(formatReportLine(terminalColors.heading(title)));
}

export function printBullet(text: string) {
  console.log(formatReportLine(`${terminalColors.muted(symbols.bullet)} ${text}`, 1));
}

export function printStatusLine(isSuccess: boolean, text: string) {
  const color = isSuccess ? terminalColors.success : terminalColors.warning;
  const symbol = isSuccess ? symbols.success : symbols.warning;

  console.log(formatReportLine(`${color(symbol)} ${text}`, 1));
}

export function printHealthStatusLine(isFound: boolean, name: string) {
  const color = isFound ? terminalColors.success : terminalColors.warning;
  const symbol = isFound ? symbols.success : symbols.warning;
  const status = isFound ? "Found" : "Missing";

  console.log(formatReportLine(`${color(symbol)} ${name}: ${color(status)}`, 1));
}

export function formatHealthScore(score: number) {
  if (score >= 80) {
    return terminalColors.success(`${score}%`);
  }

  if (score >= 60) {
    return terminalColors.warning(`${score}%`);
  }

  return terminalColors.danger(`${score}%`);
}

export function printConfigurationStatus(configFileFound: boolean, configFileName: string) {
  if (configFileFound) {
    printHealthStatusLine(true, configFileName);
  } else {
    printStatusLine(false, `${configFileName}: Not found, using defaults`);
  }
}
