import chalk from "chalk";

const SPINNER_FRAMES = ["-", "\\", "|", "/"];
const REPORT_MARGIN = "    ";

export const symbols = {
  success: "✓",
  warning: "⚠",
  bullet: "•",
};

export const terminalColors = {
  heading: chalk.bold.cyan,
  success: chalk.green,
  warning: chalk.yellow,
  danger: chalk.red,
  number: chalk.bold,
  muted: chalk.gray,
};

export type Spinner = {
  stop: () => void;
};

export function formatReportLine(text = "", indentLevel = 0, enabled = true) {
  if (!enabled || text.length === 0) {
    return text;
  }

  return `${REPORT_MARGIN}${"  ".repeat(indentLevel)}${text}`;
}

export function startSpinner(message: string, enabled = process.stdout.isTTY): Spinner {
  if (!enabled) {
    return {
      stop: () => undefined,
    };
  }

  let frameIndex = 0;
  process.stdout.write(`${terminalColors.muted(SPINNER_FRAMES[frameIndex])} ${message}`);

  const interval = setInterval(() => {
    frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length;
    process.stdout.write(`\r${terminalColors.muted(SPINNER_FRAMES[frameIndex])} ${message}`);
  }, 100);

  return {
    stop: () => {
      clearInterval(interval);
      process.stdout.write("\r\x1b[K");
    },
  };
}
