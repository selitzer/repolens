import fs from "node:fs";
import path from "node:path";

const STACK_PACKAGES = [
  ["react", "React"],
  ["vue", "Vue"],
  ["@angular/core", "Angular"],
  ["vite", "Vite"],
  ["next", "Next.js"],
  ["tailwindcss", "Tailwind CSS"],
  ["express", "Express"],
  ["fastify", "Fastify"],
  ["cors", "CORS"],
  ["dotenv", "dotenv"],
  ["electron", "Electron"],
  ["socket.io", "Socket.IO"],
  ["socket.io-client", "Socket.IO Client"],
  ["@supabase/supabase-js", "Supabase"],
  ["prisma", "Prisma"],
  ["mongoose", "Mongoose"],
  ["pg", "PostgreSQL"],
  ["mysql2", "MySQL"],
  ["sqlite3", "SQLite"],
  ["vitest", "Vitest"],
  ["jest", "Jest"],
  ["playwright", "Playwright"],
  ["cypress", "Cypress"],
  ["typescript", "TypeScript"],
  ["tsx", "TSX"],
  ["eslint", "ESLint"],
  ["prettier", "Prettier"],
  ["nodemon", "Nodemon"],
];

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function readPackageJson(projectPath: string): PackageJson {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(packageJsonPath, "utf-8");
    return JSON.parse(content) as PackageJson;
  } catch {
    return {};
  }
}

export function detectStack(projectPath: string): string[] {
  const packageJson = readPackageJson(projectPath);
  const packageNames = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ]);

  return STACK_PACKAGES.filter(([packageName]) => packageNames.has(packageName)).map(
    ([, displayName]) => displayName,
  );
}
