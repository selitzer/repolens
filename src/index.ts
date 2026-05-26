#!/usr/bin/env node

import { Command } from "commander";
import { registerAnalyzeCommand } from "./commands/analyze.js";
import { registerHealthCommand } from "./commands/health.js";
import { registerInitCommand } from "./commands/init.js";
import { registerStackCommand } from "./commands/stack.js";
import { registerStructureCommand } from "./commands/structure.js";
import { registerTodosCommand } from "./commands/todos.js";

const program = new Command();

program
  .name("repolens")
  .description("Analyze a codebase and generate a project health report.")
  .version("1.0.0");

registerAnalyzeCommand(program);
registerInitCommand(program);
registerHealthCommand(program);
registerStackCommand(program);
registerStructureCommand(program);
registerTodosCommand(program);

program.parse();
