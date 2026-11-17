/**
 * The dev server doesn't put `.env` values into `process.env` for server code, so load them once
 * here. On Vercel the variables come from the project settings and this does nothing.
 */
let loaded = false;

export function loadLocalEnv() {
  if (loaded || process.env["VERCEL"]) return;
  loaded = true;
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      // File not present — fine.
    }
  }
}
