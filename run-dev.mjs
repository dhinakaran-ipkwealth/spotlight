// Runs the backend (port 4000) and frontend (port 4001) dev servers together.
// Usage: npm run dev   (from the spotlight/ directory)
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

const apps = [
  { name: "backend", cwd: path.join(root, "backend"), script: "start:dev" },
  { name: "frontend", cwd: path.join(root, "frontend"), script: "dev" },
];

const isWindows = process.platform === "win32";

for (const app of apps) {
  const child = spawn("npm", ["run", app.script], {
    cwd: app.cwd,
    stdio: "inherit",
    shell: isWindows,
  });

  child.on("exit", (code) => {
    console.log(`[${app.name}] exited with code ${code}`);
  });
}
