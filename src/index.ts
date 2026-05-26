#!/usr/bin/env node

import { Command } from "commander";
import { registerAnalyzeCommand } from "./commands/analyze.js";

const program = new Command();

program
  .name("repolens")
  .description("Analyze a codebase and generate a project health report.")
  .version("1.0.0");

registerAnalyzeCommand(program);

program.parse();